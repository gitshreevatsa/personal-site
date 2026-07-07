import Link from "next/link";

export interface PostMeta {
  slug: string;
  title: string;
  blurb: string;
  date: string;
  readTime: string;
}

// ── roomd.sh — the Room Protocol series (reading order) ──
export const ROOMD_POSTS: PostMeta[] = [
  {
    slug: "room-protocol",
    title: "Coordinating coding agents through shared state, not messages",
    blurb:
      "Agents don’t need a group chat, they need a shared room. Building roomd: a stateless MCP server that lets multiple coding agents coordinate through shared state instead of messages.",
    date: "Jun 2026",
    readTime: "13 min read",
  },
  {
    slug: "concurrency-control",
    title: "Concurrency control for a shared plan: distributed locks and per-agent cursors",
    blurb:
      "Keeping shared state consistent under concurrent agents: a Redis distributed lock over transactions, CAS, and CRDTs; per-agent cursors for exactly-once events; and TTL presence instead of connection tracking — tradeoffs spelled out.",
    date: "Jun 2026",
    readTime: "12 min read",
  },
  {
    slug: "stateless-single-redis",
    title: "A stateless MCP server on a single Redis",
    blurb:
      "Why roomd is a fully stateless server on a single Redis, over the reflex stack of app server plus Postgres plus cache plus session store: statelessness, TTL-as-cleanup, Upstash-over-HTTP, and where the bet bites.",
    date: "Jun 2026",
    readTime: "11 min read",
  },
  {
    slug: "typed-context",
    title: "Typed context: structured artifacts over prose and vector search",
    blurb:
      "Why agents share typed, structured context with per-type schemas instead of prose or a vector store: shape at write time beats parsing at read time, and exact retrieval beats fuzzy retrieval when correctness is non-negotiable.",
    date: "Jun 2026",
    readTime: "10 min read",
  },
  {
    slug: "mcp-as-transport",
    title: "MCP as transport: stateless HTTP over long-lived SSE",
    blurb:
      "Why the protocol rides on MCP instead of a custom SDK or REST, why the transport is stateless streamable HTTP over long-lived SSE, and how the tool surface is designed as the protocol’s real UX.",
    date: "Jun 2026",
    readTime: "10 min read",
  },
  {
    slug: "multi-tenant-one-redis",
    title: "Multi-tenancy on one Redis, no auth server",
    blurb:
      "How roomd keeps teams’ rooms completely isolated with three bearer-key types resolving to one teamId, first-touch room ownership via SET NX, and fail-open rate limiting — no relational database, no auth service, no membership tables.",
    date: "Jul 2026",
    readTime: "11 min read",
  },
];

// ── projects — standalone builds ────────────────────────
export const PROJECT_POSTS: PostMeta[] = [
  {
    slug: "vector-search",
    title: "How machines learn to search by meaning",
    blurb:
      "A connected walk from the problem with keyword search all the way to how production systems compress a billion vectors into memory — each idea building on the last.",
    date: "May 2026",
    readTime: "15 min read",
  },
  {
    slug: "oss-burnout-radar",
    title: "OSS Burnout Radar: a vitals monitor for the npm packages you depend on",
    blurb:
      "A tool that watches the maintainers, not the popularity contest. Ten signals, one score, citations behind every signal.",
    date: "May 2026",
    readTime: "12 min read",
  },
  {
    slug: "pacifica-nexus",
    title: "Pacifica Nexus: an actionable analytics terminal for on-chain perps",
    blurb:
      "A trading workstation for the Pacifica perp DEX on Solana. Funding-rate arb, auto de-risk, encrypted agent-key vault, and a two-layer kill switch.",
    date: "May 2026",
    readTime: "14 min read",
  },
  {
    slug: "wallet-stack",
    title: "The EVM wallet stack, explained for builders",
    blurb:
      "A field guide from raw window.ethereum calls to production wagmi v2.",
    date: "May 2026",
    readTime: "20 min read",
  },
];

// ── solutions engineering — placeholder, more coming ────
export const SE_POSTS: PostMeta[] = [];

/** Shared list renderer used by every category page. */
export function PostList({ posts }: { posts: PostMeta[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {posts.map((post, i) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          style={{
            display: "block",
            padding: "24px 0",
            borderTop: i === 0 ? "1px solid #161616" : "none",
            borderBottom: "1px solid #161616",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <p style={{ color: "#e0e0e0", fontSize: 15, marginBottom: 8 }}>{post.title}</p>
          <p style={{ color: "#666", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
            {post.blurb}
          </p>
          <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#444", letterSpacing: "0.04em" }}>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
