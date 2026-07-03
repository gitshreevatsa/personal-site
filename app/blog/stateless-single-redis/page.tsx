import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "A stateless MCP server on a single Redis",
  description:
    "Why roomd is a fully stateless server backed by a single Redis instance, over the reflex stack of app server plus Postgres plus cache plus session store: statelessness, TTL-as-cleanup, Upstash-over-HTTP, and the tradeoffs that come with it.",
};

export default function OneDatabaseNoMemoryPost() {
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
        <span>stateless-single-redis</span>
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
          the Room Protocol · architecture
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
          A stateless MCP server on a single Redis
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
          roomd, the reference server for the Room Protocol, remembers nothing
          between requests, backed by a single Redis instance and nothing else. That
          sounds austere. It&apos;s the most load-bearing decision in the whole system.
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
          <span>11 min read</span>
          <span>·</span>
          <span>shreyaspadmakiran.com</span>
        </div>

        <P>
          When you sit down to build a service that many people will depend on, the
          reflex stack shows up almost on its own: an app server for logic, Postgres
          for durable data, Redis as a cache in front of it, maybe a session store,
          maybe a separate auth database. It&apos;s the default because it&apos;s
          safe and everyone knows it. It&apos;s also five stateful things to
          provision, secure, back up, migrate, and pay for.
        </P>

        <P>
          roomd runs on two boxes: a stateless server and one Redis. There is
          no Postgres, no cache tier, no session store, no separate auth DB. This
          post is the argument for that, made honestly, including where it bites.
        </P>

        {/* DIAGRAM 1 — reflex stack vs the bet */}
        <figure style={figStyle}>
          <svg width="100%" viewBox="0 0 640 250" role="img" xmlns="http://www.w3.org/2000/svg">
            <title>The reflex stack versus the two-box bet</title>
            <desc>
              Left: five stacked boxes — app server, Postgres, Redis cache, session
              store, auth DB. Right: two boxes — stateless server and one Redis.
            </desc>
            <text x="160" y="18" textAnchor="middle" style={svgLabel}>the reflex stack</text>
            {[
              { y: 30, label: "app server", c: "#333", f: "#111110" },
              { y: 70, label: "Postgres", c: "#333", f: "#111110" },
              { y: 110, label: "Redis cache", c: "#333", f: "#111110" },
              { y: 150, label: "session store", c: "#333", f: "#111110" },
              { y: 190, label: "auth DB", c: "#333", f: "#111110" },
            ].map((b, i) => (
              <g key={i}>
                <rect x="60" y={b.y} width="200" height="30" rx="6" fill={b.f} stroke={b.c} strokeWidth="0.5" />
                <text x="160" y={b.y + 15} textAnchor="middle" dominantBaseline="central" style={svgFaint}>
                  {b.label}
                </text>
              </g>
            ))}
            <text x="160" y="238" textAnchor="middle" style={{ ...svgFaint, fill: "#E24B4A" }}>
              5 stateful systems to operate
            </text>

            <line x1="320" y1="26" x2="320" y2="220" stroke="#1a1a18" strokeWidth="0.5" />

            <text x="490" y="18" textAnchor="middle" style={svgLabel}>the bet</text>
            <rect x="392" y="70" width="196" height="34" rx="7" fill="#111110" stroke="#333" strokeWidth="0.5" />
            <text x="490" y="87" textAnchor="middle" dominantBaseline="central" style={{ ...svgNode, fill: "#aaa" }}>
              stateless server
            </text>
            <line x1="490" y1="104" x2="490" y2="132" stroke="#333" strokeWidth="0.5" strokeDasharray="3 2" />
            <rect x="392" y="132" width="196" height="34" rx="7" fill="#1e1c36" stroke="#534AB7" strokeWidth="0.5" />
            <text x="490" y="149" textAnchor="middle" dominantBaseline="central" style={{ ...svgNode, fill: "#CECBF6" }}>
              one Redis
            </text>
            <text x="490" y="200" textAnchor="middle" style={{ ...svgFaint, fill: "#9FE1CB" }}>
              1 stateful system · restartable
            </text>
          </svg>
          <figcaption style={figCap}>
            Every box you remove is a thing that can&apos;t break, can&apos;t need a
            migration, and can&apos;t show up on the bill. The question is whether
            you can afford to remove them. Here, you can.
          </figcaption>
        </figure>

        {/* ── ACT I ─────────────────────────────────────── */}
        <ActLabel>Act I — A server that remembers nothing</ActLabel>

        <H2>Stateless, in the strong sense</H2>

        <P>
          The server holds no state between requests. Not &ldquo;mostly&rdquo; — at
          all. Each hit on the <Code>/mcp</Code> endpoint spins up a fresh MCP server
          and transport, handles that one request, and throws both away. Every
          durable effect lands in Redis:
        </P>

        <CodeBlock>{`app.all("/mcp", requireAuth, async (c) => {
  const keyCtx = c.get("keyCtx");
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,     // stateless mode — no session to pin
  });
  const server = createMcpServer(keyCtx);  // fresh per request
  await server.connect(transport);
  return transport.handleRequest(c.req.raw);
});`}</CodeBlock>

        <P>
          The alternative most MCP servers reach for is a long-lived connection: a
          session established over SSE, kept alive, with per-connection state living
          in the server&apos;s memory. That works, but it drags a tail of problems
          behind it. Sessions have to be pinned to a specific instance, so you need
          sticky routing. You can&apos;t restart or deploy without dropping live
          connections. Scaling out means sharing or migrating session state. Every
          one of those is a distributed-systems headache you signed up for the moment
          the server started remembering things.
        </P>

        <P>
          Statelessness deletes all of it. Any instance can serve any request,
          because no instance knows anything the others don&apos;t. You can kill a
          server mid-flight and the next request lands somewhere else and just works.
          Horizontal scaling is &ldquo;run more copies.&rdquo; A deploy is &ldquo;replace
          the copies.&rdquo; The correctness argument is trivial precisely because
          there&apos;s no shared in-memory state to reason about.
        </P>

        <Bridge>
          Statelessness only works if something else holds the state reliably and
          cheaply. That job goes entirely to one Redis — which is a stranger choice
          than it looks.
        </Bridge>

        {/* ── ACT II ────────────────────────────────────── */}
        <ActLabel>Act II — Why one Redis is enough</ActLabel>

        <H2>Redis as the only database, not the cache</H2>

        <P>
          Redis usually plays the supporting role: a fast cache in front of the
          &ldquo;real&rdquo; database. Here it <em>is</em> the real database. Rooms,
          plans, context, events, presence, locks, API keys — all of it lives in one
          Redis, and there is no Postgres behind it.
        </P>

        <P>
          The instinct that this is reckless comes from assuming you need what a
          relational database gives you: schemas, joins, transactions across tables,
          ad-hoc queries. Look at what a coordination room actually does and most of
          that need evaporates. The access patterns are simple and known ahead of
          time: fetch this room&apos;s plan, list this room&apos;s context, read the
          last N events, check if this agent is alive. Every one is a direct key
          lookup or a small list read. There are no reports to run, no analytics
          joins, no cross-room queries. When your access patterns are all
          &ldquo;get the thing at this key,&rdquo; a key-value store isn&apos;t a
          compromise — it&apos;s the correct shape.
        </P>

        <P>
          The one thing Redis can&apos;t do — &ldquo;list all keys matching a
          pattern&rdquo; efficiently — is handled by keeping companion index sets by
          hand. A room&apos;s context ids live in a set so listing them is one read,
          not a scan:
        </P>

        <CodeBlock>{`// write: store the entry AND register its id in the room's index set
await redis.set(\`\${roomId}:context:\${id}\`, JSON.stringify(entry));
await redis.sadd(\`\${roomId}:context:index\`, id);

// list: read the index, then fetch each — no keyspace scan
const ids = await redis.smembers(\`\${roomId}:context:index\`);`}</CodeBlock>

        <P>
          That&apos;s the whole trade: you maintain a couple of index sets manually
          in exchange for never running a second database. For a handful of
          collections with known shapes, that&apos;s a bargain.
        </P>

        <H2>TTL does the work a cron job would</H2>

        <P>
          The most underrated part of leaning on Redis is that expiry is a
          first-class feature, and it quietly replaces a whole category of cleanup
          code. Three different subsystems get their correctness from a TTL rather
          than from a background job:
        </P>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "20px 0 28px" }}>
          {[
            { dot: "#1D9E75", title: "Presence (120s)", body: "A heartbeat key expires on its own. Stop beating and you go offline. No disconnect handler, no reaper job." },
            { dot: "#BA7517", title: "Locks (30s)", body: "A lock key auto-releases if its holder dies mid-work, so the plan can never deadlock permanently. Safety without supervision." },
            { dot: "#534AB7", title: "Rate windows (120s)", body: "Each per-minute counter deletes itself two minutes later. The rate limiter needs no sweep to clean old buckets." },
          ].map((item, i) => (
            <div key={i} style={listItemStyle}>
              <div style={{ ...listDot, background: item.dot }} />
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#bbb", marginRight: 8 }}>{item.title} —</span>
                <span style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{item.body}</span>
              </div>
            </div>
          ))}
        </div>

        <P>
          In a Postgres world every one of these would be a scheduled job scanning
          for stale rows — more code, more moving parts, more things to monitor. In
          Redis it&apos;s an argument on a <Code>SET</Code>. The database garbage-collects
          your correctness for you.
        </P>

        <H2>Upstash over HTTP: the piece that makes it click</H2>

        <P>
          One more choice makes statelessness and single-store fit together cleanly:
          the Redis is Upstash, accessed over HTTP rather than a raw TCP connection.
          A normal Redis client opens and pools long-lived TCP connections, which is
          another bit of per-instance state and a poor fit for serverless or
          edge runtimes that spin up and tear down constantly. Upstash speaks HTTP,
          so each operation is a stateless request. No pool to manage, no connection
          lifecycle, no warm-up. A stateless server talking to a store over
          stateless requests is a coherent whole, top to bottom.
        </P>

        <P>
          There is a cost story underneath this, and it is a good one. The whole
          stack runs for a rounding error a month and one person can operate it: no
          database to tune, no failover to rehearse, no migration to fear on deploy.
          For anything bootstrapped, the number of stateful systems you run is a
          direct tax on your time and your runway, and two is a very different life
          than five.
        </P>

        {/* ── ACT III ───────────────────────────────────── */}
        <ActLabel>Act III — Where the bet bites</ActLabel>

        <H2>What you give up</H2>

        <P>
          I&apos;d be selling you something if I pretended this were free. The honest
          costs:
        </P>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "20px 0 28px" }}>
          {[
            { dot: "#E24B4A", title: "One store is one blast radius", body: "Everything depends on that single Redis. Upstash handles durability and replication, but there's no second system to fall back to. You're trusting one thing to be up." },
            { dot: "#BA7517", title: "No rich queries", body: "Anything beyond key lookups — analytics, search across rooms, reporting — has to be built by hand on index sets, or wait for a purpose-built tool. Redis won't join tables for you." },
            { dot: "#534AB7", title: "Memory-bound", body: "Redis keeps data in memory, so unbounded growth (event logs with no retention) will cost you eventually. Retention policies are a known to-do, not a solved thing." },
          ].map((item, i) => (
            <div key={i} style={listItemStyle}>
              <div style={{ ...listDot, background: item.dot }} />
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#bbb", marginRight: 8 }}>{item.title} —</span>
                <span style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{item.body}</span>
              </div>
            </div>
          ))}
        </div>

        <P>
          None of these are hit at the current scale, and each has a clear escape
          hatch when it is — read replicas, a purpose-built search index, TTLs on
          event logs. The point of the bet isn&apos;t that one Redis scales forever.
          It&apos;s that starting with the smallest stack that&apos;s actually correct
          buys you speed and cheapness now, and the migrations you might someday need
          are ones you&apos;ll happily do <em>because</em> you have users.
        </P>

        <P>
          The reflex stack is what you build when you&apos;re guessing at
          requirements and want to be ready for anything. A stateless server on one
          Redis is what you build when you&apos;ve looked hard at what the thing
          actually does and refused to carry a single component you can&apos;t
          justify. The second is more work to justify and far less work to live with.
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

        <SeriesFooter here="stateless-single-redis" />
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

const listItemStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "10px 14px",
  borderRadius: 8,
  background: "#0d0d0d",
  border: "1px solid #141414",
} as const;

const listDot = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  flexShrink: 0,
  marginTop: 5,
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
  { slug: "room-protocol", label: "Coordinating agents through shared state", note: "the idea" },
  { slug: "concurrency-control", label: "Concurrency control for a shared plan", note: "locks and cursors" },
  { slug: "stateless-single-redis", label: "A stateless server on a single Redis", note: "architecture" },
  { slug: "typed-context", label: "Typed context over prose and vector search", note: "context model" },
  { slug: "mcp-as-transport", label: "MCP as transport", note: "protocol layer" },
];

function SeriesFooter({ here }: { here: string }) {
  return (
    <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #161616" }}>
      <p style={{ color: "#444", fontSize: 12, marginBottom: 12 }}>more in this series</p>
      {SERIES.map((s, i) => {
        const isHere = s.slug === here;
        const n = String(i + 1).padStart(2, "0");
        return (
          <p key={s.slug} style={{ fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: "#333", marginRight: 10 }}>{n}</span>
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
