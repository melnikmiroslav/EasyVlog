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

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            disabled={loading}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>

        <button
          type="button"
          className="link-button"
          onClick={onSwitchToRegister}
          disabled={loading}
        >
          Нет аккаунта? Зарегистрироваться
        </button>
      </form>
    </div>
  )
}

export default EmailLoginForm
