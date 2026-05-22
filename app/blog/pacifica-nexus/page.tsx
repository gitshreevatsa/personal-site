import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title:
    "Pacifica Nexus: an actionable analytics terminal for on-chain perps — shreyas padmakiran",
  description:
    "A trading workstation for the Pacifica perp DEX on Solana. Funding-rate arb scanner, auto de-risk, encrypted agent-key vault, optimistic order lifecycle, and a two-layer kill switch. Notes on what is under the hood.",
};

export default function PacificaNexusPost() {
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
        <span>pacifica-nexus</span>
      </div>

      <article
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "72px 32px 120px",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(30px, 4.6vw, 48px)",
            color: "#e8e8e8",
            marginBottom: 18,
            lineHeight: 1.18,
          }}
        >
          Pacifica Nexus: an actionable analytics terminal for on-chain perps
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: 14,
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          {`A trading workstation for the Pacifica perp DEX on Solana. Notes on what's under the hood.`}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 11,
            color: "#444",
            marginBottom: 40,
            letterSpacing: "0.04em",
          }}
        >
          <span>14 min read</span>
          <span>·</span>
          <span>shreyaspadmakiran.com</span>
        </div>

        <img
          src="/blog/pacifica-nexus-cover.png"
          alt="Pacifica Nexus terminal — Verified Alpha feed, candle chart, arbitrage scanner, and Risk Guard panel side by side"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            marginBottom: 56,
            border: "1px solid #161616",
            borderRadius: 4,
          }}
        />

        <P>
          {`I built this last month. It started as a hackathon entry — Pacifica was running one, I had a free weekend, I wrote a trading dashboard. Somewhere between debugging why every signed order was returning a 400 and realising that storing an agent key as plaintext in localStorage was a bad idea I would regret later, the scope drifted. The hackathon ended. I kept building because by then I was using the thing myself, and the parts I cared most about (the auto de-risk, the signing path, the encrypted vault) weren't done. So this is less a hackathon writeup than a notebook on what's under the hood now.`}
        </P>

        <p style={{ color: "#666", fontSize: 13, marginBottom: 22 }}>
          Live:{" "}
          <A href="https://pacifica-nexus.vercel.app">
            pacifica-nexus.vercel.app
          </A>
          {" · "}
          Source:{" "}
          <A href="https://github.com/gitshreevatsa/Pacifica-Nexus">
            github.com/gitshreevatsa/Pacifica-Nexus
          </A>
        </p>

        <Hr />

        <H2>What it is, and why</H2>
        <P>
          {`Pacifica Nexus is a trading workstation for the Pacifica perp DEX on Solana. It exists because most analytics tools tell you what's happening and then ask you to switch to a different app to act on it. Nexus collapses that loop. You read the chart, scan the funding edges, watch the whale flow, and place the trade — market or limit, with TP/SL brackets, trailing stops, breakeven button, and a one-click reduce-only — all in the same window. Every chart, scanner, and signal has a path into a position, a stop, or a hedge.`}
        </P>
        <P>
          {`The app is built around three workflows. Funding-rate arbitrage is the first and the highest-EV. Pacifica runs perp markets where funding payments drift hard between assets and windows; the arb scanner annualizes funding across every market, ranks the edges, applies a depth floor so you don't get excited about a 200% APR on a market with no liquidity, and lets you short the perp leg in one click while opening Jupiter in a new tab for the spot leg. The math is standard. The friction is operational, and that's what the scanner removes.`}
        </P>
        <P>
          {`Risk management is the second. Risk Guard tracks per-position liquidation distance live, breaks down margin efficiency, and auto-fires a 25% reduce-only order the moment a position drifts inside a configurable liq buffer. It's the seatbelt version of "I'll watch it, I promise," which never works at 4am.`}
        </P>
        <P>
          {`The third workflow is fast, disciplined order entry, and this is where Nexus stops being a viewer and becomes a trading platform. The Quick Order Bar takes market or limit orders with optional TP/SL, sizes in USD or percent of equity, and is keyboard-driven end to end (B for buy, S for sell, Esc to cancel). Bracket orders, trailing stops with cancel-and-replace on the watermark, a one-click breakeven move — they all live next to the chart, not behind a separate "trade" page. After the first time you authorize the agent key, no trade in the app pops a wallet again.`}
        </P>
        <P>
          {`There's also a smaller fourth thing: an Alpha Feed that cross-references Elfa AI's trending tokens with Pacifica whale fills above $10k notional and flags a token as "verified" only when the social and on-chain directions agree. It's a starting point for ideas, not the centerpiece. Most of my real positions come out of the arb scanner. I'll get to the matcher in the engineering section because the code is interesting, not because it carries the product.`}
        </P>
        <P>
          {`Information isn't the bottleneck for an experienced trader. The bottleneck is the latency between an idea and a properly bracketed position with a tested risk fallback. Most on-chain trading UX adds that latency: tab-switching, manual size math, a wallet popup per trade, no automated risk fallback. Nexus treats the latency as the product.`}
        </P>

        <Hr />

        <H2>The shape of the app</H2>
        <P>
          {`Next.js App Router on the front. A small set of `}
          <IC>/api/*</IC>
          {` proxies on the back, mostly so any third-party API key never reaches the browser. Zustand for cross-component state. TanStack Query for anything REST-shaped. One shared WebSocket singleton that every real-time hook subscribes to.`}
        </P>
        <P>
          {`The boundary worth calling out is that the agent keypair never goes through any backend. Wallet auth, key import, key encryption, and order signing all happen in the browser. The server is a CORS-friendly relay for third-party APIs that require a secret, plus the remote kill-switch endpoint. If the Next.js server fell over, the trading path keeps working; the discovery feed and kill switch are what you'd lose.`}
        </P>

        <Hr />

        <H2>Order entry: from idea to bracketed position</H2>
        <P>
          {`Every trade in the app goes through the same path. The user types or selects a size in USD, percent of equity, or asset units; the math module handles lot-size snapping per market. The Quick Order Bar reads the current mark price, computes an effective slippage on market orders (default 0.5%), attaches the optional TP/SL legs, signs the body with the in-memory agent key, and submits.`}
        </P>
        <P>
          {`Before the call returns, the lifecycle store has already marked the order `}
          <IC>submitting</IC>
          {`. On the server's `}
          <IC>order_id</IC>
          {` response it flips to `}
          <IC>accepted</IC>
          {`. WebSocket fill events update it to `}
          <IC>partially_filled</IC>
          {` or `}
          <IC>filled</IC>
          {`; cancel confirmations move it to `}
          <IC>cancel_pending</IC>
          {` then `}
          <IC>cancelled</IC>
          {`. The status badge in the trade log reads from this store, so the user sees state changes immediately instead of waiting for the next REST poll.`}
        </P>
        <P>
          {`The TP/SL manager handles trailing stops specially. Pacifica doesn't have first-class server-side trailing stops, so the manager watches the position's high-watermark client-side and cancel-replaces the stop order whenever the watermark moves past a threshold. The cancel and the replace are bundled into a single state transition in the lifecycle store so the UI doesn't briefly show "no stop" between the two.`}
        </P>
        <P>
          {`The breakeven button is the smallest, most-used feature in the app: it reads the position's entry price, cancels any existing stop, and submits a new stop at entry. One click. It exists because every time I traded without it I'd talk myself out of moving the stop manually until it was too late.`}
        </P>

        <Hr />

        <H2>The arb scanner</H2>
        <P>
          {`Funding values come from the markets endpoint as raw per-period rates that need annualizing across different funding intervals. The scanner ranks every market by annualized rate and filters out anything thinner than a depth threshold. The "short the perp" button signs and submits through the same Quick Order path. The spot leg opens Jupiter in a new tab pre-filled with the right pair, deliberately not auto-executed, because I'd rather lose a click than lose a user's money to an unfamiliar route they didn't get to look at.`}
        </P>
        <P>
          {`The fiddly bits were funding-interval normalization (not every market funds on the same cadence) and what to do when a market's funding flips sign mid-session. The scanner treats funding as a streaming value and re-ranks on update; positions opened on a stale rate are flagged so the user can decide whether to close.`}
        </P>

        <Hr />

        <H2>Risk Guard and the auto de-risk</H2>
        <P>
          {`This is the feature that turned a hobby project into something I trust to run while I sleep. Each open position is tracked against a configurable liquidation buffer. When the distance to liquidation falls below the threshold, the guard fires a 25% reduce-only order automatically and pushes a Sentry breadcrumb so the action is auditable later. The 25% number is empirical. Too aggressive and you bleed yourself out on noise; too gentle and you don't move the liq line on a fast wick.`}
        </P>
        <P>
          {`The hard part wasn't the math. It was correctness around state. You don't want to fire two reduce orders for the same threshold crossing, you don't want to fire one when the WebSocket is stale and the price you're reading is 90 seconds old, and you don't want to fire one in the half-second between a manual close submission and the position disappearing from the API. The guard reads from the lifecycle store and the WS staleness flag and refuses to act when either is in an unsafe state.`}
        </P>

        <Hr />

        <H2>The signing problem</H2>
        <P>
          {`Every signed POST to Pacifica is an Ed25519 signature over a very specific JSON shape. Wrap operation fields under a `}
          <IC>data</IC>
          {` key, add `}
          <IC>type</IC>
          {`, `}
          <IC>timestamp</IC>
          {`, and `}
          <IC>expiry_window</IC>
          {`, alphabetize every key at every depth, `}
          <IC>JSON.stringify</IC>
          {` with no whitespace, sign the UTF-8 bytes with the agent private key, base58-encode the signature. Then, and this is the part that ate me, flatten the operation fields back out of the `}
          <IC>data</IC>
          {` wrapper before sending. The wire body and the signed body don't look the same.`}
        </P>
        <P>
          {`The longer tail was a quieter gotcha: `}
          <IC>reduce_only</IC>
          {` has to be present in the signed payload of every order, even when it's `}
          <IC>false</IC>
          {`. Omit it and the server computes a different signature hash, returns a 400 with no useful body, and you spend an afternoon reading a hex diff between two stringified JSON objects.`}
        </P>
        <P>
          {`If Pacifica shipped a typed SDK that did the wrap-sort-sign-flatten dance for you, three days come back. Hyperliquid has had one for a while and you can feel the difference from the first hour.`}
        </P>

        <Hr />

        <H2>The agent key threat model</H2>
        <P>
          {`Agent keys exist because nobody wants a wallet popup per trade. The cost is that you now have a long-lived signing key sitting on the user's machine. Putting a base58 private key into localStorage is the easy default and the kind of decision that ages badly: the first XSS or malicious browser extension exfiltrates it and you've handed someone trading authority on a real account.`}
        </P>
        <P>
          {`The vault derives an AES-256-GCM key from a user passphrase via PBKDF2 (200k iterations), encrypts the agent private key, and only persists `}
          <IC>{`{ciphertext, salt, iv}`}</IC>
          {` in localStorage. The raw key lives in memory inside a Zustand store and gets cleared on refresh. The user types the passphrase once per session. If the vault leaks, an attacker without the passphrase has homework, not a key.`}
        </P>
        <P>
          {`What I want and don't have is a clean server-side revocation primitive. Right now revocation is "register a new agent key and assume nothing has the old one cached." A revocation list with a freshness check on Pacifica's side would make agent-key UX feel less precarious.`}
        </P>

        <Hr />

        <H2>Optimistic order state without lying to the user</H2>
        <P>
          {`Pacifica's REST API is authoritative for order state, but if the UI waits for the next REST poll to show the user that an order made it, the app feels broken. So there's a small client-side state machine in `}
          <IC>orderLifecycleStore</IC>
          {` that walks an order through `}
          <IC>{`submitting → accepted → partially_filled → filled`}</IC>
          {`, with `}
          <IC>cancel_pending</IC>
          {`, `}
          <IC>cancelled</IC>
          {`, `}
          <IC>rejected</IC>
          {`, `}
          <IC>expired</IC>
          {`, and `}
          <IC>failed_reconcile</IC>
          {` as terminal states.`}
        </P>
        <P>
          <IC>failed_reconcile</IC>
          {` is the one that mattered. If a network failure happens between "we sent the order" and "we got an ack," the order may or may not exist on the server. The honest move is to admit it: mark the entry as `}
          <IC>failed_reconcile</IC>
          {`, surface a banner telling the user to check their positions manually, and refuse to show a green "filled" toast on hope. Apps that show a confident checkmark before they've heard back from the venue are how people end up double-shorting.`}
        </P>

        <Hr />

        <H2>The Alpha Feed (engineering note)</H2>
        <P>{`This is an interesting feature with subtle correctness issues, which is why the code is worth a paragraph.`}</P>
        <P>
          {`Elfa's trending tokens get pulled every five minutes and normalized to a 0-100 score. Pacifica's public trades WebSocket gets filtered down to fills above $10k notional. Social sentiment maps to a directional bet (BULLISH long, BEARISH short, NEUTRAL skipped). When a whale fill arrives on a symbol that has a live social signal pointing the same way, the hook emits a `}
          <IC>VerifiedAlpha</IC>
          {` with a confidence score.`}
        </P>
        <P>
          {`The traps were everywhere. Elfa's symbols and Pacifica's symbols don't agree on casing or `}
          <IC>-PERP</IC>
          {` suffixes. Whale fills can fire in bursts and emit twice on the same opportunity. Stale social signals shouldn't be allowed to confirm new whale activity, so the social cache has a 10-minute TTL and an eviction sweep. The WebSocket reconnects on backoff, so the matcher has to register and tear down listeners repeatedly without leaking. I ended up holding canonical state in refs alongside React state because closures over state inside `}
          <IC>useEffect</IC>
          {` callbacks were the source of half the bugs I hit.`}
        </P>
        <P>
          {`The realistic read: the Alpha Feed catches a few interesting setups a week. The arb scanner catches several a day. If I were rebuilding from scratch, I'd build the analytics-and-execution loop first and treat social discovery as a bonus tab.`}
        </P>

        <Hr />

        <H2>Patterns that hold the app together</H2>
        <P>
          {`The WebSocket layer is one shared singleton in `}
          <IC>pacifica-ws.ts</IC>
          {`. It exposes `}
          <IC>onMessage</IC>
          {`, `}
          <IC>onConnect</IC>
          {`, and `}
          <IC>wsSend</IC>
          {`, handles reconnect with exponential backoff from 2s to 30s, pings every 30 seconds, and surfaces a stale-feed banner if 60 seconds go by with no message. Real-time-heavy apps that skip the centralization end up with a different connection per feature and a debug story that's pure misery.`}
        </P>
        <P>
          {`Zustand carries the shared-state layer between hook instances. Two `}
          <IC>{`usePacifica()`}</IC>
          {` calls need to see the same agent key, the same lifecycle entries, the same toast queue. Lifting that into Zustand instead of context providers means hooks compose cleanly and re-renders stay scoped. Every store in the app is small, single-purpose, has a `}
          <IC>{`prune()`}</IC>
          {` action so it doesn't grow without bound, and lives outside React's context tree.`}
        </P>
        <P>
          {`Any API key that isn't the user's wallet sits behind a server proxy. Elfa, Privy server keys, and Jupiter all route through `}
          <IC>/api/*</IC>
          {` handlers. The kill-switch endpoint lives there too.`}
        </P>
        <P>
          {`The kill switch is two layers. A boot-time env var halts trading at page load and requires a redeploy. A remote endpoint is polled every 30 seconds; flipping `}
          <IC>KILL_SWITCH=true</IC>
          {` in the deploy dashboard propagates to every connected client within 30 seconds, no redeploy. The remote layer is what you actually want when an exchange has an incident and you're not at your laptop.`}
        </P>
        <P>
          {`Env vars are validated by a Zod schema at boot. If a required key is missing, the app refuses to start with a readable error, instead of crashing later when some hook reads `}
          <IC>undefined</IC>
          {` and the stack trace points at React internals.`}
        </P>

        <Hr />

        <H2>Working with Pacifica</H2>
        <P>
          {`Pacifica is fast, and the on-chain perp UX is genuinely good once you're trading on it. The API works once you get it working. The pain points are concentrated. Signing, as above. And error responses that aren't consistent across endpoints — some return `}
          <IC>{`{success: false, error: "..."}`}</IC>
          {` with HTTP 200, some return a 400 with `}
          <IC>error</IC>
          {`, others with `}
          <IC>message</IC>
          {`, others with `}
          <IC>detail</IC>
          {`. I ended up with a small `}
          <IC>apiFetch</IC>
          {` helper that tries every shape and logs the raw body if it can't extract a string. One documented error envelope would save every integrator the same afternoon.`}
        </P>
        <P>
          {`Pacifica is six months younger than Hyperliquid, and Hyperliquid had a typed SDK, end-to-end docs, and a Discord channel where someone would tell you within an hour that you'd forgotten to sort your keys. The gap is fixable.`}
        </P>

        <Hr />

        <H2>How I engineered the thing</H2>
        <P>
          {`The single design rule under all of this was: assume every layer is going to lie to me at the worst possible moment, and decide what the app should do when it does.`}
        </P>
        <P>
          {`The orderbook arrives over a WebSocket that can disconnect for 60 seconds without telling me. The fix is the staleness flag and a UI banner so the user knows the price they're looking at might be old. The auto de-risk reads that flag and refuses to fire when it's set. One layer deep, two layers of protection.`}
        </P>
        <P>
          {`The REST API is authoritative for order state, but it's also slow enough that a naive UI looks broken. The fix is the lifecycle store: optimistic locally, reconciled aggressively against polls and WS events, with `}
          <IC>failed_reconcile</IC>
          {` as the explicit "I don't know what happened" state. The store prunes itself after five minutes so it can't drift into a fake order history.`}
        </P>
        <P>
          {`The Pacifica signing format is unforgiving and the error responses don't tell you why a signature failed. The fix is `}
          <IC>signing.ts</IC>
          {` doing exactly one thing, with the recursive sort and the wrap-then-flatten in pure, testable functions. When I broke it, the unit test for `}
          <IC>{`compact()`}</IC>
          {` told me before I shipped it.`}
        </P>
        <P>
          {`The agent key is the most dangerous artifact in the app. The fix is the encrypted vault with PBKDF2 and AES-GCM, the raw key only in memory, the passphrase re-entry on every session, and a "forget device" button that wipes the vault. If the user's machine is compromised the day they unlocked the vault, they lose. If it's compromised on any other day, they don't.`}
        </P>
        <P>
          {`The auto de-risk is the most dangerous active code in the app — it's allowed to submit real orders without human input. The fix is gating it on the lifecycle store, the WS staleness flag, and a debounce so a single threshold crossing can't fire twice. Sentry gets a breadcrumb every time it fires, with full context, so I can audit it the next morning.`}
        </P>
        <P>
          {`The Pacifica API can have an incident at 3am. The fix is the two-layer kill switch — boot-time and remote-polled — so I can halt every connected client from a dashboard on my phone, no redeploy.`}
        </P>
        <P>
          {`Each piece is small. The math module is pure functions. The signing module is pure functions. The vault is one async function in each direction. The stores are dumb dictionaries with reducers. The hooks share one socket and one set of refs. The components read from stores and TanStack queries and don't own state of their own. There's no clever abstraction holding it together; the discipline is in keeping the boundaries strict and the failure modes explicit.`}
        </P>
        <P>
          {`The features in Nexus are visible: a chart, a scanner, a guard, an order entry, a discovery feed. The engineering is the part you only notice when something doesn't go wrong — when the WebSocket flakes and the auto de-risk doesn't fire on stale data, when the network drops mid-submit and the UI says "I don't know" instead of "filled," when the exchange has a bad afternoon and the kill switch goes flat in 30 seconds. That's the part I'm proud of.`}
        </P>

        <Hr />

        <p style={{ color: "#666", fontSize: 13, marginBottom: 22 }}>
          Live:{" "}
          <A href="https://pacifica-nexus.vercel.app">
            pacifica-nexus.vercel.app
          </A>
          {" · "}
          Source:{" "}
          <A href="https://github.com/gitshreevatsa/Pacifica-Nexus">
            github.com/gitshreevatsa/Pacifica-Nexus
          </A>
        </p>

        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 28,
            color: "#555",
            marginTop: 48,
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
        marginTop: 56,
        marginBottom: 18,
        lineHeight: 1.25,
      }}
    >
      {children}
    </h2>
  );
}

function IC({ children }: { children: ReactNode }) {
  return (
    <code
      style={{
        background: "#141414",
        border: "1px solid #1c1c1c",
        color: "#d0c8a8",
        padding: "1px 6px",
        borderRadius: 3,
        fontSize: "0.86em",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
      }}
    >
      {children}
    </code>
  );
}

function Hr() {
  return (
    <hr
      style={{
        border: 0,
        borderTop: "1px solid #161616",
        margin: "40px 0",
      }}
    />
  );
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "#a0a0a0",
        textDecoration: "underline",
        textUnderlineOffset: 3,
        textDecorationColor: "#333",
      }}
    >
      {children}
    </a>
  );
}
