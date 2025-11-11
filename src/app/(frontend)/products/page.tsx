import { Product } from '@/payload-types'
import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import ProductFilters from './components/ProductFilters'
import ProductControls from './components/ProductControls'
import ProductGrid from './components/ProductGrid'

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
  onSale?: string
  sort?: string
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

    // On Sale filter
    if (searchParams?.onSale === 'true') {
      where.salePrice = {
        exists: true,
      }
    }

    const page = parseInt(searchParams?.page || '1')
    const limit = 9 // 3x3 grid layout

    // Sort logic - PayloadCMS expects string format
    let sort: string = '-createdAt' // default: latest first
    switch (searchParams?.sort) {
      case 'popularity':
        sort = '-rating'
        break
      case 'price-low':
        sort = 'price'
        break
      case 'price-high':
        sort = '-price'
        break
      case 'name-az':
        sort = 'name'
        break
      case 'name-za':
        sort = '-name'
        break
      case 'rating':
        sort = '-rating'
        break
      case 'latest':
      default:
        sort = '-createdAt'
        break
    }

    const result = await payload.find({
      collection: 'products',
      where,
      sort,
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
    onSale?: string
    sort?: string
    view?: string
  }>
}) {
  const resolvedSearchParams = await searchParams
  const result = await getProducts(resolvedSearchParams)
  const categories = await getCategories()

  return (
    <section id="shop">
      <div className="container mx-auto">
        {/* Top Filter */}
        <ProductControls />

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
            <ProductGrid
              products={result.docs}
              viewMode={(resolvedSearchParams?.view as 'grid' | 'list') || 'grid'}
            />

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
