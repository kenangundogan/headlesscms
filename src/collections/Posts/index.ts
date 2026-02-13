import type { CollectionConfig } from 'payload'

import { revalidateChange, revalidateDelete } from './hooks/revalidate'
import { populateUrl } from './hooks/populateUrl'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Yazı',
    plural: 'Yazılar',
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
    {
      name: 'url',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Otomatik oluşturulan URL',
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            // URL hook tarafından doldurulacak
            return siblingData.url
          },
        ],
      },
    },
  ],
  hooks: {
    beforeChange: [populateUrl],
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
  trash: true,
}
