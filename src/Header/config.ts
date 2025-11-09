import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
      admin: {
        description: 'Upload the site logo',
      },
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
        {
          name: 'hasDropdown',
          type: 'checkbox',
          label: 'Has Dropdown Menu',
          defaultValue: false,
        },
        {
          name: 'dropdownItems',
          type: 'array',
          label: 'Dropdown Items',
          admin: {
            condition: (data, siblingData) => siblingData?.hasDropdown === true,
          },
          fields: [
            link({
              appearances: false,
            }),
          ],
          maxRows: 10,
        },
      ],
      maxRows: 8,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'searchSettings',
      type: 'group',
      label: 'Search Settings',
      fields: [
        {
          name: 'showSearch',
          type: 'checkbox',
          label: 'Show Search Icon',
          defaultValue: true,
        },
        {
          name: 'searchPlaceholder',
          type: 'text',
          label: 'Search Placeholder Text',
          defaultValue: 'Search for products...',
          admin: {
            condition: (data, siblingData) => siblingData?.showSearch === true,
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
