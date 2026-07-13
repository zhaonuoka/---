import { useState, useRef, useEffect, useCallback } from 'react'
import { Input, Button, Space, Avatar } from 'antd'
import { SendOutlined, UserOutlined, RobotOutlined, LoadingOutlined } from '@ant-design/icons'
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

const TouristPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sdkState, setSdkState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sdkRef = useRef<any>(null)
  const msgIdRef = useRef(0)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ========== 初始化 3D 数字人 ==========
  useEffect(() => {
    let destroyed = false

    async function init() {
      // 等 SDK 脚本
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

      // 等容器有尺寸
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

  // ========== 发送消息 → /api/chat ==========
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

  return (
    <div className="tourist-page">
      <div className="avatar-panel">
        <div className="avatar-header">
          <span className="avatar-header-title">AI 数字人导游</span>
          <span className={`avatar-status-dot ${sdkState === 'ready' ? 'online' : ''}`}>
            {sdkState === 'ready' ? '在线' : sdkState === 'loading' ? '加载中' : '离线'}
          </span>
        </div>

        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <div id="xmov-root" style={{ width: '100%', height: '100%' }} />

          {sdkState === 'loading' && (
            <div className="avatar-stage-overlay">
              <LoadingOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.6)' }} />
              <span className="overlay-text">正在加载3D数字人...</span>
              <span className="overlay-hint">首次加载可能需要 5-10 秒</span>
            </div>
          )}
          {sdkState === 'error' && (
            <div className="avatar-stage-overlay">
              <RobotOutlined style={{ fontSize: 64, color: 'rgba(255,100,100,0.5)' }} />
              <span className="overlay-text">加载失败</span>
              <span className="overlay-error">{errorMsg}</span>
            </div>
          )}
        </div>

        <div className="avatar-footer">
          <span className="footer-state">
            {sdkState === 'loading' ? '⏳ 加载中' : sdkState === 'error' ? '⚠️ 离线' : isSpeaking ? '🗣️ 说话中' : '😴 待机中'}
          </span>
          <span className="footer-hint">发送消息即可互动</span>
        </div>
      </div>

      <div className="chat-panel">
        <div className="chat-header">
          <Space>
            <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1677ff' }} />
            <div>
              <div className="chat-header-title">智能导游</div>
              <div className="chat-header-subtitle">AI · {sdkState === 'ready' ? '在线' : '连接中'}</div>
            </div>
          </Space>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <RobotOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <p>发送消息，与 AI 导游开始对话吧</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`message-item ${msg.role === 'user' ? 'message-user' : 'message-ai'}`}>
              <Avatar icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                className="message-avatar"
                style={{ backgroundColor: msg.role === 'user' ? '#87d068' : '#1677ff' }} />
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

        <div className="chat-input-area">
          <div className="chat-input-row">
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的问题..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="chat-textarea"
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} className="send-btn">发送</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TouristPage
