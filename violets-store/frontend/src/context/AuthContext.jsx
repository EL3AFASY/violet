import { createContext, useContext, useReducer, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('token', action.payload.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`
      return { ...state, user: action.payload.user }
    case 'LOGOUT':
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      return { ...state, user: null }
    case 'LOAD_USER':
      return { ...state, user: action.payload }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // axios.get('/api/auth/me').then(res => dispatch({ type: 'LOAD_USER', payload: res.data }))
    }
  }, [])

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext
