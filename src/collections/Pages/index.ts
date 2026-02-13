import type { CollectionConfig } from 'payload'

import { revalidateChange, revalidateDelete } from './hooks/revalidate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Sayfa',
    plural: 'Sayfalar',
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
  hooks: {
    afterChange: [revalidateChange],
    afterDelete: [revalidateDelete],
  },
  lockDocuments: {
    duration: 600,
  },
  versions: {
    drafts: {
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  trash: true
}
