"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Matrix Background (with mouse-hover spotlight) ──────────────────────────

const BG_CHARS = "0123456789";

function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const FS = 13;
    type Cell = { char: string; opacity: number; ttl: number };
    let cells: Cell[][] = [];
    let cols = 0;
    let rows = 0;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(window.innerWidth / FS);
      rows = Math.floor(window.innerHeight / FS);
      cells = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({
          char:
            Math.random() > 0.32
              ? BG_CHARS[Math.floor(Math.random() * BG_CHARS.length)]
              : " ",
          opacity: Math.random() * 0.1 + 0.02,
          ttl: (Math.random() * 80 + 20) | 0,
        })),
      );
    };

    const render = () => {
      const { x: mx, y: my } = mouseRef.current;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FS}px monospace`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = cells[r][c];
          cell.ttl--;
          if (cell.ttl <= 0) {
            cell.char =
              Math.random() > 0.32
                ? BG_CHARS[Math.floor(Math.random() * BG_CHARS.length)]
                : " ";
            cell.opacity = Math.random() * 0.1 + 0.02;
            cell.ttl = (Math.random() * 80 + 20) | 0;
          }
          if (cell.char !== " ") {
            const cx = c * FS + FS / 2;
            const cy = r * FS;
            const dist = Math.sqrt((cx - mx) ** 2 + (cy - my) ** 2);
            const spotlight = Math.max(0, 1 - dist / 280);
            const op = cell.opacity + spotlight * 0.28;
            ctx.fillStyle = `rgba(220,220,220,${Math.min(op, 0.38)})`;
            ctx.fillText(cell.char, c * FS, (r + 1) * FS);
          }
        }
      }
    };

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    init();
    const id = setInterval(render, 80);
    window.addEventListener("resize", init);
    window.addEventListener("mousemove", onMouse);

    return () => {
      clearInterval(id);
      window.removeEventListener("resize", init);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}

// ─── Animated Email ──────────────────────────────────────────────────────────

const EMAIL_USER = "shreyaspadmakiran";
const EMAIL_DOMAIN = "@gmail.com";

function AnimatedEmail({ cycleIdx }: { cycleIdx: number }) {
  const [displayed, setDisplayed] = useState(EMAIL_USER);

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(EMAIL_USER.slice(0, i));
      if (i >= EMAIL_USER.length) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [cycleIdx]);

  return (
    <a
      href={`mailto:${EMAIL_USER}${EMAIL_DOMAIN}`}
      style={{
        color: "#555",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        gap: 0,
      }}
    >
      <span style={{ color: "#888", display: "inline-block" }}>
        {displayed}
      </span>
      <span style={{ color: "#555" }}>{EMAIL_DOMAIN}</span>
    </a>
  );
}

// ─── Hero Tagline ────────────────────────────────────────────────────────────

const TAGLINES = [
  "i know how to get things done.",
  "an engineer.",
  "a builder.",
  "a prompter.",
  "i ship things.",
  "i make it work.",
  "a solutions engineer.",
];

function HeroTagline({ cycleIdx }: { cycleIdx: number }) {
  const suffix = TAGLINES[cycleIdx % TAGLINES.length];
  const [displayed, setDisplayed] = useState(suffix);

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(suffix.slice(0, i));
      if (i >= suffix.length) clearInterval(id);
    }, 120);
    return () => clearInterval(id);
  }, [suffix]);

  return (
    <p
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "clamp(17px, 2.4vw, 30px)",
        fontWeight: 400,
        color: "#e8e8e8",
        textAlign: "center",
        lineHeight: 1.5,
        letterSpacing: "-0.01em",
      }}
    >
      {"hi, i'm "}
      <span
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: "1.08em",
        }}
      >
        shreyas
      </span>
      {", "}
      {displayed}
    </p>
  );
}

// ─── Experience Panel ────────────────────────────────────────────────────────

const JOBS = [
  {
    title: "Solutions Engineer & Developer Relations",
    company: "Sei Development Foundation",
    period: "Jun 2025 – Apr 2026",
    type: "Full-time",
    description:
      "Owned the technical win across 10+ enterprise and protocol sales cycles. Led consultative discovery, designed custom solution architectures, ran proof-of-concepts, and conducted security reviews with CTOs. Built reference implementation library adopted as the standard onboarding resource — 600% developer engagement growth (Electric Capital).",
    tags: [
      "TypeScript",
      "Solidity",
      "LayerZero",
      "Wormhole",
      "Hardhat",
      "Foundry",
      "BullMQ",
      "Redis",
    ],
  },
  {
    title: "Developer Relations Engineer",
    company: "=nil; Foundation",
    period: "Apr 2024 – Jun 2025",
    type: "Full-time",
    description:
      "Owned end-to-end technical relationships for enterprise teams integrating with a complex distributed protocol — initial scoping through production deployment. Conducted discovery calls, responded to technical questionnaires, and contributed to SDKs and demo apps for the developer ecosystem.",
    tags: ["TypeScript", "zkSharding", "Zero-Knowledge Proofs", "SDK Dev"],
  },
  {
    title: "Lead Backend Engineer",
    company: "Chaidex",
    period: "Sep 2022 – Apr 2024",
    type: "Full-time",
    description:
      "Designed and built the entire production backend from scratch — microservices, REST APIs, WebSocket feeds, event-driven pipelines, and a low-latency order matching engine. Took the system from prototype to live production solo. At peak handled $50k+ in active liquidity with institutional market makers and no cascading failures under real load.",
    tags: [
      "TypeScript",
      "Solidity",
      "WebSocket",
      "REST APIs",
      "Docker",
      "Oracles",
      "DeFi",
    ],
  },
  {
    title: "Contractor, Lead Product Engineer",
    company: "QuillAI Network",
    period: "2022",
    type: "Contract",
    description:
      "Built QuillCheck from scratch — flagship DeFi token risk analysis platform with honeypot detection, liquidity assessment, ownership analysis, and holder risk scoring across 10+ EVM chains. Sole engineer from zero to 10,000 users; designed the public REST API consumed by third-party integrators.",
    tags: ["TypeScript", "Solidity", "REST APIs", "DeFi", "EVM"],
  },
];

function ExperiencePanel({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20,
        background: "rgba(8,8,8,0.97)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "64px 24px 96px",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(36px, 5vw, 56px)",
          color: "#e8e8e8",
          marginBottom: 52,
          textDecoration: "underline",
          textUnderlineOffset: 8,
          textDecorationColor: "#333",
        }}
      >
        Experience
      </h2>

      <div
        style={{
          width: "100%",
          maxWidth: 880,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {JOBS.map((job, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 20,
              marginBottom: i < JOBS.length - 1 ? 32 : 0,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 6,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: "#161616",
                  border: "1px solid #2a2a2a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: 8, height: 8, background: "#444" }} />
              </div>
              {i < JOBS.length - 1 && (
                <div
                  style={{
                    width: 1,
                    flex: 1,
                    background: "#1e1e1e",
                    minHeight: 40,
                    marginTop: 4,
                  }}
                />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  border: "1px solid #1e1e1e",
                  padding: "20px 24px",
                  background: "#0d0d0d",
                  marginBottom: 12,
                }}
              >
                <p style={{ color: "#e0e0e0", fontSize: 14, marginBottom: 6 }}>
                  {job.title} <span style={{ color: "#555" }}>@</span>{" "}
                  <span style={{ color: "#ccc" }}>{job.company}</span>
                </p>
                <p style={{ color: "#555", fontSize: 12, marginBottom: 16 }}>
                  {job.type} · {job.period}
                </p>
                <p style={{ color: "#777", fontSize: 12, lineHeight: 1.85 }}>
                  {job.description}
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      border: "1px solid #252525",
                      color: "#555",
                      fontSize: 11,
                      padding: "4px 10px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <CloseButton onClose={onClose} />
    </div>
  );
}

// ─── About Panel (0x) ────────────────────────────────────────────────────────

function AboutPanel({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20,
        background: "rgba(8,8,8,0.97)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 24px 96px",
      }}
    >
      <div style={{ maxWidth: 560, width: "100%" }}>
        <p style={{ color: "#e0e0e0", fontSize: 15, marginBottom: 6 }}>
          Shreyas Padmakiran
        </p>
        <p style={{ color: "#444", fontSize: 12, marginBottom: 36 }}>
          Systems &amp; Solutions Engineer
        </p>

        <p
          style={{
            color: "#666",
            fontSize: 12,
            lineHeight: 2,
            marginBottom: 48,
          }}
        >
          I specialize in designing and scaling production-grade infrastructure
          for high-concurrency environments. With 3+ years of experience, I
          focus on building robust distributed systems where security, data
          integrity, and low-latency integrations are non-negotiable.
        </p>

        <p style={{ color: "#555", fontSize: 12, marginBottom: 20 }}>
          Core Competencies:
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 48,
          }}
        >
          {[
            [
              "Architecture Design",
              "Transforming complex requirements into scalable system blueprints.",
            ],
            [
              "Production Infrastructure",
              "Deploying and maintaining high-availability backend systems.",
            ],
            [
              "Integration Engineering",
              "Making heterogeneous systems talk to each other without friction.",
            ],
            [
              "Solutions Management",
              "Concurrently unblocking 20+ engineering teams, navigating technical bottlenecks from architecture review to mainnet deployment.",
            ],
          ].map(([title, body]) => (
            <p
              key={title}
              style={{ color: "#555", fontSize: 12, lineHeight: 1.8 }}
            >
              <span style={{ color: "#777" }}>{title}:</span> {body}
            </p>
          ))}
        </div>

        <p style={{ color: "#555", fontSize: 12, marginBottom: 20 }}>
          Proven Impact:
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 48,
          }}
        >
          {[
            [
              "Scale",
              "Built and managed systems supporting 10,000+ active users.",
            ],
            [
              "Delivery",
              "Orchestrated production launches for 20+ concurrent teams, ensuring stability at scale.",
            ],
            [
              "Performance",
              "Optimized developer ecosystems resulting in 600% growth.",
            ],
            [
              "Reliability",
              "Engineered financial systems handling $50k+ in active liquidity with no cascading failures under real load.",
            ],
          ].map(([label, body]) => (
            <p
              key={label}
              style={{ color: "#555", fontSize: 12, lineHeight: 1.8 }}
            >
              <span style={{ color: "#777" }}>{label}:</span> {body}
            </p>
          ))}
        </div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            ["github", "https://github.com/gitshreevatsa"],
            ["linkedin", "https://linkedin.com/in/shreyas-padmakiran"],
            ["x", "https://x.com/sakai_thezkguy"],
            ["email", "mailto:shreyaspadmakiran@gmail.com"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              style={{
                color: "#444",
                fontSize: 12,
                textDecoration: "underline",
                textUnderlineOffset: 3,
                textDecorationColor: "#222",
              }}
            >
              {label} ↗
            </a>
          ))}
        </div>
      </div>

      <CloseButton onClose={onClose} />
    </div>
  );
}

// ─── Shared Close Button ─────────────────────────────────────────────────────

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      style={{
        marginTop: 52,
        border: "1px solid #2a2a2a",
        background: "transparent",
        color: "#666",
        padding: "10px 36px",
        fontSize: 13,
        cursor: "pointer",
        letterSpacing: "0.08em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#444";
        e.currentTarget.style.color = "#999";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#2a2a2a";
        e.currentTarget.style.color = "#666";
      }}
    >
      [CLOSE]
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const COMMANDS = ["exp", "resume", "0x", "blog"] as const;
type Command = (typeof COMMANDS)[number];

export default function Home() {
  const [panel, setPanel] = useState<Command | null>(null);
  const [buffer, setBuffer] = useState("");
  const [cycleIdx, setCycleIdx] = useState(0);

  // Single timer drives both email prefix and tagline in sync
  useEffect(() => {
    const id = setInterval(() => setCycleIdx((p) => p + 1), 6500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (panel) return;
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") {
        setBuffer("");
        return;
      }
      if (e.key === "Backspace") {
        setBuffer((p) => p.slice(0, -1));
        return;
      }
      if (e.key.length !== 1) return;
      setBuffer((prev) => {
        const next = (prev + e.key).toLowerCase();
        if ((COMMANDS as readonly string[]).includes(next)) {
          setTimeout(() => {
            setPanel(next as Command);
            setBuffer("");
          }, 80);
          return next;
        }
        if (!COMMANDS.some((cmd) => cmd.startsWith(next)))
          return e.key.toLowerCase();
        return next;
      });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [panel]);

  useEffect(() => {
    if (panel === "resume") {
      window.open("/resume", "_blank");
      setPanel(null);
    }
    if (panel === "blog") {
      window.location.href = "/blog";
      setPanel(null);
    }
  }, [panel]);

  const closePanel = useCallback(() => setPanel(null), []);

  return (
    <>
      <MatrixBackground />

      {/* Crawlable, screen-reader-only identity for SEO. Visually hidden. */}
      <header
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        <h1>Shreyas Padmakiran</h1>
        <p>
          Shreyas Padmakiran is a software, systems and solutions engineer based
          in Bangalore, India. He builds production-grade distributed systems,
          backend infrastructure, and developer tooling. Explore his experience,
          resume, and writing.
        </p>
      </header>

      {/* Main UI — fixed so the canvas bg is unobstructed */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          pointerEvents: "none",
        }}
      >
        {/* Top-left name card */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            pointerEvents: "auto",
          }}
        >
          <div
            className="name-card"
            style={{
              background: "rgba(14,14,14,0.88)",
              border: "1px solid #1e1e1e",
              backdropFilter: "blur(6px)",
              padding: "8px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <a
              href="/who"
              style={{
                color: "#ccc",
                fontSize: 13,
                textDecoration: "none",
                cursor: "pointer",
                borderBottom: "1px solid transparent",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderBottomColor = "#444";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderBottomColor = "transparent";
                e.currentTarget.style.color = "#ccc";
              }}
            >
              shreyaspadmakiran
            </a>
            <span className="divider" style={{ color: "#2a2a2a" }}>
              |
            </span>
            <AnimatedEmail cycleIdx={cycleIdx} />
          </div>
        </div>

        {/* Center hero */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 32px",
          }}
        >
          <HeroTagline cycleIdx={cycleIdx} />
        </div>

        {/* Social cards — sitting above the status bar */}
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "0 24px",
            paddingBottom: "calc(38px + 28px)", // status bar + gap
            pointerEvents: "auto",
          }}
        >
          {[
            {
              label: "github",
              sub: "the code place",
              href: "https://github.com/gitshreevatsa",
            },
            {
              label: "linkedin",
              sub: "the brag place",
              href: "https://linkedin.com/in/shreyas-padmakiran",
            },
            {
              label: "x",
              sub: "the rant place",
              href: "https://x.com/sakai_thezkguy",
            },
          ].map((card) => (
            <a
              key={card.label}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                border: "1px solid #1a1a1a",
                padding: "20px 22px",
                background: "rgba(12,12,12,0.75)",
                backdropFilter: "blur(4px)",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#2e2e2e")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#1a1a1a")
              }
            >
              <span style={{ color: "#3a3a3a", fontSize: 12 }}>{">"}_</span>
              <span style={{ color: "#e0e0e0", fontSize: 16, fontWeight: 500 }}>
                {card.label}
              </span>
              <span
                style={{
                  color: "#4a4a4a",
                  fontSize: 12,
                  fontStyle: "italic",
                  fontFamily: "var(--font-serif)",
                }}
              >
                {card.sub}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Buffer display — floats above the status bar when typing */}
      {buffer && (
        <div
          style={{
            position: "fixed",
            bottom: 38 + 10,
            left: 0,
            right: 0,
            zIndex: 6,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              background: "rgba(8,8,8,0.92)",
              border: "1px solid #1e1e1e",
              padding: "4px 10px",
              color: "#777",
              fontSize: 12,
              backdropFilter: "blur(4px)",
            }}
          >
            $ {buffer}
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 12,
                background: "#666",
                marginLeft: 2,
                verticalAlign: "middle",
                animation: "blink 1s step-end infinite",
              }}
            />
          </span>
        </div>
      )}

      {/* Status bar — explicit slots; typed commands still work for power users */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          height: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 16px",
          background: "rgba(8,8,8,0.92)",
          borderTop: "1px solid #161616",
          backdropFilter: "blur(4px)",
        }}
      >
        {[
          { cmd: "exp", onClick: () => setPanel("exp") },
          {
            cmd: "resume",
            onClick: () => window.open("/resume", "_blank"),
          },
          { cmd: "blog", onClick: () => (window.location.href = "/blog") },
          { cmd: "0x", onClick: () => setPanel("0x") },
        ].map(({ cmd, onClick }) => (
          <button
            key={cmd}
            onClick={onClick}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#333",
              fontSize: 12,
              padding: 0,
            }}
          >
            [
            <span style={{ color: "#555" }}>
              <span className="hint-desktop">type </span>
            </span>
            <span style={{ color: "#777" }}>&apos;{cmd}&apos;</span>]
          </button>
        ))}
      </div>

      {panel === "exp" && <ExperiencePanel onClose={closePanel} />}
      {panel === "0x" && <AboutPanel onClose={closePanel} />}
    </>
  );
}
