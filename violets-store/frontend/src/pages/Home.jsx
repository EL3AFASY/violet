import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import ProductSkeleton from '../components/ProductSkeleton'
import { productsAPI } from '../utils/api'
import { useCart } from '../context/CartContext'

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async (filters = {}) => {
    try {
      setLoading(true)
      const { data } = await productsAPI.getAll(filters)
      setProducts(data)
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts({ search: search })
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl leading-tight">
            Violet's Luxury
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-95 drop-shadow-lg max-w-2xl mx-auto">
            Discover our exclusive collection of handcrafted bags and accessories
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search handbags, wallets, accessories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-8 py-5 rounded-2xl text-lg bg-white/20 backdrop-blur-lg border-2 border-white/30 focus:border-white focus:outline-none text-white placeholder-white/70 shadow-2xl"
            />
            <button
              type="submit"
              className="px-12 py-5 bg-white text-violet-600 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent mb-6">
              Our Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handcrafted luxury bags and accessories designed for the modern woman
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
