import './Skeleton.css'

const Skeleton = ({ variant = 'text', width, height, className = '' }) => {
  const style = {}
  if (width) style.width = width
  if (height) style.height = height

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={style}
      aria-label="Loading..."
    />
  )
}

export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
          height="1rem"
        />
      ))}
    </div>
  )
}

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`skeleton-card ${className}`}>
      <Skeleton variant="rectangular" width="100%" height="200px" />
      <div style={{ padding: '1rem' }}>
        <Skeleton variant="text" width="80%" height="1.5rem" />
        <SkeletonText lines={2} className="mt-1" />
      </div>
    </div>
  )
}

export const SkeletonList = ({ items = 5, className = '' }) => {
  return (
    <div className={`skeleton-list ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height="1rem" />
            <Skeleton variant="text" width="40%" height="0.8rem" className="mt-0.5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default Skeleton

