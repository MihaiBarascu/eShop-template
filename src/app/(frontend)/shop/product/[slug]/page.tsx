import { Product } from '@/payload-types'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

export const dynamic = 'force-static'

const getProductBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

async function getSimilarProducts(categoryId: string, currentProductId: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    const result = await payload.find({
      collection: 'products',
      where: {
        and: [
          {
            category: {
              equals: categoryId,
            },
          },
          {
            id: {
              not_equals: currentProductId,
            },
          },
          {
            status: {
              equals: 'active',
            },
          },
        ],
      },
      limit: 4,
      depth: 2,
    })

    return result.docs as Product[]
  } catch (error) {
    console.error('Error fetching similar products:', error)
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function ProductPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise

  const product = await getProductBySlug({ slug })

  if (!product) {
    notFound()
  }

  const categoryId = typeof product.category === 'object' ? product.category.id : product.category
  const similarProducts = categoryId ? await getSimilarProducts(categoryId, product.id) : []

  const mainImage =
    Array.isArray(product.images) && product.images.length > 0 ? product.images[0].image : null

  const imageUrl =
    typeof mainImage === 'object' && mainImage?.url
      ? mainImage.url
      : '/images/placeholder-product.jpg'

  const salePrice = typeof product.salePrice === 'number' ? product.salePrice : null
  const regularPrice = typeof product.price === 'number' ? product.price : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-red">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/shop" className="hover:text-red">
                Shop
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-dark">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <img
                src={imageUrl}
                alt={product.name || 'Product'}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Additional Images */}
            {Array.isArray(product.images) && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {product.images.slice(1, 5).map((imageItem, index) => {
                  const imgUrl =
                    typeof imageItem.image === 'object' && imageItem.image?.url
                      ? imageItem.image.url
                      : '/assets/images/placeholder-product.jpg'

                  return (
                    <div key={index} className="bg-white rounded-lg shadow-md p-2">
                      <img
                        src={imgUrl}
                        alt={imageItem.alt || `Product image ${index + 2}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-dark mb-4">{product.name}</h1>

            {/* Category */}
            {typeof product.category === 'object' && product.category?.title && (
              <div className="mb-4">
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {product.category.title}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              {salePrice && salePrice < regularPrice ? (
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-red">${salePrice}</span>
                  <span className="text-xl text-gray-500 line-through">${regularPrice}</span>
                  <span className="bg-red text-white px-2 py-1 rounded-md text-sm">
                    Save ${(regularPrice - salePrice).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-dark">${regularPrice}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-dark mb-2">Description</h3>
                <div className="text-gray-600 prose max-w-none">
                  {/* This would need to be rendered properly for rich text */}
                  <p>Product description goes here...</p>
                </div>
              </div>
            )}

            {/* SKU */}
            {product.sku && (
              <div className="mb-4">
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              {product.inventory?.trackQuantity &&
              typeof product.inventory.quantity === 'number' ? (
                product.inventory.quantity > 0 ? (
                  <span className="text-green-600 font-semibold">
                    In Stock ({product.inventory.quantity} available)
                  </span>
                ) : (
                  <span className="text-red font-semibold">Out of Stock</span>
                )
              ) : (
                <span className="text-green-600 font-semibold">In Stock</span>
              )}
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="text-gray-dark font-semibold">
                  Quantity:
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  defaultValue="1"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-20 text-center"
                />
              </div>

              <button
                className="w-full bg-red text-white py-3 px-6 rounded-lg font-semibold hover:bg-red/90 transition-colors"
                disabled={product.status !== 'active'}
              >
                Adauga in cos
              </button>

              <button className="w-full border border-gray-300 text-gray-dark py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-dark mb-8">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => {
                const simImageUrl =
                  Array.isArray(similarProduct.images) && similarProduct.images.length > 0
                    ? typeof similarProduct.images[0].image === 'object' &&
                      similarProduct.images[0].image?.url
                      ? similarProduct.images[0].image.url
                      : '/assets/images/placeholder-product.jpg'
                    : '/assets/images/placeholder-product.jpg'

                const simSalePrice =
                  typeof similarProduct.salePrice === 'number' ? similarProduct.salePrice : null
                const simRegularPrice =
                  typeof similarProduct.price === 'number' ? similarProduct.price : 0

                return (
                  <div
                    key={similarProduct.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <Link href={`/shop/product/${similarProduct.slug}`}>
                      <div className="relative">
                        <img
                          src={simImageUrl}
                          alt={similarProduct.name || 'Product'}
                          className="w-full h-48 object-cover"
                        />
                        {simSalePrice && simSalePrice < simRegularPrice && (
                          <span className="absolute top-2 left-2 bg-red text-white px-2 py-1 rounded-md text-sm">
                            Sale
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-dark mb-2 line-clamp-2">
                          {similarProduct.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {simSalePrice && simSalePrice < simRegularPrice ? (
                            <>
                              <span className="text-red font-bold">${simSalePrice}</span>
                              <span className="text-gray-500 line-through">${simRegularPrice}</span>
                            </>
                          ) : (
                            <span className="text-gray-dark font-bold">${simRegularPrice}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
