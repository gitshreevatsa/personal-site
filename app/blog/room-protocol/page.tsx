import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Coordinating coding agents through shared state, not messages",
  description:
    "Agents don't need a group chat. They need a shared room. How I built roomd — a stateless MCP server that lets multiple coding agents coordinate through shared state instead of messages.",
};

export default function RoomProtocolPost() {
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
        <span>room-protocol</span>
      </div>

      <article
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "72px 32px 120px",
        }}
      >
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
          the Room Protocol · shared-state coordination
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
          Coordinating coding agents through shared state, not messages
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
          The moment a second agent joins your project, coordination becomes the
          bottleneck. I don&apos;t think the answer is a group chat for robots. I
          think it&apos;s a shared room — and this is the protocol I built to test
          that idea.
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
          <span>13 min read</span>
          <span>·</span>
          <span>shreyaspadmakiran.com</span>
        </div>

        <P>
          A single coding agent is great on its own. It holds a task, reads the
          codebase, edits files, reports back. Then you add a second agent to the
          same project and everything that was implicit becomes a problem. Who is
          building the auth service? What shape is its API, so the frontend agent
          can call it? Is that task actually done, or just started? What did we
          decide about sessions last Tuesday, and why?
        </P>

        <P>
          None of these questions have good answers today, and the ways people
          paper over them all share the same flaw. This post is about that flaw,
          the idea I think fixes it, and the working server I built to find out.
        </P>

        {/* ── ACT I ─────────────────────────────────────── */}
        <ActLabel>Act I — The problem and the idea</ActLabel>

        <H2>Three bad ways to coordinate agents</H2>

        <P>
          When two agents need to agree on something, coordination happens one of
          three ways right now, and each one hurts.
        </P>

        <P>
          <strong style={{ color: "#bbb", fontWeight: 500 }}>A human relays it.</strong>{" "}
          You copy an API contract out of one agent&apos;s chat and paste it into
          the other&apos;s. This works for exactly one handoff and then you are the
          integration bus for two robots that type faster than you.
        </P>

        <P>
          <strong style={{ color: "#bbb", fontWeight: 500 }}>The agents talk.</strong>{" "}
          One agent sends the other a natural-language message describing what it
          needs. Conversation is lossy and order-dependent. There&apos;s no durable
          record to query later, no signal that a message was even read, and
          nothing stopping both agents from editing the same plan at the same
          instant.
        </P>

        <P>
          <strong style={{ color: "#bbb", fontWeight: 500 }}>They share a repo.</strong>{" "}
          Great for code, useless for intent. A git history can&apos;t tell agent B
          that agent A is halfway through the auth service right now, or that a
          contract B depends on changed five minutes ago.
        </P>

        <P>
          The common thread: all three treat coordination as{" "}
          <em>message-passing</em>. But messages are transient and have to be
          interpreted. What agents actually need is <em>state</em> — something
          durable they can query. An agent booting cold should be able to ask
          &ldquo;what&apos;s the plan, what&apos;s mine, what changed since I last
          looked, who else is here&rdquo; and get a structured answer, not a
          transcript to re-read.
        </P>

        <Bridge>
          If the fix is shared state instead of messages, the question becomes:
          what&apos;s the smallest amount of shared state that actually lets two
          agents build software together? That set turned out to be surprisingly
          small.
        </Bridge>

        <H2>The idea: a room, not a chat</H2>

        <P>
          The central abstraction is a <strong style={{ color: "#bbb", fontWeight: 500 }}>room</strong>.
          A room is one id — say <Code>my-saas-backend</Code> — that namespaces
          everything the agents share on a project. Agents don&apos;t address each
          other. They join a room and read and write its state. Joining is
          implicit: the first time an agent touches a room, it&apos;s known.
        </P>

        {/* DIAGRAM 1 — chat vs room */}
        <figure style={figStyle}>
          <svg width="100%" viewBox="0 0 640 220" role="img" xmlns="http://www.w3.org/2000/svg">
            <title>Message-passing between agents versus a shared room</title>
            <desc>
              Left: three agents connected to each other by tangled message
              arrows. Right: three agents each connected to a single central
              room box.
            </desc>

            {/* left label */}
            <text x="160" y="18" textAnchor="middle" style={svgLabel}>
              messages between agents
            </text>
            {/* left: three agents, tangled */}
            {[
              { x: 70, y: 70 },
              { x: 250, y: 70 },
              { x: 160, y: 170 },
            ].map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="22" fill="#201500" stroke="#BA7517" strokeWidth="0.5" />
                <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" style={svgNodeAmber}>
                  A{i + 1}
                </text>
              </g>
            ))}
            <line x1="92" y1="70" x2="228" y2="70" stroke="#3a2a10" strokeWidth="0.5" strokeDasharray="4 3" />
            <line x1="80" y1="92" x2="150" y2="148" stroke="#3a2a10" strokeWidth="0.5" strokeDasharray="4 3" />
            <line x1="240" y1="92" x2="170" y2="148" stroke="#3a2a10" strokeWidth="0.5" strokeDasharray="4 3" />
            <line x1="150" y1="152" x2="240" y2="88" stroke="#2a2a28" strokeWidth="0.5" strokeDasharray="2 3" />
            <text x="160" y="205" textAnchor="middle" style={svgFaint}>
              lossy · transient · no record
            </text>

            {/* divider */}
            <line x1="320" y1="30" x2="320" y2="195" stroke="#1a1a18" strokeWidth="0.5" />

            {/* right label */}
            <text x="490" y="18" textAnchor="middle" style={svgLabel}>
              shared room
            </text>
            {/* right: central room */}
            <rect x="440" y="92" width="100" height="56" rx="10" fill="#1e1c36" stroke="#534AB7" strokeWidth="0.5" />
            <text x="490" y="120" textAnchor="middle" dominantBaseline="central" style={svgNodePurple}>
              room
            </text>
            {/* right: three agents around it */}
            {[
              { x: 400, y: 60 },
              { x: 585, y: 70 },
              { x: 500, y: 185 },
            ].map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="20" fill="#0d2117" stroke="#1D9E75" strokeWidth="0.5" />
                <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" style={svgNodeTeal}>
                  A{i + 1}
                </text>
              </g>
            ))}
            <line x1="415" y1="76" x2="455" y2="98" stroke="#2f4a3d" strokeWidth="0.5" />
            <line x1="567" y1="84" x2="533" y2="104" stroke="#2f4a3d" strokeWidth="0.5" />
            <line x1="497" y1="166" x2="492" y2="148" stroke="#2f4a3d" strokeWidth="0.5" />
          </svg>
          <figcaption style={figCap}>
            Left: N agents, N&sup2; message paths, nothing durable. Right: every
            agent reads and writes one shared room. The room holds the truth, not
            the conversation.
          </figcaption>
        </figure>

        <P>
          A room is also the unit of ownership and access — but hold that thought,
          because first it helps to see what actually lives inside one.
        </P>

        <H2>Five primitives, and why each exists</H2>

        <P>
          The claim the protocol makes is that five kinds of shared state are
          enough to coordinate independent coding agents. Each one earns its place
          because a specific failure happens without it.
        </P>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "20px 0 28px" }}>
          {[
            {
              dot: "#534AB7",
              title: "Plan",
              body: "A shared task list — status, owner, dependencies. Answers 'what is there to do and who has it.' Without it, two agents grab the same task or both assume the other will do it.",
            },
            {
              dot: "#1D9E75",
              title: "Context",
              body: "A typed store of artifacts: API contracts, architecture decisions, notes. Answers 'what has been decided that I build against.' This is the durable record conversation lacks.",
            },
            {
              dot: "#BA7517",
              title: "Events",
              body: "An append-only log, newest first. Answers 'what changed since I last looked.' Some events are posted by agents; others fire automatically when the plan changes.",
            },
            {
              dot: "#D85A30",
              title: "Presence",
              body: "A liveness signal. Answers 'who is actually here right now,' so an agent knows whether the peer it's waiting on is even connected.",
            },
            {
              dot: "#E24B4A",
              title: "Locks",
              body: "Distributed mutual exclusion. Answers 'may I safely modify the plan.' Without it, two simultaneous plan edits silently overwrite each other.",
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
          Agents reach these through MCP tools — 19 of them in the running server
          — but the tools are just the surface. The interesting part is what they
          do to shared state, and how they keep that state consistent when several
          agents hit it at once.
        </P>

        <Hr />

        {/* ── ACT II ────────────────────────────────────── */}
        <ActLabel>Act II — How it works</ActLabel>

        <H2>Typed context beats prose</H2>

        <P>
          If context were free text, we&apos;d be right back to message-passing —
          a consuming agent would have to parse English to extract a contract.
          Instead, every context entry has a <Code>type</Code> from a closed set,
          and each type has a payload schema the author fills in:{" "}
          <Code>api_contract</Code>, <Code>arch_decision</Code>, <Code>task</Code>,{" "}
          <Code>change_request</Code>, <Code>note</Code>.
        </P>

        <P>
          A frontend agent reading an <Code>api_contract</Code> knows there&apos;s
          an <Code>endpoints</Code> array with a <Code>method</Code> and{" "}
          <Code>path</Code> on each entry. It doesn&apos;t infer that from a
          paragraph. The data is structured at the moment it&apos;s written, not
          reconstructed at the moment it&apos;s read. That single difference is the
          whole ballgame.
        </P>

        <H2>The handoff, with no human in it</H2>

        <P>
          Here&apos;s the pattern that made me build this: a backend agent designs
          an interface, and a frontend agent builds against it — asynchronously,
          on different machines, no one relaying anything.
        </P>

        <CodeBlock>{`backend  → update_task(auth API, in_progress, owner: backend)
backend  → write_context(type: api_contract, payload: {...})
              ↳ room auto-posts "context_available"
backend  → update_task(auth API, done)

frontend → get_my_summary()          // one cold-start call
              ↳ my tasks, unread events, context count, presence
frontend → list_context(type: api_contract)   // reads the contract
frontend → post_event(type: change_request, to: backend,
              "need a /me endpoint")

backend  → get_unread_events()        // sees it exactly once
backend  → write_context(api_contract v1.1) + reply_to_event(...)`}</CodeBlock>

        <P>
          Not one step there is a message in the conversational sense. Every line
          is a durable read or write of shared state. The frontend agent that
          shows up an hour later doesn&apos;t replay a transcript — it queries the
          state that exists. If either agent crashes and restarts, it recovers by
          asking the room again, because the room holds the truth, not the agent.
        </P>

        <Bridge>
          &ldquo;Sees it exactly once&rdquo; and &ldquo;auto-posts&rdquo; are
          doing quiet work in that trace. Both come from how the room stays
          consistent under concurrent agents — which is where the engineering
          actually lives.
        </Bridge>

        <H2>Keeping the room consistent</H2>

        <P>
          The plan is a single JSON document that multiple agents modify with
          read-modify-write. Two agents doing that at once would lose an update.
          So every plan write takes a distributed lock built on Redis&apos;s atomic
          &ldquo;set only if absent, with an expiry&rdquo;:
        </P>

        <CodeBlock>{`await redis.set(lockKey, agentId, { nx: true, px: 10_000 });
// nx  → only one caller can win the key
// px  → auto-expires, so a crashed holder can't deadlock the plan`}</CodeBlock>

        <P>
          The winner does its read-modify-write and releases; losers retry with a
          little backoff. It costs one extra round trip on the contended path, and
          in exchange two agents updating tasks at the same time apply one after
          the other instead of clobbering each other.
        </P>

        <P>
          Events use a different trick. The log is shared, but each agent has its
          own <strong style={{ color: "#bbb", fontWeight: 500 }}>cursor</strong> —
          a timestamp of what it last saw. <Code>get_unread_events</Code> reads
          everything newer than the cursor, advances it, and returns the slice. Two
          agents reading the same log each get every event exactly once, with zero
          coordination between them and no mutation of the shared log. Presence is
          the same spirit: a heartbeat key with a 120-second expiry. Stop
          heartbeating and you go offline on your own, no cleanup job required.
        </P>

        <H2>Stateless server, one store</H2>

        <P>
          The server itself remembers nothing between requests. Every call spins up
          a fresh MCP server, handles the one request, and throws it away. All the
          durable state lives in a single Redis instance. That sounds austere, but
          it&apos;s the point: any server instance can serve any request because no
          instance holds state, so the thing restarts and scales without ceremony.
        </P>

        {/* DIAGRAM 2 — architecture */}
        <figure style={figStyle}>
          <svg width="100%" viewBox="0 0 640 200" role="img" xmlns="http://www.w3.org/2000/svg">
            <title>roomd architecture</title>
            <desc>
              Agent A, Agent B and an operator dashboard on the left connect to a
              stateless roomd server in the middle, which reads and writes a
              single Redis store on the right.
            </desc>
            <defs>
              <marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>

            {/* clients */}
            {[
              { y: 40, label: "agent A", stroke: "#1D9E75", fill: "#0d2117", tc: "#9FE1CB" },
              { y: 90, label: "agent B", stroke: "#1D9E75", fill: "#0d2117", tc: "#9FE1CB" },
              { y: 140, label: "operator", stroke: "#534AB7", fill: "#1e1c36", tc: "#CECBF6" },
            ].map((c, i) => (
              <g key={i}>
                <rect x="16" y={c.y} width="96" height="34" rx="7" fill={c.fill} stroke={c.stroke} strokeWidth="0.5" />
                <text x="64" y={c.y + 17} textAnchor="middle" dominantBaseline="central" style={{ ...svgNode, fill: c.tc }}>
                  {c.label}
                </text>
                <line x1="112" y1={c.y + 17} x2="228" y2="100" stroke="#333" strokeWidth="0.5" markerEnd="url(#ar)" />
              </g>
            ))}
            <text x="150" y="185" textAnchor="middle" style={svgFaint}>
              MCP / HTTP + Bearer
            </text>

            {/* server */}
            <rect x="230" y="60" width="180" height="80" rx="10" fill="#111110" stroke="#333" strokeWidth="0.5" />
            <text x="320" y="88" textAnchor="middle" style={{ ...svgNode, fill: "#aaa" }}>
              roomd
            </text>
            <text x="320" y="106" textAnchor="middle" style={svgFaint}>
              stateless · auth + rate limit
            </text>
            <text x="320" y="122" textAnchor="middle" style={svgFaint}>
              fresh server per request · 19 tools
            </text>

            {/* arrow to redis */}
            <line x1="410" y1="100" x2="500" y2="100" stroke="#333" strokeWidth="0.5" markerEnd="url(#ar)" />
            <text x="455" y="90" textAnchor="middle" style={svgFaint}>
              all state
            </text>

            {/* redis */}
            <rect x="502" y="66" width="122" height="68" rx="10" fill="#1e1c36" stroke="#534AB7" strokeWidth="0.5" />
            <text x="563" y="94" textAnchor="middle" style={svgNodePurple}>
              Redis
            </text>
            <text x="563" y="112" textAnchor="middle" style={svgFaint}>
              the only database
            </text>
          </svg>
          <figcaption style={figCap}>
            Everything durable is a key in Redis. The server is disposable. That
            austerity is also what makes the whole thing multi-tenant.
          </figcaption>
        </figure>

        <P>
          Why does statelessness make it multi-tenant? Because with no server-side
          state, isolation becomes a property of how keys are named, enforced in
          one place. A room is owned by the first team that touches it, claimed
          with the same atomic set-if-absent used for locking. Later calls from the
          same team pass; anyone else gets a deliberately vague &ldquo;room not
          found or access denied.&rdquo; Guests get room-scoped invite tokens that
          can reach exactly one room and nothing else. Three kinds of key, one team
          identity, no separate auth database.
        </P>

        <Hr />

        {/* ── ACT III ───────────────────────────────────── */}
        <ActLabel>Act III — Using it, and what&apos;s honest about it</ActLabel>

        <H2>Two changes to start</H2>

        <P>
          Connecting an agent is two edits. Point Claude Code at the server in{" "}
          <Code>.claude/settings.json</Code>, and tell it which room to join.
        </P>

        <CodeBlock>{`// .claude/settings.json
{
  "mcpServers": {
    "room-protocol": {
      "type": "http",
      "url": "https://roomd.sh/mcp",
      "headers": { "Authorization": "Bearer YOUR_SECRET" }
    }
  }
}`}</CodeBlock>

        <P>
          Then, at the start of a session: &ldquo;our room is{" "}
          <Code>my-saas-backend</Code>, call <Code>get_my_summary</Code> to catch
          up.&rdquo; That one call returns your tasks, your unread events, how much
          new context exists, and who else is online. The agent is oriented in a
          single round trip instead of five.
        </P>

        <H2>Does it actually beat a group chat?</H2>

        <P>
          Honest answer: I&apos;ve run it, it works, and I haven&apos;t proven the
          advantage with numbers yet. The clean way to test the claim is a
          side-by-side — run the same multi-agent build task twice, once where
          agents coordinate by chatting and once through the room, and measure a
          few things:
        </P>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "20px 0 28px" }}>
          {[
            { dot: "#1D9E75", title: "Human interventions", body: "How many times a person had to relay or restate something. Target: zero. This is the headline number." },
            { dot: "#534AB7", title: "Handoff correctness", body: "Did the consumer build against the actual current contract, or a stale one?" },
            { dot: "#BA7517", title: "Cold-start cost", body: "Tokens to recover context after a fresh session: replaying a transcript versus one get_my_summary." },
            { dot: "#D85A30", title: "Concurrency safety", body: "Lost-update rate when N agents write the plan at once — directly measurable with a stress harness." },
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
          The neat part is that the event log <em>is</em> the dataset. Every task
          change and handoff already emits a typed, timestamped event, so a
          finished room is a machine-readable trace of the coordination that
          happened. Most of the evaluation is just replaying{" "}
          <Code>read_events</Code> over a completed room.
        </P>

        <H2>What I left out on purpose</H2>

        <P>
          The first version is deliberately small. Agents poll instead of getting
          pushed to — polling was simpler and enough. Context is fetched by type
          and id, not by meaning; semantic search is a later problem. Updating a
          contract writes a new entry with no version history yet. Logs and context
          grow without a retention policy. None of these were oversights — each was
          a thing I could add once the core idea earned it, and shipping the core
          idea was the point.
        </P>

        <P>
          That&apos;s the whole bet, really. Multi-agent development breaks at the
          seams — the handoffs, the shared decisions, the &ldquo;wait, who&apos;s
          doing that&rdquo; moments. The reflex is to treat those seams as
          conversations, and conversations are lossy. Give the agents a room
          instead — a little structured, durable, queryable shared state behind one
          id — and let them coordinate by reading and writing it. It&apos;s the same
          move any working team already makes: you don&apos;t stay in sync by talking
          louder, you keep a board everyone can see.
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

        <SeriesFooter here="room-protocol" />
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

const svgNodeAmber = { ...svgNode, fill: "#FAC775" } as const;
const svgNodeTeal = { ...svgNode, fill: "#9FE1CB" } as const;
const svgNodePurple = { ...svgNode, fill: "#CECBF6" } as const;

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
    <p style={{ color: "#9a9a9a", fontSize: 14, lineHeight: 1.85, marginBottom: 22 }}>
      {children}
    </p>
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
