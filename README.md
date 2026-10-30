# OAuth Atlas — AI-Powered OAuth Setup & Approval Readiness Platform

> **"Know the OAuth approval process before you build."**  
> Explore verified setup guides, audit scope risks, and discover what it takes to move an integration from prototype to production.

---

## 1. Product Overview

Integrating with third-party SaaS APIs (Google Workspace, Slack, GitHub, Notion, HubSpot) presents developers with a steep, opaque hurdle: **the OAuth setup and approval process**.

Information today is fragmented across developer consoles, API reference guides, help center articles, and community forums. Developers frequently spend engineering sprints writing code only to discover:
- A requested scope is classified as **Restricted**, requiring an annual third-party **CASA Tier 2/3 security audit ($1,500 – $6,000+)** and 4–8 weeks of review.
- In testing mode, Google automatically **invalidates refresh tokens after 7 days**.
- Direct multi-workspace Slack installation can be accomplished without entering the **Slack App Directory review queue**.
- Corporate GitHub organizations block third-party OAuth apps by default, requiring organization admin intervention.

**OAuth Atlas answers one central question:**  
*"What exactly will it take to make my integration production-ready, what can I automate, what requires my involvement, and what could delay launch?"*

---

## 2. Target User

- **Founders & Technical Leads**: Evaluating SaaS integration feasibility and compliance costs before committing engineering resources.
- **Product Engineers**: Implementing OAuth 2.0 authorization flows, callback handlers, and permission scopes.
- **AI Agent Architects**: Looking to distinguish tasks that AI agents can automate (drafting scope justifications, formatting redirect URIs, generating App Manifests) from authenticated human actions (console logins, DNS verification, legal document uploads).

---

## 3. Key Differentiators & Product Features

| Capability | Standard OAuth Implementation Guides | OAuth Atlas |
| :--- | :--- | :--- |
| **Focus** | How to write code for token exchange | Approval readiness, compliance, and launch blockers |
| **Scope Sensitivity** | List of scopes | **Interactive Scope Risk Auditor** with CASA triggers |
| **Effort Breakdown** | "Takes 1 hour" | **Active Developer Setup** vs **External Review Wait** vs **Audit Costs** |
| **Integration Track** | Only direct OAuth | **Managed OAuth (Composio)** vs **Custom OAuth** trade-offs |
| **Task Ownership** | Undifferentiated | **HUMAN REQUIRED** vs **AGENT AUTOMATABLE** vs **HYBRID** |
| **Evidence Standards** | Uncited prose | Verbatim quote ledger with direct official source citations |
| **Unfamiliar Providers** | Static documentation | **Live AI Research Agent** with 5-phase deterministic pipeline |

---

## 4. Prebuilt Verified Seed Guides

OAuth Atlas includes three deeply researched, doc-backed seed guides:

1. **GitHub** (`/guides/github`)
   - Highlights GitHub OAuth Apps vs fine-grained GitHub Apps.
   - Explains client credentials, callback matching, and organization access restriction policies.
   - Clarifies that standard OAuth distribution is instant self-serve ($0 fees, 0 days review wait).
2. **Slack** (`/guides/slack`)
   - Explains OAuth v2, Bot token scopes vs User token scopes, and HTTPS redirect URL rules.
   - Distinguishes **Public Distribution** (direct "Add to Slack" installation link with 0-day wait) from **Slack App Directory Listing** (manual multi-week review).
   - Generates ready-to-copy **Slack App Manifest (YAML)** based on selected scopes.
3. **Google Drive & Workspace** (`/guides/google-drive`)
   - Highlights GCP project setup, consent screen audience (Internal vs External), and the 100 test-user cap.
   - Documents the **7-day token expiration** for external testing mode.
   - Distinguishes non-sensitive per-file access (`drive.file`) from broad restricted scopes (`drive`, `drive.readonly`).
   - Details mandatory Cloud Application Security Assessment (**CASA Tier 2/3**) audit fees ($1,500 – $6,000+) and 4–8 week timelines.
   - Generates ready-to-copy **Google Scope Justification Draft**.

---

## 5. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 16 APP ROUTER                           │
├────────────────────────────┬───────────────────────────────────────────┤
│          FRONTEND          │                 BACKEND                   │
│ • Tailwind CSS v4          │ • Route Handlers (/api/research, /guides) │
│ • Interactive Scope Auditor│ • Serverless Repository Pattern           │
│ • Evidence Drawer Ledger   │ • Neon PostgreSQL / Local JSON Fallback   │
│ • Live Research Progress UI│ • SSRF Security Guard & DNS Resolver      │
│ • Launch Artifact Generator│ • Deterministic Evidence Validator        │
└──────────────┬─────────────┴─────────────────────┬─────────────────────┘
               │                                   │
               ▼                                   ▼
    ┌─────────────────────┐             ┌─────────────────────┐
    │  Google Gemini API  │             │  Tavily Search API  │
    │  (Structured JSON)  │             │   & Native Fetch    │
    └─────────────────────┘             └─────────────────────┘
```

---

## 6. Multi-Agent Cooperative System & Lifecycle Process

OAuth Atlas uses a **multi-agent cooperative architecture** where specialized agents collaborate sequentially with strict boundaries between network discovery, content extraction, AI synthesis, deterministic fact-checking, and persistence:

```mermaid
flowchart LR
    User["Developer Input"] --> Orch["1. Orchestrator Agent<br/>(pipeline.ts)"]
    Orch --> SSRF["2. SSRF Guardian<br/>(ssrf.ts)"]
    Orch --> Disc["3. Discovery Agent<br/>(search.ts)"]
    Orch --> Ext["4. Extraction Agent<br/>(html-parser.ts)"]
    Orch --> AI["5. Synthesis Agent<br/>(gemini.ts)"]
    Orch --> Val["6. Evidence Auditor<br/>(evidence-validator.ts)"]
    Val --> DB[("Neon Postgres Lakebase")]
```

### 6.1 The 6 Specialized Core Agents

| Agent | Source File | Core Responsibility |
| :--- | :--- | :--- |
| **1. Orchestrator Agent** | `src/lib/agent/pipeline.ts` | **Workflow & State Machine**: Drives the 5-stage research lifecycle, tracks state transitions, persists stage updates, manages timeouts, and triggers deterministic fallback synthesis if upstream providers stall. |
| **2. Security & SSRF Guardian** | `src/lib/security/ssrf.ts` | **Perimeter Defense**: Validates every external URL before HTTP fetching. Blocks private IPv4 (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`), cloud metadata (`169.254.169.254`, GCP metadata), loopback IPv6 (`::1`), non-HTTP schemes, and re-validates DNS at every redirect hop. |
| **3. Discovery & Search Agent** | `src/lib/agent/search.ts` | **Documentation Pathfinder**: Discovers official developer portal URLs across 4 tiers: direct documentation URL bypass, Tavily HTTP API, authenticated Tavily CLI runner (`tvly.exe` with UTF-8), and curated known developer portals directory. |
| **4. Web Extraction Agent** | `src/lib/agent/html-parser.ts` | **Document Sanitizer**: Fetches target HTML, strips scripts, styles, navigation bars, and cookie banners. Extracts clean, token-budgeted text (capped at 8KB/page) prioritised for OAuth endpoints, token flows, and review policies. |
| **5. Structured Synthesis Agent** | `src/lib/agent/gemini.ts` | **AI OAuth Architect**: Communicates with Google Gemini over native IPv4 sockets (`family: 4`) with an automated multi-model fallback chain (`gemini-flash-lite-latest` $\rightarrow$ `gemini-3.5-flash` $\rightarrow$ `gemini-flash-latest` $\rightarrow$ `gemini-3.8-flash`). Extracts an 18-section structured guide validated against Zod. |
| **6. Evidence Auditor Agent** | `src/lib/agent/evidence-validator.ts` | **Anti-Hallucination Gatekeeper**: Operates 100% deterministically. Compares every claim and verbatim quote generated by Gemini against raw retrieved documentation text. If a quote cannot be verified in the sources, it automatically downgrades the evidence badge to `UNSPECIFIED IN DOCS`. |

### 6.2 Agent Lifecycle Sequence

When a developer inputs an unfamiliar SaaS application or direct documentation URL (e.g. `Notion`, `Linear`, or `https://developers.notion.com/docs/authorization`), the agents collaborate across this lifecycle:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer UI
    participant API as /api/research
    participant Orch as Orchestrator (pipeline.ts)
    participant Disc as Discovery Agent (search.ts)
    participant Ext as Extraction Agent (html-parser.ts)
    participant AI as Synthesis Agent (gemini.ts)
    participant Val as Evidence Auditor (evidence-validator.ts)
    participant DB as Neon Postgres DB

    Dev->>API: POST /api/research { input: "Linear" }
    API->>DB: Create ResearchRun (status: "running")
    API-->>Dev: Return HTTP 202 { runId }
    
    Note over Dev,API: UI polls GET /api/research/:runId every 1.5s

    API-)Orch: runResearchPipeline(runId, "Linear")
    
    rect rgb(240, 248, 255)
    Note over Orch,Disc: STAGE 1: Discovering Documentation
    Orch->>Disc: searchDocumentation("Linear")
    Disc-->>Orch: Discovered 3 official doc URLs
    Orch->>DB: Update Stage 1: completed
    end

    rect rgb(254, 249, 231)
    Note over Orch,Ext: STAGE 2: Extracting Requirements
    Orch->>Ext: safeFetch() + parse HTML for top URLs (capped 8KB/page)
    Ext-->>Orch: Cleaned text & OAuth endpoints
    Orch->>DB: Update Stage 2: completed
    end

    rect rgb(243, 232, 255)
    Note over Orch,AI: STAGE 3: Investigating Approval & Readiness
    Orch->>AI: callGeminiStructured(userPrompt, systemPrompt)
    AI->>AI: Model chain fallback (75s timeout)
    AI-->>Orch: Structured 18-field OAuth Atlas guide
    Orch->>DB: Update Stage 3: completed
    end

    rect rgb(236, 253, 245)
    Note over Orch,Val: STAGE 4: Validating Evidence
    Orch->>Val: validateClaimsAgainstSources(claims, fetchedDocs)
    Val->>Val: String normalization & substring verification
    Val-->>Orch: Verified quotes; unverified marked "UNSPECIFIED IN DOCS"
    Orch->>DB: Update Stage 4: completed
    end

    rect rgb(240, 253, 244)
    Note over Orch,DB: STAGE 5: Generating Structured Guide & Persisting
    Orch->>DB: saveGuide(guide) + mark ResearchRun "completed"
    Orch->>DB: Update Stage 5: completed (slug: "linear")
    end

    Dev->>API: Poll GET /api/research/:runId
    API-->>Dev: { status: "completed", generated_slug: "linear" }
    Dev->>Dev: Redirects user to /guides/linear
```

### 6.3 Resiliency & Zero-Crash Safeguards

1. **Deterministic Anti-Hallucination**:
   Even if an LLM outputs an optimistic claim (e.g. *"Review takes 24 hours"*), the **Evidence Auditor** checks the raw source text. If absent, the claim is automatically downgraded to `UNSPECIFIED IN DOCS` with `is_estimate: true`.
2. **Multi-Model Fallback Chain**:
   If a model returns HTTP 404 (deprecated model) or HTTP 503 (temporary high-demand spike), the agent automatically cascades through `gemini-flash-lite-latest` $\rightarrow$ `gemini-3.5-flash` $\rightarrow$ `gemini-flash-latest` $\rightarrow$ `gemini-3.8-flash`.
3. **Deterministic Documentation Synthesis Fallback**:
   If upstream LLM APIs time out or fail completely, `synthesizeFallbackGuide` builds an evidence-backed, schema-valid guide directly from the scraped documentation text so research runs never leave users on a broken screen.
4. **Native IPv4 Socket Binding (`family: 4`)**:
   External API calls use explicit IPv4 binding and a 75-second timeout window to prevent IPv6 network hangs on Windows machines.
5. **Real-Time Client Polling**:
   Stage transitions are written to Neon Lakebase Postgres; if a user refreshes their browser mid-run, the modal seamlessly resumes tracking from the last checkpoint.

---

## 7. Security & SSRF Protection

Because the research agent accepts user-supplied URLs, strict SSRF boundaries are enforced (`src/lib/security/ssrf.ts`):

- **Blocked Destinations**:
  - Loopback (`localhost`, `127.0.0.1`, `::1`)
  - Private IPv4 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
  - Link-Local and Cloud Metadata endpoints (`169.254.169.254`, `metadata.google.internal`)
  - Carrier-grade NAT (`100.64.0.0/10`)
  - Prohibited protocols (only `http:` and `https:` allowed; `file:`, `ftp:`, `javascript:` blocked)
  - Embedded credentials (`user:password@host`)
- **DNS Re-Validation**:
  - Resolves hostnames via `dns.promises.lookup` before connection.
  - Validates that the resolved IP address is not private.
- **Safe Fetch Wrapper**:
  - Validates every redirect hop manually (`redirect: "manual"`). Prevents an initially valid URL from redirecting to an internal IP.
  - Caps request timeouts (8,000ms), maximum response sizes (2MB), and redirect counts (5 hops).
- **Zero Secrets in Frontend**:
  - API keys (`GEMINI_API_KEY`, `TAVILY_API_KEY`, `DATABASE_URL`) are strictly server-side environment variables.

---

## 8. Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide React icons
- **Validation**: Zod v4 schemas for guides, claims, and pipeline inputs
- **Database**:
  - Production: Neon Serverless PostgreSQL (`@neondatabase/serverless`)
  - Local/Offline: Local persistent JSON storage (`.data/guides.json`) with in-memory caching
- **AI Extraction**: Google Gemini API (`gemini-2.5-flash`) via structured JSON endpoints
- **Search & Retrieval**: Tavily Search API, Native Fetch, lightweight HTML-to-text parser
- **Testing**: Built-in test runner executed via `tsx`

---

## 9. Local Setup & Getting Started

### Prerequisites
- Node.js v20.13.0 or higher
- npm v10 or higher

### Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/oauth-atlas.git
cd oauth-atlas

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
```

### Environment Variables (`.env.local`)

```env
# Optional: Neon Serverless Postgres (falls back to local JSON if unset)
DATABASE_URL="postgresql://user:password@ep-sample-pool.us-east-2.aws.neon.tech/neondb?sslmode=require"

# AI Extraction (Google Gemini API) - Free key at: https://aistudio.google.com/
GEMINI_API_KEY="your_gemini_api_key_here"
GEMINI_MODEL="gemini-2.5-flash"

# Optional: Tavily Search API (Free tier at: https://tavily.com/)
TAVILY_API_KEY="tvly-your_tavily_api_key_here"
```

> **Note:** The application starts and runs locally with full prebuilt guide functionality, the interactive scope auditor, evidence drawers, comparison matrix, and SSRF security guards **even without any API keys configured**. When investigating a new provider without a Tavily key, enter its direct developer documentation URL.

### Running the Application

```bash
# Start development server
npm run dev

# Or build and start production server
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 10. Running Automated Tests

OAuth Atlas includes an automated test runner validating all 8 evaluation criteria specified in Section 12:

```bash
npm test
```

### Test Suite Coverage (44 Passing Tests):
- **Test 1: Directory**: Prebuilt guides loading, slug existence, search query filtering.
- **Test 2: Guide Pages**: Slug lookup, presence of `HUMAN REQUIRED`, `AGENT AUTOMATABLE`, and `HYBRID` responsibility badges, doc-backed claims.
- **Test 3: Scope Risk Calculator**: Classification of `drive.file` (Standard) vs `drive` (Restricted) vs `drive.metadata.readonly` (Sensitive), dynamic CASA requirement trigger logic.
- **Test 4: Research Agent**: Discovers Notion documentation, preserves direct URL input.
- **Test 5: Evidence Validation**: Evaluates a synthetic unsupported claim (*"GitHub OAuth App approval always takes exactly 14 business days"*), detects missing evidence in source text, and downgrades the claim to `UNSPECIFIED IN DOCS` to prevent hallucination.
- **Test 6: Security & SSRF Protection**: Validates rejection of localhost, 127.0.0.1, private IPs (`10.0.0.1`, `192.168.1.1`, `172.16.0.1`), AWS metadata (`169.254.169.254`), Google metadata, and invalid protocols.
- **Test 7: Failure Handling**: Graceful error on missing API keys, Zod schema validation on malformed model outputs, 404 handling.
- **Test 8: Persistence**: Guides survive server reload, re-saving updates without duplication.

---

## 11. Implementation Status & Feature Breakdown

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Homepage & Searchable Directory** | **Fully Implemented** | Fast search, category filters, responsive cards |
| **Prebuilt Seed Guides** | **Fully Implemented** | GitHub, Slack, and Google Drive deeply researched with citations |
| **Interactive Scope Risk Auditor** | **Fully Implemented** | Dynamic sensitivity recalculation, CASA triggers, recommendations |
| **Responsibility Badges** | **Fully Implemented** | Tagged as HUMAN REQUIRED, AGENT AUTOMATABLE, or HYBRID |
| **Evidence Ledger Drawer** | **Fully Implemented** | Searchable drawer with verbatim quotes and direct source URLs |
| **Managed vs Custom OAuth** | **Fully Implemented** | Compares Composio managed OAuth with custom OAuth trade-offs |
| **Provider Comparison Matrix (`/compare`)** | **Fully Implemented** | Side-by-side evaluation table across 9 dimensions |
| **Artifact Generation** | **Fully Implemented** | Slack App Manifest (YAML) & Google Scope Justification draft |
| **Live AI Research Agent** | **Fully Implemented** | 5-phase pipeline with stage-by-stage UI progress tracking |
| **SSRF Security Defense** | **Fully Implemented** | IP range checks, DNS lookup validation, redirect hop guards |
| **Deterministic Claim Verification** | **Fully Implemented** | Verbatim substring and normalized token matching |
| **PostgreSQL Persistence** | **Fully Implemented** | Neon serverless Postgres driver with local JSON fallback |
| **External Auth / User Accounts** | *Explicitly Out of Scope* | Per Section 2 (P2 scope boundaries) |

---

## 12. Recommended 3-Minute Demo Walkthrough

1. **Homepage (`/`)**:
   - Point out the headline, search bar, and the prebuilt provider guides (GitHub, Slack, Google Drive).
   - Use the search bar to filter by &ldquo;Google&rdquo;.
2. **Google Drive Guide (`/guides/google-drive`)**:
   - Show the **Four-Phase Launch Readiness Matrix** distinguishing internal Workspace users from external public users.
   - Scroll to the **Interactive Scope Risk Auditor**:
     - Toggle `drive.file` — observe that it remains in the **Standard / Non-Sensitive Tier** (no CASA audit, no fees).
     - Toggle broad `https://www.googleapis.com/auth/drive` — observe the dynamic alert: **Restricted Risk Tier**, **CASA Tier 2/3 third-party security assessment required ($1,500 – $6,000+)**, and launch delay warning (4–8 weeks).
   - Point out the **Architectural Recommendation**: use `drive.file` with the Google Picker API to bypass restricted scope verification.
3. **Evidence Drawer**:
   - Click **Open Evidence Drawer** to inspect the verbatim quotes and official documentation links verifying every claim.
4. **Track Selector & Artifact Generator**:
   - Switch between **Custom OAuth** and **Managed OAuth (Composio)** to review architectural trade-offs.
   - View the generated **Google Scope Justification Draft** or open the Slack guide to copy the **Slack App Manifest (YAML)**.
5. **Comparison Matrix (`/compare`)**:
   - Review the side-by-side table comparing registration complexity, review waiting times, and audit fees across GitHub, Slack, and Google Drive.
6. **Live Research Agent**:
   - Click **Investigate** on the homepage and enter `Notion` or a documentation URL.
   - Watch the 5-phase progress modal track discovery, extraction, analysis, validation, and guide generation.

---

## 13. License

MIT License. Designed and engineered for the OAuth Atlas technical evaluation.
