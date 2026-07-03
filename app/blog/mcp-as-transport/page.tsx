import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MCP as transport: stateless HTTP over long-lived SSE",
  description:
    "Why the Room Protocol rides on the Model Context Protocol instead of a custom SDK or a REST API, why the transport is stateless streamable HTTP rather than long-lived SSE, and how the tool surface is designed as the protocol's real UX.",
};

export default function BuiltOnMcpPost() {
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
        <span>mcp-as-transport</span>
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
          the Room Protocol · transport
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
          MCP as transport: stateless HTTP over long-lived SSE
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
          A coordination protocol is only as useful as the number of agents that can
          speak it. Riding on MCP meant every capable agent could join with zero
          custom client code — but only if I got the transport and the tool surface
          right.
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
          The four earlier parts of this series were about what the room{" "}
          <em>is</em>: the primitives, the concurrency, the single-store
          architecture, the typed context. This one is about how an agent actually
          reaches it. That question has a boring-sounding answer with a lot riding on
          it, because the transport decision is really a distribution decision. A
          coordination substrate that agents can&apos;t easily connect to is a
          coordination substrate nobody uses.
        </P>

        {/* ── ACT I ─────────────────────────────────────── */}
        <ActLabel>Act I — Why a protocol, not an SDK</ActLabel>

        <H2>The distribution problem</H2>

        <P>
          Set aside the internals and ask the plain question: how does a Claude Code
          instance call <Code>read_plan</Code>? The honest options were three.
        </P>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "20px 0 28px" }}>
          {[
            { dot: "#E24B4A", title: "A REST API", body: "Ship endpoints and hope agents call them. But an agent doesn't natively know your REST API exists or what it means — you'd have to prompt every agent with your entire API surface and pray it forms correct requests. No discovery, no typed inputs, all glue." },
            { dot: "#BA7517", title: "A custom SDK", body: "Wrap the API in a library. Now you're maintaining and versioning a client per language, and every user has to install and wire it up. That's a real adoption tax for what is supposed to be a two-line setup." },
            { dot: "#1D9E75", title: "MCP", body: "Expose the operations as MCP tools. Any MCP-capable agent discovers them from the server, with names, descriptions, and typed input schemas, and can call them immediately. No SDK, no per-language client, no API docs to stuff into a prompt." },
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
          MCP wins because it&apos;s the layer agents already speak for tool use.
          Discovery and typed schemas come with the protocol, so the agent learns
          what tools exist and how to call them by asking the server, not by reading
          my documentation. The moment roomd — the reference server — is in an
          agent&apos;s config, all 19 coordination tools are available to it with no
          further work. That&apos;s
          the difference between &ldquo;integrate our SDK&rdquo; and &ldquo;paste
          this into settings.&rdquo;
        </P>

        <CodeBlock>{`// the entire client-side integration — two lines of real config
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
          The payoff is zero client lock-in and near-zero integration cost. It drops
          into whatever agent stack a team already runs, which is the cheapest
          possible path to adoption: you never ask anyone to change their tools, you
          ride the ones they already have.
        </P>

        <Bridge>
          Choosing MCP settles the &ldquo;what protocol&rdquo; question. It leaves a
          sharper one: MCP can be spoken over more than one transport, and the
          obvious default is the wrong one here.
        </Bridge>

        {/* ── ACT II ────────────────────────────────────── */}
        <ActLabel>Act II — Stateless HTTP over long-lived SSE</ActLabel>

        <H2>The transport most examples reach for</H2>

        <P>
          The familiar way to run an MCP server is a long-lived connection: the
          client opens a Server-Sent Events stream, a session is established, and it
          stays open with per-connection state held in the server&apos;s memory.
          It&apos;s the default in a lot of examples. It also quietly reintroduces
          every problem that{" "}
          <Link href="/blog/stateless-single-redis" style={{ color: "#8B85E0" }}>
            statelessness
          </Link>{" "}
          was chosen to avoid: sessions pinned to one instance, sticky routing,
          connections dropped on every deploy, session state to migrate when scaling
          out.
        </P>

        <H2>What the Room Protocol uses instead</H2>

        <P>
          roomd uses the modern streamable-HTTP transport in stateless mode.
          There is no session to establish and no stream to keep alive. Every tool
          call is an independent HTTP request that builds a fresh server, does its
          work against Redis, and returns:
        </P>

        <CodeBlock>{`const transport = new WebStandardStreamableHTTPServerTransport({
  sessionIdGenerator: undefined,   // stateless: no session id, no pinning
});
const server = createMcpServer(keyCtx);  // fresh per request
await server.connect(transport);
return transport.handleRequest(c.req.raw);`}</CodeBlock>

        <P>
          This is the transport-level twin of the architecture bet. A stateless
          server over a stateless transport talking to a store over stateless HTTP
          requests is one coherent design from top to bottom. It&apos;s also why the
          client config says <Code>&quot;type&quot;: &quot;http&quot;</Code> and not{" "}
          <Code>&quot;sse&quot;</Code> — a small line that reflects the whole stance.
          The cost is that the server can&apos;t push to the client, so agents poll
          for updates. For the current design that&apos;s an acceptable trade, and
          it&apos;s the honest limitation I&apos;ll come back to.
        </P>

        {/* DIAGRAM — sse session vs stateless request */}
        <figure style={figStyle}>
          <svg width="100%" viewBox="0 0 640 200" role="img" xmlns="http://www.w3.org/2000/svg">
            <title>Long-lived SSE session versus stateless per-request transport</title>
            <desc>
              Left: a client pinned to one server instance by a persistent session.
              Right: independent requests fanning out to any of several
              interchangeable instances.
            </desc>
            <text x="160" y="18" textAnchor="middle" style={svgLabel}>long-lived SSE session</text>
            <rect x="40" y="80" width="70" height="34" rx="6" fill="#111110" stroke="#333" strokeWidth="0.5" />
            <text x="75" y="97" textAnchor="middle" dominantBaseline="central" style={svgFaint}>agent</text>
            <rect x="210" y="80" width="80" height="34" rx="6" fill="#1a0f0f" stroke="#E24B4A" strokeWidth="0.5" />
            <text x="250" y="97" textAnchor="middle" dominantBaseline="central" style={{ ...svgFaint, fill: "#E28B8A" }}>instance 1</text>
            <line x1="110" y1="97" x2="208" y2="97" stroke="#E24B4A" strokeWidth="1" />
            <text x="160" y="90" textAnchor="middle" style={svgFaint}>pinned</text>
            <text x="160" y="150" textAnchor="middle" style={{ ...svgFaint, fill: "#E24B4A" }}>sticky · dies on deploy</text>

            <line x1="320" y1="26" x2="320" y2="180" stroke="#1a1a18" strokeWidth="0.5" />

            <text x="490" y="18" textAnchor="middle" style={svgLabel}>stateless per request</text>
            <rect x="360" y="80" width="70" height="34" rx="6" fill="#111110" stroke="#333" strokeWidth="0.5" />
            <text x="395" y="97" textAnchor="middle" dominantBaseline="central" style={svgFaint}>agent</text>
            {[54, 92, 130].map((y, i) => (
              <g key={i}>
                <rect x="520" y={y} width="90" height="26" rx="5" fill="#0d1a12" stroke="#1D9E75" strokeWidth="0.5" />
                <text x="565" y={y + 13} textAnchor="middle" dominantBaseline="central" style={{ ...svgFaint, fill: "#9FE1CB" }}>
                  instance {i + 1}
                </text>
                <line x1="430" y1="97" x2="518" y2={y + 13} stroke="#2f4a3d" strokeWidth="0.5" strokeDasharray="3 2" />
              </g>
            ))}
            <text x="490" y="176" textAnchor="middle" style={{ ...svgFaint, fill: "#9FE1CB" }}>any instance · restart-safe</text>
          </svg>
          <figcaption style={figCap}>
            A session ties an agent to one instance. Stateless requests let any
            instance answer, which is what makes restart and scale-out free.
          </figcaption>
        </figure>

        {/* ── ACT III ───────────────────────────────────── */}
        <ActLabel>Act III — The tool surface is the UX</ActLabel>

        <H2>Tools designed for how agents actually work</H2>

        <P>
          With MCP, the tools <em>are</em> the interface an agent sees. So their
          design is product design, not just API surface. Two tools exist purely
          because of how agents behave, and they&apos;re the clearest examples of
          treating the tool list as UX.
        </P>

        <P>
          An agent frequently starts cold — a fresh session with no memory of the
          room. The naive path is five calls: read the plan, get my tasks, get unread
          events, count context, check presence. So there&apos;s one tool,{" "}
          <Code>get_my_summary</Code>, that returns all of it in a single round trip.
          It exists because a cold start is the most common and most latency-sensitive
          moment an agent has, and collapsing five calls into one is a real UX win for
          a machine just as much as for a person.
        </P>

        <P>
          The second is <Code>get_unread_events</Code>, which reads from a per-agent
          cursor and advances it, so each agent gets every event exactly once without
          tracking anything client-side. The protocol encodes the intended usage
          pattern directly into the tool, rather than leaving the agent to implement
          &ldquo;what have I already seen&rdquo; itself. Good protocol design pushes
          the fiddly bookkeeping into the server where it&apos;s done once and
          correctly.
        </P>

        <P>
          Under the hood each tool is registered with a description and a typed input
          schema, and every handler runs the room-access check before doing anything,
          so access control isn&apos;t a separate middleware an agent could route
          around — it&apos;s baked into every operation on shared state:
        </P>

        <CodeBlock>{`server.registerTool(
  "read_plan",
  { description: "Read the current plan (tasks, status, owners) for a room",
    inputSchema: readPlanInput.shape },
  async (input) => {
    await assertRoomAccess(input.roomId, keyCtx);   // ownership enforced here
    const result = await readPlan(input);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);`}</CodeBlock>

        <H2>What riding on MCP costs</H2>

        <P>
          The honest tradeoffs. MCP is young and still moving, so building on it means
          tracking a spec that changes — the shift away from the older SSE transport
          is exactly that kind of churn, and there will be more. Stateless transport
          means no server-initiated push yet, so &ldquo;real-time&rdquo; is really
          &ldquo;polling on a short interval,&rdquo; and instant notifications are a
          roadmap item that will likely want a pub/sub layer. And a growing tool count
          is its own risk: 19 is comfortable, but a coordination surface can sprawl,
          and every tool is something an agent has to understand. Keeping the set
          small and purposeful is ongoing work, not a solved thing.
        </P>

        <P>
          None of that outweighs the core win. By building on the protocol agents
          already speak, the Room Protocol asks for essentially nothing from the
          people adopting it: no SDK, no new client, no tools to abandon. Two lines of
          config and an agent is in the room. For something whose entire value grows
          with the number of agents that can participate, meeting them exactly where
          they already are was the most important design decision that isn&apos;t
          about the room at all.
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

        <SeriesFooter here="mcp-as-transport" />
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
