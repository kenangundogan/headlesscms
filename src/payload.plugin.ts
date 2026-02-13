import { Plugin } from 'payload'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'

export const plugins: Plugin[] = [
  nestedDocsPlugin({
    collections: ['pages'],
    generateLabel: (_, doc) => doc.title as string,
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  redirectsPlugin({
    collections: ['posts', 'pages'],
    redirectTypes: ['301', '302'],
    redirectTypeFieldOverride: {
      label: 'Yönlendirme Tipi',
      admin: {
        description: '301 kalıcı, 302 geçici yönlendirme için kullanılır',
      },
    },
    overrides: {
      trash: true,
      labels: {
        singular: 'Yönlendirme',
        plural: 'Yönlendirmeler',
      },
      admin: {
        defaultColumns: ['from', 'to', 'type', 'updatedAt'],
        useAsTitle: 'from',
        group: 'Sistem',
      },
    },
  }),
]