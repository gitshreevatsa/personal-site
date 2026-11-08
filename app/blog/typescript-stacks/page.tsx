import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "TypeScript stacks, by the job they are good at",
  description:
    "Next, Nest, and Hono are not the same kind of tool. A field guide to the TypeScript stacks that show up in the same argument, and the job each one actually wins.",
};

export default function TypescriptStacksPost() {
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
        <Link href="/blog/solutions-engineering" style={{ color: "#555" }}>
          solutions engineering
        </Link>
        <span>/</span>
        <span>typescript-stacks</span>
      </div>

      <article
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "72px 32px 120px",
        }}
      >
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
          solutions engineering
        </p>

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
          TypeScript stacks, by the job they are good at
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: 14,
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          Next, Nest, and Hono can all return JSON with TypeScript quiet in the
          file. That similarity is why the arguments go in circles. They are
          answering different questions.
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
          <span>16 min read</span>
          <span>·</span>
          <span>Nov 2026</span>
          <span>·</span>
          <span>shreyaspadmakiran.com</span>
        </div>

        <P>
          {`A stack choice goes well when the question matches the product you still have in month six, with a second client and a second engineer in the repo. Versions below are the ones current in November 2026: Next.js 16.4, React Router 8, TanStack Start 1.0, Astro 7, NestJS 12, Hono 4, Fastify 5, Express 5, Elysia 1.4, AdonisJS 7.`}
        </P>

        <H2>Sort them into layers first</H2>

        <P>
          Rankings treat these as substitutes. They sit on four layers, and a
          tool on one layer can sit under a tool on another.
        </P>

        <UL
          items={[
            <>
              <B>Web frameworks</B> own the page. Next.js, React Router in
              framework mode, TanStack Start, and Astro decide how a URL becomes
              HTML, where the data load runs, and how the browser takes over.
            </>,
            <>
              <B>HTTP frameworks</B> own the request. Hono, Fastify, Elysia, and
              Express take a request and give you a place to put a handler. They
              leave UI, folders, and the database to you.
            </>,
            <>
              <B>Application frameworks</B> own the shape of a long-lived
              backend. Nest and Adonis hand you modules, a way to inject
              dependencies, and a pile of official packages. Nest still runs on
              an HTTP library. Adonis brings the ORM and the auth with it.
            </>,
            <>
              <B>Contract tools</B> own the type at the boundary. tRPC, oRPC,
              ts-rest, and an OpenAPI document generated from Fastify or Nest
              schemas are this layer. They tell a caller the shape of a call.
              They are a poor thing to pick instead of Nest.
            </>,
          ]}
        />

        <P>
          {`The runtime sits beside all four. Node is the runtime a platform team and a native addon already agree on. Bun is a strong runtime when you chose it and your SDKs run there. A Cloudflare Worker will run a web-standard Request handler and will fail the import of fs.`}
        </P>

        <H2>Five questions that pick the stack</H2>

        <P>Answer these before you read a benchmark.</P>

        <UL
          items={[
            <>
              <B>Is the thing you ship a website, or an API a website happens to
              call?</B> A website wants a web framework. An API with its own
              callers wants an HTTP or application framework, and a contract
              those callers can read.
            </>,
            <>
              <B>Who is the second client?</B> A React app in the same repo can
              call a typed function. An iOS app, a partner, or a cron job in
              another language needs a URL, a schema, and an auth scheme that
              still makes sense in two years.
            </>,
            <>
              <B>Does work continue after the response?</B> Queues, cron,
              websockets, and uploads that run for minutes want a process you
              keep, or a separate worker. A short Worker invocation is an
              awkward home for that work.
            </>,
            <>
              <B>How many engineers will be in this repo next year?</B> Two
              people can share taste and a thin router. Eight people need
              folders the framework will defend when someone gets clever on a
              Friday.
            </>,
            <>
              <B>Which host is already the company standard?</B> Vercel,
              Cloudflare, a Dockerfile on ECS, a VM. Several of these tools are
              direct about one of those and clumsy about the others. The
              framework decision is often a hosting decision with extra steps.
            </>,
          ]}
        />

        <H2>Next.js 16</H2>

        <P>
          Next is a React framework whose server exists to render and mutate the
          product UI. Server Components are the component model. In 16.4, Cache
          Components are the caching model, and <IC>create-next-app</IC> turns
          them on. You mark a component or function with <IC>{`'use cache'`}</IC>{" "}
          where a cached result is safe. Dynamic work runs per request unless
          you opt in. Partial prerendering comes with that flag: the static
          shell goes out immediately, and the personalized hole streams after.
        </P>

        <P>
          {`That is a better default than the earlier App Router, where fetches were cached until a blog post told you how to opt out. Old posts about implicit caching describe a framework you will not get from a new app in November 2026. Cache Components also want the Node runtime. The route-segment runtime config, including the old edge runtime, is out of this model. A new Next app is a Node app.`}
        </P>

        <P>
          Next earns its keep when the product is the website and the team lives
          in React. Images, fonts, metadata, and forms are in the box. One repo
          holds the page and the mutation. A product team shipping a logged-in
          web app on Vercel, or on Node you operate yourself, will move faster
          here than by assembling a router, a bundler, and a cache.
        </P>

        <P>
          {`The month-six failure has a shape you can recognize. Route handlers that began as form actions are now the API for an iOS client. Cookie auth, cache tags, and revalidation leak into a client that wanted a boring JSON contract. Background jobs get stuffed into the same process because the repo was already "fullstack." Split that work out the week the second client appears. Keep Next on the web product. Put the shared API on Hono, Fastify, or Nest, with a schema the mobile app can generate from.`}
        </P>

        <P>
          Hire for Next if the team already thinks in React components. Budget
          time for the Server Component boundary. The bugs that eat a sprint are
          data passed across <IC>{`'use client'`}</IC>, and a cache tag nobody
          invalidated after a write.
        </P>

        <H2>React Router 8</H2>

        <P>
          {`React Router 8, released in June 2026, is the framework line that used to be Remix, plus the client router people have used for years. Framework mode is a Vite plugin: typed route modules, loaders, actions, code splitting, and a choice of SPA, server rendering, or static rendering. Middleware is on. The package is ESM-only and wants Node 22.22 or newer, React 19.2.7 or newer, and Vite 7 or newer. Data mode and the declarative router are still there if you want the library and mean to own the rest.`}
        </P>

        <P>
          You load data in a loader and mutate in an action. The component
          receives <IC>loaderData</IC>. A form can post without a hand-rolled{" "}
          <IC>fetch</IC>. Progressive enhancement is a real feature for flows
          that should survive a missing script. Server Components are an
          unstable side path. The stable model is the loader and the action.
        </P>

        <P>
          Pick React Router when you want that explicit data flow and you want
          to choose the host. It mounts on Express, Cloudflare, and a plain Node
          server. A team migrating off Remix, or a team that wants a React
          product without taking Next&apos;s caching model and Node-only Cache
          Components, fits here. So does a team that already runs a Node service
          and wants the UI in the same request pipeline.
        </P>

        <P>
          {`You will feel the missing pieces Next ships: an image pipeline, a font pipeline, metadata conventions, and a hosting story with opinions about cache. You write those, or you pull libraries. That is the trade. You can see the request in the loader. You can put the app on the platform you already operate.`}
        </P>

        <P>
          A large interactive app with heavy client state still works. You are
          in React, and you can turn SSR down per route. The framework will not
          invent a module system for your billing domain. If the backend is the
          larger problem, React Router is the UI, and Nest, Adonis, or Fastify
          is the API beside it.
        </P>

        <H2>TanStack Start</H2>

        <P>
          {`TanStack Start reached 1.0 on October 13, 2026. The commitment is to the APIs they shipped: the typed router, server functions, and per-route rendering. It requires Vite 8. React Server Components exist, and the docs still mark them experimental after 1.0. Leave them off unless you are ready to track that guide.`}
        </P>

        <P>
          {`Start grew out of TanStack Router. The part that is better than the alternatives is the route tree as a type: paths, params, search params, and loader data, checked against each other. Search params as typed state is the feature teams adopt and then refuse to give up. A route can server-render, load data on the server without rendering the component, or render on the client. createServerFn is a typed call your own UI makes. The docs are explicit that those functions are same-origin RPC for this app, with CSRF middleware in front of them. A partner or a mobile client should call a server route you defined as an endpoint.`}
        </P>

        <P>
          {`The built-in session helper was removed at the stable release. You bring a session library, such as iron-session, and write the cookie yourself. Hosting goes through Nitro or an Rsbuild setup, and the Nitro plugin page still says the integration is under active development. The framework API is stable. The deploy glue moves more often. Plan a day to pin versions and read the hosting guide, and plan to re-read it after an upgrade.`}
        </P>

        <P>
          Pick Start when the app is a client-heavy React product, URL state is
          part of the domain, and you want a server for loaders and mutations
          without adopting Server Components as the architecture. A dashboard
          with filters in the query string, tables, and the occasional server
          call is the home field. Pair it with TanStack Query if client caches
          are the other half of the data story.
        </P>

        <P>
          Skip it when you need RSC as the default, when you want Next&apos;s
          integrated web toolkit, or when the only consumer of the server is
          outside this repo. Also skip it if a moving deploy plugin is a problem
          for your release process. Teams were in production through the beta.
          That is evidence the model works, and it is also evidence you should
          pin the stack and read changelogs.
        </P>

        <H2>Astro 7</H2>

        <P>
          Astro renders HTML and adds JavaScript where a component asks for it.
          A client island hydrates a widget. A server island, marked{" "}
          <IC>server:defer</IC>, fills a personalized hole after the rest of the
          page is already on the screen, so the shell stays cacheable. Content
          collections, with a schema and a loader, are how you type a pile of
          markdown, a CMS, or a live source. Build-time collections update when
          you build. Live collections, stable since Astro 6, fetch on the
          request. A webhook rebuild is the right freshness model for a blog or
          a docs site. A price that changes every minute wants a live collection
          or a server island. A full React app wants a different framework.
        </P>

        <P>
          {`Astro 7, from June 2026, spends its release on build speed: a Rust compiler for .astro files, a Rust markdown pipeline, Vite 8, and queued rendering. Astro's own benchmarks put builds at 15 to 61 percent faster, with the big wins on sites of thousands of pages. Route caching is stable. CDN cache providers for Netlify, Vercel, and Cloudflare were still experimental at 7.0. Advanced Routing adds a src/fetch.ts entry if the file routes stop being enough. Current releases in early November are on the 7.4 line. The product is the same one: content-shaped sites that have outgrown a static generator and have not become an application.`}
        </P>

        <P>
          Pick Astro for docs, marketing, a content-led product, a storefront
          whose pages are mostly the same for every visitor, and a blog that
          wants MDX and a typed content layer. React, Vue, Svelte, and Solid
          components can sit in islands. The page stays HTML.
        </P>

        <P>
          {`The failure mode is a logged-in product where every region is an island and the islands start sharing a client store, a router, and a data cache. At that point you have assembled a second framework inside the first. Move that surface to Next, React Router, or Start. Keep Astro on the public content. The two deploys are cheaper than one codebase fighting itself.`}
        </P>

        <H2>NestJS 12</H2>

        <P>
          {`Nest organizes a backend. Modules, providers, guards, pipes, and interceptors are the vocabulary. Dependency injection is the mechanism. HTTP is an adapter: Express unless you pass the Fastify adapter or the node adapter that showed up on the way to version 12. Nest's own comparison page says this directly. Nest sits on those libraries. It does not replace them.`}
        </P>

        <P>
          {`Version 12, from August 2026, ships the core packages as ESM while leaving CommonJS apps able to run. The useful change for day-to-day code is Standard Schema on @Body(), @Query(), and @Param(). Zod, Valibot, and ArkType validate there once you register StandardSchemaValidationPipe, and the same schemas can feed OpenAPI. class-validator remains. "Nest means decorators and class-validator only" describes an older default. The decorators are still how you declare a controller.`}
        </P>

        <P>
          {`Those decorators are also why the build stays. Node's type stripping does not emit the metadata Nest's injector reads. You keep tsc, SWC, or the Nest CLI in the pipeline. Hono and Fastify apps can often strip types and run. A Nest app compiles.`}
        </P>

        <P>
          Pick Nest when the backend is a multi-year domain and more than a
          couple of people will touch it. Billing, auth, webhooks, a queue
          consumer, gRPC beside HTTP, and an admin module all have an obvious
          place to live. A new hire who has seen one Nest app can find the guard
          that rejected their request. Put it on the Fastify adapter when the
          traffic is JSON and you want the faster transport. Keep Express when
          you depend on Express middleware you do not want to rewrite.
        </P>

        <P>
          {`A five-route service with three modules and a custom dynamic provider is the failure. The ceremony is larger than the domain, and the person who wired the injector is the only one who can trace a request. Use Fastify or Hono until the module boundaries are real. Nest pays you back when the boundaries would otherwise be a wiki page nobody updates.`}
        </P>

        <H2>Hono 4</H2>

        <P>
          Hono is a small TypeScript router whose core is a function from a
          web-standard <IC>Request</IC> to a <IC>Response</IC>. The same handler
          runs on Cloudflare Workers, Deno, Bun, Lambda, and, through{" "}
          <IC>@hono/node-server</IC>, Node. Middleware is a chain you can read.
          Validation plugs in through Zod or another middleware. The RPC helper
          can build a typed client when the caller is TypeScript too.
        </P>

        <P>
          {`That portability is the thing it is better at. An edge API, a multi-region Worker, a small service you might move off Node later, and a BFF in front of other services are the jobs. Startup and memory stay low, which matters when the platform freezes the isolate between requests. You can hold the mental model in an afternoon: routes, context, middleware, c.json().`}
        </P>

        <P>
          Hono will also render JSX and grow a larger app. Most teams should let
          it be the HTTP layer. A React product belongs in Next, React Router,
          Start, or Astro. Hono can sit behind that UI as the API, or in front
          of it as the edge router.
        </P>

        <P>
          {`With two people, the freedom is the feature. With twelve, and no convention of your own, the repo becomes a flat list of middleware and handlers, and every service invents a different place for auth. Write the folders down while the team is small, or move the large domain to Nest once the modules are obvious. Hono's RPC client is for your own TypeScript callers. A public API still wants an OpenAPI document.`}
        </P>

        <P>
          Maintenance is concentrated. A small set of maintainers does most of
          the work, which has been true of Nest and Elysia as well. Fastify
          spreads commits wider and sits under the OpenJS Foundation. For a
          service you can replace, that difference is background. For the
          framework under the whole company, read the commit graph once and
          decide if you are comfortable.
        </P>

        <H2>Fastify 5, and the case for staying on Express 5</H2>

        <P>
          {`Fastify is a Node HTTP framework. The plugin model encapsulates decorators and hooks so one plugin does not leak into another. You can declare the request and the response with JSON Schema. With a response schema, Fastify serializes from the schema instead of walking the object with JSON.stringify. Logging, validation, and lifecycle hooks are mature. Version 5 is the current line.`}
        </P>

        <P>
          This is the Node API to pick when you want control and you expect to
          serve a lot of JSON on a long-running process. A handler that spends a
          few milliseconds in Postgres will not show a framework&apos;s
          hello-world benchmark in its latency chart. The schema serializer
          shows up when the responses are large and the route is hot. Types are
          good. The framework stays out of your folder layout, which you will
          either enjoy or replace with a written convention.
        </P>

        <P>
          {`Express 5 is still the incumbent, with a download count an order of magnitude above the others, and with middleware for almost every problem already published. It ships without its own types. Pick Express when the app exists, the middleware works, and you have no measured pain. A rewrite to Fastify for a benchmark screenshot is a poor use of a quarter. Pick Fastify for a new Node API you own, where you can commit to schemas and you do not need the long tail of Express middleware.`}
        </P>

        <P>
          Both of them are weak on the edge. They are Node servers. If the
          deploy target is a Worker, write the handler in Hono. If the team
          needs the framework to impose modules, put Nest on the Fastify adapter
          and let Fastify be the transport.
        </P>

        <H2>Elysia</H2>

        <P>
          {`Elysia treats the validation schema as the route. Types fall out of that definition, and Eden is the typed client on the other side, in the same spirit as Hono's RPC. The runtime it is built around is Bun. The stable line in November 2026 is 1.4. Version 2 is in prerelease, so a production bet belongs on 1.4 unless you have a reason to track the rewrite and a test suite that will tell you when it bites.`}
        </P>

        <P>
          The experience is the product. End-to-end inference, OpenAPI from the
          same schema, and Bun&apos;s speed are why a small team picks it over a
          portable router. Pick it when Bun is already the decision, the service
          is an API, and the callers you care about are TypeScript or can
          consume the OpenAPI file.
        </P>

        <P>
          {`The failure is a platform constraint arriving late. A vendor SDK with native bindings tested on Node, a security team that standardizes on Node 22, or a host that does not run Bun, and the framework choice has to be relitigated. Hono on Bun gives you a closer portability exit. Elysia gives you the tighter types if you are sure about the runtime. Be sure on purpose, in writing, before the service is load-bearing.`}
        </P>

        <H2>AdonisJS 7</H2>

        <P>
          {`Adonis is a batteries-included TypeScript backend in the Laravel tradition. Routing, the Ace command line, Lucid for the database, auth, validation, mail, and Edge templates come as official packages with one set of conventions. Version 7, from February 2026, is an incremental step from version 6 and requires Node 24 or newer. The part worth caring about is codegen: the framework reads your routes and feeds types back, so a URL builder and the props you pass into Edge or Inertia fail at compile time when they drift. Inertia remains the path when the UI is React or Vue and the server stays Adonis.`}
        </P>

        <P>
          Pick Adonis for a product that is a classic server application. An
          internal tool, a SaaS with server-rendered pages, a CRUD-heavy backend
          where you want migrations, auth, and mail decided in week one. You
          skip the month of choosing an ORM, a validator, a session library, and
          a folder layout. The code looks like other Adonis apps, which matters
          the day a second backend engineer joins.
        </P>

        <P>
          {`The hiring pool is smaller than Express, Next, or Nest. Some engineers will be learning the framework on the job. Official packages cover the common path, and a niche need can mean writing the integration yourself. A React-first product team that wants the UI framework in charge of the repo will be happier in Next, React Router, or Start, with a thin API behind. Adonis is the wrong center of gravity for a Worker, and it is the wrong choice if Node 24 is still a fight with your platform team.`}
        </P>

        <H2>The contract is a separate choice</H2>

        <P>
          {`tRPC makes a call from your client look like a function on your server, with the input and the output typed. It fits one TypeScript team, one repo or a tight monorepo, and no outside consumer. The moment a partner asks for a curl example, you are maintaining a second description of the API or telling them to read your routers.`}
        </P>

        <P>
          Server functions in Next and in TanStack Start are the same kind of
          tool. They are excellent inside the app. TanStack&apos;s docs tell you
          to use a server route for anyone outside it. Treat that as the general
          rule.
        </P>

        <P>
          {`When a second language, a mobile app, or a customer will call you, generate OpenAPI and treat that file as the product. Fastify schemas, Nest's Swagger module, Elysia's generator, and contract libraries such as oRPC and ts-rest can produce it. oRPC and ts-rest earn a look when you want a typed call for your own TypeScript client and a document for everyone else. The library on top matters less than the decision to have a schema that outlives the framework.`}
        </P>

        <P>
          A public tRPC router is the failure mode to avoid. So is a
          hand-written <IC>types.ts</IC> that the server and the iOS app are
          both supposed to honor. One of them will drift, and it will drift
          during an incident.
        </P>

        <H2>If the product looks like this</H2>

        <Table
          headers={["What you are shipping", "Use", "Why it wins here"]}
          rows={[
            [
              "Docs, marketing, a content site with a few widgets",
              "Astro 7",
              "HTML by default, islands for the interactive and personalized bits",
            ],
            [
              "A React product, and you can run Node",
              "Next.js 16",
              "Server Components, Cache Components, and the web toolkit in one deploy",
            ],
            [
              "A React product on a host you already run",
              "React Router 8, framework mode",
              "Loaders and actions, your own server",
            ],
            [
              "A React app whose URL state is the hard part",
              "TanStack Start 1.0",
              "Typed routes and search params, server functions for this UI only",
            ],
            [
              "A JSON API on Workers, or one handler you may move between runtimes",
              "Hono 4",
              "Web-standard Request and Response",
            ],
            [
              "A JSON API on Node that you own",
              "Fastify 5",
              "Schemas, plugins, a long-running process",
            ],
            [
              "An Express app with no measured pain",
              "Express 5",
              "The middleware and the hiring pool you already have",
            ],
            [
              "A Bun API, and Bun is a settled constraint",
              "Elysia 1.4",
              "Schema-inferred types and Eden",
            ],
            [
              "A large backend, several engineers, more than one transport",
              "NestJS 12 on Fastify",
              "Modules and DI the next hire can navigate",
            ],
            [
              "A server app that should include the ORM, auth, and mail",
              "AdonisJS 7",
              "One set of official packages, Node 24, typed routes",
            ],
            [
              "Your own TS client and server, nobody else calling",
              "tRPC, or the framework's server functions",
              "A call, with types, inside one team",
            ],
            [
              "A second language on the other end",
              "OpenAPI from the schema",
              "A contract that leaves the TypeScript repo",
            ],
          ]}
        />

        <P>
          Two combinations that hold up. Next, React Router, or Start for the
          website, and Hono or Fastify for the API the other clients share. Nest
          on Fastify when the API itself is the large codebase. Astro for the
          public content, and one of the React frameworks for the logged-in
          product, in separate deploys.
        </P>

        <P>
          {`Two combinations that get explained in a retro. Next route handlers as the only API for mobile and partners. Elysia chosen from a benchmark, then blocked by a Node-only vendor SDK. A queue consumer living inside the web process because the repo was "fullstack."`}
        </P>

        <P>
          Pick the layer that matches the client. The framework on that layer is
          a smaller argument, and you can have it with a clear head.
        </P>

        <Hr />

        <H2>What I checked</H2>

        <P>
          Release notes and docs, read in November 2026. If you are picking one
          of these later, re-read the version line before you trust the details.
        </P>

        <UL
          items={[
            <A key="next" href="https://nextjs.org/blog/next-16-4">Next.js 16.4, Cache Components</A>,
            <A key="rr" href="https://remix.run/blog/react-router-v8">React Router v8</A>,
            <A key="start" href="https://tanstack.com/blog/tanstack-start-1-0">TanStack Start 1.0</A>,
            <A key="astro" href="https://astro.build/blog/astro-7/">Astro 7</A>,
            <A key="nest" href="https://docs.nestjs.com/faq/nest-vs-fastify-express-hono">Nest versus Fastify, Express, and Hono</A>,
            <A key="adonis" href="https://adonisjs.com/blog/v7">AdonisJS v7</A>,
          ]}
        />

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
