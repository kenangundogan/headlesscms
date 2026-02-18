import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const REVALIDATE_SECONDS = 3600

export const dynamic = 'force-dynamic'

function parseLines(text?: string): string[] {
  if (!text) return []
  return text.split('\n').map((line) => line.trim()).filter(Boolean)
}

const getCachedRobotsTxt = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'robots-txt' })

    const rules = settings.rules
    if (!Array.isArray(rules) || rules.length === 0) {
      return [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin/',
        '',
        `Sitemap: ${SITE_URL}/sitemap`,
      ].join('\n')
    }

    const lines: string[] = []

    for (const rule of rules as any[]) {
      lines.push(`User-agent: ${rule.userAgent || '*'}`)

      for (const path of parseLines(rule.allow)) {
        lines.push(`Allow: ${path}`)
      }

      for (const path of parseLines(rule.disallow)) {
        lines.push(`Disallow: ${path}`)
      }

      lines.push('')
    }

    lines.push(`Sitemap: ${SITE_URL}/sitemap`)

    return lines.join('\n')
  },
  ['robots-txt'],
  { tags: ['robots-txt'], revalidate: REVALIDATE_SECONDS },
)

export async function GET() {
  const body = await getCachedRobotsTxt()

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
