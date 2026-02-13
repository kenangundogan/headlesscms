import { Tab } from 'payload'

export const metaTab: Tab = {
    name: 'meta',
    label: 'SEO',
    fields: [
        {
            label: 'Meta Başlık',
            name: 'title',
            type: 'text',
            admin: {
                description: 'Arama sonuçlarında görünecek başlık',
            },
        },
        {
            label: 'Meta Açıklama',
            name: 'description',
            type: 'text',
            admin: {
                description: 'Arama sonuçlarında görünecek açıklama',
            },
        },
        {
            label: 'Meta Görsel',
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            admin: {
                description: 'Arama sonuçlarında görünecek görsel',
            },
        }
    ],
}
