import React, { useState, useEffect } from 'react'
import {
  Users,
  Briefcase,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import apiClient from '@/api/client'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  totalUsers: number
  activeGigs: number
  totalOrders: number
  revenueThisMonth: number
  dailyOrders: { date: string; count: number }[]
  topCategories: { name: string; count: number }[]
  userGrowth: number
  orderGrowth: number
  revenueGrowth: number
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

const AdminOverviewPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiClient.get('/api/admin/analytics')
        setData(response.data)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: data.totalUsers.toLocaleString(),
      icon: Users,
      change: data.userGrowth,
      changeLabel: 'vs last month',
    },
    {
      title: 'Active Gigs',
      value: data.activeGigs.toLocaleString(),
      icon: Briefcase,
      change: null,
      changeLabel: 'currently live',
    },
    {
      title: 'Total Orders',
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: data.orderGrowth,
      changeLabel: 'vs last month',
    },
    {
      title: 'Revenue This Month',
      value: formatCurrency(data.revenueThisMonth),
      icon: IndianRupee,
      change: data.revenueGrowth,
      changeLabel: 'vs last month',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Overview</h1>
        <p className="text-text-secondary">Platform analytics and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          const isPositive = card.change && card.change > 0
          const isNegative = card.change && card.change < 0

          return (
            <div
              key={card.title}
              className="bg-white rounded-card border border-border p-6 shadow-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                {card.change !== null && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-sm font-medium',
                      isPositive && 'text-success',
                      isNegative && 'text-danger',
                      !isPositive && !isNegative && 'text-text-muted'
                    )}
                  >
                    {isPositive && <TrendingUp className="w-4 h-4" />}
                    {isNegative && <TrendingDown className="w-4 h-4" />}
                    {card.change !== null && `${Math.abs(card.change)}%`}
                  </div>
                )}
              </div>
              <p className="text-3xl font-bold text-text-primary">{card.value}</p>
              <p className="text-sm text-text-secondary mt-1">{card.title}</p>
              {card.change === null && (
                <p className="text-xs text-text-muted mt-1">{card.changeLabel}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Orders Chart */}
        <div className="bg-white rounded-card border border-border p-6 shadow-card">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Daily Orders (Last 30 Days)
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} orders`, 'Orders']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories Chart */}
        <div className="bg-white rounded-card border border-border p-6 shadow-card">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Top Categories
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.topCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="name"
                >
                  {data.topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} gigs`, name]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {data.topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-text-secondary">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOverviewPage
