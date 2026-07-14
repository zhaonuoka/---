import { useState, useRef, useEffect, useCallback } from 'react'
import { Avatar } from 'antd'
import { SendOutlined, UserOutlined, RobotOutlined, LoadingOutlined, AudioOutlined, EnvironmentOutlined } from '@ant-design/icons'
import './index.css'

declare global {
  interface Window {
    XmovAvatar: any
  }
}

const APP_ID = '288058a62d40422da85205cd269bee8a'
const APP_SECRET = 'e07f7e5e99194677a4c3639003aa3bf7'
const GATEWAY = 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session'

interface ChatMessage {
  id: number
  role: 'user' | 'ai'
  content: string
  time: string
  type?: 'text' | 'voice'
}

/* 静态景点卡片数据 */
const SPOTS = [
  { name: '灵山大佛',   desc: '88米青铜立佛',  img: '/images/灵山大佛.jpg' },
  { name: '九龙灌浴',   desc: '动态音乐群雕',   img: '/images/九龙灌浴.jpg' },
  { name: '梵宫',       desc: '佛教艺术殿堂',   img: '/images/梵宫.jpg' },
  { name: '五印坛城',   desc: '藏传佛教建筑',   img: '/images/五印坛城.jpg' },
]

const TouristPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sdkState, setSdkState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [routeName, setRouteName] = useState('灵山胜境经典一日游')
  const [routeDesc, setRouteDesc] = useState('灵山大佛 → 九龙灌浴 → 梵宫 → 五印坛城')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sdkRef = useRef<any>(null)
  const msgIdRef = useRef(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const lastActivityRef = useRef<number>(Date.now())
  const idleSpokenRef = useRef<boolean>(false)
  const pageLoadTimeRef = useRef<number>(Date.now())
  const isSpeakingRef = useRef(false)

  /* 封装 speak —— 防止 SDK 冲突，1.1 倍速 */
  const safeSpeak = useCallback((text: string) => {
    if (!sdkRef.current) return
    isSpeakingRef.current = true
    setIsSpeaking(true)
    setTimeout(() => {
      try { sdkRef.current?.interactiveidle() } catch {}
      setTimeout(() => {
        try { sdkRef.current?.speak(text, true, true) } catch {}
      }, 400)
    }, 200)
  }, [])

  /* 自动滚到底部 */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ========== 初始化 3D 数字人 ========== */
  useEffect(() => {
    let destroyed = false

    async function init() {
      for (let i = 0; i < 60; i++) {
        if (window.XmovAvatar) break
        await new Promise((r) => setTimeout(r, 300))
      }
      if (!window.XmovAvatar) {
        if (!destroyed) {
          setErrorMsg('SDK 脚本加载失败，请检查网络')
          setSdkState('error')
        }
        return
      }

      const container = document.getElementById('xmov-root')
      if (!container) return
      for (let i = 0; i < 30; i++) {
        const rect = container.getBoundingClientRect()
        if (rect.width > 50 && rect.height > 50) break
        await new Promise((r) => setTimeout(r, 200))
      }

      if (destroyed) return

      try {
        const sdk = new window.XmovAvatar({
          containerId: '#xmov-root',
          appId: APP_ID,
          appSecret: APP_SECRET,
          gatewayServer: GATEWAY,
          enableLogger: true,
          onMessage: (msg: any) => console.log('[XmovSDK] msg:', msg),
          onStateChange: (state: any) => console.log('[XmovSDK] state:', state),
          onVoiceStateChange: (status: string) => {
            if (status === 'end') {
              isSpeakingRef.current = false
              setIsSpeaking(false)
            }
          },
        })

        sdkRef.current = sdk
        await sdk.init({ initModel: 'normal', onDownloadProgress: () => {} })

        if (destroyed) { sdk.destroy(); return }

        setSdkState('ready')
        console.log('[XmovSDK] ✅ 就绪')

        setTimeout(() => {
          if (!destroyed && sdkRef.current) {
            isSpeakingRef.current = true
            setIsSpeaking(true)
            try { sdkRef.current.speak('你好！我是你的AI导游😊', true, true, { speed: 1.2 }) } catch {}
          }
        }, 2000)
      } catch (err: any) {
        console.error('[XmovSDK] 初始化失败:', err)
        if (!destroyed) {
          setErrorMsg(err.message || String(err))
          setSdkState('error')
        }
      }
    }

    const timer = setTimeout(init, 400)
    return () => {
      destroyed = true
      clearTimeout(timer)
      if (sdkRef.current) {
        try { sdkRef.current.destroy() } catch {}
        sdkRef.current = null
      }
    }
  }, [])

  /* ========== 加载推荐路线 ========== */
  useEffect(() => {
    fetch('http://localhost:8000/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interests: ['历史', '文化', '自然'] }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.name) setRouteName(data.name)
        if (data.spots) setRouteDesc(data.spots.join(' → '))
      })
      .catch(() => {})
  }, [])

  /* ========== 冷场处理：10秒无操作 → 数字人主动搭话 ========== */
  useEffect(() => {
    const timer = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current
      if (idle >= 10000 && sdkState === 'ready' && sdkRef.current && !isSpeakingRef.current
          && Date.now() - pageLoadTimeRef.current >= 90000) {
        lastActivityRef.current = Date.now()
        isSpeakingRef.current = true
        setIsSpeaking(true)
        try { sdkRef.current.interactiveidle() } catch {}
        if (!idleSpokenRef.current) {
          idleSpokenRef.current = true
          setTimeout(() => {
            try { sdkRef.current?.speak('有什么需要帮助的吗？', true, true, { speed: 1.2 }) } catch {}
          }, 400)
        }
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [sdkState])

  /* ========== 发送消息 → /api/chat ========== */
  const handleSend = useCallback(async () => {
    const text = inputValue.trim()
    if (!text) return
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

    setMessages((prev) => [...prev, { id: ++msgIdRef.current, role: 'user', content: text, time: now }])
    setInputValue('')
    lastActivityRef.current = Date.now()

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      })
      const data = await res.json()
      const reply: string = data.answer || '抱歉，我现在无法回答。'

      setMessages((prev) => [...prev, {
        id: ++msgIdRef.current, role: 'ai', content: reply,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])

      if (sdkRef.current) {
        safeSpeak(reply)
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: ++msgIdRef.current, role: 'ai',
        content: '抱歉，后端服务未启动。请确保 Python 后端正在运行（http://localhost:8000）。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])
    }
  }, [inputValue])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }, [handleSend])

  /* 点击景点卡片 —— 直接提问并回复 */
  const handleSpotClick = useCallback(async (name: string) => {
    const question = `请介绍一下${name}`
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    lastActivityRef.current = Date.now()

    setMessages((prev) => [...prev, { id: ++msgIdRef.current, role: 'user', content: question, time: now }])

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      const reply: string = data.answer || '抱歉，我现在无法回答。'

      setMessages((prev) => [...prev, {
        id: ++msgIdRef.current, role: 'ai', content: reply,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])
      lastActivityRef.current = Date.now()

      if (sdkRef.current) {
        safeSpeak(reply)
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: ++msgIdRef.current, role: 'ai',
        content: '抱歉，后端服务未启动。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }])
    }
  }, [safeSpeak])

  /* 语音按钮 —— 开始/停止录音，发送到后端 STT */
  const handleVoiceToggle = useCallback(async () => {
    if (isRecording) {
      // ===== 停止录音 =====
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
      return
    }

    // ===== 开始录音 =====
    try {
      // 停止数字人说话
      if (sdkRef.current) {
        try { sdkRef.current.interactiveidle() } catch {}
        isSpeakingRef.current = false
        setIsSpeaking(false)
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        // 释放麦克风
        stream.getTracks().forEach((t) => t.stop())

        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        if (blob.size === 0) return

        setInputValue('🎤 识别中...')

        try {
          // ① 语音 → 文字
          const form = new FormData()
          form.append('file', blob, 'recording.webm')
          const sttRes = await fetch('http://localhost:8000/api/stt', { method: 'POST', body: form })
          const sttData = await sttRes.json()
          const recognized = sttData.text || ''
          setInputValue('')

          if (!recognized || recognized === '未识别到语音') return

          // ② 自动作为用户消息发送
          const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
          setMessages((prev) => [...prev, { id: ++msgIdRef.current, role: 'user', content: recognized, time: now }])

          // ③ 调用聊天接口
          const chatRes = await fetch('http://localhost:8000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: recognized }),
          })
          const chatData = await chatRes.json()
          const reply: string = chatData.answer || '抱歉，我现在无法回答。'

          setMessages((prev) => [...prev, {
            id: ++msgIdRef.current, role: 'ai', content: reply,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          }])
          lastActivityRef.current = Date.now()

          // ④ 数字人口播
          if (sdkRef.current) {
            setTimeout(() => {
              try { sdkRef.current.interactiveidle() } catch {}
              setTimeout(() => {
                setIsSpeaking(true)
                try { sdkRef.current.speak(reply, true, true) } catch {}
              }, 200)
            }, 100)
          }
        } catch {
          setInputValue('')
        }
      }

      recorder.start()
      setIsRecording(true)
      setInputValue('🎤 正在聆听...')
      lastActivityRef.current = Date.now()
    } catch (err: any) {
      console.error('麦克风权限被拒绝或出错:', err)
      setInputValue('')
    }
  }, [isRecording])

  return (
    <div className="tourist-page">
      {/* ========== 左栏：AI 数字人导游 ========== */}
      <div className="avatar-panel">

        {/* 顶部通栏标题 */}
        <div className="avatar-header">
          <span className="avatar-header-title">AI 数字人导游</span>
        </div>

        {/* 中部数字人展示区 */}
        <div className="avatar-stage">
          <div className="avatar-stage-bg" />
          <div id="xmov-root" />

          {sdkState === 'loading' && (
            <div className="avatar-stage-overlay">
              <LoadingOutlined style={{ fontSize: 44, color: 'var(--green)' }} />
              <span className="overlay-text">正在加载 3D 数字人...</span>
              <span className="overlay-hint">首次加载可能需要 5-10 秒</span>
            </div>
          )}
          {sdkState === 'error' && (
            <div className="avatar-stage-overlay">
              <RobotOutlined style={{ fontSize: 56, color: 'rgba(192,57,43,0.5)' }} />
              <span className="overlay-text">加载失败</span>
              <span className="overlay-error">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* 底部路线推荐 */}
        <div className="avatar-footer">
          <EnvironmentOutlined className="avatar-footer-icon" style={{ color: 'var(--green)' }} />
          <div className="avatar-footer-text">
            <div className="avatar-footer-title">🗺️ {routeName}</div>
            <div className="avatar-footer-desc">{routeDesc}</div>
          </div>
          <span className={`footer-state ${sdkState === 'ready' ? 'online' : ''}`}>
            {sdkState === 'loading' ? '⏳ 加载中' : sdkState === 'error' ? '⚠️ 离线' : isSpeaking ? '🗣️ 说话中' : '🟢 在线'}
          </span>
        </div>
      </div>

      {/* ========== 右栏：景点卡片 + 对话 + 输入 ========== */}
      <div className="chat-panel">

        {/* 景点卡片区 */}
        <div className="spots-header"> 景点卡片</div>
        <div className="spots-row">
          {SPOTS.map((spot) => (
            <div key={spot.name} className="spot-card" onClick={() => handleSpotClick(spot.name)}>
              <img className="spot-card-img" src={spot.img} alt={spot.name} />
              <div className="spot-card-name">{spot.name}</div>
              <div className="spot-card-desc">{spot.desc}</div>
            </div>
          ))}
        </div>

        {/* 对话气泡区 */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <RobotOutlined className="chat-empty-icon" />
              <p>发送消息，与 AI 导游开始对话吧</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`message-item ${msg.role === 'user' ? 'message-user' : 'message-ai'}`}>
              <Avatar
                icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                className="message-avatar"
                size={34}
                style={{
                  backgroundColor: msg.role === 'user' ? 'var(--orange)' : 'var(--green)',
                }}
              />
              <div className="message-body">
                <div className="message-meta">
                  <span className="message-sender">{msg.role === 'user' ? '我' : 'AI 导游'}</span>
                  <span className="message-time">{msg.time}</span>
                </div>
                <div className="message-bubble">
                  {msg.type === 'voice' ? (
                    <span className="voice-msg">语音消息</span>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 底部输入区 */}
        <div className="chat-input-area">
          <div className="chat-input-row">
            {/* 语音输入按钮 */}
            <button
              className={`voice-btn ${isRecording ? 'recording' : ''}`}
              onClick={handleVoiceToggle}
              title={isRecording ? '停止录音' : '语音输入'}
            >
              <AudioOutlined />
            </button>

            {/* 文字输入框 */}
            <div className="chat-textarea" style={{ flex: 1 }}>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您的问题..."
                rows={1}
                style={{
                  width: '100%',
                  borderRadius: 22,
                  padding: '10px 18px',
                  fontSize: 14,
                  resize: 'none' as const,
                  border: '1.5px solid rgba(0,0,0,0.06)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  background: 'rgba(255,255,255,0.65)',
                  backdropFilter: 'blur(10px)',
                }}
              />
            </div>

            {/* 发送按钮 */}
            <button
              className="send-btn"
              onClick={handleSend}
              title="发送"
              style={{
                width: 42, height: 42, borderRadius: '50%',
                border: 'none', background: 'var(--green)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, flexShrink: 0,
              }}
            >
              <SendOutlined />
            </button>
          </div>
        </div>
      </div>

      {/* 底部绿色页脚条 */}
      <div className="page-footer" />
    </div>
  )
}

export default TouristPage
