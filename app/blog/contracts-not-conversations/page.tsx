import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title:
    "Contracts, not conversations — typed context in the Room Protocol",
  description:
    "Why agents share structured, typed context entries with per-type payload schemas instead of prose or a vector store: shape at write time beats parsing at read time, and exact retrieval beats fuzzy retrieval when correctness is non-negotiable.",
};

export default function ContractsNotConversationsPost() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e8e8e8",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          padding: "20px 32px",
          borderBottom: "1px solid #141414",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12,
          color: "#444",
        }}
      >
        <Link href="/" style={{ color: "#555" }}>← back</Link>
        <span>/</span>
        <Link href="/blog" style={{ color: "#555" }}>blog</Link>
        <span>/</span>
        <span>contracts-not-conversations</span>
      </div>

      <article style={{ maxWidth: 720, margin: "0 auto", padding: "72px 32px 120px" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#555",
            marginBottom: 16,
          }}
        >
          the room protocol · part iv · typed context
        </p>

        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(28px, 4.2vw, 44px)",
            color: "#e8e8e8",
            marginBottom: 18,
            lineHeight: 1.2,
          }}
        >
          Contracts, not conversations
        </h1>

        <p
          style={{
            fontSize: 15,
            lineHeight: 1.75,
            color: "#666",
            fontStyle: "italic",
            marginBottom: 28,
            fontFamily: "var(--font-serif)",
          }}
        >
          The difference between agents that coordinate and agents that talk past
          each other comes down to one choice: is the shared knowledge structured
          when it&apos;s written, or reconstructed when it&apos;s read?
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 11,
            color: "#444",
            marginBottom: 56,
            letterSpacing: "0.04em",
          }}
        >
          <span>10 min read</span>
          <span>·</span>
          <span>shreyaspadmakiran.com</span>
        </div>

        <P>
          The whole premise of the Room Protocol is that agents coordinate through
          shared state instead of messages. But &ldquo;shared state&rdquo; is doing a
          lot of hidden work in that sentence. If the state is just a pile of text
          notes agents leave for each other, you haven&apos;t escaped messaging —
          you&apos;ve just moved the chat into a database. The escape only happens if
          the knowledge is <em>structured</em>. That&apos;s what the context store
          is, and this post is about why it&apos;s typed and what that buys over the
          alternatives.
        </P>

        {/* ── ACT I ─────────────────────────────────────── */}
        <ActLabel>Act I — Prose is a message in disguise</ActLabel>

        <H2>The handoff that has to be exact</H2>

        <P>
          Here&apos;s the canonical moment. A backend agent designs an API. A
          frontend agent has to call it. The backend needs to communicate the
          contract: the endpoints, methods, request and response shapes, whether auth
          is required. If it leaves a note like{" "}
          <em>&ldquo;built the auth API, login takes email and password and gives
          back a token&rdquo;</em>, the frontend agent now has to parse English to
          recover a precise interface. Does the endpoint live at{" "}
          <Code>/login</Code> or <Code>/auth/login</Code>? Is the field{" "}
          <Code>token</Code> or <Code>access_token</Code>? What&apos;s the shape of
          the error? The prose doesn&apos;t say, so the consumer guesses, and a guess
          in an API contract is a bug with a delay on it.
        </P>

        <P>
          This is the same lossy, order-dependent, interpretation-heavy channel that
          made agent-to-agent chat a bad idea in the first place. Free-text context
          is a message wearing a database&apos;s clothes.
        </P>

        <H2>Typed at the point of writing</H2>

        <P>
          The fix is that every context entry has a <Code>type</Code> from a closed
          set, and the producer fills a payload with a known shape for that type. The
          five types cover what agents actually need to hand each other:
        </P>

        <CodeBlock>{`type ContextType =
  | "api_contract"    // an interface one agent builds and another consumes
  | "arch_decision"   // a decision + rationale + alternatives + consequences
  | "task"            // acceptance criteria and technical notes for a task
  | "change_request"  // "I need X from you", with urgency and blocking task
  | "note";           // free-form, the deliberate escape hatch`}</CodeBlock>

        <P>
          An <Code>api_contract</Code> isn&apos;t a paragraph; it&apos;s a structure
          the consumer can rely on without reading prose:
        </P>

        <CodeBlock>{`interface ApiContractPayload {
  service: string;
  version: string;
  endpoints: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string;
    request?: Record<string, unknown>;
    response: Record<string, unknown>;
    auth_required: boolean;
    description: string;
  }[];
  base_url?: string;
}`}</CodeBlock>

        <P>
          Now the frontend agent doesn&apos;t interpret anything. It reads a list of
          endpoints, each with a method and a path and a response shape. The
          knowledge was made precise at the moment it was written, by the agent that
          actually had the information, instead of being reconstructed later by the
          agent that didn&apos;t. That inversion — structure at write time, not parse
          time — is the entire idea.
        </P>

        {/* DIAGRAM — prose vs typed */}
        <figure style={figStyle}>
          <svg width="100%" viewBox="0 0 640 200" role="img" xmlns="http://www.w3.org/2000/svg">
            <title>Free-text context versus typed context</title>
            <desc>
              Left: a prose note flows into a question mark at the consumer. Right: a
              typed api_contract flows into a clean checkmark at the consumer.
            </desc>
            <defs>
              <marker id="c1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>

            <text x="160" y="18" textAnchor="middle" style={svgLabel}>free-text note</text>
            <rect x="30" y="34" width="200" height="60" rx="7" fill="#1a0f0f" stroke="#E24B4A" strokeWidth="0.5" />
            <text x="130" y="58" textAnchor="middle" style={svgFaint}>&ldquo;built the auth API,</text>
            <text x="130" y="74" textAnchor="middle" style={svgFaint}>login takes email + pw,</text>
            <text x="130" y="90" textAnchor="middle" style={svgFaint}>returns a token&rdquo;</text>
            <line x1="130" y1="94" x2="130" y2="130" stroke="#444" strokeWidth="0.5" markerEnd="url(#c1)" />
            <circle cx="130" cy="152" r="18" fill="#1a0f0f" stroke="#E24B4A" strokeWidth="0.5" />
            <text x="130" y="152" textAnchor="middle" dominantBaseline="central" style={{ ...svgNode, fill: "#E24B4A" }}>?</text>
            <text x="130" y="188" textAnchor="middle" style={svgFaint}>consumer must guess</text>

            <line x1="320" y1="26" x2="320" y2="190" stroke="#1a1a18" strokeWidth="0.5" />

            <text x="490" y="18" textAnchor="middle" style={svgLabel}>typed api_contract</text>
            <rect x="392" y="34" width="200" height="60" rx="7" fill="#0d1a12" stroke="#1D9E75" strokeWidth="0.5" />
            <text x="492" y="56" textAnchor="middle" style={svgFaint}>POST /api/v1/auth/login</text>
            <text x="492" y="72" textAnchor="middle" style={svgFaint}>req {"{email, password}"}</text>
            <text x="492" y="88" textAnchor="middle" style={svgFaint}>res {"{access_token, …}"}</text>
            <line x1="492" y1="94" x2="492" y2="130" stroke="#444" strokeWidth="0.5" markerEnd="url(#c1)" />
            <circle cx="492" cy="152" r="18" fill="#0d1a12" stroke="#1D9E75" strokeWidth="0.5" />
            <text x="492" y="152" textAnchor="middle" dominantBaseline="central" style={{ ...svgNode, fill: "#9FE1CB" }}>✓</text>
            <text x="492" y="188" textAnchor="middle" style={svgFaint}>consumer relies on shape</text>
          </svg>
          <figcaption style={figCap}>
            Same information, two representations. Only one of them lets the consumer
            build against it without a round of clarification.
          </figcaption>
        </figure>

        <Bridge>
          &ldquo;Just use structure&rdquo; sounds obvious until you notice the two
          more fashionable options — throw it in a chat, or throw it in a vector
          store — and why neither is right for this.
        </Bridge>

        {/* ── ACT II ────────────────────────────────────── */}
        <ActLabel>Act II — Why not the fashionable options</ActLabel>

        <H2>Why not just let them chat?</H2>

        <P>
          The chat approach is the one everyone reaches for because agents are good
          at language. But language is exactly the problem. A conversation is
          transient, order-dependent, and has to be interpreted every time it&apos;s
          read. There&apos;s no guarantee two readings produce the same
          understanding, no way to query &ldquo;what&apos;s the current auth
          contract&rdquo; without re-reading a thread, and no shape to rely on. It
          optimizes for the wrong thing: expressiveness, when what a handoff needs is
          precision.
        </P>

        <H2>Why not a vector store?</H2>

        <P>
          The other reflex in 2026 is: it&apos;s knowledge, so embed it and retrieve
          it semantically. This is the more interesting wrong answer. Vector search
          is <em>fuzzy by design</em> — it returns what&apos;s probably relevant,
          ranked by similarity. That&apos;s exactly what you want for &ldquo;find me
          docs about authentication&rdquo; and exactly what you don&apos;t want for
          &ldquo;give me the one current auth contract I must implement byte-for-byte.&rdquo;
          You don&apos;t want the <em>probably-relevant</em> contract. You want{" "}
          <em>the</em> contract, by id, deterministically.
        </P>

        <P>
          Structured retrieval beats semantic retrieval whenever correctness is
          non-negotiable, and an interface an agent is about to code against is the
          definition of non-negotiable. Context here is fetched by type and by id,
          not by cosine similarity:
        </P>

        <CodeBlock>{`list_context({ roomId, type: "api_contract" })   // all contracts, exact
read_context({ roomId, id })                     // this one, deterministic`}</CodeBlock>

        <P>
          Semantic search over context is a genuinely useful <em>later</em> feature
          for discovery when a room has hundreds of entries. But it belongs on top of
          the exact store, not in place of it. The base layer has to be deterministic.
        </P>

        <H2>Why not a full relational schema per type?</H2>

        <P>
          The opposite overreach: give every context type its own table with typed
          columns and constraints. Too rigid, and it drags in the whole
          migration-and-Postgres cost the{" "}
          <Link href="/blog/one-database-no-memory" style={{ color: "#8B85E0" }}>
            architecture
          </Link>{" "}
          deliberately avoids. Agents produce artifacts whose inner shapes evolve; a
          discriminated union with a typed envelope and a JSON payload is the sweet
          spot. The envelope — id, type, author, timestamp, consuming agents,
          version — is fixed and reliable; the payload is structured by convention
          per type. You get the shape guarantees where they matter without a
          migration every time a payload gains a field.
        </P>

        {/* ── ACT III ───────────────────────────────────── */}
        <ActLabel>Act III — What the envelope unlocks</ActLabel>

        <H2>The metadata earns its keep</H2>

        <P>
          Because every entry carries the same envelope, two useful behaviors come
          almost for free. The <Code>consuming_agents</Code> field lets a write
          notify exactly the agents that depend on an artifact, instead of
          broadcasting to the whole room — so writing a contract can auto-post an
          event straight to the frontend agent that was waiting on it. And because
          author and timestamp are always present, the context store doubles as an
          <em> auditable decision record</em>: every architecture decision, with its
          rationale and rejected alternatives, is queryable after the fact.
        </P>

        <p style={{ color: "#777", fontSize: 14, lineHeight: 1.85, marginBottom: 22 }}>
          <span style={{ color: "#666" }}>The business read:</span> that decision
          record is a real asset. A team coordinating multiple projects gets a
          queryable trail of why every interface and decision looks the way it does,
          which is exactly what makes onboarding a new agent (or a new human) fast and
          makes handoffs trustworthy. Reliability of handoffs is the thing you sell;
          the typed store is what makes it structural rather than hopeful.
        </p>

        <H2>What this version doesn&apos;t enforce yet</H2>

        <P>
          The honest edge: the <em>type</em> is validated, but the per-type payload
          shape is currently a documented convention, not a schema the server
          rejects on. A malformed <Code>api_contract</Code> payload would be stored.
          Tightening that into real per-type validation is a clear next step and a
          small one, since the schemas already exist as interfaces. There&apos;s also
          no version history yet — updating a contract writes a new entry rather than
          appending to a tracked lineage — and no semantic layer on top for discovery.
          None of these undercut the core claim; they&apos;re the difference between
          &ldquo;typed by convention&rdquo; and &ldquo;typed by enforcement.&rdquo;
        </P>

        <P>
          But the direction is the whole point. The instinct with LLM agents is to
          lean on their fluency and let everything be text, because they&apos;re so
          good at text. The Room Protocol bets the other way: the more capable the
          agents, the more it matters that the things they hand each other are
          precise. You don&apos;t coordinate a build on vibes and paragraphs. You
          coordinate it on contracts.
        </P>

        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 28,
            color: "#555",
            marginTop: 64,
            letterSpacing: "0.02em",
          }}
        >
          — shreyas
        </p>

        <SeriesFooter here="contracts-not-conversations" />
      </article>
    </div>
  );
}

// ── shared styles ───────────────────────────────────────
const figStyle = {
  border: "1px solid #161616",
  borderRadius: 10,
  padding: "20px 20px 14px",
  margin: "28px 0",
  background: "#0d0d0d",
} as const;

const figCap = {
  fontSize: 12,
  color: "#555",
  textAlign: "center",
  marginTop: 12,
  lineHeight: 1.5,
} as const;

const svgLabel = {
  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  fontSize: 11,
  fontWeight: 500,
  fill: "#888",
} as const;

const svgFaint = {
  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  fontSize: 11,
  fill: "#555",
} as const;

const svgNode = {
  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  fontSize: 12,
  fontWeight: 500,
} as const;

// ── prose components ────────────────────────────────────
function P({ children }: { children: ReactNode }) {
  return <p style={{ color: "#9a9a9a", fontSize: 14, lineHeight: 1.85, marginBottom: 22 }}>{children}</p>;
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: 26,
        color: "#e8e8e8",
        marginTop: 52,
        marginBottom: 18,
        lineHeight: 1.25,
      }}
    >
      {children}
    </h2>
  );
}

function ActLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: 20,
        border: "0.5px solid #1e1e1c",
        color: "#555",
        marginBottom: 18,
      }}
    >
      {children}
    </div>
  );
}

function Bridge({ children }: { children: ReactNode }) {
  return (
    <blockquote
      style={{
        fontSize: 13,
        lineHeight: 1.7,
        color: "#555",
        borderLeft: "2px solid #1e1e1c",
        paddingLeft: 14,
        margin: "22px 0",
      }}
    >
      {children}
    </blockquote>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: 12.5,
        color: "#c98a2a",
        background: "#161410",
        padding: "1px 5px",
        borderRadius: 4,
      }}
    >
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre
      style={{
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: 12.5,
        lineHeight: 1.7,
        color: "#9a9a9a",
        background: "#0d0d0d",
        border: "1px solid #161616",
        borderRadius: 10,
        padding: "18px 20px",
        margin: "24px 0",
        overflowX: "auto",
        whiteSpace: "pre",
      }}
    >
      {children}
    </pre>
  );
}

// ── series footer ───────────────────────────────────────
const SERIES = [
  { slug: "room-protocol", label: "Part I — Two Claudes, one project", note: "the idea and the primitives" },
  { slug: "one-plan-many-agents", label: "Part II — Two agents, one plan, zero lost writes", note: "concurrency" },
  { slug: "one-database-no-memory", label: "Part III — One database, no memory", note: "the architecture bet" },
  { slug: "contracts-not-conversations", label: "Part IV — Contracts, not conversations", note: "typed context" },
  { slug: "built-on-mcp", label: "Part V — Built on MCP", note: "the protocol layer" },
];

function SeriesFooter({ here }: { here: string }) {
  return (
    <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #161616" }}>
      <p style={{ color: "#444", fontSize: 12, marginBottom: 12 }}>the room protocol series</p>
      {SERIES.map((s) => {
        const isHere = s.slug === here;
        return (
          <p key={s.slug} style={{ fontSize: 13, marginBottom: 6 }}>
            {isHere ? (
              <span style={{ color: "#999" }}>{s.label}</span>
            ) : (
              <Link href={`/blog/${s.slug}`} style={{ color: "#8B85E0" }}>
                {s.label}
              </Link>
            )}
            <span style={{ color: "#444" }}> · {isHere ? "you are here" : s.note}</span>
          </p>
        );
      })}
    </div>
  );
}
