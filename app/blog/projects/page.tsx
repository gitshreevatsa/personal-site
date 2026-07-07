import type { Metadata } from "next";
import Link from "next/link";
import { PROJECT_POSTS, PostList } from "../posts";

export const metadata: Metadata = {
  title: "projects",
  description: "Standalone builds, written up end to end — vector search, on-chain analytics, developer tooling.",
};

export default function ProjectsIndex() {
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
        <span>projects</span>
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
          projects
        </h1>
        <p style={{ color: "#555", fontSize: 13, marginBottom: 56 }}>
          things I&apos;ve built, written up end to end.
        </p>

        <PostList posts={PROJECT_POSTS} />
      </div>
    </div>
  );
}
