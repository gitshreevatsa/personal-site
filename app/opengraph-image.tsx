import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Shreyas Padmakiran';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          fontFamily: 'monospace',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.015) 0%, transparent 60%)',
            display: 'flex',
          }}
        />

        {/* Top — name + handle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                background: '#141414',
                border: '1px solid #1e1e1e',
                padding: '8px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <span style={{ color: '#ccc', fontSize: 18 }}>shreyaspadmakiran</span>
              <span style={{ color: '#2a2a2a', fontSize: 18 }}>|</span>
              <span style={{ color: '#555', fontSize: 16 }}>hey@shreyaspadmakiran.com</span>
            </div>
          </div>
        </div>

        {/* Center — main tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', fontSize: 56, color: '#e8e8e8', fontWeight: 400, lineHeight: 1.2 }}>
            <span>{"hi, i'm shreyas,"}</span>
          </div>
          <div style={{ display: 'flex', fontSize: 56, color: '#555', fontWeight: 400 }}>
            <span>a builder.</span>
          </div>
        </div>

        {/* Bottom — domain + tags */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {['TypeScript', 'Solidity', 'EVM', 'DevRel'].map((tag) => (
              <div
                key={tag}
                style={{
                  border: '1px solid #1e1e1e',
                  color: '#444',
                  fontSize: 14,
                  padding: '6px 14px',
                  display: 'flex',
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <span style={{ color: '#333', fontSize: 16 }}>shreyaspadmakiran.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
