import { Product } from '@/payload-types'
import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import ProductFilters from './components/ProductFilters'

export const dynamic = 'force-dynamic'
export const revalidate = 600

async function getProducts(searchParams?: {
  category?: string
  search?: string
  page?: string
  sizes?: string
  colors?: string
  brand?: string
  rating?: string
}) {
  const payload = await getPayload({ config })

  try {
    const where: any = {
      status: {
        equals: 'active',
      },
    }

    if (searchParams?.category) {
      // Get category by slug first
      const categoryResponse = await payload.find({
        collection: 'categories',
        where: {
          slug: {
            equals: searchParams.category,
          },
        },
        limit: 1,
      })

      if (categoryResponse.docs.length > 0) {
        where.category = {
          equals: categoryResponse.docs[0].id,
        }
      }
    }

    if (searchParams?.search) {
      where.name = {
        contains: searchParams.search,
      }
    }

    if (searchParams?.sizes) {
      where.sizes = {
        contains: searchParams.sizes,
      }
    }

    if (searchParams?.colors) {
      where.colors = {
        contains: searchParams.colors,
      }
    }

    if (searchParams?.brand) {
      where.brand = {
        equals: searchParams.brand,
      }
    }

    if (searchParams?.rating) {
      where.rating = {
        greater_than_equal: parseFloat(searchParams.rating),
      }
    }

    const page = parseInt(searchParams?.page || '1')
    const limit = 9 // 3x3 grid layout

    const result = await payload.find({
      collection: 'products',
      where,
      limit,
      page,
      depth: 2,
    })

    return {
      docs: result.docs as Product[],
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      nextPage: result.nextPage,
      prevPage: result.prevPage,
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      docs: [],
      totalDocs: 0,
      totalPages: 0,
      page: 1,
      limit: 9,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null,
    }
  }
}

async function getCategories() {
  const payload = await getPayload({ config })

  try {
    const result = await payload.find({
      collection: 'categories',
      where: {
        status: {
          equals: 'active',
        },
      },
      limit: 100,
      depth: 1,
    })

    return result.docs
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<{
    category?: string
    search?: string
    page?: string
    sizes?: string
    colors?: string
    brand?: string
    rating?: string
  }>
}) {
  const resolvedSearchParams = await searchParams
  const result = await getProducts(resolvedSearchParams)
  const categories = await getCategories()

  return (
    <section id="shop">
      <div className="container mx-auto">
        {/* Top Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <button className="bg-primary text-white hover:bg-transparent hover:text-primary border hover:border-primary py-2 px-4 rounded-full focus:outline-none">
              Show On Sale
            </button>
            <button className="bg-primary text-white hover:bg-transparent hover:text-primary border hover:border-primary py-2 px-4 rounded-full focus:outline-none">
              List View
            </button>
            <button className="bg-primary text-white hover:bg-transparent hover:text-primary border hover:border-primary py-2 px-4 rounded-full focus:outline-none">
              Grid View
            </button>
          </div>
          <div className="flex mt-5 md:mt-0 space-x-4">
            <div className="relative">
              <select className="block appearance-none w-full bg-white border hover:border-primary px-4 py-2 pr-8 rounded-full shadow leading-tight focus:outline-none focus:shadow-outline">
                <option>Sort by Latest</option>
                <option>Sort by Popularity</option>
                <option>Sort by A-Z</option>
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

        {/* Filter Toggle Button for Mobile */}
        <div className="block md:hidden text-center mb-4">
          <button className="bg-primary text-white py-2 px-4 rounded-full focus:outline-none">
            Show Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Filters */}
          <ProductFilters categories={categories} />

          {/* Products List */}
          <div className="w-full md:w-3/4 p-4">
            {/* Products grid */}
            {result.docs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.docs.map((product) => {
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
                        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                        <p className="my-2">
                          {typeof product.category === 'object' && product.category?.title}
                        </p>
                        <div className="flex items-center mb-4">
                          {salePrice && salePrice < regularPrice ? (
                            <>
                              <span className="text-lg font-bold text-primary">
                                ${(salePrice / 100).toFixed(2)}
                              </span>
                              <span className="text-sm line-through ml-2">
                                ${(regularPrice / 100).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              ${(regularPrice / 100).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </Link>
                      <button className="bg-primary border border-transparent hover:bg-transparent hover:border-primary text-white hover:text-primary font-semibold py-2 px-4 rounded-full w-full">
                        Add to Cart
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-4">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or browse our categories
                </p>
                <Link
                  href="/products"
                  className="bg-primary text-white px-6 py-3 rounded-full hover:bg-transparent hover:border-primary border border-transparent hover:text-primary font-semibold"
                >
                  View All Products
                </Link>
              </div>
            )}

            {/* Pagination - Tailstore4 Style with Smart Logic */}
            <div className="flex justify-center mt-8">
              <nav aria-label="Page navigation">
                <ul className="inline-flex space-x-2">
                  {/* Smart 3-page display */}
                  {(() => {
                    const currentPage = result.page || 0
                    const totalPages = result.totalPages
                    let pagesToShow: number[] = []

                    if (totalPages <= 3) {
                      // Show all pages if 3 or less
                      pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1)
                    } else {
                      // Smart logic for more than 3 pages
                      if (currentPage <= 2) {
                        // Show 1, 2, 3 if we're at the beginning
                        pagesToShow = [1, 2, 3]
                      } else if (currentPage >= totalPages - 1) {
                        // Show last 3 pages if we're at the end
                        pagesToShow = [totalPages - 2, totalPages - 1, totalPages]
                      } else {
                        // Show current page and neighbors
                        pagesToShow = [currentPage - 1, currentPage, currentPage + 1]
                      }
                    }

                    // Always show exactly 3 slots like tailstore4
                    return [1, 2, 3].map((slotNum) => {
                      const pageNum = pagesToShow[slotNum - 1] || slotNum
                      const isCurrentPage = pageNum === currentPage
                      const isValidPage = pageNum <= totalPages

                      return (
                        <li key={slotNum}>
                          {isValidPage ? (
                            <Link
                              href={`/products?${new URLSearchParams({
                                ...(resolvedSearchParams?.category && {
                                  category: resolvedSearchParams.category,
                                }),
                                ...(resolvedSearchParams?.search && {
                                  search: resolvedSearchParams.search,
                                }),
                                ...(resolvedSearchParams?.sizes && {
                                  sizes: resolvedSearchParams.sizes,
                                }),
                                ...(resolvedSearchParams?.colors && {
                                  colors: resolvedSearchParams.colors,
                                }),
                                ...(resolvedSearchParams?.brand && {
                                  brand: resolvedSearchParams.brand,
                                }),
                                ...(resolvedSearchParams?.rating && {
                                  rating: resolvedSearchParams.rating,
                                }),
                                page: pageNum.toString(),
                              }).toString()}`}
                              className={`w-10 h-10 flex items-center justify-center rounded-full ${
                                isCurrentPage
                                  ? 'bg-primary text-white'
                                  : 'hover:bg-primary hover:text-white'
                              }`}
                            >
                              {pageNum}
                            </Link>
                          ) : (
                            <span className="w-10 h-10 flex items-center justify-center rounded-full text-gray-300">
                              {slotNum}
                            </span>
                          )}
                        </li>
                      )
                    })
                  })()}

                  {/* Next Button */}
                  <li>
                    {result.hasNextPage ? (
                      <Link
                        href={`/products?${new URLSearchParams({
                          ...(resolvedSearchParams?.category && {
                            category: resolvedSearchParams.category,
                          }),
                          ...(resolvedSearchParams?.search && {
                            search: resolvedSearchParams.search,
                          }),
                          ...(resolvedSearchParams?.sizes && { sizes: resolvedSearchParams.sizes }),
                          ...(resolvedSearchParams?.colors && {
                            colors: resolvedSearchParams.colors,
                          }),
                          ...(resolvedSearchParams?.brand && { brand: resolvedSearchParams.brand }),
                          ...(resolvedSearchParams?.rating && {
                            rating: resolvedSearchParams.rating,
                          }),
                          page: result.nextPage!.toString(),
                        }).toString()}`}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary hover:text-white"
                      >
                        Next
                      </Link>
                    ) : (
                      <span className="w-10 h-10 flex items-center justify-center rounded-full text-gray-300">
                        Next
                      </span>
                    )}
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
