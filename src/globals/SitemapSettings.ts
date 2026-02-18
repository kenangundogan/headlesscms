import type { GlobalConfig } from 'payload'
import { revalidateTag } from 'next/cache'

export const SitemapSettings: GlobalConfig = {
  slug: 'sitemap-settings',
  label: 'Sitemap Ayarları',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidateTag('sitemap-index')
        revalidateTag('sitemap-posts')
        revalidateTag('sitemap-pages')
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
        description: 'Sitemap oluşturulmasını istediğiniz koleksiyonları seçin.',
      },
    },
  ],
}
