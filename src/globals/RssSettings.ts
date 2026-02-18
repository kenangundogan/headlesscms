import type { GlobalConfig } from 'payload'
import { revalidateTag } from 'next/cache'

export const RssSettings: GlobalConfig = {
  slug: 'rss-settings',
  label: 'RSS Ayarları',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidateTag('rss-index')
        revalidateTag('rss-posts')
        revalidateTag('rss-pages')
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'enabledCollections',
      type: 'select',
      label: 'Aktif Koleksiyonlar',
      hasMany: true,
      options: [
        { label: 'Sayfalar (Pages)', value: 'pages' },
        { label: 'Yazılar (Posts)', value: 'posts' },
      ],
      admin: {
        description: 'RSS yayını yapılmasını istediğiniz koleksiyonları seçin.',
      },
    },
  ],
}
