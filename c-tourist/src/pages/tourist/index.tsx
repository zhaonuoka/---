import { useState, useRef, useEffect, useCallback } from 'react'
import { Avatar } from 'antd'
import { SendOutlined, UserOutlined, RobotOutlined, LoadingOutlined, AudioOutlined, EnvironmentOutlined } from '@ant-design/icons'
import './index.css'

declare global {
  interface Window {
    XmovAvatar: any
  }
}

const APP_ID = '9313f3064f4541afab10817bf0b9ac49'
const APP_SECRET = '8a570880f2f14bc1a95971b0bca9050c'
const GATEWAY = 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session'

interface ChatMessage {
  id: number
  role: 'user' | 'ai'
  content: string
  time: string
}

/* 静态景点卡片数据 */
const SPOTS = [
  { name: '灵山大佛',   desc: '88米青铜立佛',  img: '/images/3.jpg' },
  { name: '九龙灌浴',   desc: '动态音乐群雕',   img: '/images/4.jpg' },
  { name: '梵宫',       desc: '佛教艺术殿堂',   img: '/images/5.jpg' },
  { name: '五印坛城',   desc: '藏传佛教建筑',   img: '/images/1.jpg' },
]

const TouristPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sdkState, setSdkState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sdkRef = useRef<any>(null)
  const msgIdRef = useRef(0)

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
            console.log('[XmovSDK] voice:', status)
            if (status === 'end') setIsSpeaking(false)
          },
        })

        sdkRef.current = sdk
        await sdk.init({ initModel: 'normal', onDownloadProgress: () => {} })

        if (destroyed) { sdk.destroy(); return }

        setSdkState('ready')
        console.log('[XmovSDK] ✅ 就绪')

        setTimeout(() => {
          if (!destroyed && sdkRef.current) {
            setIsSpeaking(true)
            try { sdkRef.current.speak('你好！我是你的AI导游😊', true, true) } catch {}
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

  /* ========== 发送消息 → /api/chat ========== */
  const handleSend = useCallback(async () => {
    const text = inputValue.trim()
    if (!text) return
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

    setMessages((prev) => [...prev, { id: ++msgIdRef.current, role: 'user', content: text, time: now }])
    setInputValue('')

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
        setTimeout(() => {
          try { sdkRef.current.interactiveidle() } catch {}
          setTimeout(() => {
            setIsSpeaking(true)
            try { sdkRef.current.speak(reply, true, true) } catch {}
          }, 200)
        }, 100)
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

  /* 点击景点卡片 —— 自动提问 */
  const handleSpotClick = useCallback((name: string) => {
    setInputValue(`请介绍一下${name}`)
  }, [])

  /* 语音按钮 —— 点击切换录音状态（UI 演示） */
  const handleVoiceToggle = useCallback(() => {
    if (isRecording) {
      setIsRecording(false)
    } else {
      setIsRecording(true)
      setInputValue('🎤 语音识别中...')
      setTimeout(() => {
        setIsRecording(false)
        setInputValue('')
      }, 3000)
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
            <div className="avatar-footer-title">🗺️ 推荐路线：灵山胜境经典一日游</div>
            <div className="avatar-footer-desc">灵山大佛 → 九龙灌浴 → 梵宫 → 五印坛城</div>
          </div>
          <span className={`footer-state ${sdkState === 'ready' ? 'online' : ''}`}>
            {sdkState === 'loading' ? '⏳ 加载中' : sdkState === 'error' ? '⚠️ 离线' : isSpeaking ? '🗣️ 说话中' : '🟢 在线'}
          </span>
        </div>
      </div>

      {/* ========== 右栏：景点卡片 + 对话 + 输入 ========== */}
      <div className="chat-panel">

        {/* 景点卡片区 */}
        <div className="spots-header">🏞️ 景点卡片</div>
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
                <div className="message-bubble">{msg.content}</div>
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
