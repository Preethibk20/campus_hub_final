import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, FileText, CheckCircle, XCircle, Loader2, Download, User } from 'lucide-react'
import Button from '@/components/ui/Button'
import EscrowStatusBadge from '@/components/features/EscrowStatusBadge'
import apiClient from '@/api/client'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Dispute {
  orderId: string
  gigTitle: string
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  amount: number
  raisedAt: string
  raisedBy: 'buyer' | 'seller'
  reason: string
  description: string
  evidence: string[]
  status: 'open' | 'resolved'
  resolution?: {
    decision: 'refund_buyer' | 'release_seller'
    adminNote: string
    resolvedAt: string
    resolvedBy: string
  }
}

const AdminDisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open')
  const [expandedDispute, setExpandedDispute] = useState<string | null>(null)
  const [resolutionDecision, setResolutionDecision] = useState<'refund_buyer' | 'release_seller' | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  
  const toast = useToast()

  const fetchDisputes = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(`/api/admin/disputes?status=${activeTab}`)
      setDisputes(response.data)
    } catch (error) {
      console.error('Failed to fetch disputes:', error)
      toast.error('Failed to load disputes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDisputes()
  }, [activeTab])

  const handleResolve = async (orderId: string) => {
    if (!resolutionDecision) {
      toast.error('Please select a resolution decision')
      return
    }

    try {
      setIsResolving(true)
      await apiClient.post(`/api/admin/disputes/${orderId}/resolve`, {
        decision: resolutionDecision,
        adminNote: adminNote.trim(),
      })

      toast.success('Dispute resolved successfully')
      setExpandedDispute(null)
      setResolutionDecision(null)
      setAdminNote('')
      fetchDisputes()
    } catch (error: any) {
      toast.error('Failed to resolve dispute', error.response?.data?.message)
    } finally {
      setIsResolving(false)
    }
  }

  const toggleExpand = (orderId: string) => {
    if (expandedDispute === orderId) {
      setExpandedDispute(null)
      setResolutionDecision(null)
      setAdminNote('')
    } else {
      setExpandedDispute(orderId)
      const dispute = disputes.find(d => d.orderId === orderId)
      if (dispute?.resolution) {
        setResolutionDecision(dispute.resolution.decision)
        setAdminNote(dispute.resolution.adminNote)
      } else {
        setResolutionDecision(null)
        setAdminNote('')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dispute Center</h1>
        <p className="text-text-secondary">Manage and resolve order disputes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('open')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'open'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          Open Disputes ({activeTab === 'open' ? disputes.length : '-'})
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'resolved'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          Resolved Disputes ({activeTab === 'resolved' ? disputes.length : '-'})
        </button>
      </div>

      {/* Disputes List */}
      <div className="bg-white rounded-card border border-border shadow-card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="text-text-secondary">
              {activeTab === 'open' ? 'No open disputes. Great!' : 'No resolved disputes yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {disputes.map((dispute) => (
              <div key={dispute.orderId} className="overflow-hidden">
                {/* Dispute Row */}
                <button
                  onClick={() => toggleExpand(dispute.orderId)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-surface-2 transition-colors text-left"
                >
                  <div className="flex-shrink-0">
                    {expandedDispute === dispute.orderId ? (
                      <ChevronUp className="w-5 h-5 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 grid grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="text-sm font-medium text-text-primary">#{dispute.orderId.slice(-6)}</p>
                      <p className="text-xs text-text-muted truncate">{dispute.gigTitle}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-sm text-text-primary">{dispute.buyerName}</p>
                        <p className="text-xs text-text-muted">Buyer</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-sm text-text-primary">{dispute.sellerName}</p>
                        <p className="text-xs text-text-muted">Seller</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-text-primary">{formatCurrency(dispute.amount)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-text-secondary">
                        {formatRelativeTime(dispute.raisedAt)}
                      </p>
                      <p className="text-xs text-text-muted">
                        by {dispute.raisedBy}
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      {dispute.status === 'resolved' && dispute.resolution ? (
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          dispute.resolution.decision === 'refund_buyer'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-green-100 text-green-600'
                        )}>
                          {dispute.resolution.decision === 'refund_buyer' ? 'Refunded' : 'Released'}
                        </span>
                      ) : (
                        <EscrowStatusBadge status="disputed" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Detail Panel */}
                {expandedDispute === dispute.orderId && (
                  <div className="px-4 pb-4 bg-surface-2/50">
                    <div className="pl-9 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Dispute Details */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border border-border">
                          <h4 className="font-medium text-text-primary mb-3">Dispute Reason</h4>
                          <p className="text-sm text-text-secondary mb-2">
                            <span className="font-medium">Category:</span> {dispute.reason}
                          </p>
                          <p className="text-sm text-text-secondary">
                            <span className="font-medium">Description:</span> {dispute.description}
                          </p>
                        </div>

                        {/* Evidence Files */}
                        {dispute.evidence.length > 0 && (
                          <div className="bg-white rounded-lg p-4 border border-border">
                            <h4 className="font-medium text-text-primary mb-3">Evidence</h4>
                            <div className="flex flex-wrap gap-2">
                              {dispute.evidence.map((url, index) => (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 bg-surface-2 rounded-lg hover:bg-surface-2 transition-colors"
                                >
                                  <FileText className="w-4 h-4 text-primary" />
                                  <span className="text-sm text-primary">File {index + 1}</span>
                                  <Download className="w-4 h-4 text-text-muted" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resolution Details (for resolved disputes) */}
                        {dispute.status === 'resolved' && dispute.resolution && (
                          <div className="bg-white rounded-lg p-4 border border-border">
                            <h4 className="font-medium text-text-primary mb-3">Resolution</h4>
                            <p className="text-sm text-text-secondary mb-2">
                              <span className="font-medium">Decision:</span>{' '}
                              <span className={cn(
                                dispute.resolution.decision === 'refund_buyer'
                                  ? 'text-blue-600'
                                  : 'text-green-600'
                              )}>
                                {dispute.resolution.decision === 'refund_buyer'
                                  ? 'Refund to Buyer'
                                  : 'Release to Seller'}
                              </span>
                            </p>
                            <p className="text-sm text-text-secondary mb-2">
                              <span className="font-medium">Admin Note:</span> {dispute.resolution.adminNote}
                            </p>
                            <p className="text-xs text-text-muted">
                              Resolved by {dispute.resolution.resolvedBy} on{' '}
                              {formatDate(dispute.resolution.resolvedAt)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Resolution Form (for open disputes) */}
                      {dispute.status === 'open' && (
                        <div className="bg-white rounded-lg p-4 border border-border">
                          <h4 className="font-medium text-text-primary mb-4">Resolve Dispute</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">
                                Resolution Decision *
                              </label>
                              <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface-2 transition-colors">
                                  <input
                                    type="radio"
                                    name={`resolution-${dispute.orderId}`}
                                    value="refund_buyer"
                                    checked={resolutionDecision === 'refund_buyer'}
                                    onChange={() => setResolutionDecision('refund_buyer')}
                                    className="text-primary focus:ring-primary"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-text-primary">Refund Buyer</p>
                                    <p className="text-sm text-text-secondary">
                                      Return full amount to buyer, order cancelled
                                    </p>
                                  </div>
                                  <CheckCircle className="w-5 h-5 text-blue-600" />
                                </label>
                                
                                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface-2 transition-colors">
                                  <input
                                    type="radio"
                                    name={`resolution-${dispute.orderId}`}
                                    value="release_seller"
                                    checked={resolutionDecision === 'release_seller'}
                                    onChange={() => setResolutionDecision('release_seller')}
                                    className="text-primary focus:ring-primary"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-text-primary">Release to Seller</p>
                                    <p className="text-sm text-text-secondary">
                                      Release payment to seller, order complete
                                    </p>
                                  </div>
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </label>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">
                                Admin Note *
                              </label>
                              <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Explain your decision..."
                                rows={4}
                                className="w-full px-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                              />
                            </div>

                            <Button
                              onClick={() => handleResolve(dispute.orderId)}
                              loading={isResolving}
                              disabled={!resolutionDecision || !adminNote.trim()}
                              className="w-full"
                            >
                              Submit Resolution
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDisputesPage
