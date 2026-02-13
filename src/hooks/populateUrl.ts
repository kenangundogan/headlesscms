import type { CollectionBeforeChangeHook } from 'payload'
import { generateUrl } from '@/utilities/generateUrl'
import type { UrlStructure } from '@/payload-types'
import type { UrlStructureType } from '@/utilities/generateUrl'

interface PopulateUrlOptions {
    /**
     * URL prefix (örn: 'posts')
     */
    prefix?: string
    /**
     * Koleksiyon slug'ı (örn: 'pages', 'posts')
     * Otomatik algılanamazsa fallback olarak kullanılır
     */
    collectionSlug?: string
}

export const populateUrl = (options?: PopulateUrlOptions): CollectionBeforeChangeHook => async ({
    data,
    req,
    originalDoc,
}) => {
    // Global UrlStructures ayarlarını al
    const urlStructures = await req.payload.findGlobal({
        slug: 'url-structures',
        depth: 0,
    }) as unknown as UrlStructure

    // Hangi koleksiyon için çalışıyoruz?
    // Önce explicit option'a bak, yoksa req'den dene
    const collectionSlug = options?.collectionSlug || (req as any).collection?.config?.slug

    if (!collectionSlug) {
        req.payload.logger.warn('populateUrl: Collection slug could not be determined.')
        return data
    }

    // Koleksiyon adına göre pattern key'ini oluştur (örn: postsUrlStructure)
    const patternKey = `${collectionSlug}UrlStructure` as keyof UrlStructure

    // Global ayarlardan pattern'i al
    const urlStructure = (urlStructures[patternKey] as UrlStructureType) || 'slug'

    req.payload.logger.info(`populateUrl: Generatig URL for ${collectionSlug}. Pattern: ${urlStructure}, Slug: ${data.slug}, isHome: ${data.isHome}`)

    // KONTROL: Eğer isHome=true ise, URL direk '/' olmalı
    // Bu sadece Pages koleksiyonunda olabilir
    if (data.isHome) {
        data.url = '/'
        return data
    }

    // Eğer slug varsa URL'yi güncelle
    if (data.slug) {
        // Create işleminde ID henüz oluşmamış olabilir, o yüzden temporary ID kullanıyoruz
        const docId = (originalDoc?.id as string) || (data.id as string) || 'temporary-id'

        data.url = generateUrl({
            slug: data.slug,
            id: docId,
            createdAt: data.createdAt || originalDoc?.createdAt,
            urlStructure,
            prefix: options?.prefix,
        })

        req.payload.logger.info(`populateUrl: URL generated: ${data.url}`)
    } else {
        req.payload.logger.warn('populateUrl: Slug is missing, skipping URL generation.')
    }

    return data
}
