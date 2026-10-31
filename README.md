# Harvey — Command Deck (React)

Autonomous outbound sales agent dashboard rewritten in **React 19 + TypeScript + Vite**.

Harvey is an autonomous sales agent command deck designed to search the web for high-intent target accounts, verify public signals (careers postings, tech footprints, recent funding rounds), draft hyper-tailored email sequences, manage a human-in-the-loop review outbox, and converse with prospects through to booked meetings.

## Key Features & Capabilities

- **Today (Mission Control)**: High-level KPI meters with 14-day trend sparklines, setup progress checklist, autonomous pipeline step runner with live progress and cost tracking, "Needs You" action queue, and contacts funnel bar.
- **Outbox (Decision Desk)**: One-at-a-time review interface. Review cold email drafts alongside company profile, website link, verified signals, and writer notes. In-place subject & body editor, "Approve & Send", "Reject", "Approve All", and Autopilot hold safety warnings.
- **Conversations**: Inbound reply handling classified by intent (Interested, Objection, Question, Meeting request, Out of office). Full chronological thread history of outbound cold emails, received prospect replies, and AI-drafted responses waiting for sign-off.
- **Signals & Cohort Builder**: Confirmation gate for proposed market signals (Hiring roles, sales expansion, tech stack, Y Combinator, Series A funding). Interactive Cohort Query Builder with instant match count calculation and CSV export.
- **Discover**: Multi-provider company discovery supporting OpenStreetMap (free), TinyFish web agent, Serper Google search, and DataForSEO SERP. Live cost and query estimator with spend caps.
- **Companies & Contacts**: Searchable directory with company drilldown into verified contact details, phone verification badges, LinkedIn profile links, deliverability statuses, score meters, opt-out reason inspection, and CSV export.
- **Campaigns**: Multi-step sequence manager with delay tracking, progress breakdown, feedback loop, and direct "Open in Gmail" compose integration with merge variable replacement.
- **Usage & Activity**: Detailed 30-day token output chart, call and token breakdowns by provider, agent, task, and model, as well as an audit log of every autonomous action.
- **Controls & Settings**: Background process manager with live console streaming, persona and pitch configuration, mail channel credentials (Gmail, Microsoft 365, SMTP/IMAP), and Autopilot arming safety lock.
- **Appearance**: Seamless Auto / Light / Dark theme switching with handcrafted typography (Geist and Geist Mono fonts) and responsive layouts.

## Architecture & Technology

- **Frontend Framework**: React 19 SPA
- **Language**: TypeScript
- **Bundler & Dev Server**: Vite (`0.0.0.0:3000`)
- **State & Storage**: React Context with localStorage persistence
- **Design & Typography**: Custom CSS design system with Geist & Geist Mono fonts and SVG sprite iconography

## Development

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```
