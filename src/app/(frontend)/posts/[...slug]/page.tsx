import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { parseUrl, parseUrlWithAllPatterns, stripPrefix } from '@/utilities/parseUrl'
import type { Post } from '@/payload-types'
import type { ParsedUrlData } from '@/utilities/parseUrl'

interface PostPageProps {
    params: {
        slug: string[]
    }
}

export default async function PostPage({ params }: PostPageProps) {
    const payload = await getPayload({ config })
    const { slug } = await params

    // Slug array'i birleştirerek tam URL oluştur (prefix dahil)
    const fullSlug = slug ? slug.join('/') : ''
    const urlPath = `/posts/${fullSlug}`

    // URL Structures global'den pattern bilgisini al
    const urlStructures = await payload.findGlobal({
        slug: 'url-structures',
        depth: 0,
    })

    const currentPattern = urlStructures?.postsUrlStructure || 'slug'

    // Prefix'i çıkar
    const urlWithoutPrefix = stripPrefix(urlPath, 'posts')

    let post: Post | null = null
    let lookupMethod = ''
    let matchedPattern = currentPattern

    // ✅ STEP 1: Current pattern ile dene
    const primaryParsed = parseUrl(urlWithoutPrefix, currentPattern)

    if (primaryParsed) {
        post = await tryFindPost(payload, primaryParsed)
        if (post) {
            lookupMethod = `Primary Pattern (${currentPattern})`
            matchedPattern = currentPattern
        }
    }

    // ✅ STEP 2: Fallback - Tüm pattern'leri dene
    if (!post) {
        const allParsedVariants = parseUrlWithAllPatterns(urlWithoutPrefix)

        for (const parsedVariant of allParsedVariants) {
            post = await tryFindPost(payload, parsedVariant)
            if (post) {
                lookupMethod = `Fallback Pattern (${parsedVariant.pattern} → ${currentPattern})`
                matchedPattern = parsedVariant.pattern
                break
            }
        }
    }

    // ✅ STEP 3: Bulunamadı → 404
    if (!post) {
        payload.logger.info(`Post not found for URL: ${urlPath}`)
        return notFound()
    }

    // ✅ STEP 4: Canonical URL Redirect (SEO)
    if (post.url && post.url !== urlPath) {
        payload.logger.info(`Redirecting ${urlPath} → ${post.url}`)
        redirect(post.url) // 301 Permanent Redirect
    }

    return (
        <div>
            <h1>📝 Post: {post.title}</h1>
            <div>
                <p><strong>Collection:</strong> Posts</p>
                <p><strong>Lookup Method:</strong> {lookupMethod}</p>
                <p><strong>Current Pattern:</strong> {currentPattern}</p>
                <p><strong>Matched Pattern:</strong> {matchedPattern}</p>
                <p><strong>Slug:</strong> {post.slug}</p>
                <p><strong>Canonical URL:</strong> {post.url}</p>
                <p><strong>Requested URL:</strong> {urlPath}</p>
                <p><strong>ID:</strong> {post.id}</p>
                <p><strong>Created:</strong> {new Date(post.createdAt).toLocaleDateString('tr-TR')}</p>
                <p><strong>Updated:</strong> {new Date(post.updatedAt).toLocaleDateString('tr-TR')}</p>
            </div>
            <hr />
            <div>
                <h2>Content:</h2>
                <pre>{JSON.stringify(post.content, null, 2)}</pre>
            </div>
        </div>
    )
}

/**
 * Parsed URL data ile post bulmaya çalış
 * Önce ID ile, sonra slug ile ara
 */
async function tryFindPost(payload: any, parsedUrl: ParsedUrlData): Promise<Post | null> {
    // ID varsa ID ile ara (en güvenilir)
    if (parsedUrl.id) {
        try {
            const post = await payload.findByID({
                collection: 'posts',
                id: parsedUrl.id,
            })
            return post as Post
        } catch (error) {
            // ID bulunamadı, slug ile devam et
        }
    }

    // Slug ile ara
    if (parsedUrl.slug) {
        const posts = await payload.find({
            collection: 'posts',
            where: {
                slug: {
                    equals: parsedUrl.slug,
                },
            },
            limit: 1,
        })
        return posts.docs[0] || null
    }

    return null
}

export async function generateStaticParams() {
    const payload = await getPayload({ config })

    const posts = await payload.find({
        collection: 'posts',
        limit: 1000,
        where: {
            _status: {
                equals: 'published',
            },
        },
    })

    return posts.docs.map((post) => ({
        slug: post.url?.replace('/posts/', '').split('/').filter(Boolean) || [post.slug],
    }))
}
