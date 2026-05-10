import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import Input from '@/components/ui/Input'
import { debounce } from '@/lib/utils'

interface SearchBarProps {
  className?: string
  placeholder?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  className,
  placeholder = 'Search for gigs...'
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [localValue, setLocalValue] = useState(searchParams.get('q') || '')

  // Debounced search function
  const debouncedSearch = debounce((query: string) => {
    if (query) {
      searchParams.set('q', query)
    } else {
      searchParams.delete('q')
    }
    // Reset page when searching
    searchParams.delete('page')
    setSearchParams(searchParams)
  }, 300)

  // Update local value when URL params change
  useEffect(() => {
    setLocalValue(searchParams.get('q') || '')
  }, [searchParams])

  const handleChange = (value: string) => {
    setLocalValue(value)
    debouncedSearch(value)
  }

  const handleClear = () => {
    setLocalValue('')
    debouncedSearch('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    debouncedSearch(localValue)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          prefix={<Search className="w-4 h-4 text-text-muted" />}
          suffix={
            localValue && (
              <button
                type="button"
                onClick={handleClear}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )
          }
          className="pr-10"
        />
      </div>
    </form>
  )
}

export default SearchBar
