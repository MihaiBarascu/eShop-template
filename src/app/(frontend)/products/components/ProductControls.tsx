'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ProductControlsProps {}

export default function ProductControls({}: ProductControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [_viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const updateFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    // Reset to page 1 when filtering
    params.delete('page')

    router.push(`/products?${params.toString()}`)
  }, [searchParams, router])

  const handleSaleToggle = () => {
    const isOnSale = searchParams.get('onSale') === 'true'
    updateFilter('onSale', isOnSale ? null : 'true')
  }

  const handleViewToggle = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    updateFilter('view', mode)
  }

  const handleSortChange = (sortValue: string) => {
    updateFilter('sort', sortValue)
  }

  const isOnSale = searchParams.get('onSale') === 'true'
  const currentSort = searchParams.get('sort') || 'latest'
  const currentView = (searchParams.get('view') as 'grid' | 'list') || 'grid'

  return (
    <div className="flex flex-col md:flex-row justify-between items-center py-4">
      <div className="flex items-center space-x-4">
        {/* Show On Sale Button */}
        <button
          onClick={handleSaleToggle}
          className={`py-2 px-4 rounded-full focus:outline-none border transition-colors ${
            isOnSale
              ? 'bg-primary text-white border-primary'
              : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-white'
          }`}
        >
          Show On Sale
        </button>

        {/* View Toggle Buttons */}
        <button
          onClick={() => handleViewToggle('list')}
          className={`py-2 px-4 rounded-full focus:outline-none border transition-colors ${
            currentView === 'list'
              ? 'bg-primary text-white border-primary'
              : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-white'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => handleViewToggle('grid')}
          className={`py-2 px-4 rounded-full focus:outline-none border transition-colors ${
            currentView === 'grid'
              ? 'bg-primary text-white border-primary'
              : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-white'
          }`}
        >
          Grid View
        </button>
      </div>

      {/* Sort Dropdown */}
      <div className="flex mt-5 md:mt-0 space-x-4">
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="block appearance-none w-full bg-white border hover:border-primary px-4 py-2 pr-8 rounded-full shadow leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="latest">Sort by Latest</option>
            <option value="popularity">Sort by Popularity</option>
            <option value="price-low">Sort by Price: Low to High</option>
            <option value="price-high">Sort by Price: High to Low</option>
            <option value="name-az">Sort by Name: A-Z</option>
            <option value="name-za">Sort by Name: Z-A</option>
            <option value="rating">Sort by Rating</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center px-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}