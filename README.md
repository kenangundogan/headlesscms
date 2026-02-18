# Headless CMS

Payload CMS 3 + Next.js 15 ile geliştirilmiş, modüler ve genişletilebilir bir Headless CMS altyapısı.

## Teknolojiler

- **Payload CMS** 3.76 — Backend & Admin Panel
- **Next.js** 15 — Frontend & API Routes
- **MongoDB** — Veritabanı
- **TypeScript** — Tip güvenliği
- **Sharp** — Görsel işleme

## Kurulum

```bash
pnpm install
cp .env.example .env  # Ortam değişkenlerini yapılandırın
```

### Geliştirme

```bash
pnpm dev
```

### Production

```bash
pnpm build
pnpm start
```

Admin paneli: `http://localhost:3000/admin`

## Proje Yapisi

```
src/
├── app/
│   ├── (frontend)/          # Frontend route'ları
│   │   ├── [...slug]/       # Dinamik sayfa route'ları
│   │   ├── posts/           # Post sayfaları
│   │   ├── rss/             # RSS feed endpoint'leri
│   │   └── sitemap/         # Sitemap endpoint'leri
│   ├── robots.txt/          # Robots.txt route
│   └── (payload)/           # Payload admin & API
├── collections/             # Koleksiyon tanımları
│   ├── Pages/
│   ├── Posts/
│   ├── Media/
│   └── Users/
├── globals/                 # Global ayarlar
│   ├── SitemapSettings.ts
│   ├── RssSettings.ts
│   ├── RobotsTxt.ts
│   └── UrlStructures.ts
├── fields/                  # Paylaşılan alan tanımları
│   ├── breadcrumbs.ts
│   ├── images.ts
│   ├── meta.ts
│   └── metaRefresh.ts
├── hooks/                   # Payload hook'ları
│   ├── populateUrl.ts
│   └── populateBreadcrumbs.ts
└── utilities/               # Yardımcı fonksiyonlar
    ├── generateCollectionRSS.ts
    ├── getCollectionSitemapFields.ts
    ├── generateUrl.ts
    ├── parseUrl.ts
    ├── escapeXml.ts
    └── validateMedia.ts
```

## Ozellikler

### URL Yonetimi

- `populateUrl` hook'u ile koleksiyon bazlı dinamik URL oluşturma
- `isHome` desteği (anasayfa olarak ayarlama)
- URL çakışma kontrolü
- Eski URL yapıları için fallback routing

### Breadcrumbs

- Pages: `nestedDocsPlugin` entegrasyonu (hiyerarşik yapı)
- Posts: Özel `populateBreadcrumbs` hook'u
- Standart API çıktısı: `{ doc, url, label }`

### SEO & Meta

- Koleksiyon bazlı Meta alanları (başlık, açıklama, görsel)
- Meta Refresh ayarları
- Dinamik `generateMetadata` desteği

### Sitemap

- `/sitemap` — Aktif koleksiyonların sitemap index'i
- `/sitemap/posts.xml` — Koleksiyon bazlı sitemap
- Admin panelden koleksiyon bazlı açma/kapama (`SitemapSettings`)
- `unstable_cache` + `revalidateTag` ile cache yönetimi

### RSS

- `/rss` — Aktif feed'lerin index'i
- `/rss/posts.xml` — Koleksiyon bazlı RSS 2.0 feed
- Media namespace desteği (görsel metadata)
- Admin panelden koleksiyon bazlı açma/kapama (`RssSettings`)
- `unstable_cache` + `revalidateTag` ile cache yönetimi

### Robots.txt

- `/robots.txt` — Admin panelden yönetilebilir kurallar
- User-Agent, Allow, Disallow tanımları
- Otomatik Sitemap referansı
- Cache + revalidation desteği

### Cache & Revalidation

Tüm SEO endpoint'leri aynı pattern'ı takip eder:

1. `unstable_cache` ile 1 saat cache
2. İçerik güncellendiğinde `afterChange` hook'u ile anında revalidation
3. Ayarlar değiştiğinde ilgili tüm cache tag'leri invalidate edilir

### Gorsel Yonetimi

- Özel oranlı görsel alanları (16:9, 9:16, 1:1)
- Upload sırasında boyut validasyonu

## Scriptler

| Script | Aciklama |
|---|---|
| `pnpm dev` | Geliştirme sunucusu |
| `pnpm build` | Production build |
| `pnpm start` | Production sunucusu |
| `pnpm generate:types` | Payload tip dosyalarını oluştur |
| `pnpm lint` | ESLint kontrolü |
| `pnpm test` | Tüm testleri çalıştır |
