import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'who am i? — shreyas padmakiran',
  description: 'the honest answer to a question i get asked a lot.',
};

export default function WhoPage() {
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
        <span>who am i?</span>
      </div>

      {/* Article */}
      <article
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '72px 32px 120px',
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(32px, 5vw, 52px)',
            color: '#e8e8e8',
            marginBottom: 28,
            lineHeight: 1.2,
          }}
        >
          who am i?
        </h1>

        {/* Metadata */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 11,
            color: '#444',
            marginBottom: 64,
            letterSpacing: '0.04em',
          }}
        >
          <span>april 2026</span>
          <span>·</span>
          <span>3 min read</span>
          <span>·</span>
          <span>shreyaspadmakiran.com</span>
        </div>

        {/* Body */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          <P>hey, you found this.</P>

          <P>
            i don&apos;t write often. this isn&apos;t a blog and it&apos;s not a portfolio piece —
            it&apos;s more like an honest answer to a question i keep getting asked.
            who are you, actually. so here&apos;s the attempt.
          </P>

          <Section>how i think</Section>

          <P>
            i think in systems, not in features. whenever i look at something new — a protocol,
            a codebase, a team — my first instinct is to map the failure modes before i understand
            the happy path. that reflex came from building backend infrastructure where something
            breaking at 3am is entirely your problem.
          </P>

          <P>
            building and thinking are the same motion for me. i don&apos;t finish the spec before
            i start writing code. the implementation always knows something the document doesn&apos;t.
            i&apos;d rather have something running and wrong than something theoretically perfect
            and not yet real. i&apos;m a purist about the outcome, not the path.
          </P>

          <P>
            i obsess over the details that matter. the trick is figuring out which ones those are
            and ignoring the rest. that distinction takes longer to learn than any technical skill.
          </P>

          <Section>how i got here</Section>

          <P>
            i didn&apos;t plan any of this. chaidex was my first real bet — build the entire
            backend for a decentralized exchange from scratch, on a chain with barely any tooling.
            i said yes before i fully understood what that meant. that&apos;s been the pattern.
          </P>

          <P>
            every role i&apos;ve had started with: this is too complex, i don&apos;t know all
            of it yet, i&apos;ll figure it out. turned out that&apos;s actually a strategy.
            developer relations made sense because i was already the person who had read every doc,
            broken every integration, and could still explain it calmly to someone who hadn&apos;t.
            it wasn&apos;t a career pivot. it was just what i was already doing.
          </P>

          <P>
            no plan. no networking strategy. just following what was hard and seeing where it went.
            one thing opened a door. the door led to another one. at some point you stop calling it
            luck.
          </P>

          <Section>what feeds it</Section>

          <P>
            curiosity about why people get stuck. not the technical kind of stuck — the kind where
            the abstraction is wrong and you don&apos;t have the words for it yet. the gap between
            what the docs say and what you actually need to know is where most of my work lives.
            closing that gap is more interesting to me than the code itself.
          </P>

          <P>
            clear writing. i&apos;ve gotten more leverage out of a well-written README than most
            features i&apos;ve shipped. a good doc reduces the number of people who have to ask
            the same question. that compounds. i take it seriously.
          </P>

          <P>
            the builders i&apos;ve worked with. every protocol, every integration, every late-night
            debug session was someone trying to make something real. that part doesn&apos;t get old.
            i take in a lot outside of code too — philosophy, history, systems thinking — and most
            of what i know about building good software came from understanding people, not compilers.
          </P>

          <Section>...</Section>

          <P>work in progress. intentionally.</P>

          {/* Signature */}
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 28,
              color: '#555',
              marginTop: 48,
              letterSpacing: '0.02em',
            }}
          >
            — shreyas
          </p>
        </div>
      </article>
    </div>
  );
}

// ─── Local helpers ────────────────────────────────────────────────────────────

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        color: '#777',
        fontSize: 14,
        lineHeight: 1.95,
        marginBottom: 22,
      }}
    >
      {children}
    </p>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: '#444',
        letterSpacing: '0.08em',
        textTransform: 'lowercase',
        marginTop: 52,
        marginBottom: 20,
        borderBottom: '1px solid #161616',
        paddingBottom: 12,
      }}
    >
      {children}
    </h2>
  );
}
