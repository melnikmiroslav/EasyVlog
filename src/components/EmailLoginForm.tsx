import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './EmailAuthForm.css'

interface EmailLoginFormProps {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

function EmailLoginForm({ onSuccess, onSwitchToRegister }: EmailLoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Введите email')
      return
    }

    if (!password) {
      setError('Введите пароль')
      return
    }

    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      setError('Неверный email или пароль')
    } else {
      onSuccess()
    }
  }

  return (
    <div className="email-auth-form">
      <h3>Вход по email</h3>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Пароль</label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            disabled={loading}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>

        <div className="toggle-mode">
          <span className="toggle-link" onClick={onSwitchToRegister}>
            Нет аккаунта? Зарегистрироваться
          </span>
        </div>
      </form>
    </div>
  )
}

export default EmailLoginForm
