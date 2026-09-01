import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'UtilsNow - 230+ Free Online Tools'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{
        fontSize: 60, background: 'linear-gradient(135deg, #0b1120 0%, #1e3a5f 100%)',
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', color: 'white',
        fontFamily: 'system-ui', padding: 40,
      }}>
        <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 20 }}>UtilsNow</div>
        <div style={{ fontSize: 32, opacity: 0.9, marginBottom: 30 }}>230+ Free Browser-Based Tools</div>
        <div style={{ display: 'flex', gap: 20, fontSize: 22, opacity: 0.7 }}>
          <span>AI Tools</span><span>•</span>
          <span>Developer</span><span>•</span>
          <span>SEO</span><span>•</span>
          <span>Financial</span><span>•</span>
          <span>Image</span>
        </div>
        <div style={{ fontSize: 20, marginTop: 30, opacity: 0.5 }}>No signup • 100% in-browser • Free forever</div>
      </div>
    ),
    { ...size }
  )
}
