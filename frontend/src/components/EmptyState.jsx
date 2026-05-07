import React from 'react'
import { Link } from 'react-router-dom'

const EmptyState = ({ 
  icon = '📋', 
  title, 
  description, 
  actionText, 
  actionLink,
  actionOnClick 
}) => {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {actionText && (
        actionLink ? (
          <Link to={actionLink} className="btn-primary">
            {actionText}
          </Link>
        ) : (
          <button onClick={actionOnClick} className="btn-primary">
            {actionText}
          </button>
        )
      )}
    </div>
  )
}

export default EmptyState