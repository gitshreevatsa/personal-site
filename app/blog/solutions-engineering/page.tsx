import type { Metadata } from "next";
import Link from "next/link";
import { SE_POSTS, PostList } from "../posts";

export const metadata: Metadata = {
  title: "solutions engineering",
  description: "Lessons from customer-facing engineering — discovery, integrations, and getting things to production.",
};

export default function SolutionsEngineeringIndex() {
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
        <span>solutions engineering</span>
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
          solutions engineering
        </h1>
        <p style={{ color: "#555", fontSize: 13, marginBottom: 56 }}>
          notes from the field — discovery, integrations, and getting things to production.
        </p>

        {SE_POSTS.length > 0 ? (
          <PostList posts={SE_POSTS} />
        ) : (
          <div
            style={{
              border: "1px solid #161616",
              borderRadius: 10,
              background: "#0d0d0d",
              padding: "40px 28px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#888", fontSize: 14, marginBottom: 8 }}>Coming soon.</p>
            <p style={{ color: "#555", fontSize: 13, lineHeight: 1.7 }}>
              Writing this one up from scratch — the parts of customer-facing engineering
              that don&apos;t make it into a spec. Check back.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
