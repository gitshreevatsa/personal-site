import type { Metadata } from "next";
import Link from "next/link";
import { ROOMD_POSTS, PostList } from "../posts";

export const metadata: Metadata = {
  title: "roomd.sh — the Room Protocol",
  description:
    "A coordination layer for multiple AI coding agents: shared, structured state over MCP instead of a group chat. Design deep-dives on how roomd works and why.",
};

export default function RoomdIndex() {
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
        <Link href="/" style={{ color: "#555" }}>
          ← back
        </Link>
        <span>/</span>
        <Link href="/blog" style={{ color: "#555" }}>
          blog
        </Link>
        <span>/</span>
        <span>roomd</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "72px 32px 120px" }}>
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
          the Room Protocol
        </p>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(32px, 5vw, 52px)",
            color: "#e8e8e8",
            marginBottom: 20,
            lineHeight: 1.2,
          }}
        >
          roomd.sh
        </h1>
        <p style={{ color: "#888", fontSize: 14, lineHeight: 1.85, marginBottom: 16 }}>
          When two coding agents work on one project, coordination becomes the
          bottleneck. The usual fixes — a human relaying state, agents chatting, a
          shared repo — all treat coordination as message-passing. roomd treats it as
          shared state instead: one durable, structured, queryable{" "}
          <em>room</em> that agents read and write, exposed over MCP and backed by a
          stateless server on a single Redis.
        </p>
        <p style={{ color: "#5a5a5a", fontSize: 13, lineHeight: 1.8, marginBottom: 52 }}>
          This series is the thinking behind it, one subsystem at a time — read top to
          bottom or jump in anywhere.
        </p>

        <PostList posts={ROOMD_POSTS} />
      </div>
    </div>
  );
}
