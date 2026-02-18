import type { GlobalConfig } from 'payload'
import { revalidateTag } from 'next/cache'

export const RobotsTxt: GlobalConfig = {
    slug: 'robots-txt',
    label: 'Robots.txt',
    access: {
        read: () => true,
    },
    hooks: {
        afterChange: [
            ({ doc }) => {
                revalidateTag('robots-txt')
                return doc
            },
        ],
    },
    fields: [
        {
            name: 'rules',
            type: 'array',
            label: 'Kurallar',
            labels: {
                singular: 'Kural',
                plural: 'Kurallar',
            },
            fields: [
                {
                    name: 'userAgent',
                    type: 'text',
                    label: 'User Agent',
                    defaultValue: '*',
                    required: true,
                    admin: {
                        description: 'Örn: * veya Googlebot',
                    },
                },
                {
                    name: 'allow',
                    type: 'textarea',
                    label: 'Allow (İzin Verilenler)',
                    admin: {
                        description: 'Her satıra bir yol giriniz. Örn: /',
                    },
                },
                {
                    name: 'disallow',
                    type: 'textarea',
                    label: 'Disallow (Engellenenler)',
                    admin: {
                        description: 'Her satıra bir yol giriniz. Örn: /admin/',
                    },
                },
            ],
        },
    ],
}
