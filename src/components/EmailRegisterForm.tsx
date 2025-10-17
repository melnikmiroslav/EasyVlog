import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './EmailAuthForm.css'

interface EmailRegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

function EmailRegisterForm({ onSuccess, onSwitchToLogin }: EmailRegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Введите email')
      return
    }

    if (!password || password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password)
    setLoading(false)

    if (error) {
      setError('Ошибка регистрации. Возможно, этот email уже используется')
    } else {
      onSuccess()
    }
  }

  return (
    <div className="email-auth-form">
      <h3>Регистрация по email</h3>

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
            placeholder="Минимум 6 символов"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">Подтвердите пароль</label>
          <input
            type="password"
            id="confirmPassword"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторите пароль"
            disabled={loading}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        <div className="toggle-mode">
          <span className="toggle-link" onClick={onSwitchToLogin}>
            Уже есть аккаунт? Войти
          </span>
        </div>
      </form>
    </div>
  )
}

export default EmailRegisterForm
