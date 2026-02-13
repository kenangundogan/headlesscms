import type { CollectionBeforeChangeHook } from 'payload'
import type { Page } from '@/payload-types'

export const ensureUniqueHome: CollectionBeforeChangeHook<Page> = async ({
    data,
    req,
    operation,
    originalDoc,
}) => {
    // Eğer normal bir update ise ve isHome değişmemişse işlem yapma
    if (operation === 'update' && typeof data.isHome === 'undefined') {
        return data
    }

    // Eğer bu sayfa "Anasayfa" olarak işaretlendiyse
    if (data.isHome) {
        // Diğer tüm sayfalardan "isHome" işaretini kaldır
        await req.payload.update({
            collection: 'pages',
            where: {
                id: {
                    not_equals: originalDoc?.id || data.id, // Kendisi hariç
                },
                isHome: {
                    equals: true,
                },
            },
            data: {
                isHome: false,
            },
        })
    }

    return data
}
