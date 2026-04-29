import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { ordersAPI } from '../utils/api'
import { useState } from 'react'

const Cart = () => {
  const { cart, dispatch } = useCart()
  const { state } = useAuth()
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { product: productId, quantity } })
  }

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!state.user) {
      toast.error('Please login to checkout')
      return
    }

    const formData = new FormData(e.target)
    const shippingAddress = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address')
    }

    setCheckoutLoading(true)
    try {
      await ordersAPI.create({
        items: cart.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress
      })
      dispatch({ type: 'CLEAR_CART' })
      toast.success('Order placed successfully!')
    } catch (error) {
      toast.error('Checkout failed')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <div className="text-6xl text-gray-300 mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <Link to="/" className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
        <div className="divide-y divide-gray-200">
          {cart.map(item => (
            <div key={item.product} className="p-6 flex items-center">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg mr-6" />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-500">${item.price}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => updateQuantity(item.product, item.quantity - 1)}
                  className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.product, item.quantity + 1)}
                  className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
                <button 
                  onClick={() => removeItem(item.product)}
                  className="ml-4 text-red-600 hover:text-red-900 font-semibold"
                >
                  Remove
                </button>
              </div>
              <div className="ml-8 font-bold text-lg">${(item.price * item.quantity).toFixed(0)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow">
        <div className="flex justify-between items-center mb-8">
          <h2>Total: <span className="text-2xl font-bold text-violet-600">${total.toFixed(0)}</span></h2>
          <Link to="/" className="text-gray-500 hover:text-gray-700">← Continue Shopping</Link>
        </div>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input name="name" placeholder="Full Name *" required className="p-4 border rounded-lg" />
          <input name="phone" placeholder="Phone *" required className="p-4 border rounded-lg" />
          <textarea name="address" placeholder="Shipping Address *" rows="3" required className="md:col-span-2 p-4 border rounded-lg" />
          
          <button 
            type="submit" 
            disabled={checkoutLoading || cart.length === 0}
            className="md:col-span-2 bg-violet-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:bg-violet-700 disabled:opacity-50"
          >
            {checkoutLoading ? 'Processing...' : `Place Order - $${total.toFixed(0)}`}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Cart
