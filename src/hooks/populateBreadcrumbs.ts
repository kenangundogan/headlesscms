import type { CollectionBeforeChangeHook } from 'payload'
import type { Page } from '@/payload-types'

// Payload relationship field value type
type RelationshipValue = {
    relationTo: string
    value: string | number
} | string | number | null

interface BreadcrumbItem {
    doc?: RelationshipValue
    url?: string
    label?: string
    id?: string
}

interface PopulateBreadcrumbsOptions {
    collectionLabel?: string
    collectionUrl?: string
    collectionSlug?: string
}

export const populateBreadcrumbs = (options?: PopulateBreadcrumbsOptions): CollectionBeforeChangeHook => async ({
    data,
    req,
    originalDoc,
}) => {
    const breadcrumbs: BreadcrumbItem[] = []

    try {
        const homePage = await req.payload.find({
            collection: 'pages',
            where: {
                isHome: {
                    equals: true,
                },
            },
            depth: 0,
            limit: 1,
        })

        if (homePage.docs.length > 0) {
            const home = homePage.docs[0] as unknown as Page

            // LOG: Anasayfa ID kontrolü
            req.payload.logger.info(`Breadcrumb: Home found. ID: ${home.id}, Type: ${typeof home.id}`)

            breadcrumbs.push({
                doc: {
                    value: String(home.id), // String'e zorla
                    relationTo: 'pages',
                },
                url: '/',
                label: home.title || 'Anasayfa',
            })
        } else {
            breadcrumbs.push({
                url: '/',
                label: 'Anasayfa',
            })
        }
    } catch (error) {
        req.payload.logger.error(`Breadcrumb error: ${error}`)
        breadcrumbs.push({
            url: '/',
            label: 'Anasayfa',
        })
    }

    if (options?.collectionLabel && options?.collectionUrl) {
        breadcrumbs.push({
            url: options.collectionUrl,
            label: options.collectionLabel,
        })
    }

    const currentDocId = (originalDoc?.id as string) || (data.id as string)
    const currentCollectionSlug = options?.collectionSlug || (req as any).collection?.config?.slug

    req.payload.logger.info(`Breadcrumb: Current Doc ID: ${currentDocId}, Collection: ${currentCollectionSlug}`)

    if (data.url && currentDocId && currentCollectionSlug) {
        breadcrumbs.push({
            doc: {
                value: String(currentDocId), // String'e zorla
                relationTo: currentCollectionSlug,
            },
            url: data.url,
            label: data.title,
        })
    } else {
        if (data.url) {
            breadcrumbs.push({
                url: data.url,
                label: data.title,
            })
        }
    }

    req.payload.logger.info(`Breadcrumb Generated: ${JSON.stringify(breadcrumbs)}`)

    data.breadcrumbs = breadcrumbs

    return data
}
