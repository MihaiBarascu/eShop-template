import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    defaultColumns: ['orderNumber', 'customer', 'total', 'status', 'createdAt'],
    useAsTitle: 'orderNumber',
  },
  access: {
    read: ({ req: { user } }) => {
      // If no user, deny access
      if (!user) {
        return false
      }

      // Users can only see their own orders
      return {
        customer: {
          equals: user?.id,
        },
      }
    },
    create: () => true,
    update: ({ req: { user } }) => {
      // For now, allow all authenticated users to update orders
      // In a real app, you might want to check if they own the order
      return !!user
    },
    delete: ({ req: { user } }) => {
      // For now, allow all authenticated users to delete orders
      // In a real app, you might want to check if they own the order
      return !!user
    },
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
        },
      ],
    },
    {
      name: 'shippingAddress',
      type: 'group',
      required: true,
      fields: [
        {
          name: 'firstName',
          type: 'text',
          required: true,
        },
        {
          name: 'lastName',
          type: 'text',
          required: true,
        },
        {
          name: 'address1',
          type: 'text',
          required: true,
        },
        {
          name: 'address2',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'state',
          type: 'text',
          required: true,
        },
        {
          name: 'zip',
          type: 'text',
          required: true,
        },
        {
          name: 'country',
          type: 'text',
          required: true,
          defaultValue: 'Romania',
        },
      ],
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'shipping',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'tax',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Processing',
          value: 'processing',
        },
        {
          label: 'Shipped',
          value: 'shipped',
        },
        {
          label: 'Delivered',
          value: 'delivered',
        },
        {
          label: 'Cancelled',
          value: 'cancelled',
        },
        {
          label: 'Refunded',
          value: 'refunded',
        },
      ],
      defaultValue: 'pending',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Credit Card',
          value: 'credit-card',
        },
        {
          label: 'PayPal',
          value: 'paypal',
        },
        {
          label: 'Bank Transfer',
          value: 'bank-transfer',
        },
        {
          label: 'Cash on Delivery',
          value: 'cod',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this order',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.orderNumber) {
          data.orderNumber = `ORDER-${Date.now()}`
        }
        return data
      },
    ],
  },
}