import { Link } from 'react-router-dom'
import { ShoppingCart, User, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from 'react-hot-toast'

const Header = () => {
  const { state, dispatch } = useAuth()

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out')
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text text-transparent">
            Violet's
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-violet-600">Home</Link>
            {state.user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-700 hover:text-violet-600">Admin</Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-gray-500 hover:text-violet-600 group">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                {useCart().cart.length}
              </span>
            </Link>
            <Link to="/my-orders" className="p-2 text-gray-500 hover:text-violet-600 hidden md:block">
              Orders
            </Link>
            
            {state.user ? (
              <div className="flex items-center space-x-2">
                <User size={20} className="text-gray-500" />
                <span className="hidden md:inline">{state.user.name}</span>
                <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-violet-600 hover:text-violet-700">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
