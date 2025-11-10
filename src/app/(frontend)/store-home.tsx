import { Product } from '@/payload-types'
import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

async function getFeaturedProducts() {
  const payload = await getPayload({ config })

  try {
    const result = await payload.find({
      collection: 'products',
      where: {
        and: [
          {
            featured: {
              equals: true,
            },
          },
          {
            status: {
              equals: 'active',
            },
          },
        ],
      },
      limit: 8,
      depth: 2,
    })

    return result.docs as Product[]
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

async function getFeaturedCategories() {
  const payload = await getPayload({ config })

  try {
    const result = await payload.find({
      collection: 'categories',
      where: {
        and: [
          {
            featured: {
              equals: true,
            },
          },
          {
            status: {
              equals: 'active',
            },
          },
        ],
      },
      limit: 6,
      depth: 1,
    })

    return result.docs
  } catch (error) {
    console.error('Error fetching featured categories:', error)
    return []
  }
}

export default async function StoreHome() {
  const featuredProducts = await getFeaturedProducts()
  const featuredCategories = await getFeaturedCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 md:h-[600px] bg-gray-dark overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src="/assets/images/hero-bg.jpg"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center text-center text-white">
          <div className="max-w-3xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to TailStore</h1>
            <p className="text-lg md:text-xl mb-8">
              Discover our amazing collection of premium products
            </p>
            <Link
              href="/shop"
              className="inline-block bg-red text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red/90 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {featuredCategories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-dark mb-4">
                Shop by Category
              </h2>
              <p className="text-gray-600 text-lg">Explore our carefully curated categories</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCategories.map((category) => {
                const imageUrl =
                  typeof category.image === 'object' && category.image?.url
                    ? category.image.url
                    : '/assets/images/placeholder-category.jpg'

                return (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.slug}`}
                    className="group relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={imageUrl}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                        {category.description && (
                          <p className="text-sm opacity-90">{category.description}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-dark mb-4">
                Featured Products
              </h2>
              <p className="text-gray-600 text-lg">
                Check out our handpicked products just for you
              </p>
            </div>

            <div className="flex flex-wrap -mx-4">
              {featuredProducts.map((product) => {
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
                  <div key={product.id} className="w-full sm:w-1/2 lg:w-1/4 px-4 mb-8">
                    <div className="bg-white p-3 rounded-lg shadow-lg">
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
                  </div>
                )
              })}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/shop"
                className="inline-block bg-gray-dark text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter to get the latest updates on new products, exclusive offers,
            and more.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red"
            />
            <button className="bg-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red/90 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shipping-fast text-2xl text-red"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-dark mb-2">Free Shipping</h3>
              <p className="text-gray-600">
                Free shipping on orders over $100. Fast and reliable delivery.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-undo text-2xl text-red"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-dark mb-2">Easy Returns</h3>
              <p className="text-gray-600">
                30-day return policy. No questions asked, hassle-free returns.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-headset text-2xl text-red"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-dark mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Round the clock customer support. We&apos;re here to help you.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
