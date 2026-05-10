import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
}

interface FilterSidebarProps {
  categories: Category[]
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  className,
  isOpen = true,
  onClose,
}) => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Get current filter values
  const currentCategory = searchParams.get('category') || ''
  const currentType = searchParams.get('type') || 'all'
  const currentMinBudget = searchParams.get('minBudget') || ''
  const currentMaxBudget = searchParams.get('maxBudget') || ''
  const currentSort = searchParams.get('sort') || 'relevance'

  // Update URL params
  const updateParam = (key: string, value: string) => {
    if (value) {
      searchParams.set(key, value)
    } else {
      searchParams.delete(key)
    }
    setSearchParams(searchParams)
  }

  const handleCategoryChange = (categoryId: string) => {
    updateParam('category', categoryId === currentCategory ? '' : categoryId)
  }

  const handleTypeChange = (type: string) => {
    updateParam('type', type === 'all' ? '' : type)
  }

  const handleBudgetChange = (field: 'minBudget' | 'maxBudget', value: string) => {
    updateParam(field, value)
  }

  const handleSortChange = (sort: string) => {
    updateParam('sort', sort)
  }

  const clearFilters = () => {
    const newParams = new URLSearchParams()
    // Keep search query if exists
    const searchQuery = searchParams.get('q')
    if (searchQuery) {
      newParams.set('q', searchQuery)
    }
    setSearchParams(newParams)
  }

  const hasActiveFilters = currentCategory || currentType !== 'all' || currentMinBudget || currentMaxBudget || currentSort !== 'relevance'

  return (
    <div className={cn(
      'bg-white rounded-card border border-border p-6 shadow-card',
      'w-full lg:w-80 h-fit',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-text-muted hover:text-text-primary"
            >
              Clear All
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="font-medium text-text-primary mb-3">Category</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-3 cursor-pointer hover:bg-surface-2 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={currentCategory === category.id}
                onChange={() => handleCategoryChange(category.id)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <span className="text-sm text-text-primary">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div className="mb-6">
        <h3 className="font-medium text-text-primary mb-3">Type</h3>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'SERVICE', label: 'Service' },
            { value: 'REQUEST', label: 'Request' },
          ].map((type) => (
            <label
              key={type.value}
              className="flex items-center gap-3 cursor-pointer hover:bg-surface-2 p-2 rounded"
            >
              <input
                type="radio"
                name="type"
                checked={currentType === type.value}
                onChange={() => handleTypeChange(type.value)}
                className="w-4 h-4 text-primary border-border focus:ring-primary"
              />
              <span className="text-sm text-text-primary">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget Range */}
      <div className="mb-6">
        <h3 className="font-medium text-text-primary mb-3">Budget Range</h3>
        <div className="space-y-3">
          <Input
            label="Minimum"
            type="number"
            placeholder="0"
            value={currentMinBudget}
            onChange={(e) => handleBudgetChange('minBudget', e.target.value)}
            prefix="₹"
          />
          <Input
            label="Maximum"
            type="number"
            placeholder="10000"
            value={currentMaxBudget}
            onChange={(e) => handleBudgetChange('maxBudget', e.target.value)}
            prefix="₹"
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <h3 className="font-medium text-text-primary mb-3">Sort By</h3>
        <select
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-input focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest First</option>
          <option value="budget_low_high">Budget: Low to High</option>
          <option value="budget_high_low">Budget: High to Low</option>
        </select>
      </div>

      {/* Mobile Apply Button */}
      <div className="lg:hidden">
        <Button
          onClick={onClose}
          className="w-full"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )
}

export default FilterSidebar
