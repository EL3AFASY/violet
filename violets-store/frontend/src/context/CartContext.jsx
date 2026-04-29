import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existing = state.find(item => item.product === action.payload.product)
      if (existing) {
        return state.map(item =>
          item.product === action.payload.product
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...state, action.payload]
    case 'UPDATE_QUANTITY':
      return state.map(item =>
        item.product === action.payload.product
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0)
    case 'REMOVE_ITEM':
      return state.filter(item => item.product !== action.payload)
    case 'CLEAR_CART':
      return []
    case 'LOAD_CART':
      return action.payload
    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, [])

  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) dispatch({ type: 'LOAD_CART', payload: JSON.parse(saved) })
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

export default CartContext
