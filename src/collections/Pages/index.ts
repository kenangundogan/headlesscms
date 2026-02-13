import type { CollectionConfig } from 'payload'

import { revalidateChange, revalidateDelete } from './hooks/revalidate'
import { populateUrl } from '@/hooks/populateUrl'
import { imagesFields } from '@/fields/images'
import { metaTab } from '@/fields/meta'
import { metaRefreshTab } from '@/fields/metaRefresh'
import { ensureUniqueHome } from './hooks/ensureUniqueHome'

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
      label: 'Başlık',
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      label: 'Açıklama',
      name: 'description',
      type: 'text',
      required: true,
    },
    {
      label: 'Slug',
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      label: 'URL',
      name: 'url',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Otomatik oluşturulan URL',
      },
    },
    {
      label: 'Anasayfa olarak ayarla',
      name: 'isHome',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'content',
          label: 'İçerik',
          fields: [
            {
              label: 'İçerik',
              name: 'content',
              type: 'richText',
              required: true,
            },
          ],
        },
        {
          label: 'Görseller',
          fields: [imagesFields],
        },
        metaTab,
        metaRefreshTab,
      ]
    }
  ],
  hooks: {
    beforeChange: [ensureUniqueHome, populateUrl({ collectionSlug: 'pages' })],
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
