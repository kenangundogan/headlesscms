import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: true,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        url: true,
      },
    })

    const dateFallback = new Date().toISOString()

    const sitemap = results.docs
      ? results.docs
        .filter((page) => Boolean(page?.slug))
        .map((page) => {
          const url = page?.url || `/${page.slug}`
          return {
            loc: `${SITE_URL}${url}`,
            lastmod: page.updatedAt || dateFallback,
          }
        })
      : []

    return sitemap
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
