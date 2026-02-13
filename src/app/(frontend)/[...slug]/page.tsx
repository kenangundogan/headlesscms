import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { parseUrl, parseUrlWithAllPatterns } from '@/utilities/parseUrl'
import type { Page } from '@/payload-types'
import type { ParsedUrlData } from '@/utilities/parseUrl'

interface PageProps {
    params: {
        slug: string[]
    }
}

export default async function DynamicPage({ params }: PageProps) {
    const payload = await getPayload({ config })
    const { slug } = await params

    // Slug array'i birleştirerek tam URL oluştur
    const fullSlug = slug ? slug.join('/') : ''
    const urlPath = `/${fullSlug}`

    // URL Structures global'den pattern bilgisini al
    const urlStructures = await payload.findGlobal({
        slug: 'url-structures',
        depth: 0,
    })

    const currentPattern = urlStructures?.pagesUrlStructure || 'slug'

    let page: Page | null = null
    let lookupMethod = ''
    let matchedPattern = currentPattern

    // ✅ STEP 1: Current pattern ile dene
    const primaryParsed = parseUrl(urlPath, currentPattern)

    if (primaryParsed) {
        page = await tryFindPage(payload, primaryParsed)
        if (page) {
            lookupMethod = `Primary Pattern (${currentPattern})`
            matchedPattern = currentPattern
        }
    }

    // ✅ STEP 2: Fallback - Tüm pattern'leri dene
    if (!page) {
        const allParsedVariants = parseUrlWithAllPatterns(urlPath)

        for (const parsedVariant of allParsedVariants) {
            page = await tryFindPage(payload, parsedVariant)
            if (page) {
                lookupMethod = `Fallback Pattern (${parsedVariant.pattern} → ${currentPattern})`
                matchedPattern = parsedVariant.pattern
                break
            }
        }
    }

    // ✅ STEP 3: Bulunamadı → 404
    if (!page) {
        payload.logger.info(`Page not found for URL: ${urlPath}`)
        return notFound()
    }

    // ✅ STEP 4: Canonical URL Redirect (SEO)
    if (page.url && page.url !== urlPath) {
        payload.logger.info(`Redirecting ${urlPath} → ${page.url}`)
        redirect(page.url) // 301 Permanent Redirect
    }

    return (
        <div>
            <h1>📄 Page: {page.title}</h1>
            <div>
                <p><strong>Collection:</strong> Pages</p>
                <p><strong>Lookup Method:</strong> {lookupMethod}</p>
                <p><strong>Current Pattern:</strong> {currentPattern}</p>
                <p><strong>Matched Pattern:</strong> {matchedPattern}</p>
                <p><strong>Slug:</strong> {page.slug}</p>
                <p><strong>Canonical URL:</strong> {page.url}</p>
                <p><strong>Requested URL:</strong> {urlPath}</p>
                <p><strong>ID:</strong> {page.id}</p>
                <p><strong>Created:</strong> {new Date(page.createdAt).toLocaleDateString('tr-TR')}</p>
                <p><strong>Updated:</strong> {new Date(page.updatedAt).toLocaleDateString('tr-TR')}</p>
            </div>
            <hr />
            <div>
                <h2>Content:</h2>
                <pre>{JSON.stringify(page.content, null, 2)}</pre>
            </div>
        </div>
    )
}

/**
 * Parsed URL data ile page bulmaya çalış
 * Önce ID ile, sonra slug ile ara
 */
async function tryFindPage(payload: any, parsedUrl: ParsedUrlData): Promise<Page | null> {
    // ID varsa ID ile ara (en güvenilir)
    if (parsedUrl.id) {
        try {
            const page = await payload.findByID({
                collection: 'pages',
                id: parsedUrl.id,
            })
            return page as Page
        } catch (error) {
            // ID bulunamadı, slug ile devam et
        }
    }

    // Slug ile ara
    if (parsedUrl.slug) {
        const pages = await payload.find({
            collection: 'pages',
            where: {
                slug: {
                    equals: parsedUrl.slug,
                },
            },
            limit: 1,
        })
        return pages.docs[0] || null
    }

    return null
}

export async function generateStaticParams() {
    const payload = await getPayload({ config })

    const pages = await payload.find({
        collection: 'pages',
        limit: 1000,
        where: {
            _status: {
                equals: 'published',
            },
        },
    })

    return pages.docs.map((page) => ({
        slug: page.url?.split('/').filter(Boolean) || [page.slug],
    }))
}
