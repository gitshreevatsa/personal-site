import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title:
    "How machines learn to search by meaning — vector search, a beginner's guide — shreyas padmakiran",
  description:
    "A connected walk from the problem with keyword search all the way to how production systems compress a billion vectors into memory — each idea building on the last.",
};

// Dense vs sparse bar chart data
const denseData = [
  0.23, -0.81, 0.44, -0.12, 0.67, 0.31, -0.55, 0.18, 0.72, -0.38, 0.51,
  -0.29, 0.44, -0.63, 0.19,
];
const sparseData = [0, 0, 0.8, 0, 0, 0, 0, 0.6, 0, 0, 0.5, 0, 0, 0, 0];
const BAR_W = 18;
const BAR_GAP = 3;
const MAX_H = 55;

export default function VectorSearchPost() {
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
        <span>vector-search</span>
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
          Vector search · A beginner&apos;s guide
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
          How machines learn to search by meaning
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
          A connected walk from the problem with keyword search all the way to
          how production systems compress a billion vectors into memory — each
          idea building on the last.
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
          <span>15 min read</span>
          <span>·</span>
          <span>shreyaspadmakiran.com</span>
        </div>

        <P>
          Search is a solved problem — until you try to search for what
          something <em>means</em> rather than what it literally says. This post
          walks through why keyword search breaks, what embeddings are and why
          they work, how production systems find the right vector among a billion
          of them in milliseconds, and how a language model gets connected to all
          of it so it can reason over data it was never trained on. Each idea is
          motivated by the problem the one before it left unsolved — so by the
          end, the whole stack makes sense as a chain of decisions rather than a
          list of components to memorise.
        </P>

        {/* ── ACT I ─────────────────────────────────────── */}
        <ActLabel>Act I — The problem and the idea</ActLabel>

        <H2>Start with a broken search</H2>

        <P>
          Imagine you&apos;re building a recipe app. A user types: &ldquo;something
          light for a hot day.&rdquo; Your search engine returns nothing. Not because
          the recipes don&apos;t exist — you have gazpacho, salads, smoothies — but
          because none of them literally contain those words in their title.
        </P>

        <P>
          This is keyword search&apos;s core failure. It matches strings, not intent.
          It finds what you typed, not what you meant. And for most real-world
          queries — natural language, synonyms, paraphrases, multilingual input
          — what you typed and what you meant are not the same thing.
        </P>

        <P>
          Vector search asks a different question: what if, instead of comparing
          words, we compared meaning?
        </P>

        <Bridge>
          To compare meaning, you first need a way to represent it numerically —
          something a computer can actually work with. That&apos;s what an embedding
          is.
        </Bridge>

        <H2>Meaning as a point in space</H2>

        <P>
          An embedding is a list of numbers — typically hundreds or thousands of
          them — that represents a piece of content. Not the words themselves,
          but the meaning behind them. These numbers come from a machine learning
          model trained on massive amounts of text. Through that training, the
          model learns to place similar things near each other in this numerical
          space.
        </P>

        <P>
          The model doesn&apos;t store words — it stores positions in a high-dimensional
          space, and position encodes meaning. &ldquo;The dog chased the ball&rdquo; lands
          near &ldquo;the puppy ran after the toy&rdquo; even though they share zero words.
          Searching by meaning becomes searching by proximity.
        </P>

        <P>
          Two families of vectors exist, and each does something the other
          can&apos;t.
        </P>

        {/* DIAGRAM 1 */}
        <figure
          style={{
            border: "1px solid #161616",
            borderRadius: 10,
            padding: "20px 20px 14px",
            margin: "28px 0",
            background: "#0d0d0d",
          }}
        >
          <svg
            width="100%"
            viewBox="0 0 640 200"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Embedding space showing semantic proximity</title>
            <desc>
              Cat and kitten are plotted close together. Automobile is plotted
              far away. Distances encode meaning.
            </desc>
            {/* cat */}
            <circle
              cx="170"
              cy="115"
              r="30"
              fill="#1e1c36"
              stroke="#534AB7"
              strokeWidth="0.5"
            />
            <text
              x="170"
              y="115"
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                fill: "#CECBF6",
              }}
            >
              cat
            </text>
            {/* kitten */}
            <circle
              cx="258"
              cy="86"
              r="30"
              fill="#1e1c36"
              stroke="#534AB7"
              strokeWidth="0.5"
            />
            <text
              x="258"
              y="86"
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                fill: "#CECBF6",
              }}
            >
              kitten
            </text>
            {/* close line */}
            <line
              x1="200"
              y1="108"
              x2="228"
              y2="97"
              stroke="#444"
              strokeWidth="0.5"
              strokeDasharray="3 2"
            />
            <text
              x="230"
              y="145"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 12,
                fill: "#555",
              }}
            >
              close
            </text>
            {/* automobile */}
            <circle
              cx="490"
              cy="130"
              r="36"
              fill="#1a1916"
              stroke="#555"
              strokeWidth="0.5"
            />
            <text
              x="490"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                fill: "#888",
              }}
            >
              <tspan x="490" y="124">auto-</tspan>
              <tspan x="490" y="139">mobile</tspan>
            </text>
            {/* far line */}
            <line
              x1="288"
              y1="97"
              x2="460"
              y2="122"
              stroke="#2a2a28"
              strokeWidth="0.5"
              strokeDasharray="4 3"
            />
            <text
              x="374"
              y="97"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 12,
                fill: "#444",
              }}
            >
              far apart
            </text>
            <text
              x="220"
              y="175"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 12,
                fill: "#555",
              }}
            >
              &quot;the dog chased the ball&quot; lands near &quot;the puppy ran
              after the toy&quot;
            </text>
            <text
              x="220"
              y="190"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 12,
                fill: "#444",
              }}
            >
              even though they share zero words
            </text>
          </svg>
          <figcaption
            style={{
              fontSize: 12,
              color: "#555",
              textAlign: "center",
              marginTop: 12,
              lineHeight: 1.5,
            }}
          >
            Distance between two points encodes semantic similarity. Zero words
            in common, but near each other because the meaning is the same.
            (Real embeddings have 384–3072 dimensions — this is a 2D slice.)
          </figcaption>
        </figure>

        <Bridge>
          Dense vectors capture meaning. But there&apos;s a whole class of queries
          where meaning isn&apos;t enough — where the exact word matters. That&apos;s
          where sparse vectors come in.
        </Bridge>

        <H2>Two kinds of vectors, two kinds of knowledge</H2>

        <P>
          A dense vector has a value in every one of its dimensions — hundreds
          of numbers, all contributing to a holistic representation of meaning.
          When you embed &ldquo;something light for a hot day,&rdquo; every dimension
          shifts to encode the composite of lightness, warmth, and food context.
          This is what lets it find gazpacho.
        </P>

        <P>
          A sparse vector works differently. It&apos;s mostly zeros. Only the
          dimensions that correspond to actual tokens in the text get non-zero
          values, weighted by how important each token is. For a sentence like
          &ldquo;NullPointerException at line 42,&rdquo; a sparse vector preserves the
          exact string. A dense vector might round it into a vague neighbourhood
          of &ldquo;software errors&rdquo; — losing the specificity you need.
        </P>

        <P>
          Neither is strictly better. Dense wins on meaning; sparse wins on
          exactness. In production you use both. Running them simultaneously and
          merging results — called hybrid search — is the standard approach. The
          fusion algorithm most commonly used is RRF (Reciprocal Rank Fusion):
          each document&apos;s final score comes from how well it ranks in each list,
          so documents that do well in both float to the top naturally.
        </P>

        {/* DIAGRAM 2 — JS-rendered bar chart */}
        <figure
          style={{
            border: "1px solid #161616",
            borderRadius: 10,
            padding: "20px 20px 14px",
            margin: "28px 0",
            background: "#0d0d0d",
          }}
        >
          <svg
            width="100%"
            viewBox="0 0 620 160"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Dense vs sparse vector comparison</title>
            {/* Dense group label */}
            <text
              x="100"
              y="14"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 11,
                fontWeight: 500,
                fill: "#888",
              }}
            >
              dense vector
            </text>
            {/* Dense bars */}
            {denseData.map((v, i) => {
              const x = 10 + i * (BAR_W + BAR_GAP);
              const h = Math.abs(v) * MAX_H;
              const isPos = v >= 0;
              const color = isPos ? "#534AB7" : "#E24B4A";
              return (
                <g key={i}>
                  {isPos ? (
                    <rect
                      x={x}
                      y={80 - h}
                      width={BAR_W}
                      height={h}
                      fill={color}
                      opacity={0.85}
                      rx={2}
                    />
                  ) : (
                    <rect
                      x={x}
                      y={80}
                      width={BAR_W}
                      height={h}
                      fill={color}
                      opacity={0.75}
                      rx={2}
                    />
                  )}
                </g>
              );
            })}
            {/* baseline for dense */}
            <line
              x1="10"
              y1="80"
              x2="320"
              y2="80"
              stroke="#222"
              strokeWidth="0.5"
            />
            {/* Dense caption */}
            <text
              x="100"
              y="150"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 10,
                fill: "#555",
              }}
            >
              all dims have values — encodes meaning
            </text>

            {/* Sparse group label */}
            <text
              x="420"
              y="14"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 11,
                fontWeight: 500,
                fill: "#888",
              }}
            >
              sparse vector
            </text>
            {/* Sparse bars */}
            {sparseData.map((v, i) => {
              const x = 330 + i * (BAR_W + BAR_GAP);
              const h = v * MAX_H;
              const color = v !== 0 ? "#0F6E56" : "#222";
              return (
                <rect
                  key={i}
                  x={x}
                  y={80 - h}
                  width={BAR_W}
                  height={h || 2}
                  fill={color}
                  opacity={v !== 0 ? 0.9 : 0.4}
                  rx={2}
                />
              );
            })}
            {/* baseline for sparse */}
            <line
              x1="330"
              y1="80"
              x2="617"
              y2="80"
              stroke="#222"
              strokeWidth="0.5"
            />
            {/* Sparse caption */}
            <text
              x="420"
              y="150"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: 10,
                fill: "#555",
              }}
            >
              mostly zeros — preserves exact tokens
            </text>
          </svg>
          <figcaption
            style={{
              fontSize: 12,
              color: "#555",
              textAlign: "center",
              marginTop: 12,
              lineHeight: 1.5,
            }}
          >
            Dense: every dimension contributes. Sparse: only a handful of
            dimensions are non-zero. Neither is strictly better — use both.
          </figcaption>
        </figure>

        <Bridge>
          Now we have vectors that represent meaning. The next problem is scale.
          How do you find the most similar vector among a hundred million of
          them — fast?
        </Bridge>

        <Hr />

        {/* ── ACT II ────────────────────────────────────── */}
        <ActLabel>Act II — The engine</ActLabel>

        <H2>The search problem at scale</H2>

        <P>
          Finding the closest vector to a query seems straightforward: compare
          the query to every stored vector, rank by similarity, return the top
          results. This works at ten thousand vectors. At ten million, it&apos;s too
          slow. At a billion, it&apos;s completely impractical.
        </P>

        <P>
          The solution is an index — a data structure that lets you skip most
          comparisons and still find the right answer. The dominant algorithm in
          modern vector databases is HNSW: Hierarchical Navigable Small World.
        </P>

        <P>
          The intuition: imagine a multi-floor building. The top floor has
          sparse, long-range connections — highways between distant
          neighbourhoods. Lower floors have denser, local connections. When a
          query comes in, you enter at the top floor and walk greedily toward
          the query vector, using the highways to cover distance quickly. Then
          you descend to lower floors and close in on the exact neighbourhood.
          The result is approximate — you might miss the absolute nearest
          neighbour — but the miss is controlled, and you do it in logarithmic
          time instead of linear.
        </P>

        {/* DIAGRAM 3 — HNSW */}
        <figure
          style={{
            border: "1px solid #161616",
            borderRadius: 10,
            padding: "20px 20px 14px",
            margin: "28px 0",
            background: "#0d0d0d",
          }}
        >
          <svg
            width="100%"
            viewBox="0 0 640 265"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>HNSW index layers</title>
            <desc>
              Three layers. Top layer has two purple nodes with a long dashed
              highway connection. Middle layer has four teal nodes. Bottom layer
              has seven gray densely connected nodes. An amber query node Q
              enters at top right with arrows descending through the layers.
            </desc>
            <defs>
              <marker
                id="arr"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path
                  d="M2 1L8 5L2 9"
                  fill="none"
                  stroke="#BA7517"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </marker>
            </defs>
            {/* layer labels */}
            <text
              x="10"
              y="50"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#555",
              }}
            >
              layer 2
            </text>
            <text
              x="10"
              y="63"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#555",
              }}
            >
              highways
            </text>
            <text
              x="10"
              y="125"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#555",
              }}
            >
              layer 1
            </text>
            <text
              x="10"
              y="138"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#555",
              }}
            >
              local links
            </text>
            <text
              x="10"
              y="196"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#555",
              }}
            >
              layer 0
            </text>
            <text
              x="10"
              y="209"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#555",
              }}
            >
              dense graph
            </text>
            {/* layer 2 nodes */}
            <circle
              cx="200"
              cy="58"
              r="10"
              fill="#1e1c36"
              stroke="#534AB7"
              strokeWidth="0.5"
            />
            <circle
              cx="430"
              cy="52"
              r="10"
              fill="#1e1c36"
              stroke="#534AB7"
              strokeWidth="0.5"
            />
            <line
              x1="210"
              y1="57"
              x2="420"
              y2="53"
              stroke="#333"
              strokeWidth="0.5"
              strokeDasharray="5 3"
            />
            {/* layer 1 nodes */}
            <circle
              cx="160"
              cy="130"
              r="8"
              fill="#0d2117"
              stroke="#1D9E75"
              strokeWidth="0.5"
            />
            <circle
              cx="258"
              cy="122"
              r="8"
              fill="#0d2117"
              stroke="#1D9E75"
              strokeWidth="0.5"
            />
            <circle
              cx="358"
              cy="132"
              r="8"
              fill="#0d2117"
              stroke="#1D9E75"
              strokeWidth="0.5"
            />
            <circle
              cx="458"
              cy="124"
              r="8"
              fill="#0d2117"
              stroke="#1D9E75"
              strokeWidth="0.5"
            />
            <line
              x1="168"
              y1="130"
              x2="250"
              y2="124"
              stroke="#222"
              strokeWidth="0.5"
              strokeDasharray="3 2"
            />
            <line
              x1="266"
              y1="124"
              x2="350"
              y2="130"
              stroke="#222"
              strokeWidth="0.5"
              strokeDasharray="3 2"
            />
            <line
              x1="366"
              y1="130"
              x2="450"
              y2="126"
              stroke="#222"
              strokeWidth="0.5"
              strokeDasharray="3 2"
            />
            {/* layer 0 nodes */}
            {[128, 190, 252, 314, 374, 434, 490].map((cx, i) => (
              <circle
                key={i}
                cx={cx}
                cy={[200, 193, 204, 196, 206, 198, 204][i]}
                r="7"
                fill="#111110"
                stroke="#333"
                strokeWidth="0.5"
              />
            ))}
            <line
              x1="135"
              y1="200"
              x2="183"
              y2="195"
              stroke="#1c1c1a"
              strokeWidth="0.5"
            />
            <line
              x1="197"
              y1="195"
              x2="245"
              y2="202"
              stroke="#1c1c1a"
              strokeWidth="0.5"
            />
            <line
              x1="259"
              y1="202"
              x2="307"
              y2="198"
              stroke="#1c1c1a"
              strokeWidth="0.5"
            />
            <line
              x1="321"
              y1="198"
              x2="367"
              y2="204"
              stroke="#1c1c1a"
              strokeWidth="0.5"
            />
            <line
              x1="381"
              y1="204"
              x2="427"
              y2="200"
              stroke="#1c1c1a"
              strokeWidth="0.5"
            />
            <line
              x1="441"
              y1="200"
              x2="483"
              y2="202"
              stroke="#1c1c1a"
              strokeWidth="0.5"
            />
            {/* query node */}
            <circle
              cx="565"
              cy="130"
              r="14"
              fill="#201500"
              stroke="#BA7517"
              strokeWidth="0.5"
            />
            <text
              x="565"
              y="130"
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                fill: "#FAC775",
              }}
            >
              Q
            </text>
            <text
              x="565"
              y="152"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#555",
              }}
            >
              query
            </text>
            {/* descent arrows */}
            <path
              d="M552 122 L442 60"
              stroke="#BA7517"
              strokeWidth="1.5"
              markerEnd="url(#arr)"
              fill="none"
            />
            <path
              d="M553 132 L468 126"
              stroke="#BA7517"
              strokeWidth="1.5"
              markerEnd="url(#arr)"
              fill="none"
            />
            <path
              d="M553 138 L499 202"
              stroke="#BA7517"
              strokeWidth="1.5"
              markerEnd="url(#arr)"
              fill="none"
            />
            <text
              x="320"
              y="250"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#444",
              }}
            >
              enter top → walk toward Q → descend → terminate · result is
              approximate, but controllably so
            </text>
          </svg>
          <figcaption
            style={{
              fontSize: 12,
              color: "#555",
              textAlign: "center",
              marginTop: 12,
              lineHeight: 1.5,
            }}
          >
            HNSW trades a small recall hit for logarithmic search time. You
            tune how hard it searches via the{" "}
            <code
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                color: "#777",
              }}
            >
              ef
            </code>{" "}
            parameter — higher ef means better recall but slower queries.
          </figcaption>
        </figure>

        <P>
          This handles the speed problem. But speed alone isn&apos;t enough — real
          search always has conditions. Not just &ldquo;find the most similar
          vector,&rdquo; but &ldquo;find the most similar vector that also matches these
          filters.&rdquo;
        </P>

        <P>
          Most vector databases handle this badly. They either filter first
          (scan the entire filter, then search — destroying recall when the
          filter is selective) or filter after (search broadly, then discard
          non-matching results — wasting the work). The better approach is to
          weave the filter into the HNSW traversal itself, evaluating it as you
          walk the graph. One pass, no recall penalty. This is the technical
          detail that separates production-grade vector databases from toy
          implementations.
        </P>

        <Bridge>
          The index handles millions of queries at low latency. But standard
          dense retrieval compresses each document into a single vector, and
          that compression loses detail. For high-stakes retrieval, you need
          something finer-grained.
        </Bridge>

        <H2>Token-level precision: how ColBERT works</H2>

        <P>
          Standard dense search embeds an entire document into one vector. That
          single vector averages out the meaning of every sentence, paragraph,
          and phrase — the specific detail that makes a document relevant to a
          particular query often gets washed out.
        </P>

        <P>
          ColBERT takes a different approach: every token in the document gets
          its own embedding. At query time, for each query token, you find its
          maximum similarity to any token in the document. You sum these
          per-token maxima across all query tokens. The score is called MaxSim.
        </P>

        {/* DIAGRAM 4 — ColBERT MaxSim */}
        <figure
          style={{
            border: "1px solid #161616",
            borderRadius: 10,
            padding: "20px 20px 14px",
            margin: "28px 0",
            background: "#0d0d0d",
          }}
        >
          <svg
            width="100%"
            viewBox="0 0 640 200"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>ColBERT late interaction MaxSim</title>
            <desc>
              Four amber query tokens on top row. Six teal document tokens on
              bottom row. Lines of varying thickness connect each query token to
              its best-matching document token. Thicker lines mean stronger
              match.
            </desc>
            <text
              x="320"
              y="16"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#555",
              }}
            >
              query tokens
            </text>
            {/* query tokens */}
            {["cat", "food", "diet", "tips"].map((word, i) => (
              <g key={word}>
                <rect
                  x={60 + i * 108}
                  y="24"
                  width="70"
                  height="30"
                  rx="6"
                  fill="#201500"
                  stroke="#BA7517"
                  strokeWidth="0.5"
                />
                <text
                  x={95 + i * 108}
                  y="39"
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: "-apple-system, sans-serif",
                    fontSize: 12,
                    fill: "#CECBF6",
                  }}
                >
                  {word}
                </text>
              </g>
            ))}
            {/* match lines */}
            <line
              x1="95"
              y1="54"
              x2="80"
              y2="148"
              stroke="#BA7517"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.9"
            />
            <line
              x1="203"
              y1="54"
              x2="178"
              y2="148"
              stroke="#BA7517"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.85"
            />
            <line
              x1="311"
              y1="54"
              x2="374"
              y2="148"
              stroke="#BA7517"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
            <line
              x1="419"
              y1="54"
              x2="472"
              y2="148"
              stroke="#BA7517"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.4"
            />
            {/* doc tokens */}
            <text
              x="320"
              y="140"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#555",
              }}
            >
              document tokens
            </text>
            {[
              { x: 44, label: "feline" },
              { x: 142, label: "nutrition" },
              { x: 240, label: "guide" },
              { x: 338, label: "feeding" },
              { x: 436, label: "advice" },
              { x: 534, label: "health" },
            ].map(({ x, label }) => (
              <g key={label}>
                <rect
                  x={x}
                  y="148"
                  width="72"
                  height="28"
                  rx="6"
                  fill="#0d2117"
                  stroke="#1D9E75"
                  strokeWidth="0.5"
                />
                <text
                  x={x + 36}
                  y="162"
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: "-apple-system, sans-serif",
                    fontSize: 12,
                    fill: "#9FE1CB",
                  }}
                >
                  {label}
                </text>
              </g>
            ))}
            <text
              x="320"
              y="192"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#444",
              }}
            >
              line thickness = MaxSim score · &quot;cat&quot; → &quot;feline&quot; strong · &quot;diet&quot; →
              &quot;feeding&quot; moderate
            </text>
          </svg>
          <figcaption
            style={{
              fontSize: 12,
              color: "#555",
              textAlign: "center",
              marginTop: 12,
              lineHeight: 1.5,
            }}
          >
            ColBERT&apos;s MaxSim: for each query token, find the best-matching
            document token. Sum those scores. Far more precise than
            single-vector matching, at higher memory cost.
          </figcaption>
        </figure>

        <P>
          The practical pattern: use HNSW to retrieve the top 100 candidates
          cheaply, then rerank them with ColBERT for precision. You get the
          speed of approximate search and the accuracy of token-level
          comparison.
        </P>

        <P>
          At this point you have a complete retrieval engine: vectors that
          encode meaning, an index that finds them fast, filters that narrow by
          metadata, and reranking that sharpens precision. The natural question
          is: what do you do with all this retrieved content? That&apos;s where LLMs
          enter.
        </P>

        <Hr />

        {/* ── ACT III ───────────────────────────────────── */}
        <ActLabel>Act III — Production</ActLabel>

        <H2>Giving a language model memory</H2>

        <P>
          Large language models are powerful, but they have a hard boundary:
          they only know what they were trained on, and their training has a
          cutoff date. They don&apos;t know your company&apos;s internal docs, your product
          catalogue, your customers&apos; conversation history, or anything that
          happened last week.
        </P>

        <P>
          RAG — Retrieval Augmented Generation — solves this by connecting a
          language model to a vector database. Before generating a response, you
          retrieve the relevant pieces of your data and include them in the
          context window. The model doesn&apos;t need to memorise your data; it just
          needs to reason over what you hand it.
        </P>

        {/* DIAGRAM 5 — RAG pipeline */}
        <figure
          style={{
            border: "1px solid #161616",
            borderRadius: 10,
            padding: "20px 20px 14px",
            margin: "28px 0",
            background: "#0d0d0d",
          }}
        >
          <svg
            width="100%"
            viewBox="0 0 640 92"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>
              RAG pipeline: five steps from documents to grounded answer
            </title>
            <desc>
              Five boxes in sequence: data, chunk and embed, vector database,
              retrieve top-K, LLM plus context, then answer. Arrows connect
              each step.
            </desc>
            <defs>
              <marker
                id="ra"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path
                  d="M2 1L8 5L2 9"
                  fill="none"
                  stroke="#333"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </marker>
            </defs>
            {/* box 1: data */}
            <rect
              x="20"
              y="22"
              width="86"
              height="44"
              rx="8"
              fill="#111110"
              stroke="#333"
              strokeWidth="0.5"
            />
            <text
              x="63"
              y="40"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#666",
              }}
            >
              your docs
            </text>
            <text
              x="63"
              y="56"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                fill: "#888",
              }}
            >
              data
            </text>
            <line
              x1="106"
              y1="44"
              x2="124"
              y2="44"
              stroke="#333"
              strokeWidth="0.5"
              markerEnd="url(#ra)"
            />
            {/* box 2: chunk+embed */}
            <rect
              x="126"
              y="22"
              width="90"
              height="44"
              rx="8"
              fill="#0d2117"
              stroke="#1D9E75"
              strokeWidth="0.5"
            />
            <text
              x="171"
              y="40"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#5ab38a",
              }}
            >
              chunk +
            </text>
            <text
              x="171"
              y="56"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                fill: "#5ab38a",
              }}
            >
              embed
            </text>
            <line
              x1="216"
              y1="44"
              x2="234"
              y2="44"
              stroke="#333"
              strokeWidth="0.5"
              markerEnd="url(#ra)"
            />
            {/* box 3: vector db */}
            <rect
              x="236"
              y="22"
              width="90"
              height="44"
              rx="8"
              fill="#1e1c36"
              stroke="#534AB7"
              strokeWidth="0.5"
            />
            <text
              x="281"
              y="40"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#8B85E0",
              }}
            >
              vector
            </text>
            <text
              x="281"
              y="56"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                fill: "#8B85E0",
              }}
            >
              database
            </text>
            <line
              x1="326"
              y1="44"
              x2="344"
              y2="44"
              stroke="#333"
              strokeWidth="0.5"
              markerEnd="url(#ra)"
            />
            {/* box 4: retrieve */}
            <rect
              x="346"
              y="22"
              width="90"
              height="44"
              rx="8"
              fill="#201500"
              stroke="#BA7517"
              strokeWidth="0.5"
            />
            <text
              x="391"
              y="40"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#c98a2a",
              }}
            >
              retrieve
            </text>
            <text
              x="391"
              y="56"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                fill: "#c98a2a",
              }}
            >
              top-K
            </text>
            <line
              x1="436"
              y1="44"
              x2="454"
              y2="44"
              stroke="#333"
              strokeWidth="0.5"
              markerEnd="url(#ra)"
            />
            {/* box 5: LLM */}
            <rect
              x="456"
              y="22"
              width="90"
              height="44"
              rx="8"
              fill="#0d2117"
              stroke="#1D9E75"
              strokeWidth="0.5"
            />
            <text
              x="501"
              y="40"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 11,
                fill: "#5ab38a",
              }}
            >
              LLM +
            </text>
            <text
              x="501"
              y="56"
              textAnchor="middle"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                fill: "#5ab38a",
              }}
            >
              context
            </text>
            <line
              x1="546"
              y1="44"
              x2="564"
              y2="44"
              stroke="#333"
              strokeWidth="0.5"
              markerEnd="url(#ra)"
            />
            {/* box 6: answer */}
            <rect
              x="566"
              y="22"
              width="54"
              height="44"
              rx="8"
              fill="#0f1a08"
              stroke="#3B6D11"
              strokeWidth="0.5"
            />
            <text
              x="593"
              y="44"
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                fill: "#6ba84a",
              }}
            >
              answer
            </text>
          </svg>
          <figcaption
            style={{
              fontSize: 12,
              color: "#555",
              textAlign: "center",
              marginTop: 12,
              lineHeight: 1.5,
            }}
          >
            The vector database is the memory layer. Without it, the LLM
            reasons from training data. With it, it reasons from your actual
            content.
          </figcaption>
        </figure>

        <P>
          There&apos;s a step in this pipeline that most tutorials skip but that
          determines retrieval quality more than any other: chunking. Before you
          can embed a document, you have to split it into pieces. Split too
          small and you lose context. Split too large and the embedding averages
          out too much detail. Split at the wrong boundaries and you&apos;ll cleave
          a key sentence in half — and the chunk will never retrieve correctly,
          no matter how good your embedding model is.
        </P>

        <P>
          The right chunking strategy depends on your content: fixed-size chunks
          with overlap for dense prose, sentence-level splits for conversational
          content, header-based splits for structured documents. Chunking is the
          highest-leverage decision in a RAG system, and it gets the least
          attention.
        </P>

        <Bridge>
          The pipeline works. Now imagine it at production scale — a billion
          vectors. A 1536-dimensional float32 vector takes 6KB. A billion of
          them: 6TB of RAM. Something has to give. That&apos;s what quantization is
          for.
        </Bridge>

        <H2>Compressing vectors without losing what matters</H2>

        <P>
          Quantization reduces the memory footprint of stored vectors by
          representing each value with fewer bits. The tradeoff is recall: you
          trade some precision for dramatically smaller indices that fit in
          memory and search faster.
        </P>

        {/* DIAGRAM 6 — Quantization comparison table */}
        <figure
          style={{
            border: "1px solid #161616",
            borderRadius: 10,
            padding: "20px 20px 14px",
            margin: "28px 0",
            background: "#0d0d0d",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  {["Method", "How it works", "Compression", "Notes"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          fontSize: 11,
                          fontWeight: 500,
                          color: "#555",
                          borderBottom: "1px solid #1a1a1a",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    method: "Scalar (SQ)",
                    how: "float32 → int8 per dimension",
                    barW: "25%",
                    barColor: "#1D9E75",
                    notes: "4x · safe default",
                  },
                  {
                    method: "Binary (BQ)",
                    how: "each dimension → 1 bit (sign)",
                    barW: "80%",
                    barColor: "#BA7517",
                    notes: "32x · needs rescoring",
                  },
                  {
                    method: "Product (PQ)",
                    how: "split into sub-vectors → codebook",
                    barW: "100%",
                    barColor: "#E24B4A",
                    notes: "up to 64x · most lossy",
                  },
                  {
                    method: "TurboQuant",
                    how: "Hadamard rotation → 1–4 bit",
                    barW: "50%",
                    barColor: "#534AB7",
                    notes: "~2x vs SQ · similar recall",
                  },
                ].map((row) => (
                  <tr key={row.method}>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#888",
                        borderBottom: "1px solid #141414",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.method}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#555",
                        borderBottom: "1px solid #141414",
                        fontSize: 12,
                      }}
                    >
                      {row.how}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        borderBottom: "1px solid #141414",
                        minWidth: 120,
                      }}
                    >
                      <div
                        style={{
                          background: "#1a1a1a",
                          height: 6,
                          borderRadius: 3,
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            background: row.barColor,
                            height: 6,
                            borderRadius: 3,
                            width: row.barW,
                            opacity: 0.85,
                          }}
                        />
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#555",
                        borderBottom: "1px solid #141414",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figcaption
            style={{
              fontSize: 12,
              color: "#555",
              textAlign: "center",
              marginTop: 12,
              lineHeight: 1.5,
            }}
          >
            Bar = relative compression ratio. Scalar is the safe starting
            point. Binary needs oversampling and rescoring to recover recall.
            TurboQuant (2026) closes the gap between binary compression and
            scalar recall.
          </figcaption>
        </figure>

        <P>
          Binary quantization deserves special mention. Rather than storing each
          dimension as a float, you store a single bit: 1 if positive, 0 if
          negative. Distance is computed using XOR and popcount operations,
          which modern CPUs execute extremely fast. The catch: you retrieve 5x
          more candidates than you need using binary search, then rescore the
          top candidates with full-precision vectors to recover recall.
          Two-stage retrieval, extreme memory savings.
        </P>

        <P>
          TurboQuant handles the centering problem by rotating the vector space
          before compression. A Hadamard transform normalises the distribution
          regardless of how the original embedding model was trained. At 4-bit
          precision, it delivers recall close to scalar quantization at twice
          the compression.
        </P>

        <Hr />

        <H2>The full stack, assembled</H2>

        <P>
          Each layer exists because of a specific limitation in the layer before
          it. This is the shape of a production semantic search or RAG system —
          not a list of components, but a chain of solutions.
        </P>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "20px 0 28px" }}>
          {[
            {
              dot: "#888780",
              title: "Embed your content",
              body: "Convert text, images, or code into dense vectors. The model you choose determines the semantic space everything lives in.",
            },
            {
              dot: "#534AB7",
              title: "Build a hybrid index",
              body: "Dense vectors for meaning, sparse vectors for exact terms. Payload indexes on metadata for filtered search. HNSW for fast approximate retrieval.",
            },
            {
              dot: "#1D9E75",
              title: "Retrieve and fuse",
              body: "Run dense and sparse queries in parallel, merge with RRF, apply filters. Retrieve the top 100 candidates.",
            },
            {
              dot: "#BA7517",
              title: "Rerank with ColBERT",
              body: "Score the top 100 at token level. Return the true top 5–10. This step is what separates good retrieval from great retrieval.",
            },
            {
              dot: "#D85A30",
              title: "Generate with context",
              body: "Pass the retrieved chunks to the LLM. It reasons over your actual data, not its training set.",
            },
            {
              dot: "#888780",
              title: "Quantize for scale",
              body: "Once you hit millions of vectors, apply scalar or binary quantization. The index shrinks, queries get faster, recall stays high if you rescore.",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 8,
                background: "#0d0d0d",
                border: "1px solid #141414",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: item.dot,
                  flexShrink: 0,
                  marginTop: 5,
                }}
              />
              <div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#bbb",
                    marginRight: 8,
                  }}
                >
                  {item.title} —
                </span>
                <span style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
                  {item.body}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: 13,
            color: "#555",
            marginBottom: 28,
            lineHeight: 1.7,
            borderLeft: "2px solid #1a1a1a",
            paddingLeft: 14,
          }}
        >
          You don&apos;t need all of this on day one. Start with dense retrieval. Add
          sparse when exact terms matter. Add reranking when precision matters
          more than latency. Add quantization when memory matters more than
          simplicity.
        </p>

        <P>
          What looks like a complex system is really just a sequence of problems
          and the solutions they forced into existence. The keyword search
          failure demanded embeddings. The scale of embeddings demanded an
          index. The single-vector compression loss demanded token-level
          reranking. The memory cost of billions of vectors demanded
          quantization. Follow the chain of problems and you understand why
          every piece is there.
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
      </article>
    </div>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        color: "#9a9a9a",
        fontSize: 14,
        lineHeight: 1.85,
        marginBottom: 22,
      }}
    >
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
  return (
    <hr
      style={{
        border: 0,
        borderTop: "1px solid #161616",
        margin: "48px 0 40px",
      }}
    />
  );
}
