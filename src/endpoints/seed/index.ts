import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest } from 'payload'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { getServerSideURL } from '@/utilities/getURL'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'products',
  'forms',
  'form-submissions',
  'search',
]

const globals: GlobalSlug[] = ['header', 'footer']

const categories = ['Bărbați', 'Femei', 'Copii', 'Accesorii', 'Încălțăminte', 'Genți']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // Ensure database connection is stable
  try {
    if (payload.db.connect) {
      await payload.db.connect()
      payload.logger.info('Database connection verified')
    } else {
      payload.logger.info(
        'Database connection method not available - assuming connection is active',
      )
    }
  } catch (error) {
    payload.logger.error(`Failed to connect to database: ${error}`)
    throw error
  }

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not
  payload.logger.info(`— Clearing collections and globals...`)

  // clear the database
  await Promise.all(
    globals.map((global) => {
      if (global === 'header') {
        return payload.updateGlobal({
          slug: global,
          data: {
            logo: null,
            navItems: [],
            searchSettings: {
              showSearch: false,
              searchPlaceholder: '',
            },
          },
          depth: 0,
          context: {
            disableRevalidate: true,
          },
        })
      } else {
        return payload.updateGlobal({
          slug: global,
          data: {
            columns: [],
          },
          depth: 0,
          context: {
            disableRevalidate: true,
          },
        })
      }
    }),
  )

  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, req, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, req, where: {} })),
  )

  payload.logger.info(`— Seeding demo author and user...`)

  await payload.delete({
    collection: 'users',
    depth: 0,
    where: {
      email: {
        equals: 'demo-author@example.com',
      },
    },
  })

  const [_demoAuthor, _image1Doc] = await Promise.all([
    payload.create({
      collection: 'users',
      data: {
        name: 'Demo Author',
        email: 'demo-author@example.com',
        password: 'password',
      },
    }),

    categories.map((category) =>
      payload.create({
        collection: 'categories',
        data: {
          title: category,
          slug: category,
        },
      }),
    ),
  ])

  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData,
  })

  payload.logger.info(`— Seeding pages...`)

  const [contactPage] = await Promise.all([
    payload.create({
      collection: 'pages',
      depth: 0,
      data: contactPageData({ contactForm: contactForm }),
    }),
  ])

  payload.logger.info(`— Seeding globals...`)

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        logo: null,
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Acasă',
              url: '/',
            },
            hasDropdown: false,
          },
          {
            link: {
              type: 'custom',
              label: 'Bărbați',
              url: '/barbati',
            },
            hasDropdown: true,
            dropdownItems: [
              {
                link: {
                  type: 'custom',
                  label: 'Tricouri',
                  url: '/barbati/tricouri',
                },
              },
              {
                link: {
                  type: 'custom',
                  label: 'Pantaloni',
                  url: '/barbati/pantaloni',
                },
              },
              {
                link: {
                  type: 'custom',
                  label: 'Costume',
                  url: '/barbati/costume',
                },
              },
            ],
          },
          {
            link: {
              type: 'custom',
              label: 'Femei',
              url: '/femei',
            },
            hasDropdown: true,
            dropdownItems: [
              {
                link: {
                  type: 'custom',
                  label: 'Rochii',
                  url: '/femei/rochii',
                },
              },
              {
                link: {
                  type: 'custom',
                  label: 'Bluze',
                  url: '/femei/bluze',
                },
              },
              {
                link: {
                  type: 'custom',
                  label: 'Pantaloni',
                  url: '/femei/pantaloni',
                },
              },
            ],
          },
          {
            link: {
              type: 'custom',
              label: 'Produse',
              url: '/products',
            },
            hasDropdown: false,
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPage.id,
              },
            },
            hasDropdown: false,
          },
        ],
        searchSettings: {
          showSearch: true,
          searchPlaceholder: 'Caută produse...',
        },
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        logo: null,
        columns: [
          {
            title: 'Magazin',
            links: [
              {
                link: {
                  type: 'custom',
                  label: 'Toate produsele',
                  url: '/magazin',
                },
              },
              {
                link: {
                  type: 'custom',
                  label: 'Femei',
                  url: '/femei',
                },
              },
              {
                link: {
                  type: 'custom',
                  label: 'Bărbați',
                  url: '/barbati',
                },
              },
              {
                link: {
                  type: 'custom',
                  label: 'Accesorii',
                  url: '/accesorii',
                },
              },
            ],
          },
          {
            title: 'Pagini',
            links: [
              {
                link: {
                  type: 'custom',
                  label: 'Magazin',
                  url: '/magazin',
                },
              },
              {
                link: {
                  type: 'custom',
                  label: 'Produs',
                  url: '/produs',
                },
              },
              {
                link: {
                  type: 'custom',
                  label: 'Checkout',
                  url: '/checkout',
                },
              },
              {
                link: {
                  type: 'custom',
                  label: 'Coș',
                  url: '/cos',
                },
              },
            ],
          },
          {
            title: 'Cont',
            links: [
              {
                link: {
                  type: 'custom',
                  label: 'Coșul meu',
                  url: '/cos',
                },
              },
              {
                link: {
                  type: 'custom',
                  label: 'Înregistrare',
                  url: '/inregistrare',
                },
              },
              {
                link: {
                  type: 'custom',
                  label: 'Autentificare',
                  url: '/autentificare',
                },
              },
            ],
          },
        ],
        socialLinks: [
          {
            platform: 'facebook',
            url: 'https://facebook.com/yourstore',
            icon: null,
          },
          {
            platform: 'instagram',
            url: 'https://instagram.com/yourstore',
            icon: null,
          },
          {
            platform: 'twitter',
            url: 'https://twitter.com/yourstore',
            icon: null,
          },
          {
            platform: 'pinterest',
            url: 'https://pinterest.com/yourstore',
            icon: null,
          },
          {
            platform: 'youtube',
            url: 'https://youtube.com/yourstore',
            icon: null,
          },
        ],
        contactAddress: '123 Strada Exemplu, București, România',
        contactPhone: '(+40) 123 456 789',
        contactEmail: 'info@magazinultau.ro',
        description:
          'Magazinul tău online pentru modă și accesorii de calitate. Descoperă colecțiile noastre și găsește stilul perfect pentru tine.',
        copyrightText: '© 2024 Magazinul Tău. Toate drepturile rezervate.',
        legalLinks: [
          {
            link: {
              type: 'custom',
              label: 'Politica de confidențialitate',
              url: '/politica-confidentialitate',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Termeni și condiții',
              url: '/termeni-conditii',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'FAQ',
              url: '/faq',
            },
          },
        ],
        paymentIcons: [],
      },
    }),
  ])

  payload.logger.info('— Seeding products...')

  // Upload product images using official Payload method from Unsplash
  const productImages: any[] = []

  // Using tall fashion product images similar to your originals (600x800 ratio)
  const productImageUrls = [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop&auto=format', // Tricou bărbați
    'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&h=800&fit=crop&auto=format', // Bluză femei
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop&auto=format', // Pantaloni bărbați
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&auto=format', // Rochie de seară
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop&auto=format', // Geacă sport
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=800&fit=crop&auto=format', // Pantofi eleganți
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop&auto=format', // Geantă designer
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=800&fit=crop&auto=format', // Tricou copii
  ]

  payload.logger.info('— Starting image uploads using official Payload method...')

  // Fetch all images in parallel using official method
  const imagePromises = productImageUrls.map((imageUrl, i) => {
    payload.logger.info(`Fetching image ${i + 1}/8 from URL: ${imageUrl}`)
    return fetchFileByURL(imageUrl)
  })

  try {
    const imageFiles = await Promise.all(imagePromises)
    payload.logger.info(`✓ Successfully fetched ${imageFiles.length} images from Unsplash`)

    // Create media documents
    for (const [index, file] of imageFiles.entries()) {
      try {
        const imageDoc = await payload.create({
          collection: 'media',
          data: {
            alt: `Product image ${index + 1}`,
          },
          file,
        })
        productImages.push(imageDoc)
        payload.logger.info(`✓ Image ${index + 1}/8 uploaded successfully`)
      } catch (error) {
        payload.logger.error(`✗ Image ${index + 1}/8 failed to upload: ${error}`)
      }
    }
  } catch (error) {
    payload.logger.error(`✗ Failed to fetch images: ${error}`)
  }

  payload.logger.info(
    `— Image uploads completed. ${productImages.length}/8 images uploaded successfully.`,
  )

  // Find created categories by title
  const categoriesMap: Record<string, any> = {}
  for (const categoryTitle of categories) {
    const categoryDoc = await payload.find({
      collection: 'categories',
      where: {
        title: {
          equals: categoryTitle,
        },
      },
      limit: 1,
    })
    if (categoryDoc.docs[0]) {
      categoriesMap[categoryTitle] = categoryDoc.docs[0]
    }
  }

  // Product data based on tailstore4 analysis
  const productsData = [
    {
      name: 'Tricou Premium Bărbați',
      slug: 'tricou-premium-barbati',
      description: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal' as const,
                  style: '',
                  text: 'Tricou premium din bumbac 100% organic, perfect pentru orice ocazie. Material soft și rezistent.',
                  type: 'text' as const,
                  version: 1,
                },
              ],
              direction: 'ltr' as const,
              format: '',
              indent: 0,
              type: 'paragraph' as const,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root' as const,
          version: 1,
        },
      },
      price: 12999, // 129.99 RON in cents
      salePrice: 9999, // 99.99 RON sale price
      sku: 'TPB001',
      category: categoriesMap['Bărbați']?.id,
      images: productImages[0]
        ? [{ image: productImages[0].id, alt: 'Tricou Premium Bărbați' }]
        : [],
      featured: true,
      status: 'active' as const,
      sizes: ['m', 'l', 'xl'],
      colors: ['blue', 'black'],
      brand: 'nike',
      rating: 5,
      material: '100% Cotton',
      careInstructions: 'Machine wash at 30°C, do not tumble dry, iron on low heat',
      fit: 'regular',
      modelHeight: 'Our model is 180 cm tall and is wearing size M',
      inventory: {
        quantity: 25,
        trackQuantity: true,
      },
      seo: {
        title: 'Tricou Premium Bărbați - Bumbac 100% Organic',
        description:
          'Tricou premium din bumbac organic pentru bărbați. Comfort și stil într-un singur produs.',
        keywords: 'tricou bărbați, bumbac organic, premium',
      },
    },
    {
      name: 'Bluză Elegantă Femei',
      slug: 'bluza-eleganta-femei',
      description: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal' as const,
                  style: '',
                  text: 'Bluză elegantă din mătase naturală, ideală pentru events și ocazii speciale. Design modern și rafinat.',
                  type: 'text' as const,
                  version: 1,
                },
              ],
              direction: 'ltr' as const,
              format: '',
              indent: 0,
              type: 'paragraph' as const,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root' as const,
          version: 1,
        },
      },
      price: 19999, // 199.99 RON
      sku: 'BEF002',
      category: categoriesMap['Femei']?.id,
      images: productImages[1] ? [{ image: productImages[1].id, alt: 'Bluză Elegantă Femei' }] : [],
      featured: true,
      status: 'active' as const,
      sizes: ['s', 'm', 'l'],
      colors: ['red', 'black'],
      brand: 'adidas',
      rating: 4,
      material: 'Natural Silk',
      careInstructions: 'Dry clean only, do not iron directly on fabric',
      fit: 'slim',
      modelHeight: 'Our model is 170 cm tall and is wearing size M',
      inventory: {
        quantity: 15,
        trackQuantity: true,
      },
      seo: {
        title: 'Bluză Elegantă din Mătase - Pentru Femei',
        description: 'Bluză elegantă din mătase naturală, perfectă pentru ocazii speciale.',
        keywords: 'bluză femei, mătase, elegant, ocazii speciale',
      },
    },
    {
      name: 'Pantaloni Casual Bărbați',
      slug: 'pantaloni-casual-barbati',
      description: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal' as const,
                  style: '',
                  text: 'Pantaloni casual din denim premium, tăietură modernă și fit perfect. Rezistenți și confortabili.',
                  type: 'text' as const,
                  version: 1,
                },
              ],
              direction: 'ltr' as const,
              format: '',
              indent: 0,
              type: 'paragraph' as const,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root' as const,
          version: 1,
        },
      },
      price: 15999, // 159.99 RON
      salePrice: 12999, // 129.99 RON sale
      sku: 'PCB003',
      category: categoriesMap['Bărbați']?.id,
      images: productImages[2]
        ? [{ image: productImages[2].id, alt: 'Pantaloni Casual Bărbați' }]
        : [],
      featured: false,
      status: 'active' as const,
      sizes: ['m', 'l', 'xl'],
      colors: ['blue', 'black'],
      brand: 'puma',
      rating: 4,
      material: 'Premium Denim',
      careInstructions: 'Machine wash at 40°C, tumble dry medium heat',
      fit: 'regular',
      modelHeight: 'Our model is 185 cm tall and is wearing size L',
      inventory: {
        quantity: 30,
        trackQuantity: true,
      },
      seo: {
        title: 'Pantaloni Casual din Denim Premium - Bărbați',
        description:
          'Pantaloni casual din denim de calitate superioară, fit modern și confort exceptional.',
        keywords: 'pantaloni bărbați, denim, casual, premium',
      },
    },
    {
      name: 'Rochie de Seară',
      slug: 'rochie-de-seara',
      description: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal' as const,
                  style: '',
                  text: 'Rochie de seară din catifea luxoasă, croială feminină și design sofisticat. Perfectă pentru evenimente elegante.',
                  type: 'text' as const,
                  version: 1,
                },
              ],
              direction: 'ltr' as const,
              format: '',
              indent: 0,
              type: 'paragraph' as const,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root' as const,
          version: 1,
        },
      },
      price: 34999, // 349.99 RON
      sku: 'RDS004',
      category: categoriesMap['Femei']?.id,
      images: productImages[3] ? [{ image: productImages[3].id, alt: 'Rochie de Seară' }] : [],
      featured: true,
      status: 'active' as const,
      sizes: ['s', 'm', 'l'],
      colors: ['red', 'black'],
      brand: 'nike',
      rating: 5,
      material: 'Luxury Velvet',
      careInstructions: 'Dry clean only, store hanging',
      fit: 'slim',
      modelHeight: 'Our model is 175 cm tall and is wearing size M',
      inventory: {
        quantity: 8,
        trackQuantity: true,
      },
      seo: {
        title: 'Rochie de Seară din Catifea Luxoasă',
        description:
          'Rochie de seară elegantă din catifea premium, design sofisticat pentru evenimente speciale.',
        keywords: 'rochie seară, catifea, elegant, femei',
      },
    },
    {
      name: 'Geacă Sport Unisex',
      slug: 'geaca-sport-unisex',
      description: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal' as const,
                  style: '',
                  text: 'Geacă sport din material tehnic, impermeabilă și respirantă. Design modern pentru activități outdoor.',
                  type: 'text' as const,
                  version: 1,
                },
              ],
              direction: 'ltr' as const,
              format: '',
              indent: 0,
              type: 'paragraph' as const,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root' as const,
          version: 1,
        },
      },
      price: 22999, // 229.99 RON
      salePrice: 18999, // 189.99 RON sale
      sku: 'GSU005',
      category: categoriesMap['Accesorii']?.id,
      images: productImages[4] ? [{ image: productImages[4].id, alt: 'Geacă Sport Unisex' }] : [],
      featured: false,
      status: 'active' as const,
      sizes: ['m', 'l', 'xl'],
      colors: ['green', 'blue'],
      brand: 'adidas',
      rating: 3,
      material: 'Technical Fabric - Waterproof',
      careInstructions: 'Machine wash at 30°C, do not use fabric softener',
      fit: 'athletic',
      modelHeight: 'Unisex fit - check size guide',
      inventory: {
        quantity: 20,
        trackQuantity: true,
      },
      seo: {
        title: 'Geacă Sport Impermeabilă - Unisex',
        description: 'Geacă sport din material tehnic premium, perfectă pentru activități outdoor.',
        keywords: 'geacă sport, impermeabil, unisex, outdoor',
      },
    },
    {
      name: 'Pantofi Eleganti Bărbați',
      slug: 'pantofi-eleganti-barbati',
      description: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal' as const,
                  style: '',
                  text: 'Pantofi eleganți din piele naturală, finisaje de calitate și comfort exceptional. Ideali pentru business.',
                  type: 'text' as const,
                  version: 1,
                },
              ],
              direction: 'ltr' as const,
              format: '',
              indent: 0,
              type: 'paragraph' as const,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root' as const,
          version: 1,
        },
      },
      price: 39999, // 399.99 RON
      sku: 'PEB006',
      category: categoriesMap['Încălțăminte']?.id,
      images: productImages[5]
        ? [{ image: productImages[5].id, alt: 'Pantofi Eleganti Bărbați' }]
        : [],
      featured: false,
      status: 'active' as const,
      sizes: ['l', 'xl'],
      colors: ['black'],
      brand: 'nike',
      rating: 4,
      material: 'Natural Leather',
      careInstructions: 'Clean with leather care products, avoid water',
      fit: 'regular',
      modelHeight: 'Classic business shoe fit',
      inventory: {
        quantity: 12,
        trackQuantity: true,
      },
      seo: {
        title: 'Pantofi Eleganți din Piele Naturală - Bărbați',
        description: 'Pantofi eleganți din piele de calitate superioară, perfecti pentru business.',
        keywords: 'pantofi bărbați, piele naturală, elegant, business',
      },
    },
    {
      name: 'Geantă Designer Femei',
      slug: 'geanta-designer-femei',
      description: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal' as const,
                  style: '',
                  text: 'Geantă designer din piele premium, design exclusiv și funcționalitate maximă. Accesoriu perfect pentru orice ținută.',
                  type: 'text' as const,
                  version: 1,
                },
              ],
              direction: 'ltr' as const,
              format: '',
              indent: 0,
              type: 'paragraph' as const,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root' as const,
          version: 1,
        },
      },
      price: 45999, // 459.99 RON
      sku: 'GDF007',
      category: categoriesMap['Genți']?.id,
      images: productImages[6]
        ? [{ image: productImages[6].id, alt: 'Geantă Designer Femei' }]
        : [],
      featured: true,
      status: 'active' as const,
      sizes: [],
      colors: ['red', 'black'],
      brand: 'puma',
      rating: 5,
      material: 'Premium Leather',
      careInstructions: 'Clean with soft cloth, use leather conditioner',
      fit: 'regular',
      modelHeight: 'Designer handbag - one size',
      inventory: {
        quantity: 6,
        trackQuantity: true,
      },
      seo: {
        title: 'Geantă Designer din Piele Premium - Femei',
        description:
          'Geantă designer exclusivă din piele premium, accesoriu perfect pentru femei moderne.',
        keywords: 'geantă femei, designer, piele premium, accesorii',
      },
    },
    {
      name: 'Tricou Copii Colorat',
      slug: 'tricou-copii-colorat',
      description: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal' as const,
                  style: '',
                  text: 'Tricou colorat pentru copii din bumbac organic, design vesel și material hipoalergenic. Perfect pentru joacă.',
                  type: 'text' as const,
                  version: 1,
                },
              ],
              direction: 'ltr' as const,
              format: '',
              indent: 0,
              type: 'paragraph' as const,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root' as const,
          version: 1,
        },
      },
      price: 7999, // 79.99 RON
      salePrice: 5999, // 59.99 RON sale
      sku: 'TCC008',
      category: categoriesMap['Copii']?.id,
      images: productImages[7] ? [{ image: productImages[7].id, alt: 'Tricou Copii Colorat' }] : [],
      featured: false,
      status: 'active' as const,
      sizes: ['s', 'm'],
      colors: ['green', 'blue'],
      brand: 'adidas',
      rating: 4,
      material: 'Organic Cotton',
      careInstructions: 'Machine wash at 30°C, suitable for sensitive skin',
      fit: 'relaxed',
      modelHeight: 'Kids sizes - check size chart',
      inventory: {
        quantity: 40,
        trackQuantity: true,
      },
      seo: {
        title: 'Tricou Colorat din Bumbac Organic - Copii',
        description:
          'Tricou colorat pentru copii din bumbac organic, design vesel și material hipoalergenic.',
        keywords: 'tricou copii, bumbac organic, colorat, hipoalergenic',
      },
    },
  ]

  // Create products (with connection verification)
  payload.logger.info(`— Creating ${productsData.length} products...`)
  let successCount = 0

  for (const [index, productData] of productsData.entries()) {
    try {
      // Ensure connection before each product creation
      try {
        if (payload.db.connect) {
          await payload.db.connect()
        }
      } catch (connectionError) {
        payload.logger.warn(
          `Database reconnection attempted for product ${productData.name}: ${connectionError}`,
        )
      }

      await payload.create({
        collection: 'products',
        data: productData as any,
      })
      successCount++
      payload.logger.info(
        `✓ Created product ${index + 1}/${productsData.length}: ${productData.name}`,
      )
    } catch (error) {
      payload.logger.error(`✗ Failed to create product ${productData.name}: ${error}`)
    }

    // Small delay between product creations
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  payload.logger.info(
    `— Products creation completed. ${successCount}/${productsData.length} products created successfully.`,
  )

  payload.logger.info('Seeded database successfully!')
}

// Official Payload method for fetching files from URLs (from template)
async function fetchFileByURL(url: string): Promise<{
  name: string
  data: Buffer
  mimetype: string
  size: number
}> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}

