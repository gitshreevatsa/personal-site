import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title:
    "OSS Burnout Radar: a vitals monitor for the npm packages you depend on — shreyas padmakiran",
  description:
    "A tool that watches the maintainers, not the popularity contest. Ten signals stream into one screen with a 0–100 burnout score and citations behind every signal. Notes on the architecture, the Anakin endpoints, and the traps that ate hours.",
};

const SIG_OUTPUT = `SIG  | Pulse Activity         score=90  | Last week: 22 PRs merged · 24 issues closed · 16 authors
SIG  | Release Cadence        score=90  | latest 7d ago · median gap 8d · 9 recent releases
SIG  | Bus Factor             score=90  | 100 contributors · top owns 21%
SIG  | Maintainer Tone        score=55  | neutral · 0 burnout phrases, 0 positive phrases
…
DONE | overall=75 risk=LOW`;

const ARCH_DIAGRAM = `                                 ┌─ Per-collector 120s budget ────────┐
                                 │                                     │
POST /api/analyze (NDJSON) ──────┼─→ 9 fast collectors ───→ aggregate  │
                                 │       │                              │
                                 │       └─→ Anakin instrumented client│
                                 │             │                        │
                                 │             ├─ urlScraper            │
                                 │             ├─ crawl                 │
                                 │             ├─ search ─── circuit ───┤
                                 │             └─ agenticSearch ────────┤
                                 │                                       │
                                 └─→ ensureResearchJob() (background) ───┤
                                                                         │
GET /api/analyze/research (SSE) ←── poll job-store ──── (background) ←───┘`;

const NDJSON_EVENTS = `{ "type": "meta", "packageName": "axios", "repo": "axios/axios", "collectors": [...] }
{ "type": "instrumentation", "record": { "call": "urlScraper", "durationMs": 11268, ... } }
{ "type": "signal", "signal": { "key": "pulse_activity", "score": 90, ... } }
{ "type": "signal", "signal": { "key": "release_cadence", "score": 90, ... } }
{ "type": "done", "burnout": { "overall": 76, "risk": "LOW" }, ... }`;

const NDJSON_CLIENT = `const reader = res.body.getReader()
const decoder = new TextDecoder()
let buffer = ''
while (true) {
  const { value, done } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })
  let nl: number
  while ((nl = buffer.indexOf('\\n')) !== -1) {
    handleEvent(JSON.parse(buffer.slice(0, nl)) as StreamEvent)
    buffer = buffer.slice(nl + 1)
  }
}`;

const INSTRUMENT_FN = `async function instrument<T>(
  call: AnakinCall,
  argsSummary: string,
  fn: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now()
  try {
    const result = await fn()
    record({
      call,
      argsSummary,
      durationMs: Date.now() - startedAt,
      status: 'completed',
    })
    return result
  } catch (err) {
    record({
      call,
      argsSummary,
      durationMs: Date.now() - startedAt,
      status: 'failed',
      error: err.message,
    })
    throw err
  }
}`;

const CIRCUIT_FN = `async search(query, opts) {
  ensureCircuitClosed('search')
  try {
    return await request('/search', ...)
  } catch (err) {
    if (err.status >= 500) tripCircuit('search', err.message)
    throw err
  }
}`;

const REGEX_FIX = `// before
const match = repoUrl.match(/github\\.com[:/]([^/]+\\/[^/.]+)/)
// after
const match = repoUrl.match(/github\\.com[:/]([^/#?]+\\/[^/#?]+)/i)
return match ? match[1].replace(/\\.git$/i, '') : null`;

export default function OssBurnoutRadarPost() {
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
        <span>oss-burnout-radar</span>
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
          OSS Burnout Radar: a vitals monitor for the npm packages you depend on
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: 14,
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          {`A tool that watches the maintainers, not the popularity contest. Ten signals, one score, citations behind every signal.`}
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
          <span>12 min read</span>
          <span>·</span>
          <span>shreyaspadmakiran.com</span>
        </div>

        <img
          src="/blog/oss-burnout-radar-cover.png"
          alt="OSS Burnout Radar — package vitals monitor showing ten signals streaming in with a 0–100 burnout score"
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
          {`I built this on a long weekend after almost shipping a security patch on top of a package that had quietly gone unmaintained six months prior. The maintainer's last comment on a closed issue was "I'm out of bandwidth, sorry." I read it after I'd already typed `}
          <IC>npm install</IC>
          {`. That happens too often.`}
        </P>

        <P>
          {`The signals that say "this person is about to stop maintaining their package" exist. They're scattered. The lone maintainer writing a "looking for maintainers" note on issue #842. The release timestamp drifting from monthly to "11 months ago." One person owning 100% of recent commits while the issues queue grows. Stars and weekly downloads — what most teams actually look at — move way after any of those.`}
        </P>

        <P>
          {`So I built a tool that watches the maintainers, not the popularity contest. Paste a package name, watch ten signals stream into one screen, get a 0–100 burnout score with citations behind every signal. The whole thing runs on Anakin's scraping and agentic-search APIs, plus a thin layer of GitHub direct API for the things GitHub already exposes cleanly.`}
        </P>

        <P>
          {`This post is what I'd hand to someone wanting to build a similar tool: the architecture, every Anakin endpoint we hit and why, the patterns that turned out to matter, and the traps that ate hours.`}
        </P>

        <p style={{ color: "#666", fontSize: 13, marginBottom: 22 }}>
          Live:{" "}
          <A href="https://oss-burnout-radar.vercel.app">
            oss-burnout-radar.vercel.app
          </A>
          {" · "}
          Source:{" "}
          <A href="https://github.com/gitshreevatsa/OSS-Burnout-Radar">
            github.com/gitshreevatsa/OSS-Burnout-Radar
          </A>
        </p>

        <Hr />

        <H2>What it does</H2>
        <P>{`Type a package name. Watch the signals come in.`}</P>
        <Code>{SIG_OUTPUT}</Code>
        <P>
          {`That's `}
          <IC>axios</IC>
          {`. Healthy. The 25%-weighted "Burnout Research" signal isn't in that snapshot because it runs as a separate background job — agentic search across HN, blogs, and discussions takes a couple of minutes. When it lands, the score updates and a panel below shows the citations.`}
        </P>
        <P>
          {`Every signal card has a hover tooltip that explains what it measures and which API or scraper produced it. Every piece of evidence links to its source. The realistic read: nothing is "vibes." The score is reproducible from the citations.`}
        </P>

        <Hr />

        <H2>The shape of the app</H2>
        <Code>{ARCH_DIAGRAM}</Code>
        <P>
          {`Two routes. One streams the fast signals (NDJSON, ~30s wall clock). One streams the slow research signal (SSE, ~3min cold). The UI subscribes to both as soon as you hit Analyze.`}
        </P>
        <P>
          {`Every signal is a `}
          <IC>Collector</IC>
          {` that returns a 0–100 score and a weight. Aggregation is a weighted average over the signals that succeeded. Failed signals drop out of the weight pool, so a missing data point doesn't pull a healthy package toward 50 by averaging it against neutral.`}
        </P>

        <Hr />

        <H2>The Anakin services we ride on</H2>
        <P>
          {`Anakin-first as a constraint that turned into a strength. The alternative was writing five custom HTML scrapers, a sentiment classifier, and a multi-stage agentic search pipeline myself. Anakin has all of that as endpoints with one API key. Once I sat down with the docs, things clicked into place pretty fast.`}
        </P>
        <P>{`Every Anakin endpoint we touch:`}</P>
        <Table
          headers={["Anakin service", "What it powers", "Why this endpoint"]}
          rows={[
            [
              <>
                <IC>POST /v1/url-scraper</IC>
                {` (+ poll)`}
              </>,
              <>
                {`Pulse Activity (`}
                <IC>/pulse</IC>
                {`), Release Cadence (`}
                <IC>/releases</IC>
                {`), Maintainer Tone fallback (`}
                <IC>/issues</IC>
                {`), npm Reach (`}
                <IC>npmjs.com</IC>
                {`), Bus Factor fallback (`}
                <IC>/graphs/contributors</IC>
                {`)`}
              </>,
              <>
                {`These pages render data the REST API doesn't expose. `}
                <IC>/pulse</IC>
                {` weekly rollups have no GitHub API equivalent. npmjs.com only shows dependents and maintainers in the rendered DOM.`}
              </>,
            ],
            [
              <>
                <IC>POST /v1/crawl</IC>
                {` (+ poll)`}
              </>,
              <>
                {`Discussions Health — multi-page traversal across `}
                <IC>/discussions</IC>
                {` (8 pages, `}
                <IC>{`includePatterns: ["/discussions"]`}</IC>
                {`)`}
              </>,
              `URL Scraper is single-page. Discussions span paginated lists. Crawl is the Anakin verb built to follow links by pattern.`,
            ],
            [
              <>
                <IC>POST /v1/agentic-search</IC>
                {` (+ poll)`}
              </>,
              <>
                {`Burnout Research — the headline 25%-weighted signal. Sends a structured prompt and a JSON Schema, gets back `}
                <IC>riskLevel</IC>
                {`, `}
                <IC>summary</IC>
                {`, `}
                <IC>evidence[]</IC>
                {`, `}
                <IC>citations[]</IC>
                {`.`}
              </>,
              `Replaces a build-out of HN scraper + blog crawler + sentiment classifier + LLM synthesis with one call. Schema-driven extraction keeps the output structured. The biggest single unlock in the project.`,
            ],
            [
              <IC>POST /v1/search</IC>,
              `Reserved. The Stack Overflow signal got removed (SO has lost relevance for OSS dependency questions in 2026).`,
              `Kept the typed method in the client for future use. HN-specific or Reddit-specific search drops in cleanly when I add those signals.`,
            ],
            [
              <IC>GET /v1/holocron/catalog</IC>,
              <>
                {`Probe at `}
                <IC>/api/debug/holocron</IC>
                {`. Lists pre-built actions for our account.`}
              </>,
              `If Anakin adds Holocron actions for npm or GitHub, we'd switch to those instead of bespoke scrapers. The probe lets us see new actions without redeploying.`,
            ],
            [
              <IC>WebSocket /v1/browser-connect</IC>,
              `Not used — reserved.`,
              `Future: scraping authenticated GitHub views (private metadata, gated discussions). Pairs with Browser Sessions.`,
            ],
            [
              <>
                <IC>POST /v1/sessions</IC>
                {` (Browser Sessions)`}
              </>,
              `Not used — reserved.`,
              <>
                {`Future: bypassing GitHub's login wall on certain `}
                <IC>/issues</IC>
                {` URLs by reusing a saved session.`}
              </>,
            ],
          ]}
        />
        <P>
          {`For the signals where direct GitHub APIs are strictly faster (issues, contributors, repo metadata), GitHub REST is primary and Anakin scraping is the fallback. There was a decision moment around this. The brief was "Anakin for everything," and I considered routing all GitHub data through `}
          <IC>url-scraper</IC>
          {` for consistency. But scraping GitHub takes ten to fifteen seconds per page versus sub-second for the REST API, and the data is identical. Slower and cosmetically tidier loses to faster every time. So the architecture is Anakin-first where Anakin gives you something the direct API can't, and direct-first where the REST API is just faster.`}
        </P>

        <Hr />

        <H2>The instrumented proxy that saved my afternoon</H2>
        <P>
          {`If I'm allowed one decision out of this entire project that I'm happy with, it's this one. Every Anakin call goes through a thin proxy that records the call name, arguments, duration, status, and any error. The proxy fans out to three places: stdout, the NDJSON response stream as `}
          <IC>instrumentation</IC>
          {` events, and a 200-call ring buffer that backs `}
          <IC>/api/debug/last-analysis</IC>
          {`.`}
        </P>
        <Code>{INSTRUMENT_FN}</Code>
        <P>{`Twelve lines. That's the whole pattern.`}</P>
        <P>
          {`Why I'm happy with it: when Anakin's Perplexity quota got exhausted mid-development, the failure mode was that `}
          <IC>/search</IC>
          {` and `}
          <IC>/agentic-search</IC>
          {` would return cryptic 500s and "Anakin job failed." Without instrumentation, debugging that would have been hours of guessing. With instrumentation, the actual error message ("perplexity: Unexpected error: 401 - You exceeded your current quota") was in the structured stdout log within thirty seconds of the first failed call. I knew exactly which upstream provider was broken and that there was nothing I could fix on my end.`}
        </P>
        <P>
          <B>{`Add observability before you need to debug.`}</B>
          {` The cost is a thin wrapper. The payoff is finding root causes in seconds instead of hours.`}
        </P>

        <Hr />

        <H2>Streaming signals over NDJSON</H2>
        <P>
          {`The natural API shape would be one POST that returns a JSON object once all signals are collected. Works fine. Also means you stare at a spinner for a minute. I wanted users to see the radar light up signal by signal, the way `}
          <IC>htop</IC>
          {` updates instead of dumping everything at the end.`}
        </P>
        <P>
          {`The standard option for that is Server-Sent Events. SSE has one annoying constraint: `}
          <IC>EventSource</IC>
          {` only does GET. You can't put a request body in a GET, so the package name would need to go in a query string, which is fine but feels off for a "submit and process" verb.`}
        </P>
        <P>{`What I did instead is stream NDJSON over a normal POST. Each chunk is one JSON object on its own line.`}</P>
        <Code>{NDJSON_EVENTS}</Code>
        <P>
          {`The client reads `}
          <IC>response.body</IC>
          {` as a stream, splits on newlines, parses each line. About fifteen lines of client code total. No library. No protocol. The request body works.`}
        </P>
        <Code>{NDJSON_CLIENT}</Code>
        <P>
          {`Worth knowing: any time you have "submit something, get many ordered events back over time" and the events are structured, NDJSON over POST beats SSE. SSE's superpower is auto-reconnect, which doesn't matter for a one-shot analysis call.`}
        </P>

        <Hr />

        <H2>Decoupling the slow signal</H2>
        <P>
          {`The headline signal — Burnout Research — runs `}
          <IC>agentic-search</IC>
          {`. Four-stage pipeline (refine the query, search the web, scrape citations, synthesize). On a cold cache it takes anywhere from sixty seconds to five minutes.`}
        </P>
        <P>
          {`Holding an HTTP connection open that long is a bad idea on basically every layer of the stack. Vercel hobby caps you at 300 seconds. Browser fetch happily times out before that. Network blips drop the stream. Each of those means the user sees a timeout.`}
        </P>
        <P>
          {`So the architecture splits into two endpoints. The main `}
          <IC>POST /api/analyze</IC>
          {` returns the nine fast signals in fifteen to thirty seconds. It also kicks off the research job in the background, fire-and-forget. A second endpoint, `}
          <IC>GET /api/analyze/research</IC>
          {`, is an SSE stream that subscribes to the in-flight job (or returns the cached result if it has already finished). The client opens this SSE connection as soon as it receives the `}
          <IC>meta</IC>
          {` event from the main POST.`}
        </P>
        <P>
          {`First time you analyze `}
          <IC>axios</IC>
          {`, the research panel shows a "still working" spinner for a minute or two. Second time you analyze it within 24 hours, the result lands instantly from cache.`}
        </P>
        <P>
          {`The trap was: my in-memory job store works fine on a single dev server. On Vercel each lambda invocation can land on a different instance, so for production you'd want Vercel KV or Redis. The interfaces are narrow enough (`}
          <IC>ensureResearchJob</IC>
          {`, `}
          <IC>getResearchJob</IC>
          {`) that it's a small swap. Haven't done it yet.`}
        </P>

        <Hr />

        <H2>The circuit breaker</H2>
        <P>
          {`When `}
          <IC>/search</IC>
          {` and `}
          <IC>/agentic-search</IC>
          {` started failing because of the Perplexity quota, every collector that called them was wasting five seconds per attempt waiting for a 500. Two SO calls per analysis, ten seconds gone. Plus credits.`}
        </P>
        <P>
          {`A small circuit breaker fixed it. The first failure that classifies as "Perplexity quota" trips the circuit. Subsequent calls return immediately with a "circuit open" error. After five minutes, the circuit half-opens and the next call gets to try.`}
        </P>
        <Code>{CIRCUIT_FN}</Code>
        <P>
          {`Textbook pattern. Surprisingly underused in client code that calls third-party APIs. The bug it prevents is the one where one bad upstream stalls every request indefinitely.`}
        </P>

        <Hr />

        <H2>The traps along the way</H2>

        <H3>The regex that ate eight signals</H3>
        <P>
          {`When I tested the app on `}
          <IC>ethers</IC>
          {`, every signal came back blank or wrong. Issue Backlog showed `}
          <IC>0 open / 0 closed</IC>
          {`. Maintainer Tone scraped what looked like a GitHub login wall. Bus Factor showed zero contributors. I assumed Anakin was misbehaving and started writing a fallback chain.`}
        </P>
        <P>
          {`The actual root cause: I had a regex parsing the GitHub repo path out of npm's `}
          <IC>repository.url</IC>
          {` field. The regex was `}
          <IC>{`/github\\.com[:/]([^/]+\\/[^/.]+)/`}</IC>
          {`, parsing username/reponame, where reponame was "any character that isn't a slash or a dot." `}
          <IC>ethers</IC>
          {` lists its repository as `}
          <IC>git://github.com/ethers-io/ethers.js.git</IC>
          {`. My regex stopped at the first dot, parsing the repo as `}
          <IC>ethers-io/ethers</IC>
          {`. That repo doesn't exist on GitHub. Every API call hit a 404. Every Anakin scrape got a generic GitHub redirect.`}
        </P>
        <P>{`One regex fix. Eight signals fixed at once.`}</P>
        <Code>{REGEX_FIX}</Code>
        <P>
          {`The lesson, which I should have known: when many things break at once, suspect a shared dependency before you suspect each consumer. And: write unit tests for input parsers, even when they look trivial. The fix took ninety seconds. Finding it took an hour.`}
        </P>

        <H3>The Perplexity quota that vanished mid-build</H3>
        <P>
          <IC>/search</IC>
          {` and `}
          <IC>/agentic-search</IC>
          {` both run on Perplexity. One afternoon, both started returning 500s with "Failed to perform search." Anakin's URL Scraper and Crawl were unaffected — different infrastructure on their side.`}
        </P>
        <P>
          {`The instrumented proxy already had the actual error in stdout. Within thirty seconds I knew it was Perplexity's quota, not Anakin's. Forwarded the upstream error verbatim to the Anakin team. They topped it up the same day. Without the proxy, this would have looked like "the app sometimes fails for no reason." With the proxy, it was "external dep is over quota, here's the upstream error message verbatim."`}
        </P>
        <P>
          <B>{`Build the observability before you need it.`}</B>
          {` Every time.`}
        </P>

        <H3>The &quot;small package isn&apos;t unhealthy&quot; rebalance</H3>
        <P>
          {`A user testing the tool typed `}
          <IC>date</IC>
          {` and saw it score 40 (At Risk). They thought that was wrong. I thought about it for a while.`}
        </P>
        <P>
          <IC>date</IC>
          {` has 3.1k weekly downloads, one author, last push 116 days ago. From a pure burnout-detection standpoint, that's not "perfectly healthy." Solo authors burn out. Packages going four months without a push do drift. Was the score wrong? Or was the user's intuition wrong?`}
        </P>
        <P>
          {`The rubric was wrong, in a subtle way. The original scoring punished low values across the board. Low downloads, low score. No releases, low score. One contributor, low score. Stack those penalties and any small mature library lands in "At Risk" regardless of whether it's actually risky.`}
        </P>
        <P>
          {`What I changed: low values now anchor on "is the project still being touched?" If `}
          <IC>pushed_at</IC>
          {` is recent (less than 60 days), no recent releases doesn't pull the score down. That's a stable mature library, not a fading one. If `}
          <IC>pushed_at</IC>
          {` is two years stale, no recent releases is bad. Same data point, different context, different answer.`}
        </P>
        <P>
          {`The product is named "Burnout Radar," but people use it as "should I depend on this?" — which isn't quite the same question. A healthy mature library that doesn't change because it doesn't need to is a fine dependency. The scoring should reflect that.`}
        </P>
        <P>
          {`After the rebalance, `}
          <IC>date</IC>
          {` scores 46 ("Watch") and `}
          <IC>axios</IC>
          {` still scores 75 ("Healthy"). Sanity preserved on both ends.`}
        </P>

        <Hr />

        <H2>What I&apos;d do differently</H2>
        <P>
          {`The two stores that hold state in memory (response cache and research job map) need to be Redis or KV before this runs at any scale. I knew that when I shipped the first version. Wanted to see the system work end-to-end before optimizing the persistence layer. In retrospect, swapping in Vercel KV from the start would have cost an extra hour and avoided the "yes, this works, but it won't on Vercel hobby across instances" footnote.`}
        </P>
        <P>
          {`I'd probably also make the Burnout Research signal opt-in. It's the most expensive single signal in credits and time, and most users will close the tab before it lands. The other nine signals already get you 90% of the way there.`}
        </P>

        <Hr />

        <H2>What&apos;s next</H2>
        <P>
          {`The architecture is general enough to add signals without touching anything but a single collector file. On the list:`}
        </P>
        <UL
          items={[
            <>
              {`A crawl over the project's docs site to check freshness — broken links, last-edit timestamps, version drift between docs and the latest release. Anakin's `}
              <IC>crawl</IC>
              {` already does multi-page traversal.`}
            </>,
            <>
              {`A security-advisory cadence signal. GitHub publishes per-repo advisories at `}
              <IC>{`/{repo}/security/advisories`}</IC>
              {`. One URL Scraper call away.`}
            </>,
            <>
              {`A dependency-churn signal. How often the package's own dependencies are getting bumped, parsed from `}
              <IC>package.json</IC>
              {` history.`}
            </>,
            `Cross-package signals. If you depend on twenty packages and three share a maintainer who just posted "stepping back," that's worth flagging.`,
          ]}
        />

        <Hr />

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
        marginTop: 56,
        marginBottom: 18,
        lineHeight: 1.25,
      }}
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        fontSize: 14,
        color: "#d6d6d6",
        marginTop: 36,
        marginBottom: 14,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </h3>
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

function Code({ children }: { children: string }) {
  return (
    <pre
      style={{
        background: "#0d0d0d",
        border: "1px solid #161616",
        borderRadius: 4,
        padding: "16px 18px",
        overflowX: "auto",
        color: "#c8c8c8",
        fontSize: 12.5,
        lineHeight: 1.65,
        margin: "14px 0 22px",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
      }}
    >
      <code>{children}</code>
    </pre>
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

function B({ children }: { children: ReactNode }) {
  return (
    <strong style={{ color: "#e0e0e0", fontWeight: 500 }}>{children}</strong>
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

function UL({ items }: { items: ReactNode[] }) {
  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: "0 0 22px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            color: "#9a9a9a",
            fontSize: 13.5,
            lineHeight: 1.8,
            paddingLeft: 16,
            position: "relative",
          }}
        >
          <span style={{ position: "absolute", left: 0, color: "#444" }}>
            —
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "14px 0 22px" }}>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          fontSize: 12.5,
        }}
      >
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  border: "1px solid #1a1a1a",
                  padding: "8px 12px",
                  textAlign: "left",
                  background: "#101010",
                  color: "#bdbdbd",
                  fontWeight: 500,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    border: "1px solid #1a1a1a",
                    padding: "8px 12px",
                    color: "#8e8e8e",
                    verticalAlign: "top",
                    lineHeight: 1.7,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
