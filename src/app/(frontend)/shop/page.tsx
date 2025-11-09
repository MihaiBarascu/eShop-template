import { Product } from '@/payload-types'
import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

export const dynamic = 'force-static'
export const revalidate = 600

async function getProducts(searchParams?: { category?: string; search?: string }) {
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

    const result = await payload.find({
      collection: 'products',
      where,
      limit: 20,
      depth: 2,
    })

    return result.docs as Product[]
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
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
  searchParams?: Promise<{ category?: string; search?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const products = await getProducts(resolvedSearchParams)
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-dark mb-4">Shop</h1>
          <p className="text-gray-600">Discover our amazing collection of products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-dark mb-4">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/shop"
                    className={`block py-2 px-3 rounded-lg transition-colors ${
                      !resolvedSearchParams?.category
                        ? 'bg-red text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Products
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/shop?category=${category.slug}`}
                      className={`block py-2 px-3 rounded-lg transition-colors ${
                        resolvedSearchParams?.category === category.slug
                          ? 'bg-red text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                {products.length > 0
                  ? `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`
                  : 'No products found'}
              </p>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <Link href={`/shop/product/${product.slug}`}>
                        <div className="relative">
                          <img
                            src={imageUrl}
                            alt={product.name || 'Product'}
                            className="w-full h-64 object-cover"
                          />
                          {salePrice && salePrice < regularPrice && (
                            <span className="absolute top-2 left-2 bg-red text-white px-2 py-1 rounded-md text-sm">
                              Sale
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-dark mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {salePrice && salePrice < regularPrice ? (
                                <>
                                  <span className="text-red font-bold">${salePrice}</span>
                                  <span className="text-gray-500 line-through">
                                    ${regularPrice}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-dark font-bold">${regularPrice}</span>
                              )}
                            </div>
                            <button className="bg-red text-white px-4 py-2 rounded-lg hover:bg-red/90 transition-colors">
                              Adauga in cos
                            </button>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-dark mb-4">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or browse our categories
                </p>
                <Link
                  href="/shop"
                  className="bg-red text-white px-6 py-3 rounded-lg hover:bg-red/90 transition-colors"
                >
                  View All Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
