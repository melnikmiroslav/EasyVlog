import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './PhoneAuthForm.css'

interface PhoneLoginFormProps {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

function PhoneLoginForm({ onSuccess, onSwitchToRegister }: PhoneLoginFormProps) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithPhone } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone.trim()) {
      setError('Введите номер телефона')
      return
    }

    if (!password) {
      setError('Введите пароль')
      return
    }

    setLoading(true)
    const { error } = await signInWithPhone(phone, password)
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="phone-auth-form">
      <h3>Вход по телефону</h3>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="phone" className="form-label">Номер телефона</label>
          <input
            type="tel"
            id="phone"
            className="form-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+79001234567"
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

export default PhoneLoginForm
