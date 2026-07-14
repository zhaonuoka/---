import { useState, useCallback } from 'react'
import './index.css'

interface LoginPageProps {
  onLogin: (token: string, user: { id: number; username: string; role: string }) => void
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false) // false=登录, true=注册

  const handleSubmit = useCallback(async () => {
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码')
      return
    }
    setLoading(true)
    setError('')

    try {
      if (isRegister) {
        // ===== 注册模式 =====
        const regRes = await fetch('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password, role: 'tourist' }),
        })

        if (regRes.status === 409) {
          setError('该用户名已被使用，请换一个')
          setLoading(false)
          return
        }
        if (!regRes.ok) {
          setError('注册失败，请稍后重试')
          setLoading(false)
          return
        }

        // 注册成功 → 自动登录
        const loginRes = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password }),
        })
        const data = await loginRes.json()
        onLogin(data.token, data.user)
      } else {
        // ===== 登录模式 =====
        const res = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password }),
        })

        if (res.status === 401) {
          setError('密码错误，请重试')
          setLoading(false)
          return
        }
        if (!res.ok) {
          setError('登录失败，请稍后重试')
          setLoading(false)
          return
        }

        const data = await res.json()
        onLogin(data.token, data.user)
      }
    } catch {
      setError('无法连接后端服务，请确保后端已启动')
    }
    setLoading(false)
  }, [username, password, isRegister, onLogin])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }, [handleSubmit])

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-title">灵山胜境</div>
        <div className="login-subtitle">AI 数字人导游 · 智慧旅游助手</div>

        <input
          className="login-input"
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <input
          className="login-input"
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button className="login-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? '请稍候...' : isRegister ? '注册并进入' : '登录'}
        </button>

        <div className="login-error">{error}</div>

        <div className="login-hint" onClick={() => { setIsRegister(!isRegister); setError('') }}
             style={{ cursor: 'pointer', textDecoration: 'underline' }}>
          {isRegister ? '已有账号？点击登录' : '没有账号？点击注册'}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
