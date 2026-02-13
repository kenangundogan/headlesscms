import type { CollectionBeforeChangeHook } from 'payload'
import { generateUrl } from '@/utilities/generateUrl'

import type { Page } from '@/payload-types'

export const populateUrl: CollectionBeforeChangeHook<Page> = async ({
    data,
    req,
    originalDoc,
}) => {
    // Global UrlStructures ayarlarını al
    const urlStructures = await req.payload.findGlobal({
        slug: 'url-structures',
        depth: 0,
    })

    const urlStructure = urlStructures?.pagesUrlStructure || 'slug'

    // Eğer slug varsa URL'yi güncelle
    if (data.slug) {
        // Create işleminde ID henüz oluşmamış olabilir, o yüzden temporary ID kullanıyoruz
        const docId = (originalDoc?.id as string) || 'temporary-id'

        data.url = generateUrl({
            slug: data.slug,
            id: docId,
            createdAt: data.createdAt || originalDoc?.createdAt,
            urlStructure,
        })
    }

    return data
}
