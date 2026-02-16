import { Tab } from 'payload'

export const metaRefreshTab: Tab = {
    label: 'Meta Refresh',
    fields: [
        {
            name: 'metaRefresh',
            label: 'Yenileme Süresi (Saniye)',
            type: 'number',
            min: 180,
            max: 86400,
            admin: {
                placeholder: 'Otomatik yenileme için saniye girin (Örn: 180)',
            },
        },
    ],
}
