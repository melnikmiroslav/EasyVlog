import './Sidebar.css'

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-content">
        <div className="sidebar-section">
          <div className="sidebar-item active">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 4.44l-6.95 6.27V20h5v-6h4v6h5v-9.29L12 4.44zM12 3.19l8.95 8.07V21h-7v-6h-4v6H2v-9.74L12 3.19z"/>
            </svg>
            <span>Главная</span>
          </div>
          <div className="sidebar-item">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25zm-.23 5.86l-8.5 4.5c-1.34.71-3.01.2-3.72-1.14-.71-1.34-.2-3.01 1.14-3.72l2.04-1.08v-1.21l-.69-.28-1.11-.46c-.99-.41-1.65-1.35-1.7-2.41-.05-1.06.52-2.06 1.46-2.56l8.5-4.5c1.34-.71 3.01-.2 3.72 1.14.71 1.34.2 3.01-1.14 3.72L15.5 9.26v1.21l1.8.74c.99.41 1.65 1.35 1.7 2.41.05 1.06-.52 2.06-1.46 2.56z"/>
            </svg>
            <span>Shorts</span>
          </div>
          <div className="sidebar-item">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M10 18v-6l5 3-5 3zm7-15H7v1h10V3zm3 3H4v1h16V6zm2 3H2v12h20V9zM3 10h18v10H3V10z"/>
            </svg>
            <span>Подписки</span>
          </div>
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section">
          <div className="sidebar-item">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M11 7l6 3.5L11 14V7zm7 13H4V6H3v15h15v-1zm3-2H6V3h15v15zM7 17h13V4H7v13z"/>
            </svg>
            <span>Библиотека</span>
          </div>
          <div className="sidebar-item">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M14.97 16.95L10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM12 3c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9m0-1c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/>
            </svg>
            <span>История</span>
          </div>
          <div className="sidebar-item">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M18.4 5.6v12.8H5.6V5.6h12.8zm0-1H5.6C4.72 4.6 4 5.32 4 6.2v12.8c0 .88.72 1.6 1.6 1.6h12.8c.88 0 1.6-.72 1.6-1.6V6.2c0-.88-.72-1.6-1.6-1.6zm-4 8.4H9.6v-1h4.8v1z"/>
            </svg>
            <span>Ваши видео</span>
          </div>
          <div className="sidebar-item">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M14.97 16.95L10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM22 12c0 5.51-4.49 10-10 10S2 17.51 2 12h1c0 4.96 4.04 9 9 9s9-4.04 9-9-4.04-9-9-9C8.81 3 5.92 4.64 4.28 7.38c-.11.18-.22.37-.31.56L3.94 8H8v1H1.96V3h1v4.74c.04-.09.07-.17.11-.25.11-.22.23-.42.35-.63C5.22 3.86 8.51 2 12 2c5.51 0 10 4.49 10 10z"/>
            </svg>
            <span>Смотреть позже</span>
          </div>
          <div className="sidebar-item">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M18.77 11h-4.23l1.52-4.94C16.38 5.03 15.54 4 14.38 4c-.58 0-1.14.24-1.52.65L7 11H3v10h4h1h9.43c1.06 0 1.98-.67 2.19-1.61l1.34-6C21.23 12.15 20.18 11 18.77 11zM7 20H4v-8h3V20zM19.98 13.17l-1.34 6C18.54 19.65 18.03 20 17.43 20H8v-8.61l5.6-6.06C13.79 5.12 14.08 5 14.38 5c.26 0 .5.11.64.31.18.27.18.65.01.92L13.7 10.9L13.18 12h5.59c.86 0 1.52.67 1.42 1.17z"/>
            </svg>
            <span>Понравившиеся</span>
          </div>
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section">
          <h3 className="sidebar-title">Подписки</h3>
          <div className="sidebar-item">
            <div className="channel-avatar">М</div>
            <span>Музыка</span>
          </div>
          <div className="sidebar-item">
            <div className="channel-avatar">Т</div>
            <span>Технологии</span>
          </div>
          <div className="sidebar-item">
            <div className="channel-avatar">И</div>
            <span>Игры</span>
          </div>
          <div className="sidebar-item">
            <div className="channel-avatar">Н</div>
            <span>Новости</span>
          </div>
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section">
          <div className="sidebar-item" onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'EasyVlog',
                text: 'Попробуй это приложение для просмотра видео!',
                url: window.location.href
              }).catch(() => {});
            }
          }}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
            <span>Поделиться приложением</span>
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}

export default Sidebar
