import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'blog — shreyas padmakiran',
  description: 'notes on building, mostly technical, occasionally not.',
};

const POSTS = [
  {
    slug: 'oss-burnout-radar',
    title: 'OSS Burnout Radar: a vitals monitor for the npm packages you depend on',
    blurb:
      'A tool that watches the maintainers, not the popularity contest. Ten signals, one score, citations behind every signal.',
    date: 'May 2026',
    readTime: '12 min read',
  },
  {
    slug: 'pacifica-nexus',
    title: 'Pacifica Nexus: an actionable analytics terminal for on-chain perps',
    blurb:
      'A trading workstation for the Pacifica perp DEX on Solana. Funding-rate arb, auto de-risk, encrypted agent-key vault, and a two-layer kill switch.',
    date: 'May 2026',
    readTime: '14 min read',
  },
  {
    slug: 'wallet-stack',
    title: 'The EVM wallet stack, explained for builders',
    blurb:
      'A field guide from raw window.ethereum calls to production wagmi v2.',
    date: 'May 2026',
    readTime: '20 min read',
  },
];

export default function BlogIndex() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#e8e8e8',
        fontFamily: 'var(--font-mono), ui-monospace, monospace',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: '20px 32px',
          borderBottom: '1px solid #141414',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          color: '#444',
        }}
      >
        <Link href="/" style={{ color: '#555' }}>
          ← back
        </Link>
        <span>/</span>
        <span>blog</span>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '72px 32px 120px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(32px, 5vw, 52px)',
            color: '#e8e8e8',
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          blog
        </h1>
        <p style={{ color: '#555', fontSize: 13, marginBottom: 56 }}>
          notes on building. mostly technical. occasionally not.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {POSTS.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                display: 'block',
                padding: '24px 0',
                borderTop: i === 0 ? '1px solid #161616' : 'none',
                borderBottom: '1px solid #161616',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <p style={{ color: '#e0e0e0', fontSize: 15, marginBottom: 8 }}>
                {post.title}
              </p>
              <p style={{ color: '#666', fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
                {post.blurb}
              </p>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#444', letterSpacing: '0.04em' }}>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
