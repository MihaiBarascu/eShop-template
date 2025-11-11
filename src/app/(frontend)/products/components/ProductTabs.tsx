'use client'

import { Product } from '@/payload-types'
import { useState } from 'react'

interface ProductTabsProps {
  product: Product
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description')

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'additional-info', label: 'Additional Information' },
    { id: 'size-shape', label: 'Size & Shape' },
    { id: 'reviews', label: 'Reviews (0)' },
  ]

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mt-10">
          {/* Tab Navigation */}
          <div className="flex space-x-4" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="tab-content">
                <div className="flex flex-col lg:flex-row lg:space-x-8">
                  <div className="w-full lg:w-1/2">
                    <h3 className="text-xl font-semibold mb-2">
                      Premium quality product made with high-quality materials to ensure comfort and durability.
                    </h3>
                    <p className="mb-4">
                      {product.description ? (
                        // This would need proper rich text rendering - for now showing fallback
                        <span>Experience exceptional quality and comfort with this carefully crafted product. Made with attention to detail and designed for long-lasting use.</span>
                      ) : (
                        'Experience exceptional quality and comfort with this carefully crafted product. Made with attention to detail and designed for long-lasting use.'
                      )}
                    </p>
                  </div>
                  <div className="w-full lg:w-1/4">
                    <h3 className="text-xl font-semibold mb-5">Material & Washing</h3>
                    {product.material && (
                      <p className="mb-2 pb-2 border-b border-gray-line">
                        Material: <span className="font-semibold">{product.material}</span>
                      </p>
                    )}
                    {product.fit && (
                      <p className="mb-2 pb-2 border-b border-gray-line">
                        Fit: <span className="font-semibold capitalize">{product.fit}</span>
                      </p>
                    )}
                    {product.careInstructions && (
                      <p className="mb-2">
                        Care instructions: <span className="font-semibold">{product.careInstructions}</span>
                      </p>
                    )}
                  </div>
                  <div className="w-full lg:w-1/4">
                    <h3 className="text-xl font-semibold mb-5">Size & Shape</h3>
                    {product.modelHeight && (
                      <p className="mb-2 pb-2 border-b border-gray-line">
                        Model info: <span className="font-semibold">{product.modelHeight}</span>
                      </p>
                    )}
                    {product.fit && (
                      <p className="mb-2 pb-2 border-b border-gray-line">
                        Fit: <span className="font-semibold capitalize">{product.fit}</span>
                      </p>
                    )}
                    {product.sizes && product.sizes.length > 0 && (
                      <p className="mb-2">
                        Available sizes: <span className="font-semibold">{product.sizes.map(s => s.toUpperCase()).join(', ')}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information Tab */}
            {activeTab === 'additional-info' && (
              <div className="tab-content">
                <div className="flex flex-col space-y-8">
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Colors</h3>
                      <p className="text-base text-gray-700">
                        Available colors: {product.colors.map((color, index) => (
                          <span key={color}>
                            <span className="text-primary hover:underline capitalize">{color}</span>
                            {index < product.colors!.length - 1 && ', '}
                          </span>
                        ))}
                      </p>
                    </div>
                  )}
                  {product.brand && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Brand</h3>
                      <p className="text-base text-gray-700">
                        This product is made by{' '}
                        <span className="text-primary hover:underline capitalize">{product.brand}</span>.
                      </p>
                    </div>
                  )}
                  {(product.material || product.careInstructions) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Material & Care</h3>
                      <p className="text-base text-gray-700">
                        {product.material && (
                          <>
                            Material: {product.material}
                            <br />
                          </>
                        )}
                        {product.careInstructions && (
                          <>Care instructions: {product.careInstructions}</>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Size & Shape Tab */}
            {activeTab === 'size-shape' && (
              <div className="tab-content">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 border-b border-gray-line bg-gray-100 text-left text-xs leading-4 font-medium text-gray-700 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 border-b border-gray-line bg-gray-100 text-left text-xs leading-4 font-medium text-gray-700 uppercase tracking-wider">
                          Chest (inches)
                        </th>
                        <th className="px-6 py-3 border-b border-gray-line bg-gray-100 text-left text-xs leading-4 font-medium text-gray-700 uppercase tracking-wider">
                          Waist (inches)
                        </th>
                        <th className="px-6 py-3 border-b border-gray-line bg-gray-100 text-left text-xs leading-4 font-medium text-gray-700 uppercase tracking-wider">
                          Length (inches)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          Small
                        </td>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          34-36
                        </td>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          28-30
                        </td>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          28-29
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          Medium
                        </td>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          38-40
                        </td>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          30-32
                        </td>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          29-30
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          Large
                        </td>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          42-44
                        </td>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          32-34
                        </td>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          30-31
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          X-Large
                        </td>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          46-48
                        </td>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          34-36
                        </td>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-line text-sm leading-5 text-gray-700">
                          31-32
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="tab-content">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>

                  {/* No reviews message */}
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No reviews yet. Be the first to review this product!</p>
                  </div>

                  {/* Review Form */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                    <form className="space-y-4">
                      <div className="space-y-4 md:flex md:space-x-4 md:space-y-0">
                        <div className="md:flex-1">
                          <label htmlFor="review-name" className="block text-sm font-medium text-gray-700">
                            Name
                          </label>
                          <input
                            type="text"
                            id="review-name"
                            name="review-name"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        </div>
                        <div className="md:flex-1">
                          <label htmlFor="review-email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            id="review-email"
                            name="review-email"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="review-rating" className="block text-sm font-medium text-gray-700">
                          Rating
                        </label>
                        <select
                          id="review-rating"
                          name="review-rating"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                          <option value="5">★★★★★ (5/5)</option>
                          <option value="4">★★★★☆ (4/5)</option>
                          <option value="3">★★★☆☆ (3/5)</option>
                          <option value="2">★★☆☆☆ (2/5)</option>
                          <option value="1">★☆☆☆☆ (1/5)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700">
                          Review
                        </label>
                        <textarea
                          id="review-comment"
                          name="review-comment"
                          rows={4}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder="Share your thoughts about this product..."
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-primary border border-transparent hover:bg-transparent hover:border-primary text-white hover:text-primary font-semibold py-2 px-6 rounded-full"
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}