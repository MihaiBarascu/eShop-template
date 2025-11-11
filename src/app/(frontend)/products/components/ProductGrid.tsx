'use client'

import { Product } from '@/payload-types'
import Link from 'next/link'

interface ProductGridProps {
  products: Product[]
  viewMode: 'grid' | 'list'
}

export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {products.map((product) => {
          const mainImage =
            Array.isArray(product.images) && product.images.length > 0
              ? product.images[0].image
              : null

          const imageUrl =
            typeof mainImage === 'object' && mainImage?.url
              ? mainImage.url
              : '/assets/images/placeholder-product.jpg'

          const salePrice = typeof product.salePrice === 'number' ? product.salePrice : null
          const regularPrice = typeof product.price === 'number' ? product.price : 0

          return (
            <div key={product.id} className="bg-white p-6 rounded-lg shadow flex gap-6">
              {/* Product Image */}
              <Link href={`/products/${product.slug}`} className="flex-shrink-0">
                <img
                  src={imageUrl}
                  alt={product.name || 'Product'}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </Link>

              {/* Product Info */}
              <div className="flex-1">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="text-xl font-semibold mb-2 hover:text-primary">
                    {product.name}
                  </h3>
                </Link>

                {typeof product.category === 'object' && product.category?.title && (
                  <p className="text-gray-600 mb-3">{product.category.title}</p>
                )}

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center mb-3">
                    <span className="text-primary text-sm">
                      {'★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating))}
                    </span>
                    <span className="ml-2 text-gray-600 text-sm">({product.rating}/5)</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center mb-4">
                  {salePrice && salePrice < regularPrice ? (
                    <>
                      <span className="text-2xl font-bold text-primary">
                        ${(salePrice / 100).toFixed(2)}
                      </span>
                      <span className="text-lg text-gray-500 line-through ml-3">
                        ${(regularPrice / 100).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      ${(regularPrice / 100).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Premium quality product made with high-quality materials to ensure comfort and durability.
                </p>

                {/* Add to Cart Button */}
                <button className="bg-primary border border-transparent hover:bg-transparent hover:border-primary text-white hover:text-primary font-semibold py-2 px-6 rounded-full transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Grid View (default)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => {
        const mainImage =
          Array.isArray(product.images) && product.images.length > 0
            ? product.images[0].image
            : null

        const imageUrl =
          typeof mainImage === 'object' && mainImage?.url
            ? mainImage.url
            : '/assets/images/placeholder-product.jpg'

        const salePrice = typeof product.salePrice === 'number' ? product.salePrice : null
        const regularPrice = typeof product.price === 'number' ? product.price : 0

        return (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow">
            <Link href={`/products/${product.slug}`}>
              <img
                src={imageUrl}
                alt={product.name || 'Product'}
                className="w-full object-cover mb-4 rounded-lg"
              />
              <h3 className="text-lg font-semibold mb-2 hover:text-primary">
                {product.name}
              </h3>
            </Link>

            {typeof product.category === 'object' && product.category?.title && (
              <p className="my-2 text-gray-600">{product.category.title}</p>
            )}

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center mb-3">
                <span className="text-primary text-sm">
                  {'★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating))}
                </span>
                <span className="ml-1 text-gray-600 text-sm">({product.rating})</span>
              </div>
            )}

            <div className="flex items-center mb-4">
              {salePrice && salePrice < regularPrice ? (
                <>
                  <span className="text-lg font-bold text-primary">
                    ${(salePrice / 100).toFixed(2)}
                  </span>
                  <span className="text-sm line-through ml-2 text-gray-500">
                    ${(regularPrice / 100).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  ${(regularPrice / 100).toFixed(2)}
                </span>
              )}
            </div>

            <button className="bg-primary border border-transparent hover:bg-transparent hover:border-primary text-white hover:text-primary font-semibold py-2 px-4 rounded-full w-full transition-colors">
              Add to Cart
            </button>
          </div>
        )
      })}
    </div>
  )
}