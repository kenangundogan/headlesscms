import { getServerSideSitemap, ISitemapField } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

/**
 * Belirtilen koleksiyon için dinamik sitemap response'u oluşturur.
 * Cache mekanizması dahildir.
 * 
 * @param collectionSlug - Sitemap oluşturulacak koleksiyonun slug'ı (örn: 'pages', 'posts')
 * @returns Sitemap XML Response
 */
export async function generateCollectionSitemap(collectionSlug: string) {
    const getSitemap = unstable_cache(
        async () => {
            const payload = await getPayload({ config })
            const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

            try {
                const results = await payload.find({
                    collection: collectionSlug as any, // Güvenli cast
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

                const sitemap: ISitemapField[] = results.docs
                    ? results.docs
                        .filter((doc) => {
                            // Slug veya URL olmayanları ele
                            return Boolean((doc as any)?.slug)
                        })
                        .map((doc) => {
                            // URL varsa onu kullan, yoksa fallback yap (URL yapınız değiştikçe burası tek yerden güncellenebilir)
                            const docUrl = (doc as any)?.url || `/${collectionSlug === 'pages' ? '' : collectionSlug + '/'}${(doc as any).slug}`.replace('//', '/')

                            return {
                                loc: `${SITE_URL}${docUrl}`,
                                lastmod: String((doc as any).updatedAt || dateFallback), // String cast
                                changefreq: 'daily',
                                priority: collectionSlug === 'pages' ? 0.7 : 0.5, // Örn: Sayfalar daha öncelikli
                            }
                        })
                    : []

                return sitemap
            } catch (error) {
                console.error(`Sitemap generation error for ${collectionSlug}:`, error)
                return []
            }
        },
        [`sitemap-${collectionSlug}`], // Cache Key
        {
            tags: [`sitemap-${collectionSlug}`], // Revalidation Tags
            revalidate: 3600, // 1 Saat (Opsiyonel fallback)
        },
    )

    const sitemapData = await getSitemap()
    return getServerSideSitemap(sitemapData)
}
