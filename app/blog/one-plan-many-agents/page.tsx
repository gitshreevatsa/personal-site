import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title:
    "Two agents, one plan, zero lost writes — concurrency in the Room Protocol",
  description:
    "How collab-mcp keeps a shared plan consistent when several agents write at once: a Redis distributed lock over optimistic concurrency and CRDTs, per-agent cursors for exactly-once events, and TTL presence instead of connection tracking — with the tradeoffs spelled out.",
};

export default function OnePlanManyAgentsPost() {
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
      {/* nav */}
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
        <Link href="/" style={{ color: "#555" }}>
          ← back
        </Link>
        <span>/</span>
        <Link href="/blog" style={{ color: "#555" }}>
          blog
        </Link>
        <span>/</span>
        <span>one-plan-many-agents</span>
      </div>

      <article style={{ maxWidth: 720, margin: "0 auto", padding: "72px 32px 120px" }}>
        {/* kicker */}
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
          the room protocol · part ii · concurrency
        </p>

        {/* title */}
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
          Two agents, one plan, zero lost writes
        </h1>

        {/* lede */}
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
          The whole promise of multi-agent work is agents running in parallel. The
          moment they do, they can corrupt each other&apos;s state. Here&apos;s how
          the Room Protocol stays consistent under concurrency — and why I reached
          for a Redis lock instead of the fancier options.
        </p>

        {/* meta */}
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
          <span>12 min read</span>
          <span>·</span>
          <span>shreyaspadmakiran.com</span>
        </div>

        <P>
          In{" "}
          <Link href="/blog/room-protocol" style={{ color: "#8B85E0" }}>
            Part I
          </Link>{" "}
          I argued agents should coordinate through a shared room instead of
          chatting. There&apos;s a catch buried in that idea. If the value of
          multi-agent development is that agents work <em>at the same time</em>,
          then the shared state they coordinate through is, by definition, under
          concurrent access. And concurrent access to mutable shared state is where
          quiet, awful bugs live.
        </P>

        <P>
          This post is about three of those bugs and the three mechanisms that kill
          them: a distributed lock for the plan, per-agent cursors for events, and
          TTL-based presence. None of the mechanisms is exotic. What&apos;s worth
          your time is <em>why each one</em>, over the alternatives that look more
          sophisticated on paper.
        </P>

        {/* ── ACT I ─────────────────────────────────────── */}
        <ActLabel>Act I — The lost update</ActLabel>

        <H2>One JSON document, two writers</H2>

        <P>
          The plan is a single JSON blob per room: a list of tasks with status,
          owner, and dependencies. Agents change it with read-modify-write. Read
          the plan, flip one task to <Code>in_progress</Code>, write the whole thing
          back. That is the textbook setup for a lost update.
        </P>

        <P>
          Agent A reads the plan. Agent B reads the same plan a millisecond later.
          A marks task 1 done and writes. B marks task 2 done and writes — over A&apos;s
          version, which B never saw. Task 1 silently reverts to pending. No error,
          no crash. An agent just quietly loses work, and the first anyone notices is
          when something gets built twice or not at all.
        </P>

        {/* DIAGRAM 1 — lost update vs serialized */}
        <figure style={figStyle}>
          <svg width="100%" viewBox="0 0 640 230" role="img" xmlns="http://www.w3.org/2000/svg">
            <title>Lost update without a lock versus serialized writes with a lock</title>
            <desc>
              Left: agent A and agent B read the plan concurrently, both write, and
              B's write clobbers A's. Right: the lock serializes them so both
              updates survive.
            </desc>

            {/* left: without lock */}
            <text x="160" y="16" textAnchor="middle" style={svgLabel}>without a lock</text>
            <text x="60" y="44" style={svgFaintL}>A: read</text>
            <text x="60" y="70" style={svgFaintL}>B: read</text>
            <text x="60" y="120" style={{ ...svgFaintL, fill: "#9FE1CB" }}>A: write task1 ✓</text>
            <text x="60" y="150" style={{ ...svgFaintL, fill: "#E24B4A" }}>B: write task2</text>
            <text x="60" y="176" style={{ ...svgFaintL, fill: "#E24B4A" }}>   (clobbers A)</text>
            <rect x="40" y="190" width="240" height="26" rx="5" fill="#1a0f0f" stroke="#E24B4A" strokeWidth="0.5" />
            <text x="160" y="207" textAnchor="middle" style={{ ...svgFaint, fill: "#E24B4A" }}>
              task1 silently reverts · work lost
            </text>

            {/* divider */}
            <line x1="320" y1="26" x2="320" y2="216" stroke="#1a1a18" strokeWidth="0.5" />

            {/* right: with lock */}
            <text x="490" y="16" textAnchor="middle" style={svgLabel}>with the plan lock</text>
            <text x="360" y="44" style={{ ...svgFaintL, fill: "#9FE1CB" }}>A: acquire → RMW → release</text>
            <text x="360" y="74" style={svgFaintL}>B: acquire … (waits)</text>
            <text x="360" y="120" style={{ ...svgFaintL, fill: "#CECBF6" }}>B: acquire → RMW → release</text>
            <rect x="352" y="150" width="248" height="26" rx="5" fill="#0d1a12" stroke="#1D9E75" strokeWidth="0.5" />
            <text x="476" y="167" textAnchor="middle" style={{ ...svgFaint, fill: "#9FE1CB" }}>
              both updates survive · serialized
            </text>
            <text x="476" y="200" textAnchor="middle" style={svgFaint}>
              cost: one extra round trip + a short wait
            </text>
          </svg>
          <figcaption style={figCap}>
            Read-modify-write on shared state without serialization loses writes.
            The fix is to make the read, the modify, and the write one atomic
            critical section.
          </figcaption>
        </figure>

        <H2>The obvious fixes, and why I skipped them</H2>

        <P>
          There are three respectable ways to solve this, and I want to be explicit
          about why none of them fit before showing the one that did.
        </P>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "20px 0 28px" }}>
          {[
            {
              dot: "#E24B4A",
              title: "A real database transaction",
              body: "Postgres with row-level locks or SERIALIZABLE would nail this. But it means running a relational database next to the coordination server — a second stateful system to provision, back up, and pay for. The whole design goal was one store. Adding Postgres just to serialize a rare write is a lot of operational weight for a small problem.",
            },
            {
              dot: "#BA7517",
              title: "Optimistic concurrency (CAS)",
              body: "Store a version number, write only if the version hasn't changed, retry on conflict. Clean, and lock-free. But under real contention it turns into a retry storm, and the retry logic plus the conflict-merge ends up as complex as a lock without being easier to reason about. Optimistic wins when conflicts are rare and cheap to redo; plan writes are neither guaranteed.",
            },
            {
              dot: "#534AB7",
              title: "CRDTs",
              body: "Conflict-free replicated data types merge concurrent edits without coordination — beautiful for collaborative documents. Massive overkill here. The plan isn't a rich-text doc with character-level merges; it's a small task list edited a few times a minute. Paying CRDT complexity and metadata overhead to avoid a lock I take once a minute is the wrong trade.",
            },
          ].map((item, i) => (
            <div key={i} style={listItemStyle}>
              <div style={{ ...listDot, background: item.dot }} />
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#bbb", marginRight: 8 }}>
                  {item.title} —
                </span>
                <span style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{item.body}</span>
              </div>
            </div>
          ))}
        </div>

        <P>
          The deciding facts: plan writes are <em>infrequent</em> (a handful a
          minute, not thousands a second), the contended object is <em>one small
          document</em>, and I already have Redis, which gives me atomic operations
          for free. When writes are rare and you already own an atomic primitive, a
          pessimistic lock is the simplest thing that is obviously correct. Simple
          and obviously correct beats clever every time in infrastructure you have
          to trust.
        </P>

        <Bridge>
          &ldquo;I already have Redis, which gives me atomicity for free&rdquo; is
          the whole argument. The lock is just one Redis command used honestly.
        </Bridge>

        <Hr />

        {/* ── ACT II ────────────────────────────────────── */}
        <ActLabel>Act II — A lock that can&apos;t deadlock</ActLabel>

        <H2>SET NX PX, and why both flags matter</H2>

        <P>
          The lock is a single Redis <Code>SET</Code> with two options:
        </P>

        <CodeBlock>{`await redis.set(lockKey, agentId, { nx: true, px: ttlMs });
// nx  → set only if the key does NOT exist  → exactly one winner
// px  → auto-expire after ttlMs               → a dead holder can't block forever`}</CodeBlock>

        <P>
          <Code>nx</Code> is what makes it a lock: the operation is atomic inside
          Redis, so if ten agents fire it at once, exactly one gets{" "}
          <Code>&quot;OK&quot;</Code> and the rest get nothing. No race, no
          coordination protocol, no consensus round. <Code>px</Code> is what makes
          it a lock I can <em>trust in production</em>: it sets an expiry, so if the
          agent that holds it crashes, disconnects, or just wanders off, the lock
          releases itself. A lock without a TTL is a deadlock waiting for its first
          crash.
        </P>

        <P>
          Around that primitive is a small acquire-run-release wrapper with bounded,
          backed-off retries. Every plan mutation runs inside it:
        </P>

        <CodeBlock>{`async function withPlanLock(roomId, fn) {
  const lockId = \`server:\${nanoid()}\`;
  let acquired = false;

  for (let attempt = 0; attempt < 5; attempt++) {
    acquired = await acquireLock(roomId, "plan", lockId, 10_000);
    if (acquired) break;
    await sleep(150 * (attempt + 1));   // 150ms, 300, 450, 600 …
  }
  if (!acquired) throw new Error("Plan is locked, retry in a moment.");

  try { return await fn(); }            // the read-modify-write
  finally { await releaseLock(roomId, "plan", lockId); }
}`}</CodeBlock>

        <P>
          Three details earn their place here. The retry loop is <em>bounded</em> —
          five tries, then it gives up and tells the caller to retry, rather than
          hanging forever. The backoff <em>grows</em>, so two agents colliding
          don&apos;t synchronize into a tight retry loop hammering the same key. And
          release is in a <Code>finally</Code>, so the lock comes back even if the
          work throws. Release also checks ownership before deleting, so an agent
          can only free a lock it actually holds:
        </P>

        <CodeBlock>{`const current = await redis.get(lockKey);
if (current === agentId) { await redis.del(lockKey); return true; }
return false;   // someone else holds it (or it already expired) — don't touch`}</CodeBlock>

        <P>
          That ownership check prevents the classic distributed-lock footgun: agent
          A&apos;s lock expires under load, agent B acquires it, then A finishes late
          and blindly deletes the lock — freeing B&apos;s lock out from under it.
          Checking the holder before deleting closes that window. It&apos;s not a
          fully fenced lock (that would need monotonic tokens), but for a
          single-Redis coordination server where the TTL is generous relative to the
          work, it&apos;s the right amount of rigor.
        </P>

        <p style={{ color: "#777", fontSize: 14, lineHeight: 1.85, marginBottom: 22 }}>
          <span style={{ color: "#666" }}>The business version of all this:</span>{" "}
          you can point four agents at one backend overnight and trust that you wake
          up to a consistent plan, not a corrupted one. Reliability under
          parallelism is the entire reason to run multiple agents in the first
          place, so it&apos;s the one property that can&apos;t be &ldquo;good
          enough.&rdquo; The price is one extra Redis round trip on writes and a
          brief wait under contention, which for a document edited a few times a
          minute is invisible.
        </p>

        <Hr />

        {/* ── ACT III ───────────────────────────────────── */}
        <ActLabel>Act III — Reading without stepping on each other</ActLabel>

        <H2>Exactly-once events with a per-agent cursor</H2>

        <P>
          The event log has the opposite problem. It&apos;s append-only, so writes
          don&apos;t conflict — but <em>reads</em> do, in a subtle way. Every agent
          needs its own answer to &ldquo;what&apos;s new to me?&rdquo; and those
          answers must not interfere. If two agents share a read position, one
          advancing it hides events from the other.
        </P>

        <P>
          The tempting fixes are both bad. A shared &ldquo;last read&rdquo; pointer
          breaks the instant a second agent joins. Re-sending the whole recent log
          every poll and asking the agent to dedupe pushes the problem onto every
          client and wastes tokens re-reading events it&apos;s already seen. The
          clean answer is a cursor <em>per agent</em>:
        </P>

        <CodeBlock>{`const cursor = await getEventCursor(roomId, agentId);   // this agent's position
const recent = await getEvents(roomId, 50);

const unread = cursor === null
  ? recent
  : recent.filter(e => new Date(e.timestamp) > new Date(cursor));

await setEventCursor(roomId, agentId, new Date().toISOString());  // advance
return { events: unread, count: unread.length };`}</CodeBlock>

        <P>
          Each agent has its own cursor key. Reading advances only <em>your</em>
          cursor and never mutates the shared log, so two agents reading the same
          stream each get every event exactly once, with zero coordination between
          them. No locks, because nothing shared is being written. This is the flip
          side of the lock decision: use the heaviest tool only where writes
          actually contend, and lean on per-agent state everywhere else.
        </P>

        {/* DIAGRAM 2 — per-agent cursors */}
        <figure style={figStyle}>
          <svg width="100%" viewBox="0 0 640 180" role="img" xmlns="http://www.w3.org/2000/svg">
            <title>One shared event log, two independent per-agent cursors</title>
            <desc>
              A single row of events. Agent A's cursor sits further along than
              agent B's cursor. Each sees a different slice as unread, without
              affecting the other.
            </desc>
            {/* event log */}
            <text x="20" y="40" style={svgFaintL}>shared event log →</text>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <g key={i}>
                <rect x={40 + i * 78} y="54" width="66" height="30" rx="5" fill="#111110" stroke="#333" strokeWidth="0.5" />
                <text x={73 + i * 78} y="69" textAnchor="middle" dominantBaseline="central" style={svgFaint}>
                  e{i + 1}
                </text>
              </g>
            ))}
            {/* cursor B */}
            <line x1="274" y1="48" x2="274" y2="90" stroke="#BA7517" strokeWidth="1.5" />
            <text x="274" y="108" textAnchor="middle" style={{ ...svgFaint, fill: "#FAC775" }}>B cursor</text>
            <text x="274" y="122" textAnchor="middle" style={svgFaint}>unread: e4–e7</text>
            {/* cursor A */}
            <line x1="508" y1="48" x2="508" y2="90" stroke="#1D9E75" strokeWidth="1.5" />
            <text x="508" y="108" textAnchor="middle" style={{ ...svgFaint, fill: "#9FE1CB" }}>A cursor</text>
            <text x="508" y="122" textAnchor="middle" style={svgFaint}>unread: e7</text>

            <text x="320" y="158" textAnchor="middle" style={svgFaint}>
              same log, independent positions — reading advances only your own cursor
            </text>
          </svg>
          <figcaption style={figCap}>
            Per-agent cursors give each agent an exactly-once view of one shared log
            with no write contention and no client-side dedupe.
          </figcaption>
        </figure>

        <H2>Presence as a TTL, not a connection</H2>

        <P>
          Last one: knowing who is actually online. The instinct from chat apps is
          to track live connections — a WebSocket per agent, an{" "}
          <Code>onDisconnect</Code> handler to mark them offline. That instinct is
          wrong here for one reason: the server is stateless. There is no persistent
          connection to hang presence on, and I want to keep it that way, because
          statelessness is what lets any server instance serve any request and
          restart without ceremony.
        </P>

        <P>
          So presence is just a key with an expiry. An agent calls{" "}
          <Code>heartbeat</Code> every ~60s; that writes a key that lives 120s:
        </P>

        <CodeBlock>{`// heartbeat: write a key that outlives one missed beat, then expires
await redis.set(heartbeatKey(roomId, agentId), now, { ex: 120 });

// presence: you're online iff your heartbeat key still exists
const lastSeen = await redis.get(heartbeatKey(roomId, agentId));
status = lastSeen !== null ? "online" : "offline";`}</CodeBlock>

        <P>
          Stop heartbeating and you fall offline on your own after 120 seconds. No
          disconnect handler, no cleanup job, no connection state anywhere. The 120s
          window is deliberately two missed beats, so one dropped request
          doesn&apos;t flap you offline. Liveness becomes a question about the store,
          not about a socket — which is exactly the property that keeps the server
          disposable.
        </P>

        <Hr />

        <H2>The pattern underneath all three</H2>

        <P>
          Look at the three mechanisms together and there&apos;s one idea running
          through them: <strong style={{ color: "#bbb", fontWeight: 500 }}>match the
          coordination cost to the actual contention.</strong> The plan is genuinely
          write-contended, so it gets a real lock. The event log is append-only with
          per-reader views, so it gets cheap per-agent cursors and no lock at all.
          Presence has no shared write at all, so it gets a self-expiring key and no
          bookkeeping. Reaching for a database transaction or a CRDT everywhere would
          have been more &ldquo;serious&rdquo; and strictly worse: more moving parts,
          more latency, more to operate, to solve problems two of the three cases
          don&apos;t even have.
        </P>

        <P>
          What this version doesn&apos;t do, to be straight about it: the plan lock
          makes the plan a serialization point, so a room with agents furiously
          rewriting tasks would bottleneck on it (fine at real usage, but it&apos;s
          the ceiling). The lock isn&apos;t fully fenced, so a pathological
          TTL-expiry-under-load case is mitigated but not provably impossible. And
          presence and events are poll-based, so &ldquo;online&rdquo; and
          &ldquo;unread&rdquo; are accurate to within a poll interval, not
          instantaneous. Push and fencing are on the roadmap; neither was worth the
          complexity for the load this handles today.
        </P>

        <P>
          The lesson I keep relearning: in systems you have to trust, the right
          amount of cleverness is usually less than you think. One Redis command used
          honestly, a cursor per reader, and a key that expires on its own. Three
          small, boring mechanisms, and the room stays consistent no matter how many
          agents pile in.
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

        {/* series footer */}
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #161616" }}>
          <p style={{ color: "#444", fontSize: 12, marginBottom: 12 }}>the room protocol series</p>
          <p style={{ fontSize: 13, marginBottom: 6 }}>
            <Link href="/blog/room-protocol" style={{ color: "#8B85E0" }}>
              Part I — Two Claudes, one project
            </Link>
            <span style={{ color: "#444" }}> · the idea and the primitives</span>
          </p>
          <p style={{ fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: "#999" }}>Part II — Two agents, one plan, zero lost writes</span>
            <span style={{ color: "#444" }}> · you are here</span>
          </p>
          <p style={{ fontSize: 13, marginBottom: 6 }}>
            <Link href="/blog/one-database-no-memory" style={{ color: "#8B85E0" }}>
              Part III — One database, no memory
            </Link>
            <span style={{ color: "#444" }}> · the architecture bet</span>
          </p>
          <p style={{ fontSize: 13, marginBottom: 6 }}>
            <Link href="/blog/contracts-not-conversations" style={{ color: "#8B85E0" }}>
              Part IV — Contracts, not conversations
            </Link>
            <span style={{ color: "#444" }}> · typed context</span>
          </p>
          <p style={{ fontSize: 13, marginBottom: 6 }}>
            <Link href="/blog/built-on-mcp" style={{ color: "#8B85E0" }}>
              Part V — Built on MCP
            </Link>
            <span style={{ color: "#444" }}> · the protocol layer</span>
          </p>
        </div>
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

const svgFaintL = {
  fontFamily: "var(--font-mono), ui-monospace, monospace",
  fontSize: 11,
  fill: "#777",
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
  return (
    <p style={{ color: "#9a9a9a", fontSize: 14, lineHeight: 1.85, marginBottom: 22 }}>{children}</p>
  );
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

function Hr() {
  return <hr style={{ border: 0, borderTop: "1px solid #161616", margin: "48px 0 40px" }} />;
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
