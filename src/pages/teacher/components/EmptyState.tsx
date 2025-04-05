import type React from "react"
import type { ReactNode } from "react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm border border-gray-100">
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}

export default EmptyState

