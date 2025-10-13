import { useState } from 'react'
import PhoneLoginForm from './PhoneLoginForm'
import PhoneRegisterForm from './PhoneRegisterForm'
import EmailLoginForm from './EmailLoginForm'
import EmailRegisterForm from './EmailRegisterForm'
import './AuthModal.css'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'choice' | 'phone-login' | 'phone-register' | 'email-login' | 'email-register'

function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('choice')

  if (!isOpen) return null

  const handleClose = () => {
    setMode('choice')
    onClose()
  }

  const handleSuccess = () => {
    handleClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {mode === 'choice' && (
          <>
            <h2 className="modal-title">Вход на сайт</h2>

            <p style={{ textAlign: 'center', color: '#606060', marginBottom: '24px', fontSize: '14px' }}>
              Выберите способ входа
            </p>

            <button
              type="button"
              className="auth-option-button"
              onClick={() => setMode('email-login')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Войти по email
            </button>

            <div className="divider">или</div>

            <button
              type="button"
              className="auth-option-button"
              onClick={() => setMode('phone-login')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.25 5.25c0-.69-.56-1.25-1.25-1.25H8c-.69 0-1.25.56-1.25 1.25v13.5c0 .69.56 1.25 1.25 1.25h8c.69 0 1.25-.56 1.25-1.25V5.25zM12 18.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4-3H8V6h8v9.5z"/>
              </svg>
              Войти по телефону
            </button>
          </>
        )}

        {mode === 'email-login' && (
          <EmailLoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => setMode('email-register')}
          />
        )}

        {mode === 'email-register' && (
          <EmailRegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setMode('email-login')}
          />
        )}

        {mode === 'phone-login' && (
          <PhoneLoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => setMode('phone-register')}
          />
        )}

        {mode === 'phone-register' && (
          <PhoneRegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setMode('phone-login')}
          />
        )}
      </div>
    </div>
  )
}

export default AuthModal
