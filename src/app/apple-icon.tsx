import { ImageResponse } from 'next/og'

// Apple Touch Icon 配置
export const runtime = 'edge'
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// 生成 Apple Touch Icon
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '85%',
            height: '85%',
            background: '#ffffff',
            borderRadius: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 70,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            LM
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
