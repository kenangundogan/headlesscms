import type { CollectionBeforeChangeHook } from 'payload'
import { generateUrl } from '@/utilities/generateUrl'

import type { Post } from '@/payload-types'

export const populateUrl: CollectionBeforeChangeHook<Post> = async ({
    data,
    req,
    originalDoc,
}) => {
    // Global UrlStructures ayarlarını al
    const urlStructures = await req.payload.findGlobal({
        slug: 'url-structures',
        depth: 0,
    })

    const urlStructure = urlStructures?.postsUrlStructure || 'slug'

    // Eğer slug varsa URL'yi güncelle
    if (data.slug) {
        // Create işleminde ID henüz oluşmamış olabilir, o yüzden temporary ID kullanıyoruz
        const docId = (originalDoc?.id as string) || 'temporary-id'

        data.url = generateUrl({
            slug: data.slug,
            id: docId,
            createdAt: data.createdAt || originalDoc?.createdAt,
            urlStructure,
            prefix: 'posts', // Sabit prefix: /posts/*
        })
    }

    return data
}
