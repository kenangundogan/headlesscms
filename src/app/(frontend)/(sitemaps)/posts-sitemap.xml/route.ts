import { generateCollectionSitemap } from '@/utilities/generateCollectionSitemap'

export async function GET() {
  return await generateCollectionSitemap('posts')
}
