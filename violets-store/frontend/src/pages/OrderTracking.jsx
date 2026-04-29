import { useState, useEffect, useParams } from 'react'
import { api } from '../utils/api'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Truck, PackageCheck, Clock, MapPin } from 'lucide-react'

const statusConfig = [
  { status: 'pending', label: 'Order Placed', icon: Clock, color: 'gray' },
  { status: 'payment_pending', label: 'Payment Pending', icon: Clock, color: 'yellow' },
  { status: 'confirmed', label: 'Order Confirmed', icon: PackageCheck, color: 'blue' },
  { status: 'processing', label: 'Processing', icon: PackageCheck, color: 'indigo' },
  { status: 'shipped', label: 'Shipped', icon: Truck, color: 'purple' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'green' },
  { status: 'delivered', label: 'Delivered', icon: MapPin, color: 'emerald' },
  { status: 'cancelled', label: 'Cancelled', icon: Clock, color: 'red' }
]

const OrderTracking = () => {
  const { id } = useParams()
  const { state } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadOrder()
  }, [id])

  const loadOrder = async () => {
    try {
      const { data } = await api.get(`/tracking/order/${id}`)
      setOrder(data)
    } catch {
      toast.error('Order not found')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen p-8 flex items-center justify-center"><div className="animate-spin h-12 w-12 border-4 border-violet-200 rounded-full border-t-violet-600"></div></div>

  if (!order || order.user._id !== state.user?.id) return <div className="min-h-screen p-8 flex items-center justify-center text-gray-500">Order not found</div>

  const currentStatusIndex = statusConfig.findIndex(s => s.status === order.status)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order #{order._id.slice(-8)}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                <span>Total: ${order.totalPrice}</span>
                <span>{order.paymentMethod.toUpperCase()}</span>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Order Tracking</h2>
          <div className="relative">
            {statusConfig.map((step, index) => {
              const Icon = step.icon
              const isActive = index <= currentStatusIndex
              const isCurrent = index === currentStatusIndex

              return (
                <div key={step.status} className="flex items-center mb-12 relative">
                  {/* Step Circle */}
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all z-10 ${
                    isActive ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/25' : 'bg-gray-200 text-gray-500'
                  } ${isCurrent ? 'ring-4 ring-emerald-200' : ''}`}>
                    <Icon size={28} />
                  </div>

                  {/* Line */}
                  <div className={`flex-1 h-1 bg-gradient-to-r ${
                    isActive ? 'from-emerald-500 to-green-600 shadow-lg' : 'bg-gray-200'
                  } mx-8 relative z-0`}></div>

                  {/* Step Label */}
                  <div className="min-w-[180px] text-right">
                    <div className={`text-sm font-semibold ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.trackingTimeline?.[index]?.date ? new Date(order.trackingTimeline[index].date).toLocaleDateString() : 'Pending'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Items */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Items</h3>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-500">{item.product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${item.price}</p>
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>${order.totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Tracking */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Shipping Details</h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900">Name</p>
                <p>{order.shippingAddress.name}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Phone</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Address</p>
                <p className="text-gray-700">{order.shippingAddress.address}</p>
              </div>
              {order.trackingNumber && (
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <p className="font-semibold text-emerald-900">Tracking</p>
                  <p className="font-mono text-sm bg-white px-3 py-1 rounded-lg">{order.trackingNumber}</p>
                </div>
              )}
              {order.deliveryEstimate && (
                <div>
                  <p className="font-semibold text-gray-900">Estimated Delivery</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {new Date(order.deliveryEstimate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
