import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { state } = useAuth()
  
  if (!state.user) {
    return <Navigate to="/login" replace />
  }
  
  if (requireAdmin && state.user.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  
  return children
}

export default ProtectedRoute
