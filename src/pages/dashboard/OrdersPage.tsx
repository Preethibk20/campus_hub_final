import React, { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import apiClient from '@/api/client'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface Order {
  id: string
  gig: {
    id: string
    title: string
    category: string
  }
  buyer: {
    id: string
    name: string
  }
  seller: {
    id: string
    name: string
  }
  amount: number
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  createdAt: string
  type: 'buyer' | 'seller'
}

const OrdersPage: React.FC = () => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get('/api/orders')
        const allOrders = response.data || []
        
        // Filter orders based on current user role
        const userOrders = allOrders.map((order: any) => ({
          ...order,
          type: order.buyer.id === user?.id ? 'buyer' : 'seller'
        }))
        
        setOrders(userOrders)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
        // Mock data for demo
        setOrders([
          {
            id: '1',
            gig: { id: '1', title: 'Web Development Project', category: 'Web Development' },
            buyer: { id: '1', name: 'John Doe' },
            seller: { id: '2', name: 'Jane Smith' },
            amount: 500,
            status: 'active',
            createdAt: '2024-01-15T10:30:00Z',
            type: 'buyer',
          },
          {
            id: '2',
            gig: { id: '2', title: 'Logo Design', category: 'Design' },
            buyer: { id: '3', name: 'Mike Johnson' },
            seller: { id: '1', name: 'John Doe' },
            amount: 200,
            status: 'completed',
            createdAt: '2024-01-10T15:45:00Z',
            type: 'seller',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'active':
        return <Package className="w-4 h-4 text-blue-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredOrders = orders.filter(order => order.type === activeTab)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Manage your orders as buyer and seller</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'buyer'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              As Buyer
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'seller'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              As Seller
            </button>
          </div>

          <div className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No orders found</p>
                <p className="text-sm text-gray-500">
                  {activeTab === 'buyer' 
                    ? 'Start browsing gigs to place your first order!'
                    : 'Post more gigs to get orders from buyers!'
                  }
                </p>
                <Button className="mt-4">
                  {activeTab === 'buyer' ? 'Browse Gigs' : 'Create Gig'}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="pb-3 font-medium">Gig Title</th>
                      <th className="pb-3 font-medium">
                        {activeTab === 'buyer' ? 'Seller' : 'Buyer'}
                      </th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-4">
                          <div>
                            <p className="font-medium text-gray-900">{order.gig.title}</p>
                            <p className="text-sm text-gray-500">{order.gig.category}</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-medium text-gray-600">
                                {(activeTab === 'buyer' ? order.seller : order.buyer).name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900">
                              {activeTab === 'buyer' ? order.seller.name : order.buyer.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="font-medium text-gray-900">
                              {formatCurrency(order.amount)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center">
                            {getStatusIcon(order.status)}
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersPage
