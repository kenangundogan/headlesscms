import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Page } from '@/payload-types'

export default async function HomePage() {
  const payload = await getPayload({ config })

  // isHome: true olan sayfayı bul
  const homePage = await payload.find({
    collection: 'pages',
    where: {
      isHome: {
        equals: true,
      },
    },
    limit: 1,
  })

  const page = homePage.docs[0]

  if (!page) {
    // Eğer anasayfa atanmamışsa standart bir karşılama mesajı göster
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
        <h1>Welcome to Headless CMS</h1>
        <p>No homepage set via CMS. Please define a homepage in the admin panel.</p>
        <a href="/admin" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem', background: '#333', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
          Go to Admin Panel
        </a>
      </div>
    )
  }

  return (
    <div>
      <h1>🏠 Homepage: {page.title}</h1>
      <div>
        <p><strong>Collection:</strong> Pages</p>
        <p><strong>Type:</strong> Homepage (isHome=true)</p>
        <p><strong>Slug:</strong> {page.slug}</p>
        <p><strong>URL:</strong> {page.url}</p>
        <p><strong>ID:</strong> {page.id}</p>
        <p><strong>Created:</strong> {new Date(page.createdAt).toLocaleDateString('tr-TR')}</p>
        <p><strong>Updated:</strong> {new Date(page.updatedAt).toLocaleDateString('tr-TR')}</p>
      </div>
      <hr />
      <div>
        <h2>Content:</h2>
        <pre>{JSON.stringify(page.content, null, 2)}</pre>
      </div>
    </div>
  )
}
