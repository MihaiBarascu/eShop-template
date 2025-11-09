import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Upload a logo for the footer',
      },
    },
    {
      name: 'columns',
      type: 'array',
      label: 'Footer Columns',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Column Title',
        },
        {
          name: 'links',
          type: 'array',
          label: 'Column Links',
          fields: [
            link({
              appearances: false,
            }),
          ],
          maxRows: 10,
        },
      ],
      maxRows: 5,
      admin: {
        initCollapsed: true,
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Media Links',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Twitter', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Pinterest', value: 'pinterest' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'LinkedIn', value: 'linkedin' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Optional custom icon (SVG recommended)',
          },
        },
      ],
      maxRows: 10,
    },
    {
      name: 'contactAddress',
      type: 'text',
      label: 'Contact Address',
    },
    {
      name: 'contactPhone',
      type: 'text',
      label: 'Contact Phone',
    },
    {
      name: 'contactEmail',
      type: 'text',
      label: 'Contact Email',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Shop Description',
      admin: {
        description: 'Brief description about your shop',
      },
    },
    {
      name: 'copyrightText',
      type: 'text',
      label: 'Copyright Text',
      defaultValue: '© 2024 TailStore. All rights reserved.',
    },
    {
      name: 'legalLinks',
      type: 'array',
      label: 'Legal Links',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
    {
      name: 'paymentIcons',
      type: 'array',
      label: 'Payment Method Icons',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Payment Method Name',
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Payment method icon (SVG/PNG)',
          },
        },
      ],
      maxRows: 6,
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
