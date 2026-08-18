import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Google AdSense crawler (REQUIRED for ad serving)
      { userAgent: 'Mediapartners-Google', allow: '/' },
      // Standard search crawlers
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'DuckDuckBot', allow: '/' },
      { userAgent: 'DuckAssistBot', allow: '/' },
      { userAgent: 'Applebot', allow: '/' },
      { userAgent: 'Kagibot', allow: '/' },
      { userAgent: 'BraveBot', allow: '/' },
      // OpenAI (ChatGPT)
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      // Anthropic (Claude)
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-SearchBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      // Perplexity
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      // Google AI (Gemini)
      { userAgent: 'Google-Extended', allow: '/' },
      // Apple Intelligence
      { userAgent: 'Applebot-Extended', allow: '/' },
      // Meta AI
      { userAgent: 'Meta-ExternalAgent', allow: '/' },
      { userAgent: 'meta-webindexer', allow: '/' },
      { userAgent: 'FacebookBot', allow: '/' },
      // Amazon (Alexa)
      { userAgent: 'Amazonbot', allow: '/' },
      { userAgent: 'Amzn-SearchBot', allow: '/' },
      { userAgent: 'Amzn-User', allow: '/' },
      // You.com
      { userAgent: 'YouBot', allow: '/' },
      // Phind
      { userAgent: 'PhindBot', allow: '/' },
      // Common Crawl (feeds many LLMs)
      { userAgent: 'CCBot', allow: '/' },
      // Other AI models
      { userAgent: 'DeepSeekBot', allow: '/' },
      { userAgent: 'MistralAI-User', allow: '/' },
      { userAgent: 'QwenBot', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
      // Block aggressive crawlers
      { userAgent: 'Bytespider', disallow: '/' },
      // Default
      { userAgent: '*', allow: '/' },
    ],
    sitemap: 'https://utilsnow.com/sitemap.xml',
  }
}
