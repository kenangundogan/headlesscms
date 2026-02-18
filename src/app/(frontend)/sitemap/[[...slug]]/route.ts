import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { getCollectionSitemapFields } from '@/utilities/getCollectionSitemapFields'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const REVALIDATE_SECONDS = 3600

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ slug?: string[] }>
}

const getCachedIndex = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'sitemap-settings' })
    const collections: string[] = Array.isArray((settings as any).enabledCollections)
      ? (settings as any).enabledCollections
      : []

    const sitemaps = collections
      .map(
        (slug) => `
  <sitemap>
    <loc>${SITE_URL}/sitemap/${slug}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`,
      )
      .join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps}
</sitemapindex>`
  },
  ['sitemap-index'],
  { tags: ['sitemap-index'], revalidate: REVALIDATE_SECONDS },
)

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params

  if (!slug || slug.length === 0) {
    const xml = await getCachedIndex()
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    })
  }

  const collection = slug[0].replace('.xml', '')
  const fields = await getCollectionSitemapFields(collection)
  if (!fields) notFound()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fields.map((f) => `  <url>
    <loc>${f.loc}</loc>
    <lastmod>${f.lastmod}</lastmod>
    <changefreq>${f.changefreq}</changefreq>
    <priority>${f.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
