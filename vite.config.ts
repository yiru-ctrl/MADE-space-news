import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import Parser from 'rss-parser'
import { RSS_SOURCES } from './src/data/rssSources'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

const APP_CATEGORY: Record<string, string> = {
  LLM: 'Technology', AIUse: 'Technology', Semis: 'Technology', Cloud: 'Technology',
  Security: 'Technology', Consumer: 'Technology', General: 'Technology', Robotics: 'Technology', AR: 'Technology',
  Bio: 'Health', Climate: 'Environment', Crypto: 'Business', Policy: 'Politics',
  Space: 'Science', Batteries: 'Science', Materials: 'Science',
  Design: 'Design', Science: 'Science', Culture: 'Culture', Sports: 'Sports',
}

function cleanText(value = '') {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function stableId(value: string) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return `rss-${(hash >>> 0).toString(36)}`
}

function rssFeedPlugin() {
  const parser = new Parser({
    customFields: {
      item: [
        ['media:content', 'mediaContent'],
        ['media:thumbnail', 'mediaThumbnail'],
        ['content:encoded', 'contentEncoded'],
      ],
    },
  })
  let cache: { expires: number; payload: unknown } | null = null

  async function fetchSource(source: typeof RSS_SOURCES[number]) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    try {
      const response = await fetch(source.url, {
        signal: controller.signal,
        headers: { 'user-agent': 'CanvasRSS/1.0 (+local news reader)' },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const feed = await parser.parseString(await response.text())
      return (feed.items ?? []).slice(0, 4).map((rawItem: any) => {
        const html = rawItem.contentEncoded || rawItem.content || rawItem.summary || ''
        const media = rawItem.mediaContent?.$?.url || rawItem.mediaContent?.url
        const thumbnail = rawItem.mediaThumbnail?.$?.url || rawItem.mediaThumbnail?.url
        const htmlImage = String(html).match(/<img[^>]+src=["']([^"']+)/i)?.[1]
        const link = rawItem.link || rawItem.guid || source.url
        const summary = cleanText(rawItem.contentSnippet || rawItem.summary || html)
        const title = cleanText(rawItem.title || 'Untitled')
        const wordCount = `${title} ${summary}`.split(/\s+/).length
        return {
          id: stableId(`${source.name}:${link}`),
          title,
          summary: summary.slice(0, 360),
          source: source.name,
          sourceIcon: source.name.match(/[A-Za-z0-9]/)?.[0]?.toUpperCase() || 'R',
          category: APP_CATEGORY[source.category] || 'Technology',
          publishedAt: rawItem.isoDate || rawItem.pubDate || new Date().toISOString(),
          imageUrl: rawItem.enclosure?.url || media || thumbnail || htmlImage || null,
          readTime: Math.max(2, Math.ceil(wordCount / 200)),
          boardIds: [],
          url: link,
          feedUrl: source.url,
          isLive: true,
        }
      })
    } finally {
      clearTimeout(timeout)
    }
  }

  async function aggregateFeeds() {
    const articles: any[] = []
    let failedSources = 0
    const results = await Promise.allSettled(RSS_SOURCES.map(fetchSource))
    results.forEach(result => {
      if (result.status === 'fulfilled') articles.push(...result.value)
      else failedSources += 1
    })
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    return {
      articles: articles.slice(0, 180),
      sourceCount: RSS_SOURCES.length - failedSources,
      failedSources,
      updatedAt: new Date().toISOString(),
    }
  }

  const middleware = async (req, res, next) => {
    if (!req.url?.startsWith('/api/rss')) return next()
    try {
      if (!cache || Date.now() >= cache.expires) {
        cache = { expires: Date.now() + 10 * 60 * 1000, payload: await aggregateFeeds() }
      }
      res.statusCode = 200
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.setHeader('cache-control', 'public, max-age=300')
      res.end(JSON.stringify(cache.payload))
    } catch (error) {
      res.statusCode = 502
      res.setHeader('content-type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'RSS aggregation failed' }))
    }
  }

  return {
    name: 'canvas-rss-feed',
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    rssFeedPlugin(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
