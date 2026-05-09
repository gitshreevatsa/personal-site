import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Resume — Shreyas Padmakiran',
};

const EXPERIENCE = [
  {
    title: 'Solutions Engineer & Developer Relations',
    company: 'Sei Development Foundation',
    period: 'Jun 2025 – Apr 2026',
    bullets: [
      'Owned the technical win across 10+ enterprise and protocol sales cycles — led consultative discovery, designed custom solution architectures, and drove each engagement from qualification through production deployment',
      'Planned and executed guided proof-of-concepts with prospective partners, defining technical success criteria mapped directly to business objectives',
      'Led technical security reviews for production deployments, articulating security posture, audit history, and risk management practices to both technical and non-technical stakeholders including CTOs',
      'Built a reference implementation library adopted as the standard onboarding resource across the ecosystem, measurably reducing time-to-integration and repeat support volume',
      'Rebuilt public technical documentation from scratch; collected and organised feature requests as a structured feedback loop to the product team',
      'Built internal automation tooling (Monday.com → GitHub PR pipeline, TypeScript, BullMQ, Redis) to streamline partner tracking and GTM operations',
      'Drove 600% developer engagement growth (Electric Capital) through ecosystem enablement, partner onboarding programs, and community initiatives',
      'Acted as the bridge between external partners and internal engineering/product — triaged blockers, surfaced feature requests with reproduction steps, and followed through to resolution',
    ],
  },
  {
    title: 'Developer Relations Engineer',
    company: '=nil; Foundation',
    period: 'Apr 2024 – Jun 2025',
    bullets: [
      'Owned end-to-end technical relationships for enterprise teams integrating with a complex distributed protocol — covered initial scoping and architecture design through production deployment and post-launch support',
      'Conducted technical discovery and qualification calls; responded to technical questionnaires and delivered custom integration guidance for each partner use case',
      'Contributed to SDKs and client libraries; built demo applications and integration templates adopted across the developer ecosystem',
      'Organised and participated in developer events, Twitter Spaces, and community workshops to drive platform awareness and developer pipeline',
      'Collected and organised feature requests and integration pain points as structured product input, collaborating with product to prioritise improvements',
    ],
  },
  {
    title: 'Lead Backend Engineer',
    company: 'Chaidex',
    period: 'Sep 2022 – Apr 2024',
    bullets: [
      'Designed and built the entire production backend from scratch — microservices, REST APIs, WebSocket feeds, event-driven data pipelines, and a low-latency order matching engine',
      'Took the system from prototype to live production independently. At peak handled $50k+ in active liquidity with institutional market makers and no cascading failures under real load',
      'Built event-based indexers, real-time data pipelines, and monitoring/alerting infrastructure; owned all architecture, scaling, and incident response decisions',
    ],
  },
  {
    title: 'Contractor, Lead Product Engineer',
    company: 'QuillAI Network',
    period: '2022',
    bullets: [
      'Built QuillCheck from scratch — the flagship product of QuillAI Network: a DeFi token risk analysis platform with honeypot detection, liquidity assessment, ownership analysis, and holder risk scoring across 10+ EVM chains',
      'Sole engineer from zero to 10,000 users; owned architecture, API design, documentation, and deployment end-to-end',
      'Designed the public REST API surface consumed by third-party integrators and institutional users',
    ],
  },
];

const SKILLS = {
  Languages: 'TypeScript, JavaScript, Python, Solidity',
  'Backend & Systems':
    'Microservices, REST APIs, WebSocket, Event-Driven Pipelines, Message Queues, BullMQ/Redis, Low-Latency Architecture, Real-Time Data',
  Infrastructure: 'Docker, AWS, GCP, Node.js, GitHub, Monitoring & Alerting',
  'Customer-Facing Engineering':
    'Pre-Sales Technical Strategy, Solution Architecture Design, PoC Execution, Technical Due Diligence, Security Reviews, RFP/RFI Response, Customer Success, Technical Support & Triage, Integration Runbooks, SDK/API Development, Developer Documentation, Enterprise Onboarding, Demo Engineering',
};

const PROJECTS = [
  {
    name: 'QuillCheck',
    blurb:
      'DeFi token risk analysis platform covering honeypot detection, liquidity assessment, and holder analysis across 10+ chains. 10,000 users.',
    href: 'https://docs.quillcheck.quillai.network',
    linkLabel: 'docs ↗',
  },
  {
    name: 'Pacifica Nexus',
    blurb:
      'Pro trader terminal for a Solana perpetual DEX — arbitrage scanner, liquidation maps, bracket order management, and real-time trade logs.',
    href: 'https://pacifica-nexus.vercel.app',
    linkLabel: 'link ↗',
  },
];

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
            Solutions Engineer and technical customer-facing engineer with 3+ years owning the full
            lifecycle of enterprise partner relationships — pre-sales discovery, solution architecture,
            proof-of-concept execution, production deployment, ongoing technical support, and customer
            success. Comfortable as the technical face of a product in front of CTOs and integration
            teams, and equally comfortable in the weeds debugging a production failure. Strong written
            communicator who builds the documentation, runbooks, and escalation frameworks that make
            complex products easy to adopt and support at scale.
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
                <span style={{ color: '#444', fontSize: 12, minWidth: 200, flexShrink: 0 }}>
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
              <div key={`${job.company}-${job.period}`}>
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

        {/* Shipped Projects */}
        <section style={{ marginBottom: 48 }}>
          <p style={{ color: '#333', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            shipped projects
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {PROJECTS.map((p) => (
              <div key={p.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: '#ddd', fontSize: 13 }}>{p.name}</span>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#555', fontSize: 12 }}
                  >
                    {p.linkLabel}
                  </a>
                </div>
                <p style={{ color: '#666', fontSize: 12, lineHeight: 1.8 }}>{p.blurb}</p>
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
