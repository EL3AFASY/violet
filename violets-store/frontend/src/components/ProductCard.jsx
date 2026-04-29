import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useCart } from '../context/CartContext'

const ProductCard = ({ product }) => {
  const { dispatch } = useCart()

  const addToCart = () => {
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { product: product._id, name: product.name, price: product.finalPrice, image: product.images[0] || '' } 
    })
    toast.success(`${product.name} added to cart!`)
  }

  const discountPrice = product.finalPrice.toFixed(0)
  const originalPrice = product.price.toFixed(0)
  const savings = (product.price - product.finalPrice).toFixed(0)

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-64 bg-gray-100">
        <img 
          src={product.images[0] || '/placeholder.jpg'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{product.discount}%
          </div>
        )}
      </div>
      
      <div className="p-6">
        <Link to={`/product/${product._id}`} className="block hover:text-violet-600 transition-colors">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">${discountPrice}</div>
            {product.discount > 0 && (
              <div className="text-sm text-gray-500 line-through">${originalPrice}</div>
            )}
          </div>
          
          <button 
            onClick={addToCart}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
