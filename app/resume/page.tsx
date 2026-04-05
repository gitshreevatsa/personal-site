import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Resume — Shreyas Padmakiran',
};

const EXPERIENCE = [
  {
    title: 'Solutions Engineer & Developer Relations',
    company: 'Sei Development Foundation',
    period: 'Jun 2025 – Present',
    bullets: [
      'Primary technical POC for 10+ ecosystem teams — owned integrations end-to-end from architecture design through smart contract audits, debugging, and go-live',
      'Led technical due diligence for multiple mainnet projects including time-sensitive TGE launches and cross-chain bridging support (LayerZero OFT, Wormhole NTT)',
      'Built open-source reference implementation library with production-tested EVM integration patterns — adopted by ecosystem teams as the standard onboarding resource',
      'Curated awesome-sei ecosystem directory, contributing to 600% increase in developer engagement (Electric Capital)',
      'Built internal automation (Monday.com → GitHub PR pipeline, TypeScript, BullMQ, Redis) to streamline ecosystem operations',
      'Revamped developer documentation using 30:3:30 framework; conducted smart contract security reviews and architecture consultations',
    ],
  },
  {
    title: 'Developer Relations Engineer',
    company: '=nil; Foundation',
    period: 'Apr 2024 – Jun 2025',
    bullets: [
      'Managed end-to-end developer onboarding for devnet/testnet cohorts; ran 1-on-1 technical calls, scoped integration requirements',
      'Worked directly with external teams to complete integrations with =nil;\'s zkSharding architecture — owned technical relationship through deployment',
      'Contributed to SDKs and client libraries; built demo apps; tested integration flows for edge cases and performance',
      'Led outreach campaigns (Twitter Spaces, community events, workshops) driving platform awareness and developer pipeline',
    ],
  },
  {
    title: 'Lead Backend Engineer',
    company: 'Chaidex',
    period: 'Sep 2022 – Apr 2024',
    bullets: [
      'Architected entire microservices backend for a decentralized exchange — fault-tolerant systems across REST APIs, WebSocket feeds, message queues, and low-latency order routing',
      'Developed core exchange smart contracts: liquidity pool mechanics, swap logic, and transaction batching — from testnet prototype to production-ready infrastructure',
      'Implemented oracle price feeds, event-based indexers, and real-time data pipelines; built hedging strategy execution layer with latency-optimized order matching',
      'Scaled the full backend stack: API gateway, WebSocket event distribution, database indexing, and monitoring/alerting for production reliability',
    ],
  },
];

const SKILLS = {
  Languages: 'TypeScript, JavaScript, Solidity, Python, Rust, Go',
  Blockchain:
    'EVM Smart Contracts, Cross-Chain Messaging (Hyperlane, LayerZero, Wormhole), Rollup Architectures (Optimism, Arbitrum Orbit), Wallet Infrastructure (Privy, Turnkey), Account Abstraction (ERC-4337, EIP-7702), DeFi Protocols, Oracles',
  Tooling: 'Hardhat, Foundry, Ethers.js, Wagmi, GitHub, Docker, GCP, AWS, BullMQ/Redis',
  Solutions:
    'Integration Architecture, Technical Due Diligence, Smart Contract Auditing, Developer Documentation, SDK/API Improvement, B2B Partner Onboarding',
};

export default function ResumePage() {
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
      {/* Nav */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(10,10,10,0.95)',
          borderBottom: '1px solid #161616',
          backdropFilter: 'blur(4px)',
          padding: '12px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <Link href="/" style={{ color: '#555', fontSize: 12 }}>
          ← back
        </Link>
        <span style={{ color: '#333', fontSize: 12 }}>resume.pdf</span>
        <a
          href="/resume.pdf"
          download
          style={{ color: '#666', fontSize: 12 }}
        >
          download pdf ↓
        </a>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 32px 100px' }}>
        {/* Header */}
        <div style={{ marginBottom: 52, borderBottom: '1px solid #161616', paddingBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 400, color: '#e8e8e8', marginBottom: 8 }}>
            Shreyas Padmakiran
          </h1>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, color: '#555' }}>
            <span>Bangalore, India</span>
            <span>·</span>
            <a href="mailto:shreyaspadmakiran@gmail.com" style={{ color: '#555' }}>
              shreyaspadmakiran@gmail.com
            </a>
            <span>·</span>
            <a href="https://github.com/gitshreevatsa" target="_blank" rel="noopener noreferrer" style={{ color: '#555' }}>
              github/gitshreevatsa
            </a>
            <span>·</span>
            <a href="https://linkedin.com/in/shreyas-padmakiran" target="_blank" rel="noopener noreferrer" style={{ color: '#555' }}>
              linkedin
            </a>
          </div>
        </div>

        {/* Summary */}
        <section style={{ marginBottom: 48 }}>
          <p style={{ color: '#333', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            summary
          </p>
          <p style={{ color: '#777', fontSize: 13, lineHeight: 1.9 }}>
            Solutions Engineer with 3+ years in infrastructure. Combines hands-on backend engineering —
            microservices architecture, REST/WebSocket APIs, message queues, low-latency systems — with
            partner-facing technical ownership across integration design, due diligence, and production
            deployment. Deep domain expertise in EVM infrastructure, cross-chain protocols, wallet systems,
            and DeFi tooling.
          </p>
        </section>

        {/* Skills */}
        <section style={{ marginBottom: 48 }}>
          <p style={{ color: '#333', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            skills
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(SKILLS).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 0 }}>
                <span style={{ color: '#444', fontSize: 12, minWidth: 110, flexShrink: 0 }}>
                  {k}
                </span>
                <span style={{ color: '#666', fontSize: 12, lineHeight: 1.7 }}>{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section style={{ marginBottom: 48 }}>
          <p style={{ color: '#333', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 28 }}>
            experience
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {EXPERIENCE.map((job) => (
              <div key={job.company}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: '#ddd', fontSize: 13 }}>{job.title}</span>
                  <span style={{ color: '#444', fontSize: 12 }}>{job.period}</span>
                </div>
                <p style={{ color: '#555', fontSize: 12, marginBottom: 14 }}>{job.company}</p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {job.bullets.map((b, i) => (
                    <li
                      key={i}
                      style={{
                        color: '#666',
                        fontSize: 12,
                        lineHeight: 1.8,
                        paddingLeft: 14,
                        position: 'relative',
                      }}
                    >
                      <span style={{ position: 'absolute', left: 0, color: '#333' }}>—</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <p style={{ color: '#333', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            education
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <p style={{ color: '#ddd', fontSize: 13, marginBottom: 4 }}>
                BE in Electronics and Telecommunication Engineering
              </p>
              <p style={{ color: '#555', fontSize: 12 }}>Dayananda Sagar College of Engineering</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#444', fontSize: 12, marginBottom: 4 }}>May 2024</p>
              <p style={{ color: '#444', fontSize: 12 }}>SGPA 9.03 · 6th Rank in University</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
