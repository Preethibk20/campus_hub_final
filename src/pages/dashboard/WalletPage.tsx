import React, { useState, useEffect } from 'react'
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft,
  RefreshCw,
  Calendar,
  Banknote,
  CreditCard
} from 'lucide-react'
import Button from '@/components/ui/Button'
import apiClient from '@/api/client'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Wallet {
  availableBalance: number
  pendingBalance: number
  totalEarned: number
  totalSpent: number
  currency: string
}

interface Transaction {
  id: string
  type: 'credit' | 'debit' | 'hold' | 'release'
  amount: number
  description: string
  orderId?: string
  createdAt: string
  status: 'completed' | 'pending'
}

interface TransactionsResponse {
  data: Transaction[]
  pagination: {
    page: number
    size: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<TransactionsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const toast = useToast()

  const fetchWallet = async () => {
    try {
      const response = await apiClient.get('/api/wallet/me')
      setWallet(response.data)
    } catch (error: any) {
      toast.error('Failed to load wallet data', error.response?.data?.message)
    }
  }

  const fetchTransactions = async (page: number = 1) => {
    try {
      const response = await apiClient.get(`/api/wallet/transactions?page=${page}&size=20`)
      setTransactions(response.data)
    } catch (error: any) {
      toast.error('Failed to load transactions', error.response?.data?.message)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchWallet(), fetchTransactions(1)])
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchTransactions(page)
  }

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="w-4 h-4" />
      case 'debit':
        return <ArrowUpRight className="w-4 h-4" />
      case 'hold':
        return <Clock className="w-4 h-4" />
      case 'release':
        return <RefreshCw className="w-4 h-4" />
      default:
        return <Banknote className="w-4 h-4" />
    }
  }

  const getTransactionColor = (type: Transaction['type'], status: Transaction['status']) => {
    if (status === 'pending') return 'text-orange-600 bg-orange-100'
    
    switch (type) {
      case 'credit':
        return 'text-success bg-success/10'
      case 'debit':
        return 'text-danger bg-danger/10'
      case 'hold':
        return 'text-warning bg-warning/10'
      case 'release':
        return 'text-info bg-info/10'
      default:
        return 'text-text-muted bg-surface-2'
    }
  }

  const getTransactionLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'credit':
        return 'Credit'
      case 'debit':
        return 'Debit'
      case 'hold':
        return 'Hold'
      case 'release':
        return 'Release'
      default:
        return 'Other'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            My Wallet
          </h1>
          <p className="text-text-secondary">
            Manage your earnings and transactions
          </p>
        </div>

        {/* Wallet Cards */}
        {wallet && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Available Balance */}
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <Wallet className="w-8 h-8" />
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  Available
                </span>
              </div>
              <p className="text-3xl font-bold mb-1">
                {formatCurrency(wallet.availableBalance)}
              </p>
              <p className="text-sm opacity-90">
                Ready to withdraw
              </p>
            </div>

            {/* Pending Balance */}
            <div className="bg-white rounded-card border border-border p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-warning" />
                <span className="px-2 py-1 bg-warning/10 text-warning rounded-full text-xs">
                  Pending
                </span>
              </div>
              <p className="text-3xl font-bold text-text-primary mb-1">
                {formatCurrency(wallet.pendingBalance)}
              </p>
              <p className="text-sm text-text-secondary">
                Held in escrow
              </p>
            </div>

            {/* Total Earned */}
            <div className="bg-white rounded-card border border-border p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-success" />
                <span className="px-2 py-1 bg-success/10 text-success rounded-full text-xs">
                  Lifetime
                </span>
              </div>
              <p className="text-3xl font-bold text-text-primary mb-1">
                {formatCurrency(wallet.totalEarned)}
              </p>
              <p className="text-sm text-text-secondary">
                Total earned
              </p>
            </div>
          </div>
        )}

        {/* Withdraw Button */}
        <div className="mb-8 flex justify-end">
          <Button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex items-center gap-2"
            disabled={!wallet || wallet.availableBalance <= 0}
          >
            <CreditCard className="w-4 h-4" />
            Withdraw Funds
          </Button>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-card border border-border shadow-card">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-text-primary">
              Transaction History
            </h2>
          </div>

          <div className="overflow-x-auto">
            {transactions && transactions.data.length > 0 ? (
              <>
                <table className="w-full">
                  <thead className="bg-surface-2">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border">
                    {transactions.data.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-surface-2 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={cn(
                            'inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium',
                            getTransactionColor(transaction.type, transaction.status)
                          )}>
                            {getTransactionIcon(transaction.type)}
                            <span>{getTransactionLabel(transaction.type)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {transaction.description}
                            </p>
                            {transaction.orderId && (
                              <p className="text-xs text-text-muted">
                                Order #{transaction.orderId.slice(-8)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            'text-sm font-medium',
                            transaction.type === 'credit' || transaction.type === 'release' 
                              ? 'text-success' 
                              : 'text-danger'
                          )}>
                            {transaction.type === 'credit' || transaction.type === 'release' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-text-secondary">
                            <Calendar className="w-3 h-3" />
                            {formatDate(transaction.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {transactions.pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-text-secondary">
                        Showing {((transactions.pagination.page - 1) * transactions.pagination.size) + 1} to{' '}
                        {Math.min(transactions.pagination.page * transactions.pagination.size, transactions.pagination.total)} of{' '}
                        {transactions.pagination.total} transactions
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(transactions.pagination.page - 1)}
                          disabled={!transactions.pagination.hasPrev}
                        >
                          Previous
                        </Button>
                        
                        <span className="px-3 py-1 text-sm text-text-primary">
                          Page {transactions.pagination.page} of {transactions.pagination.totalPages}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(transactions.pagination.page + 1)}
                          disabled={!transactions.pagination.hasNext}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Banknote className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No transactions yet
                </h3>
                <p className="text-text-secondary">
                  Your transaction history will appear here once you start earning.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={wallet?.availableBalance || 0}
        onSuccess={() => {
          fetchWallet()
          setIsWithdrawModalOpen(false)
        }}
      />
    </div>
  )
}

// Withdraw Modal Component
interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  availableBalance: number
  onSuccess: () => void
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  onSuccess,
}) => {
  const [withdrawalMethod, setWithdrawalMethod] = useState<'bank' | 'upi'>('bank')
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const withdrawAmount = parseFloat(amount)
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (withdrawAmount > availableBalance) {
      toast.error('Insufficient balance')
      return
    }

    setIsSubmitting(true)
    try {
      // Placeholder API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Withdrawal request submitted successfully!')
      onSuccess()
    } catch (error: any) {
      toast.error('Failed to submit withdrawal request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    setWithdrawalMethod('bank')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-card border border-border shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Withdraw Funds
          </h2>
          
          <p className="text-text-secondary mb-6">
            Available balance: {formatCurrency(availableBalance)}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Withdrawal Method */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Withdrawal Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary">
                  <input
                    type="radio"
                    name="method"
                    value="bank"
                    checked={withdrawalMethod === 'bank'}
                    onChange={(e) => setWithdrawalMethod(e.target.value as 'bank' | 'upi')}
                  />
                  <Banknote className="w-4 h-4" />
                  <span>Bank Transfer</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary">
                  <input
                    type="radio"
                    name="method"
                    value="upi"
                    checked={withdrawalMethod === 'upi'}
                    onChange={(e) => setWithdrawalMethod(e.target.value as 'bank' | 'upi')}
                  />
                  <CreditCard className="w-4 h-4" />
                  <span>UPI</span>
                </label>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary"
                max={availableBalance}
                min={1}
                step="0.01"
                required
              />
            </div>

            {/* Bank Details (conditional) */}
            {withdrawalMethod === 'bank' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter account number"
                    className="w-full px-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter IFSC code"
                    className="w-full px-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter account holder name"
                    className="w-full px-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>
            )}

            {/* UPI Details (conditional) */}
            {withdrawalMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  UPI ID
                </label>
                <input
                  type="text"
                  placeholder="Enter UPI ID (e.g., username@upi)"
                  className="w-full px-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                className="flex-1"
              >
                Submit Request
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default WalletPage
