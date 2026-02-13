export type UrlStructureType = 'slug' | 'slugId' | 'dateSlug' | 'dateSlugId' | 'archiveSlug' | 'archiveSlugId'

interface GenerateUrlParams {
    slug: string
    id: string
    createdAt?: string | Date
    urlStructure: UrlStructureType
    prefix?: string // Ön ek path (örn: "blog", "sayfalar")
}

/**
 * Seçilen URL yapısına göre dinamik URL oluşturur
 * TAM ID kullanır (short ID DEĞİL)
 */
export function generateUrl({ slug, id, createdAt, urlStructure, prefix }: GenerateUrlParams): string {
    // Prefix varsa temizle ve normalize et
    const cleanPrefix = prefix
        ? `/${prefix.replace(/^\/+|\/+$/g, '')}` // Başta ve sondaki slash'leri temizle, sonra başa ekle
        : ''

    let path = ''

    switch (urlStructure) {
        case 'slug':
            // /ornek-yazi
            path = `/${slug}`
            break

        case 'slugId':
            // /ornek-yazi-698f05b399a962a3b66a8bb7 (TAM ID)
            path = `/${slug}-${id}`
            break

        case 'dateSlug': {
            // /2024/03/15/ornek-yazi
            if (!createdAt) {
                path = `/${slug}`
                break
            }
            const date = new Date(createdAt)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            path = `/${year}/${month}/${day}/${slug}`
            break
        }

        case 'dateSlugId': {
            // /2024/03/15/ornek-yazi-698f05b399a962a3b66a8bb7 (TAM ID)
            if (!createdAt) {
                path = `/${slug}-${id}`
                break
            }
            const date = new Date(createdAt)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            path = `/${year}/${month}/${day}/${slug}-${id}`
            break
        }

        case 'archiveSlug':
            // /arsiv/ornek-yazi
            path = `/arsiv/${slug}`
            break

        case 'archiveSlugId':
            // /arsiv/ornek-yazi-698f05b399a962a3b66a8bb7 (TAM ID)
            path = `/arsiv/${slug}-${id}`
            break

        default:
            path = `/${slug}`
    }

    // Prefix varsa başa ekle
    return cleanPrefix ? `${cleanPrefix}${path}` : path
}
