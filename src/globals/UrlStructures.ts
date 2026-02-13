import type { GlobalConfig } from 'payload'

export const URL_STRUCTURE_OPTIONS = [
    {
        label: '/slug (Varsayılan)',
        value: 'slug',
    },
    {
        label: '/slug-id (Benzersiz)',
        value: 'slugId',
    },
    {
        label: '/yıl/ay/gün/slug (Tarihli)',
        value: 'dateSlug',
    },
    {
        label: '/yıl/ay/gün/slug-id (Tarihli + Benzersiz)',
        value: 'dateSlugId',
    },
    {
        label: '/arsiv/slug (Arşiv)',
        value: 'archiveSlug',
    },
    {
        label: '/arsiv/slug-id (Arşiv + Benzersiz)',
        value: 'archiveSlugId',
    },
]

export const UrlStructures: GlobalConfig = {
    slug: 'url-structures',
    label: 'URL Yapıları',
    access: {
        read: () => true,
    },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Sayfalar (Pages)',
                    fields: [
                        {
                            name: 'pagesUrlStructure',
                            label: 'URL Yapısı',
                            type: 'select',
                            defaultValue: 'slug',
                            options: URL_STRUCTURE_OPTIONS,
                            admin: {
                                description: 'Sayfalar için URL yapısını belirleyin.',
                            },
                        },
                    ],
                },
                {
                    label: 'Yazılar (Posts)',
                    fields: [
                        {
                            name: 'postsUrlStructure',
                            label: 'URL Yapısı',
                            type: 'select',
                            defaultValue: 'slug',
                            options: URL_STRUCTURE_OPTIONS,
                            admin: {
                                description: 'Yazılar için URL yapısını belirleyin. URL\'ler /posts/ öneki ile oluşturulur.',
                            },
                        },
                    ],
                },
            ],
        },
    ],
}
