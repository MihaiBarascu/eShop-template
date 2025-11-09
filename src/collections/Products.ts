import { slugField, type CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { generatePreviewPath } from '../utilities/generatePreviewPath'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    defaultColumns: ['name', 'price', 'category', 'status', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req,
      }),
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'salePrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Sale price (optional)',
      },
    },
    {
      name: 'sku',
      type: 'text',
      admin: {
        description: 'Stock Keeping Unit',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      admin: {
        description: 'Show this product on homepage',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Inactive',
          value: 'inactive',
        },
        {
          label: 'Out of Stock',
          value: 'out-of-stock',
        },
      ],
      defaultValue: 'active',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'inventory',
      type: 'group',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'quantity',
          type: 'number',
          defaultValue: 0,
          min: 0,
        },
        {
          name: 'trackQuantity',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'keywords',
          type: 'text',
        },
      ],
    },

    slugField(),
  ],
}
