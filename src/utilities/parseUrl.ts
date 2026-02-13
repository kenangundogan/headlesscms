import type { UrlStructureType } from './generateUrl'

export interface ParsedUrlData {
    slug?: string
    id?: string
    year?: string
    month?: string
    day?: string
    pattern: UrlStructureType
}

/**
 * URL'den farklı pattern'lere göre veri çıkarır
 * Tüm olası pattern'leri dener ve başarılı olanı döndürür
 */
export function parseUrlWithAllPatterns(url: string): ParsedUrlData[] {
    const results: ParsedUrlData[] = []
    const patterns: UrlStructureType[] = ['slug', 'slugId', 'dateSlug', 'dateSlugId', 'archiveSlug', 'archiveSlugId']

    for (const pattern of patterns) {
        const parsed = parseUrl(url, pattern)
        if (parsed && (parsed.slug || parsed.id)) {
            results.push(parsed)
        }
    }

    return results
}

/**
 * URL'den belirli bir pattern'e göre veri çıkarır
 */
export function parseUrl(url: string, pattern: UrlStructureType): ParsedUrlData | null {
    // Başındaki ve sonundaki slash'leri temizle
    const cleanUrl = url.replace(/^\/+|\/+$/g, '')
    const parts = cleanUrl.split('/')

    const result: ParsedUrlData = { pattern }

    switch (pattern) {
        case 'slug':
            // /slug
            if (parts.length === 1 && parts[0] && !parts[0].includes('-')) {
                result.slug = parts[0]
                return result
            }
            break

        case 'slugId':
            // /slug-id
            if (parts.length === 1 && parts[0].includes('-')) {
                const lastDashIndex = parts[0].lastIndexOf('-')
                result.slug = parts[0].substring(0, lastDashIndex)
                result.id = parts[0].substring(lastDashIndex + 1)
                if (result.slug && result.id) {
                    return result
                }
            }
            break

        case 'dateSlug':
            // /year/month/day/slug
            if (parts.length === 4) {
                result.year = parts[0]
                result.month = parts[1]
                result.day = parts[2]
                result.slug = parts[3]
                return result
            }
            break

        case 'dateSlugId':
            // /year/month/day/slug-id
            if (parts.length === 4 && parts[3].includes('-')) {
                result.year = parts[0]
                result.month = parts[1]
                result.day = parts[2]
                const lastDashIndex = parts[3].lastIndexOf('-')
                result.slug = parts[3].substring(0, lastDashIndex)
                result.id = parts[3].substring(lastDashIndex + 1)
                if (result.slug && result.id) {
                    return result
                }
            }
            break

        case 'archiveSlug':
            // /arsiv/slug
            if (parts.length === 2 && parts[0] === 'arsiv' && !parts[1].includes('-')) {
                result.slug = parts[1]
                return result
            }
            break

        case 'archiveSlugId':
            // /arsiv/slug-id
            if (parts.length === 2 && parts[0] === 'arsiv' && parts[1].includes('-')) {
                const lastDashIndex = parts[1].lastIndexOf('-')
                result.slug = parts[1].substring(0, lastDashIndex)
                result.id = parts[1].substring(lastDashIndex + 1)
                if (result.slug && result.id) {
                    return result
                }
            }
            break
    }

    return null
}

/**
 * Prefix'i URL'den çıkarır
 */
export function stripPrefix(url: string, prefix?: string): string {
    if (!prefix) return url

    const cleanPrefix = prefix.replace(/^\/+|\/+$/g, '')
    const cleanUrl = url.replace(/^\/+/, '')

    if (cleanUrl.startsWith(`${cleanPrefix}/`)) {
        return cleanUrl.substring(cleanPrefix.length)
    }

    return `/${cleanUrl}`
}
