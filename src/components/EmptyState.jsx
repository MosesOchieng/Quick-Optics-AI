import { Link } from 'react-router-dom'
import './EmptyState.css'

const EmptyState = ({
  icon = '📭',
  title = 'No data found',
  message = 'There\'s nothing here yet.',
  actionLabel,
  actionPath,
  onAction,
  children
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-content">
        <div className="empty-state-icon">{icon}</div>
        <h2 className="empty-state-title">{title}</h2>
        <p className="empty-state-message">{message}</p>
        
        {children && (
          <div className="empty-state-children">
            {children}
          </div>
        )}

        {(actionLabel && actionPath) && (
          <Link to={actionPath} className="empty-state-action">
            {actionLabel}
          </Link>
        )}

        {actionLabel && onAction && (
          <button onClick={onAction} className="empty-state-action">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default EmptyState

