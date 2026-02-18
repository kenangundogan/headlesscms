import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { generateCollectionRSS } from '@/utilities/generateCollectionRSS'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const REVALIDATE_SECONDS = 3600

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ slug?: string[] }>
}

const getCachedIndex = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'rss-settings' })
    const collections: string[] = Array.isArray((settings as any).enabledCollections)
      ? (settings as any).enabledCollections
      : []

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

    const items = collections
      .map(
        (slug) => `
    <item>
      <title>${capitalize(slug)} Feed</title>
      <link>${SITE_URL}/rss/${slug}.xml</link>
      <description>Latest content from ${slug}</description>
    </item>`,
      )
      .join('')

    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>RSS Feeds Index</title>
    <description>Index of all available RSS feeds</description>
    <link>${SITE_URL}</link>${items}
  </channel>
</rss>`
  },
  ['rss-index'],
  { tags: ['rss-index'], revalidate: REVALIDATE_SECONDS },
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
  return generateCollectionRSS(collection, {
    feedUrl: `${SITE_URL}/rss/${slug[0]}`,
  })
}
