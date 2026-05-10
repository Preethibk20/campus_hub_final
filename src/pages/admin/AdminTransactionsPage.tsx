import React, { useState, useEffect } from 'react'
import { Download, Calendar, Filter, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import EscrowStatusBadge from '@/components/features/EscrowStatusBadge'
import apiClient from '@/api/client'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Transaction {
  orderId: string
  gigId: string
  gigTitle: string
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  amount: number
  platformFee: number
  escrowStatus: 'pending' | 'held' | 'released' | 'refunded' | 'disputed'
  createdAt: string
  completedAt?: string
}

const AdminTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  
  const toast = useToast()
  const pageSize = 20

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
      })
      
      if (fromDate) params.append('from', fromDate)
      if (toDate) params.append('to', toDate)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await apiClient.get(`/api/admin/transactions?${params}`)
      setTransactions(response.data.content)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, fromDate, toDate, statusFilter])

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const params = new URLSearchParams()
      if (fromDate) params.append('from', fromDate)
      if (toDate) params.append('to', toDate)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await apiClient.get(`/api/admin/transactions/export?${params}`, {
        responseType: 'blob',
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Transactions exported successfully')
    } catch (error) {
      console.error('Failed to export transactions:', error)
      toast.error('Failed to export transactions')
    } finally {
      setIsExporting(false)
    }
  }

  // Calculate totals
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
  const totalFees = transactions.reduce((sum, t) => sum + t.platformFee, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Transactions</h1>
          <p className="text-text-secondary">Monitor all platform transactions</p>
        </div>
        <Button
          onClick={handleExport}
          loading={isExporting}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-card border border-border p-4 shadow-card">
          <p className="text-sm text-text-secondary mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-text-primary">{transactions.length}</p>
        </div>
        <div className="bg-white rounded-card border border-border p-4 shadow-card">
          <p className="text-sm text-text-secondary mb-1">Total Volume</p>
          <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-card border border-border p-4 shadow-card">
          <p className="text-sm text-text-secondary mb-1">Platform Fees</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalFees)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white rounded-card border border-border p-4 shadow-card">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-muted" />
          <span className="text-sm text-text-secondary">From:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-border rounded-input px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">To:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-border rounded-input px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-border rounded-input px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="held">Held</option>
            <option value="released">Released</option>
            <option value="refunded">Refunded</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>

        <Button variant="secondary" onClick={() => {
          setFromDate('')
          setToDate('')
          setStatusFilter('all')
          setCurrentPage(0)
        }}>
          Clear Filters
        </Button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                  Gig
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                  Buyer
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                  Seller
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">
                  Fee
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-text-secondary">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.orderId} className="hover:bg-surface-2">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-text-primary">
                        #{transaction.orderId.slice(-6)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-text-primary truncate max-w-xs">
                          {transaction.gigTitle}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-text-secondary">{transaction.buyerName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-text-secondary">{transaction.sellerName}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium text-text-primary">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm text-text-secondary">
                        {formatCurrency(transaction.platformFee)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <EscrowStatusBadge status={transaction.escrowStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-text-secondary">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-text-secondary">
            Page {currentPage + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminTransactionsPage
