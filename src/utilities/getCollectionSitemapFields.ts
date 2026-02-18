import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const REVALIDATE_SECONDS = 3600

export interface SitemapField {
  loc: string
  lastmod: string
  changefreq: string
  priority: number
}

export async function getCollectionSitemapFields(
  collectionSlug: string,
): Promise<SitemapField[] | null> {
  const getFields = unstable_cache(
    async () => {
      const payload = await getPayload({ config })

      const settings = await payload.findGlobal({ slug: 'sitemap-settings' })
      const enabled = (settings as any).enabledCollections
      if (!Array.isArray(enabled) || !enabled.includes(collectionSlug)) return null

      const { docs } = await payload.find({
        collection: collectionSlug as any,
        overrideAccess: true,
        draft: false,
        depth: 0,
        limit: 1000,
        where: { _status: { equals: 'published' } },
        select: { slug: true, updatedAt: true, url: true },
      })

      return docs
        .filter((doc: any) => doc.url || doc.slug)
        .map((doc: any): SitemapField => ({
          loc: doc.url
            ? `${SITE_URL}${doc.url}`
            : `${SITE_URL}/${collectionSlug}/${doc.slug}`,
          lastmod: new Date(doc.updatedAt).toISOString(),
          changefreq: 'daily',
          priority: 0.7,
        }))
    },
    [`sitemap-${collectionSlug}`],
    { tags: [`sitemap-${collectionSlug}`], revalidate: REVALIDATE_SECONDS },
  )

  return getFields()
}
