import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Dialog, Tab } from '@headlessui/react'
import { productsAPI, ordersAPI, api } from '../utils/api'
import { Edit3, Trash2 } from 'lucide-react'

const AdminDashboard = () => {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // PRODUCTS (أساسي)
      const productsRes = await productsAPI.getAll()
      setProducts(productsRes.data || [])

      // ORDERS (لو فشل ميوقعش الصفحة)
      try {
        const ordersRes = await ordersAPI.allOrders()
        setOrders(ordersRes.data || [])
      } catch (err) {
        console.error('Orders error:', err)
      }

      // STATS (لو فشل ميكسرش الدنيا)
      try {
        const statsRes = await api.get('/admin/stats')
        setStats(statsRes.data || { products: 0, orders: 0, revenue: 0 })
      } catch (err) {
        console.error('Stats error:', err)
      }

    } catch (error) {
      console.error('Products error:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete product?')) return
    try {
      await productsAPI.delete(id)
      toast.success('Product deleted')
      loadData()
    } catch {
      toast.error('Delete failed')
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}`, { status })
      toast.success('Status updated')
      loadData()
    } catch {
      toast.error('Update failed')
    }
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setIsOpen(true)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    try {
      await productsAPI.update(editingProduct._id, editingProduct)
      toast.success('Product updated')
      setIsOpen(false)
      loadData()
    } catch {
      toast.error('Update failed')
    }
  }

  if (loading) {
    return (
      <div className="p-12 grid place-items-center">
        <div className="animate-spin h-12 w-12 border-4 border-violet-200 border-t-violet-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-8">

      <h1 className="text-4xl font-bold text-violet-700">
        Admin Dashboard
      </h1>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-violet-600 text-white p-6 rounded-xl">
          <p>Products</p>
          <h2 className="text-2xl font-bold">{stats.products}</h2>
        </div>

        <div className="bg-green-600 text-white p-6 rounded-xl">
          <p>Orders</p>
          <h2 className="text-2xl font-bold">{stats.orders}</h2>
        </div>

        <div className="bg-pink-600 text-white p-6 rounded-xl">
          <p>Revenue</p>
          <h2 className="text-2xl font-bold">${stats.revenue}</h2>
        </div>
      </div>

      {/* TABS */}
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex gap-2">
          <Tab className="px-4 py-2 bg-gray-200 rounded">Products</Tab>
          <Tab className="px-4 py-2 bg-gray-200 rounded">Orders</Tab>
        </Tab.List>

        <Tab.Panels>

          {/* PRODUCTS */}
          <Tab.Panel>
            {products.length === 0 ? (
              <p>No products</p>
            ) : (
              <table className="w-full mt-4">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>${p.finalPrice}</td>
                      <td>{p.stock}</td>
                      <td className="flex gap-2">
                        <button onClick={() => openEdit(p)}>
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => deleteProduct(p._id)}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Tab.Panel>

          {/* ORDERS */}
          <Tab.Panel>
            {orders.length === 0 ? (
              <p>No orders</p>
            ) : (
              orders.map(o => (
                <div key={o._id} className="border p-4 mt-2">
                  <p>{o.user?.name}</p>
                  <p>${o.totalPrice}</p>

                  <select
                    value={o.status}
                    onChange={(e) =>
                      updateOrderStatus(o._id, e.target.value)
                    }
                  >
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                  </select>
                </div>
              ))
            )}
          </Tab.Panel>

        </Tab.Panels>
      </Tab.Group>

      {/* EDIT MODAL */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <form onSubmit={saveEdit}>
              <input
                className="border p-2 w-full"
                value={editingProduct?.name || ''}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    name: e.target.value
                  })
                }
              />

              <button
                type="submit"
                className="mt-4 bg-violet-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </Dialog>

    </div>
  )
}

export default AdminDashboard