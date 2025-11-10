'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type Category = {
  id: string
  title: string
  slug: string
}

type ProductFiltersProps = {
  categories: Category[]
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  return (
    <div className="w-full md:w-1/4 p-4 hidden md:block">
      {/* Category Filter */}
      <div className="mb-6 pb-8 border-b border-gray-line">
        <h3 className="text-lg font-semibold mb-6">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => {
            const isSelected = searchParams.get('category') === category.slug
            return (
              <label key={category.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={isSelected}
                  onChange={() => {
                    updateFilter('category', isSelected ? null : category.slug)
                  }}
                />
                <span className="ml-2">{category.title}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Size Filter */}
      <div className="mb-6 pb-8 border-b border-gray-line">
        <h3 className="text-lg font-semibold mb-6">Size</h3>
        <div className="space-y-2">
          {['S', 'M', 'L', 'XL'].map((size) => {
            const isSelected = searchParams.get('sizes') === size.toLowerCase()
            return (
              <label key={size} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={isSelected}
                  onChange={() => {
                    updateFilter('sizes', isSelected ? null : size.toLowerCase())
                  }}
                />
                <span className="ml-2">{size}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Color Filter */}
      <div className="mb-6 pb-8 border-b border-gray-line">
        <h3 className="text-lg font-semibold mb-6">Color</h3>
        <div className="space-y-2">
          {['Red', 'Blue', 'Green', 'Black'].map((color) => {
            const isSelected = searchParams.get('colors') === color.toLowerCase()
            return (
              <label key={color} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={isSelected}
                  onChange={() => {
                    updateFilter('colors', isSelected ? null : color.toLowerCase())
                  }}
                />
                <span className="ml-2">{color}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="mb-6 pb-8 border-b border-gray-line">
        <h3 className="text-lg font-semibold mb-6">Brand</h3>
        <div className="space-y-2">
          {['Nike', 'Adidas', 'Puma'].map((brand) => {
            const isSelected = searchParams.get('brand') === brand.toLowerCase()
            return (
              <label key={brand} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={isSelected}
                  onChange={() => {
                    updateFilter('brand', isSelected ? null : brand.toLowerCase())
                  }}
                />
                <span className="ml-2">{brand}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-6">Rating</h3>
        <div className="space-y-2">
          {[
            { label: '★★★★★', value: '5' },
            { label: '★★★★☆', value: '4' },
            { label: '★★★☆☆', value: '3' }
          ].map((rating) => {
            const isSelected = searchParams.get('rating') === rating.value
            return (
              <label key={rating.value} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={isSelected}
                  onChange={() => {
                    updateFilter('rating', isSelected ? null : rating.value)
                  }}
                />
                <span className="ml-2">{rating.label}</span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}