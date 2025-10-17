import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './PhoneAuthForm.css'

interface PhoneRegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

function PhoneRegisterForm({ onSuccess, onSwitchToLogin }: PhoneRegisterFormProps) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { registerWithPhone } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone.trim()) {
      setError('Введите номер телефона')
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
    const { error } = await registerWithPhone(phone, password)
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="phone-auth-form">
      <h3>Регистрация по телефону</h3>

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
            placeholder="Минимум 6 символьов"
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

export default PhoneRegisterForm
