import type { Field } from 'payload'

export const breadcrumbsField: Field = {
    name: 'breadcrumbs',
    type: 'array',
    label: false,
    admin: {
        readOnly: true,
    },
    fields: [
        {
            name: 'doc',
            type: 'relationship',
            relationTo: ['pages', 'posts'],
            maxDepth: 0,
            admin: {
                disabled: true,
            },
        },
        {
            name: 'url',
            type: 'text',
        },
        {
            name: 'label',
            type: 'text',
        },
    ],
}
