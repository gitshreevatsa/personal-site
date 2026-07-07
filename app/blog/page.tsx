import type { Metadata } from "next";
import Link from "next/link";
import { ROOMD_POSTS, PROJECT_POSTS, SE_POSTS } from "./posts";

export const metadata: Metadata = {
  title: "blog",
  description: "Notes on building. The Room Protocol, projects, and solutions engineering.",
};

const CATEGORIES = [
  {
    href: "/blog/roomd",
    name: "roomd.sh",
    tagline: "the Room Protocol",
    desc: "A coordination layer for multiple AI coding agents — shared state, not a group chat. Design deep-dives on how roomd works and why.",
    count: ROOMD_POSTS.length,
  },
  {
    href: "/blog/projects",
    name: "projects",
    tagline: "things I've built",
    desc: "Standalone builds, written up end to end — vector search, on-chain analytics, developer tooling.",
    count: PROJECT_POSTS.length,
  },
  {
    href: "/blog/solutions-engineering",
    name: "solutions engineering",
    tagline: "notes from the field",
    desc: "Lessons from customer-facing engineering — discovery, integrations, and getting things to production.",
    count: SE_POSTS.length,
  },
];

export default function BlogIndex() {
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
        <span>blog</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "72px 32px 120px" }}>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(32px, 5vw, 52px)",
            color: "#e8e8e8",
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          blog
        </h1>
        <p style={{ color: "#555", fontSize: 13, marginBottom: 56 }}>
          notes on building. mostly technical. occasionally not.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="cat-card"
              style={{
                display: "block",
                padding: "22px 24px",
                border: "1px solid #1a1a1a",
                background: "rgba(12,12,12,0.6)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                <span style={{ color: "#e0e0e0", fontSize: 17, fontWeight: 500 }}>{cat.name}</span>
                <span style={{ color: "#444", fontSize: 11, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                  {cat.count > 0 ? `${cat.count} post${cat.count === 1 ? "" : "s"}` : "coming soon"}
                </span>
              </div>
              <p
                style={{
                  color: "#5a5a5a",
                  fontSize: 12,
                  fontStyle: "italic",
                  fontFamily: "var(--font-serif)",
                  marginBottom: 10,
                }}
              >
                {cat.tagline}
              </p>
              <p style={{ color: "#666", fontSize: 13, lineHeight: 1.7 }}>{cat.desc}</p>
              <span style={{ display: "inline-block", marginTop: 14, color: "#555", fontSize: 12 }}>
                {cat.count > 0 ? "enter →" : "→"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
