import { Product } from '@/payload-types'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'
import ProductTabs from '../components/ProductTabs'

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
  const { isEnabled: _draft } = await draftMode()
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
    <>
      {/* Breadcrumbs */}
      <section id="breadcrumbs" className="pt-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <ol className="list-reset flex">
            <li>
              <Link href="/" className="font-semibold hover:text-primary">
                Home
              </Link>
            </li>
            <li><span className="mx-2">&gt;</span></li>
            <li>
              <Link href="/products" className="font-semibold hover:text-primary">
                Shop
              </Link>
            </li>
            <li><span className="mx-2">&gt;</span></li>
            <li>
              {typeof product.category === 'object' && product.category?.title && (
                <>
                  <Link href="#" className="font-semibold hover:text-primary">
                    {product.category.title}
                  </Link>
                  <span className="mx-2">&gt;</span>
                </>
              )}
            </li>
            <li>{product.name}</li>
          </ol>
        </div>
      </section>

      {/* Product info */}
      <section id="product-info">
        <div className="container mx-auto px-4">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Image Section */}
              <div className="w-full lg:w-1/2">
                <div className="grid gap-4">
                  {/* Big Image */}
                  <div id="main-image-container">
                    <img
                      id="main-image"
                      className="h-auto w-full max-w-full rounded-lg object-cover object-center md:h-[480px]"
                      src={imageUrl}
                      alt={product.name || 'Product'}
                    />
                  </div>
                  {/* Small Images */}
                  {Array.isArray(product.images) && product.images.length > 1 && (
                    <div className="grid grid-cols-5 gap-4">
                      {product.images.slice(0, 5).map((imageItem, index) => {
                        const imgUrl =
                          typeof imageItem.image === 'object' && imageItem.image?.url
                            ? imageItem.image.url
                            : '/assets/images/placeholder-product.jpg'

                        return (
                          <div key={index}>
                            <img
                              src={imgUrl}
                              className="object-cover object-center max-h-30 max-w-full rounded-lg cursor-pointer"
                              alt={imageItem.alt || `Gallery Image ${index + 1}`}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details Section */}
              <div className="w-full lg:w-1/2 flex flex-col justify-between">
                <div className="pb-8 border-b border-gray-200">
                  <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                  <div className="flex items-center mb-8">
                    <span className="text-primary">
                      {product.rating && product.rating > 0 ? (
                        '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating))
                      ) : (
                        '★★★★★'
                      )}
                    </span>
                    <span className="ml-2">({product.rating ? `${product.rating.toFixed(1)}` : '0'} Reviews)</span>
                    <a href="#" className="ml-4 text-primary font-semibold">Write a review</a>
                  </div>
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    {product.brand && (
                      <p className="mb-2">
                        Brand: <strong>
                          <span className="hover:text-primary capitalize">{product.brand}</span>
                        </strong>
                      </p>
                    )}
                    {typeof product.category === 'object' && product.category?.title && (
                      <p className="mb-2">
                        Category: <strong>{product.category.title}</strong>
                      </p>
                    )}
                    {product.sku && (
                      <p className="mb-2">
                        Product code: <strong>{product.sku}</strong>
                      </p>
                    )}
                    <p className="mb-2">
                      Availability: <strong>
                        {product.inventory?.trackQuantity &&
                        typeof product.inventory.quantity === 'number' ? (
                          product.inventory.quantity > 0 ? (
                            <span className="text-green-600">In Stock</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )
                        ) : (
                          <span className="text-green-600">In Stock</span>
                        )}
                      </strong>
                    </p>
                  </div>
                  <div className="text-2xl font-semibold mb-8">
                    {salePrice && salePrice < regularPrice ? (
                      <>
                        ${(salePrice / 100).toFixed(2)}
                        <span className="text-lg text-gray-500 line-through ml-2">
                          ${(regularPrice / 100).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        ${(regularPrice / 100).toFixed(2)}
                      </>
                    )}
                  </div>
                  <div className="flex items-center mb-8">
                    <button
                      id="decrease"
                      className="bg-primary hover:bg-transparent border border-transparent hover:border-primary text-white hover:text-primary font-semibold w-10 h-10 rounded-full flex items-center justify-center focus:outline-none"
                    >
                      -
                    </button>
                    <input
                      id="quantity"
                      type="number"
                      defaultValue="1"
                      className="w-16 py-2 text-center focus:outline-none"
                      readOnly
                    />
                    <button
                      id="increase"
                      className="bg-primary hover:bg-transparent border border-transparent hover:border-primary text-white hover:text-primary font-semibold w-10 h-10 rounded-full focus:outline-none"
                    >
                      +
                    </button>
                    <button className="ml-4 bg-primary border border-transparent hover:bg-transparent hover:border-primary text-white hover:text-primary font-semibold py-2 px-4 rounded-full">
                      Add to Cart
                    </button>
                  </div>
                </div>
                {/* Social sharing */}
                <div className="flex space-x-4 my-6">
                  <a href="#" className="w-4 h-4 flex items-center justify-center">
                    <svg className="w-4 h-4 transition-transform transform hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-4 h-4 flex items-center justify-center">
                    <svg className="w-4 h-4 transition-transform transform hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                </div>
                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Product Description</h3>
                  {product.description ? (
                    <div className="text-gray-600">
                      {/* This would need proper rich text rendering */}
                      <p>Premium quality product made with high-quality materials to ensure comfort and durability.</p>
                    </div>
                  ) : (
                    <p className="text-gray-600">Premium quality product made with high-quality materials to ensure comfort and durability.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs */}
      <ProductTabs product={product} />

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Latest products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div key={similarProduct.id} className="bg-white p-4 rounded-lg shadow">
                    <Link href={`/products/${similarProduct.slug}`}>
                      <img
                        src={simImageUrl}
                        alt={similarProduct.name || 'Product'}
                        className="w-full object-cover mb-4 rounded-lg"
                      />
                      <h3 className="text-lg font-semibold mb-2">{similarProduct.name}</h3>
                      <p className="my-2">
                        {typeof similarProduct.category === 'object' && similarProduct.category?.title}
                      </p>
                      <div className="flex items-center mb-4">
                        {simSalePrice && simSalePrice < simRegularPrice ? (
                          <>
                            <span className="text-lg font-bold text-primary">
                              ${(simSalePrice / 100).toFixed(2)}
                            </span>
                            <span className="text-sm line-through ml-2">
                              ${(simRegularPrice / 100).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            ${(simRegularPrice / 100).toFixed(2)}
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
          </div>
        </section>
      )}
    </>
  )
}
