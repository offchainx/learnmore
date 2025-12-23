import { ImageResponse } from 'next/og'

// 图标配置
export const runtime = 'edge'
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

// 生成图标
export default function Icon() {
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
          borderRadius: '20%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80%',
            height: '80%',
            background: '#ffffff',
            borderRadius: '15%',
          }}
        >
          {/* 书本图标 */}
          <div
            style={{
              display: 'flex',
              fontSize: 200,
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
