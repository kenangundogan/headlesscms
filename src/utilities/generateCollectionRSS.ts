import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { escapeXml } from './escapeXml'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const REVALIDATE_SECONDS = 3600

const NAMESPACES = {
  atom: 'http://www.w3.org/2005/Atom',
  media: 'http://search.yahoo.com/mrss/',
} as const

// --- Types ---

export interface RSSOptions {
  title?: string
  description?: string
  language?: string
  ttl?: number
  feedUrl?: string
}

interface RSSItem {
  title: string
  description?: string
  link: string
  guid: string
  pubDate: string
  image?: { url: string; mimeType?: string }
}

// --- Helpers ---

function resolveImageUrl(doc: any): RSSItem['image'] | undefined {
  const raw = doc.images?.ratio16x9 || doc.images?.ratio1x1
  if (!raw?.url) return undefined

  return {
    url: raw.url.startsWith('http') ? raw.url : `${SITE_URL}${raw.url}`,
    mimeType: raw.mimeType,
  }
}

// --- XML Builders ---

function buildItemXml(item: RSSItem): string {
  const media = item.image
    ? `
      <media:content url="${item.image.url}" type="${item.image.mimeType || 'image/jpeg'}" medium="image" />
      <media:thumbnail url="${item.image.url}" />`
    : ''

  return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid>${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <description>${escapeXml(item.description || '')}</description>${media}
    </item>`
}

function buildFeedXml(options: {
  title: string
  description: string
  language: string
  feedUrl: string
  itemsXml: string
}): string {
  const { title, description, language, feedUrl, itemsXml } = options

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="${NAMESPACES.atom}" xmlns:media="${NAMESPACES.media}">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(description)}</description>
    <language>${language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />${itemsXml}
  </channel>
</rss>`
}

// --- Main ---

export async function generateCollectionRSS(collectionSlug: string, options?: RSSOptions) {
  const revalidate = options?.ttl || REVALIDATE_SECONDS

  const getRSS = unstable_cache(
    async () => {
      const payload = await getPayload({ config })

      const settings = await payload.findGlobal({ slug: 'rss-settings' })
      const enabled = (settings as any).enabledCollections
      if (!Array.isArray(enabled) || !enabled.includes(collectionSlug)) return ''

      const feedUrl = options?.feedUrl || `${SITE_URL}/${collectionSlug}-rss.xml`

      const { docs } = await payload.find({
        collection: collectionSlug as any,
        overrideAccess: true,
        draft: false,
        depth: 1,
        limit: 100,
        sort: '-updatedAt',
        where: { _status: { equals: 'published' } },
        select: {
          title: true,
          description: true,
          slug: true,
          updatedAt: true,
          url: true,
          images: true,
        },
      })

      const itemsXml = docs
        .filter((doc: any) => doc.url || doc.slug)
        .map((doc: any) => {
          const link = doc.url
            ? `${SITE_URL}${doc.url}`
            : `${SITE_URL}/${collectionSlug}/${doc.slug}`

          return buildItemXml({
            title: doc.title || 'Untitled',
            description: doc.description,
            link,
            guid: link,
            pubDate: new Date(doc.updatedAt).toUTCString(),
            image: resolveImageUrl(doc),
          })
        })
        .join('')

      const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

      return buildFeedXml({
        title: options?.title || `${capitalize(collectionSlug)} Feed`,
        description: options?.description || `Latest updates from ${collectionSlug}`,
        language: options?.language || 'tr',
        feedUrl,
        itemsXml,
      })
    },
    [`rss-${collectionSlug}`],
    { tags: [`rss-${collectionSlug}`], revalidate },
  )

  const xml = (await getRSS()).trim()
  if (!xml) notFound()

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=${Math.floor(revalidate / 2)}`,
    },
  })
}
