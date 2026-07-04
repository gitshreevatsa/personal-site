import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Multi-tenancy on one Redis, no auth server",
  description:
    "How roomd keeps different teams' rooms completely isolated: three bearer-key types resolving to one teamId, first-touch room ownership via SET NX, fail-open rate limiting, and a one-boolean provisioning guard — no relational database, no auth service, no membership tables.",
};

export default function MultiTenantOneRedisPost() {
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
        <span>multi-tenant-one-redis</span>
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
          the Room Protocol · multi-tenancy
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
          Multi-tenancy on one Redis, no auth server
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
          The other posts cover how the protocol works for one team. This is the part
          that keeps your rooms from leaking into someone else&apos;s — and does it
          without standing up an auth service or a single database table.
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
          A coordination server that any bearer can read is a demo. The moment two
          teams point their agents at the same server, roomd has to guarantee that
          team A can never see team B&apos;s plans, contracts, or events — and it has
          to do that while staying a stateless server on one Redis, with no relational
          database, no identity provider, and no session store. This post is how that
          isolation actually works, and why each piece is the shape it is.
        </P>

        <P>
          Three things have to be true for real multi-tenancy, and they get conflated
          constantly: <strong style={{ color: "#bbb", fontWeight: 500 }}>isolation</strong>{" "}
          (A can&apos;t read B&apos;s data), <strong style={{ color: "#bbb", fontWeight: 500 }}>attribution</strong>{" "}
          (the server knows which team every request belongs to, so it can meter and
          eventually bill), and <strong style={{ color: "#bbb", fontWeight: 500 }}>scoped
          access</strong> (you can hand a collaborator into one room without handing
          them everything). roomd gets all three from a single move: collapse every
          credential down to one team identity, then key everything off it.
        </P>

        {/* ── ACT I ─────────────────────────────────────── */}
        <ActLabel>Act I — One identity, three doors</ActLabel>

        <H2>Every request resolves to a teamId</H2>

        <P>
          Before any tool runs, roomd turns the request&apos;s bearer secret into a{" "}
          <Code>teamId</Code> — the one identity that owns rooms and data. There are
          three kinds of secret, checked cheapest-first, but they all answer the same
          question (&ldquo;which team is this?&rdquo;):
        </P>

        <CodeBlock>{`async function resolveKey(secret): Promise<KeyContext | null> {
  // 1. static env keys — in-memory map, no I/O
  const staticTeam = keyMap.get(secret);
  if (staticTeam) return { teamId: staticTeam, isStatic: true,  isInvite: false };

  // 2. dynamic keys — created at runtime, stored in Redis
  const dyn = await getDynamicKey(secret);
  if (dyn)        return { teamId: dyn.teamId,  isStatic: false, isInvite: false };

  // 3. room-scoped invite tokens — access to exactly one room
  const invite = await getInviteToken(secret);
  if (invite)     return { teamId: invite.createdBy,
                           allowedRoomId: invite.roomId,
                           isInvite: true, isStatic: false };

  return null; // unrecognised → 401
}`}</CodeBlock>

        <P>
          The ordering is deliberate: the common case (a known team key) is a
          hash-map hit with zero network round trips, and only unrecognised secrets
          pay for a Redis lookup. But the point is the return shape — every branch
          produces a <Code>teamId</Code>. An invite additionally carries an{" "}
          <Code>allowedRoomId</Code> and a flag that pins it to one room. That is the
          entire identity model.
        </P>

        <H2>Why three bearer keys instead of an auth service</H2>

        <P>
          The reflex for &ldquo;who is this and what can they do&rdquo; is an auth
          service: OAuth, JWTs, a users table, refresh tokens, sessions. That&apos;s
          the right tool when you have human users with profiles, passwords, and
          roles. roomd&apos;s callers are agents and the teams that run them, and what
          they need is far narrower: a durable secret that maps to a team. A bearer
          secret resolving to a <Code>teamId</Code> gives exactly that in a single
          lookup — no login flow, no token-expiry choreography, no identity provider
          to operate.
        </P>

        <P>
          The three types aren&apos;t three auth systems; they&apos;re three ways to
          mint the same <Code>teamId</Code> for three situations. Static env keys are
          the ones the operator sets by hand. Dynamic keys are created at runtime for
          self-serve. Invite tokens are scoped to a single room for guests. Because
          everything downstream sees only the <Code>teamId</Code>, the auth surface
          and the coordination logic are decoupled by exactly one string — I can add,
          remove, or change how people authenticate without touching a line of the
          tool handlers.
        </P>

        {/* DIAGRAM 1 — three keys → teamId */}
        <figure style={figStyle}>
          <svg width="100%" viewBox="0 0 640 210" role="img" xmlns="http://www.w3.org/2000/svg">
            <title>Three secret types resolving to one team identity</title>
            <desc>
              A static key, a dynamic key, and an invite token on the left all resolve
              through resolveKey into a single teamId, which gates access to rooms.
            </desc>
            <defs>
              <marker id="m1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>

            {[
              { y: 26, label: "static key", sub: "operator-set", stroke: "#1D9E75", fill: "#0d2117", tc: "#9FE1CB" },
              { y: 86, label: "dynamic key", sub: "self-serve", stroke: "#534AB7", fill: "#1e1c36", tc: "#CECBF6" },
              { y: 146, label: "invite token", sub: "one room only", stroke: "#BA7517", fill: "#201500", tc: "#FAC775" },
            ].map((c, i) => (
              <g key={i}>
                <rect x="16" y={c.y} width="132" height="42" rx="7" fill={c.fill} stroke={c.stroke} strokeWidth="0.5" />
                <text x="82" y={c.y + 18} textAnchor="middle" style={{ ...svgNode, fill: c.tc }}>{c.label}</text>
                <text x="82" y={c.y + 33} textAnchor="middle" style={svgFaint}>{c.sub}</text>
                <line x1="148" y1={c.y + 21} x2="236" y2="105" stroke="#333" strokeWidth="0.5" markerEnd="url(#m1)" />
              </g>
            ))}

            <rect x="238" y="82" width="120" height="48" rx="9" fill="#111110" stroke="#333" strokeWidth="0.5" />
            <text x="298" y="102" textAnchor="middle" style={{ ...svgNode, fill: "#aaa" }}>resolveKey()</text>
            <text x="298" y="118" textAnchor="middle" style={svgFaint}>→ teamId</text>

            <line x1="358" y1="106" x2="452" y2="106" stroke="#333" strokeWidth="0.5" markerEnd="url(#m1)" />

            <rect x="454" y="70" width="168" height="72" rx="10" fill="#0d0d0d" stroke="#252525" strokeWidth="0.5" />
            <text x="538" y="90" textAnchor="middle" style={{ ...svgNode, fill: "#bbb" }}>rooms owned</text>
            <text x="538" y="106" textAnchor="middle" style={svgFaint}>by this team</text>
            <text x="538" y="126" textAnchor="middle" style={svgFaint}>(invite → 1 room)</text>
          </svg>
          <figcaption style={figCap}>
            Three ways in, one identity out. Ownership, metering, and access all read
            the same <code style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "#777" }}>teamId</code>,
            so the rest of the system never learns how you authenticated.
          </figcaption>
        </figure>

        <Bridge>
          Identity answers &ldquo;which team.&rdquo; It doesn&apos;t yet answer
          &ldquo;which rooms are yours&rdquo; — and the usual answer to that is a
          database table roomd deliberately doesn&apos;t have.
        </Bridge>

        {/* ── ACT II ────────────────────────────────────── */}
        <ActLabel>Act II — Ownership without a table</ActLabel>

        <H2>First touch wins</H2>

        <P>
          A team needs to own its rooms so no one else can reach them. The textbook
          approach is a rooms table, a memberships table, and the CRUD to manage both.
          roomd has neither. A room is owned by the first team that touches it,
          claimed with the same atomic primitive the plan uses for locking:
        </P>

        <CodeBlock>{`// runs on every tool call, before the tool does anything
const claimed = await redis.set(ownerKey, teamId, { nx: true });
if (claimed === "OK") return;                 // first touch → you own it now
const owner = await redis.get(ownerKey);
if (owner !== teamId)
  throw new Error("Room not found or access denied");`}</CodeBlock>

        <P>
          <Code>nx</Code> means &ldquo;set only if the key doesn&apos;t exist,&rdquo;
          so the first caller on a given roomId wins ownership atomically. Every later
          call by the same team passes; any other team gets a deliberately vague error
          that doesn&apos;t even confirm the room exists. Invite tokens skip the claim
          entirely, because their scope is already fixed to one room by the{" "}
          <Code>allowedRoomId</Code> from <Code>resolveKey</Code>.
        </P>

        <H2>Why first-touch over a membership table</H2>

        <P>
          A rooms-and-members schema would be more &ldquo;correct&rdquo; in a CRUD
          sense, so it&apos;s worth being concrete about what it buys and costs. It
          buys a room-creation endpoint, a join flow, membership rows, and the queries
          to check them on every single call — and it drags in a relational database
          to hold all that, which the{" "}
          <Link href="/blog/stateless-single-redis" style={{ color: "#8B85E0" }}>
            single-store architecture
          </Link>{" "}
          exists specifically to avoid. First-touch ownership gets the one property
          that actually matters — a room is private to exactly one team — from a
          single <Code>SET NX</Code>, with no schema, no create step, and no second
          datastore. Rooms spring into existence the instant an agent names one, and
          they&apos;re private from that instant.
        </P>

        <P>
          The tradeoff is real and worth naming out loud: there is no shared ownership
          and no transfer. A room belongs to one team, full stop. For coordinating one
          team&apos;s agents, that isn&apos;t a limitation — it&apos;s the point. If
          cross-team rooms ever become a real need, that&apos;s a membership table
          added deliberately for that feature, not schema you carried from day one on
          the chance you&apos;d want it.
        </P>

        {/* DIAGRAM 2 — ownership claim */}
        <figure style={figStyle}>
          <svg width="100%" viewBox="0 0 640 200" role="img" xmlns="http://www.w3.org/2000/svg">
            <title>First-touch room ownership via SET NX</title>
            <desc>
              team-acme calls SET NX on the room owner key and wins ownership.
              team-globex calls the same and is refused because the owner is already
              team-acme.
            </desc>
            <defs>
              <marker id="m2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>

            {/* owner key in the middle */}
            <rect x="250" y="82" width="140" height="40" rx="8" fill="#1e1c36" stroke="#534AB7" strokeWidth="0.5" />
            <text x="320" y="98" textAnchor="middle" style={{ ...svgNode, fill: "#CECBF6" }}>room:x:owner</text>
            <text x="320" y="113" textAnchor="middle" style={svgFaint}>= team-acme</text>

            {/* acme */}
            <rect x="20" y="34" width="150" height="34" rx="7" fill="#0d2117" stroke="#1D9E75" strokeWidth="0.5" />
            <text x="95" y="51" textAnchor="middle" style={{ ...svgNode, fill: "#9FE1CB" }}>team-acme</text>
            <path d="M172 52 L248 92" stroke="#1D9E75" strokeWidth="0.5" markerEnd="url(#m2)" fill="none" />
            <text x="150" y="86" textAnchor="middle" style={{ ...svgFaint, fill: "#9FE1CB" }}>SET NX → OK</text>
            <text x="150" y="100" textAnchor="middle" style={svgFaint}>owns it</text>

            {/* globex */}
            <rect x="20" y="140" width="150" height="34" rx="7" fill="#1a0f0f" stroke="#E24B4A" strokeWidth="0.5" />
            <text x="95" y="157" textAnchor="middle" style={{ ...svgNode, fill: "#E28B8A" }}>team-globex</text>
            <path d="M172 156 L248 116" stroke="#E24B4A" strokeWidth="0.5" markerEnd="url(#m2)" fill="none" />
            <text x="150" y="140" textAnchor="middle" style={{ ...svgFaint, fill: "#E24B4A" }}>SET NX → (exists)</text>

            {/* outcome */}
            <line x1="390" y1="102" x2="470" y2="102" stroke="#333" strokeWidth="0.5" markerEnd="url(#m2)" />
            <rect x="472" y="60" width="150" height="34" rx="7" fill="#0d1a12" stroke="#1D9E75" strokeWidth="0.5" />
            <text x="547" y="77" textAnchor="middle" style={{ ...svgFaint, fill: "#9FE1CB" }}>acme: allowed</text>
            <rect x="472" y="110" width="150" height="34" rx="7" fill="#1a0f0f" stroke="#E24B4A" strokeWidth="0.5" />
            <text x="547" y="123" textAnchor="middle" style={{ ...svgFaint, fill: "#E24B4A" }}>globex: room not</text>
            <text x="547" y="136" textAnchor="middle" style={{ ...svgFaint, fill: "#E24B4A" }}>found / denied</text>
          </svg>
          <figcaption style={figCap}>
            One atomic write decides ownership forever. The loser can&apos;t even tell
            whether the room exists — the error is the same as for a room that was
            never created.
          </figcaption>
        </figure>

        {/* ── ACT III ───────────────────────────────────── */}
        <ActLabel>Act III — Keeping it standing</ActLabel>

        <H2>Rate limiting that fails open</H2>

        <P>
          Each team gets a per-minute budget from a fixed-window counter that expires
          on its own:
        </P>

        <CodeBlock>{`const count = await redis.incr(rateKey);        // this minute's bucket
if (count === 1) await redis.expire(rateKey, 120);
return { allowed: count <= limit, remaining: Math.max(0, limit - count) };

// and if Redis itself is unreachable:
catch { return { allowed: true, remaining: limit }; }  // FAIL OPEN`}</CodeBlock>

        <P>
          The decision hiding in that last line is fail-open versus fail-closed, and
          it&apos;s a real fork. A fail-closed limiter, the instant its own store
          stutters, freezes every team&apos;s agents mid-task — it converts a
          dependency blip into a total outage of the one thing the server exists to
          provide. For a coordination substrate agents lean on to make progress, a few
          seconds of unmetered traffic is a rounding error; a few seconds of everyone
          frozen is precisely the failure you were trying to prevent. So it fails open.
          A payments system would choose the exact opposite, and be right to — the
          lesson is that &ldquo;fail open or closed&rdquo; is a product question wearing
          an infrastructure costume, and you should answer it on purpose.
        </P>

        <P>
          The counter is keyed by <Code>teamId</Code>, which is the same reason
          attribution came for free: the thing that meters you is the thing that
          isolates you.
        </P>

        <H2>The key that mints keys</H2>

        <P>
          Once keys can be created at runtime, an escalation opens up: could a team use
          its own key to mint keys for other teams, or spin up unlimited free
          identities? The guard is one flag from <Code>resolveKey</Code>. Provisioning
          a brand-new team is allowed only from a static env key — the ones only the
          operator controls — never from a dynamic key issued to a caller:
        </P>

        <CodeBlock>{`// POST /admin/keys/provision  (the dashboard calls this on signup)
if (!keyCtx.isStatic)
  return c.json({ error: "Only static env keys may provision new teams" }, 403);`}</CodeBlock>

        <P>
          So the operator, holding a static master key server-side, can hand every new
          signup its own isolated team, while a caller&apos;s own dynamic key can
          manage its team&apos;s rooms and keys all day but can never bootstrap a new
          tenant. One boolean draws the line between self-serve signup and privilege
          escalation, and it costs a single <Code>if</Code>.
        </P>

        <H2>What this version doesn&apos;t do</H2>

        <P>
          The honest edges. Ownership is single-team, so there&apos;s no shared room
          across tenants and no transferring a room to another team. The rate limiter
          is a fixed window, so a burst straddling two windows can briefly exceed the
          nominal limit — fine at current load, worth swapping for a sliding window
          before anyone treats it as a hard billing boundary. And identity lives behind
          the bearer secret, so rotating a leaked key means issuing a new one and
          revoking the old (dynamic keys support revoke; static keys are managed in the
          environment). None of these dents the isolation guarantee; they&apos;re the
          gap between &ldquo;multi-tenant&rdquo; and &ldquo;multi-tenant with every
          enterprise knob.&rdquo;
        </P>

        <P>
          The thread running through all of it is that isolation here is naming
          discipline, not machinery. One string decides what a request can see, one
          atomic write decides who owns a room, one boolean decides who can mint
          identities. There&apos;s no auth service to secure and no schema to migrate
          because there is almost nothing there — and for a system one person keeps
          running, the best security surface is the one small enough to hold in your
          head.
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

        <SeriesFooter here="multi-tenant-one-redis" />
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
  { slug: "room-protocol", label: "Coordinating agents through shared state", note: "the idea" },
  { slug: "concurrency-control", label: "Concurrency control for a shared plan", note: "locks and cursors" },
  { slug: "stateless-single-redis", label: "A stateless server on a single Redis", note: "architecture" },
  { slug: "typed-context", label: "Typed context over prose and vector search", note: "context model" },
  { slug: "mcp-as-transport", label: "MCP as transport", note: "protocol layer" },
  { slug: "multi-tenant-one-redis", label: "Multi-tenancy on one Redis", note: "isolation and access" },
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
