import { tr } from '@payloadcms/translations/languages/tr'

export const i18n = {
    supportedLanguages: { tr },
    fallbackLanguage: 'tr' as const,
    translations: {
        tr: {
            'plugin-redirects': {
                fromUrl: 'Eski URL',
                toUrlType: 'Yönlendirme Tipi',
                internalLink: 'Dahili Bağlantı',
                customUrl: 'Özel URL',
                documentToRedirect: 'Yönlendirilecek Sayfa',
            },
        },
    },
}
