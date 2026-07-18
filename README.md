<div align="center">

# 🏟️ Stadium OS
### World Cup 2026 · Real-Time Stadium Mission Control Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy](https://img.shields.io/badge/Deployed_on-Render-46E3B7?logo=render&logoColor=white)](https://stadium-os-2026-1.onrender.com)

**A premium, AI-powered operations dashboard orchestrating a swarm of 12 specialized agents across fans, volunteers, and mission control — all in real time.**

---

### 🌐 [Live Demo → https://stadium-os-2026-1.onrender.com](https://stadium-os-2026-1.onrender.com)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo Layouts](#-live-demo-layouts)
- [Key Features](#-key-features--architecture)
- [Agent System](#-agent-system--capability-registry)
- [Technology Stack](#%EF%B8%8F-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Available Routes](#-available-routes)
- [Responsive Design](#-responsive-design)
- [Multilingual Support](#-multilingual-support)
- [Environment Variables](#-environment-variables-optional)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🧭 Overview

**Stadium OS** is a high-fidelity simulation of a **FIFA World Cup 2026 stadium operating system** built for MetLife Stadium, New Jersey. It demonstrates how a decentralized swarm of AI agents can orchestrate real-time crowd intelligence, emergency response, volunteer dispatch, multilingual communication, and pathfinding across 80,000 attendees — with zero backend infrastructure required.

The entire platform runs as a **100% static, client-side application** — no database, no cloud functions, no API keys required. All multi-agent event processing, Dijkstra routing, real-time cross-tab synchronization, and AI copilot responses are simulated in-browser using React Context, `localStorage`, and a local event bus.

> Built as a **Virtual Hackathon submission** demonstrating production-grade AI agent orchestration patterns in a zero-cost, zero-dependency architecture.

---

## 🚀 Live Demo Layouts

Open the live deployment and navigate to any role-specific view:

| Route | Interface | Description |
|-------|-----------|-------------|
| [`/`](https://stadium-os-2026-1.onrender.com/) | 🏠 **Role Selection** | Premium landing gateway — select your operational role |
| [`/simulator`](https://stadium-os-2026-1.onrender.com/simulator) | 🖥️ **Integrated Simulator** | All three panels side-by-side, fully synchronized in real time |
| [`/fan`](https://stadium-os-2026-1.onrender.com/fan) | 📱 **Fan Companion App** | Mobile-first ticket scanning, AI Copilot, navigation & concessions |
| [`/volunteer`](https://stadium-os-2026-1.onrender.com/volunteer) | 📋 **Volunteer Tablet** | Touch-optimized staff dispatch tablet with real-time task assignments |
| [`/command`](https://stadium-os-2026-1.onrender.com/command) | 🎛️ **Mission Control** | Digital Twin map, emergency controls, live audit terminal |

### 🎬 Try This Demo Flow

1. Open `/simulator` in your browser (full-width screen recommended for desktop, or use the tab switcher on mobile)
2. **Click "Scan Ticket"** in the Fan panel → watch the Dijkstra route light up on the Digital Twin map
3. **Click "Panic Button"** → see the swarm dispatch a volunteer, plot the AED route, and log the event chain
4. **Click "Lost Child"** → observe the Vision Agent analyze, dispatch Sarah Chen, and create the Amber Alert task card
5. Open `/command` in a **second browser tab** → changes sync instantly across tabs via `localStorage` events

---

## 🧠 Key Features & Architecture

### 1. Decentralized Multi-Agent Orchestrator

The heart of Stadium OS is a **swarm-based event bus** modeled on production multi-agent system patterns:

- **Event Bus**: All agents subscribe to a shared `agent_events` queue. Events carry a type, source agent, target agent, priority, and a `correlationId` for full trace logging.
- **Capability Registry**: Incoming queries are dynamically matched to agents by capability (e.g., `NAVIGATION`, `CROWD_DENSITY`, `EMERGENCY`, `TRANSLATION`) — not hardcoded routing chains.
- **Lease & Retry System**: Each event is atomically claimed with a worker ID, `startedAt`, and `leaseExpiresAt`. Failed events retry up to 3× with exponential backoff before routing to the **Dead Letter Queue (DLQ)**.
- **Human Authorization Gate**: Critical emergency actions (Stadium Alarm, Evacuation) are gated behind a **15-second countdown approval modal**. Unapproved actions auto-escalate to a supervisor queue.
- **Idempotency Keys**: Duplicate panic alarms and re-submitted lost child reports are rejected using event-level idempotency checking.

### 2. Digital Twin & Dijkstra Routing Engine

- Full **SVG stadium map** of MetLife Stadium including gates, concourses, AED cabinets, food courts, restrooms, and seating sections.
- **Dijkstra's Shortest Path Algorithm** computes optimal routes in real time between any two nodes.
- **Step-Free Mode**: Toggleable accessibility flag that re-weights graph edges through stairwell nodes, routing fans through ramp-only paths. Sections without step-free access receive WCAG-compliant color + icon warnings (`♿🚫`).
- **Dynamic Incident Overlays**: Active incidents, volunteer positions, and highlighted Dijkstra paths are rendered live on the map.

### 3. Cross-Tab Real-Time Synchronization

- Uses the browser's native **`window.storage` event API** to broadcast state changes across simultaneously open tabs.
- Opening `/fan`, `/volunteer`, and `/command` in three separate windows produces a fully synchronized multi-screen operations center — no WebSockets, no backend required.

### 4. AI Fan Copilot

- **Demo Mode (default)**: A local keyword-parsing engine generates realistic, multilingual AI responses for navigation, food, transit, accessibility, and emergency queries — with no API calls.
- **Live Gemini Mode (optional)**: If a Gemini API key is stored in `localStorage`, the copilot routes real queries through `gemini-2.5-flash` with graceful fallback to demo mode on quota errors.
- Maintains a **rolling 10-message conversation memory** per session.

### 5. Swarm Incident Dispatching

| Event | Agent Chain | Outcome |
|-------|-------------|---------|
| **Panic Button** | Fan → Emergency Agent → Volunteer Agent | AED route plotted, nearest volunteer dispatched, dual-event logged |
| **Lost Child Upload** | Fan → Vision Agent → Volunteer Agent | Amber Alert card created on volunteer tablet, Dijkstra route to search zone plotted, broadcast to all staff |
| **Manual Stadium Alarm** | Command → Emergency Agent → Human Gate | 15s approval modal with supervisor escalation on timeout |
| **Ticket OCR Scan** | Fan → Vision Agent → Navigation Agent + Crowd Agent (parallel) | Seat validated, optimal gate route highlighted, crowd density overlaid |

### 6. Multilingual Operations Layer

- **5 languages**: English, Spanish (`es`), Arabic (`ar`), Portuguese (`pt`), French (`fr`)
- **Automatic RTL layout** switches to right-to-left direction when Arabic is selected (`dir="rtl"` on the root `<html>` element)
- **Side-by-side translations** appear in the Volunteer Tablet and Audit Terminal — original foreign-language staff messages appear next to their English operational translations for cross-country coordination.

---

## 🤖 Agent System & Capability Registry

| Agent | Capabilities | Triggers |
|-------|-------------|----------|
| **Command Orchestrator** | `ORCHESTRATE`, `ROUTE` | All incoming fan/staff queries |
| **Vision Agent** | `OCR_SCAN`, `IMAGE_CLASSIFY` | Ticket scan, lost child photo upload |
| **Navigation Agent** | `PATHFIND`, `STEP_FREE_ROUTE` | Seat lookup, gate routing, incident response |
| **Crowd Intelligence Agent** | `DENSITY_ANALYSIS`, `GATE_CONGESTION` | Post-scan crowd overlay, gate divert alerts |
| **Emergency Agent** | `PANIC_DISPATCH`, `AED_LOCATE`, `ALARM_PROPOSE` | Panic button, stadium alarm |
| **Volunteer Agent** | `DISPATCH_STAFF`, `ROSTER_CLAIM` | Lost child, medical, panic events |
| **Translation Agent** | `TRANSLATE_ES`, `TRANSLATE_AR` | Staff message normalization |
| **Fan Experience Agent** | `COPILOT_CHAT`, `CONCESSION_QUERY` | AI Copilot conversations |
| **Accessibility Agent** | `RAMP_ROUTE`, `DISABILITY_ASSIST` | Step-free toggle, wheelchair routing |
| **Transport Agent** | `TRANSIT_STATUS`, `SHUTTLE_ETA` | Transit tab queries |
| **Analytics Agent** | `KPI_REPORT`, `RESPONSE_TIME` | Dashboard metric cards |
| **Sustainability Agent** | `GREEN_SCORE`, `ENERGY_AUDIT` | Environmental KPI tracking |

---

## 🛠️ Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | [Next.js App Router](https://nextjs.org) | 14.2.3 |
| Language | TypeScript (strict mode) | 5.4.5 |
| Styling | Tailwind CSS + Vanilla CSS | 3.x |
| Icons | Lucide React | 0.378.0 |
| Animations | Framer Motion | 11.2.6 |
| AI SDK | @google/genai (optional) | 0.1.1 |
| State | React Context + localStorage | – |
| Export | Next.js Static Export (`output: 'export'`) | – |
| Hosting | Render (static site) | – |

> **Zero external runtime dependencies.** No database, no server functions, no authentication service required.

---

## 📂 Project Structure

```
Stadium-os-2026/
├── public/
│   ├── stadium-os-logo.svg      # Custom top-down stadium radar SVG logo
│   └── favicon.svg              # Matching favicon variant
│
├── src/
│   ├── agents/
│   │   ├── agents.ts            # 12 specialized agent implementations
│   │   ├── commandOrchestrator.ts  # Capability registry & event routing
│   │   └── copilotEngine.ts     # AI Copilot (demo mode + Gemini API)
│   │
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout, global header, RTL switch
│   │   ├── page.tsx             # Role selection landing page
│   │   ├── globals.css          # Tailwind base + glassmorphism utilities
│   │   ├── command/
│   │   │   └── page.tsx         # Mission Control cockpit
│   │   ├── fan/
│   │   │   └── page.tsx         # Fan mobile companion app
│   │   ├── simulator/
│   │   │   └── page.tsx         # Integrated 3-panel simulator sandbox
│   │   └── volunteer/
│   │       └── page.tsx         # Volunteer staff dispatch tablet
│   │
│   ├── components/
│   │   └── StadiumMap.tsx       # Interactive SVG Digital Twin component
│   │
│   ├── context/
│   │   └── StadiumOSContext.tsx # Global state, event bus, localStorage sync
│   │
│   ├── modules/
│   │   ├── accessibilityModule.ts  # Step-free graph weighting
│   │   └── stadiumOperations.ts    # Ticket, concessions, transit logic
│   │
│   ├── utils/
│   │   ├── dijkstra.ts          # Dijkstra's shortest path algorithm
│   │   └── translations.ts      # 5-language translation dictionary
│   │
│   └── mockData.ts              # Stadium graph, roster, concessions, transit
│
├── tailwind.config.js           # Obsidian/neon color tokens & shadow config
├── next.config.mjs              # Static export + image optimization config
├── tsconfig.json                # TypeScript strict configuration
└── package.json                 # Locked dependency versions
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** `>= 20.9.0` — [Download](https://nodejs.org)
- **npm** `>= 10.x` (bundled with Node.js)
- **Git** — [Download](https://git-scm.com)

### 1. Clone the Repository

```bash
git clone https://github.com/Priyan120-dev/Stadium-os-2026.git
cd Stadium-os-2026
```

### 2. Install Dependencies

```bash
npm install
```

All dependencies are version-locked in `package.json`. No global installations are needed.

### 3. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The dev server supports Hot Module Replacement (HMR).

### 4. Build for Production

```bash
npm run build
```

Generates a fully static export in the `out/` directory. This can be deployed to any static hosting provider (Render, Vercel, Netlify, GitHub Pages, etc.).

### 5. Preview the Production Build Locally

```bash
npx serve out
```

---

## 🗺️ Available Routes

| URL | Component | Description |
|-----|-----------|-------------|
| `/` | `app/page.tsx` | Role selector gateway — choose Fan, Volunteer, Command, or Simulator |
| `/fan` | `app/fan/page.tsx` | Full-screen fan mobile companion app with AI copilot |
| `/volunteer` | `app/volunteer/page.tsx` | Volunteer staff dispatch tablet |
| `/command` | `app/command/page.tsx` | Operations mission control cockpit |
| `/simulator` | `app/simulator/page.tsx` | Unified 3-panel simulator sandbox |

---

## 📱 Responsive Design

Stadium OS is fully **mobile-first responsive** across all screen sizes:

| Viewport | Behavior |
|----------|----------|
| **375px – 767px (Mobile)** | Full-screen layouts, stacked columns, mobile tab switcher in Simulator, 44px+ touch targets |
| **768px – 1023px (Tablet)** | Split roster/detail panels, condensed status bar, scrollable sections |
| **1024px – 1279px (Laptop)** | Standard dashboard grid, multi-column cockpit layouts |
| **1280px+ (Desktop)** | Full 3-panel simulator side-by-side, complete status bar details |

Key responsive behaviors:
- **Simulator**: On mobile/tablet, shows one panel at a time with a **Fan / Volunteer / Command** tab switcher
- **Header**: Non-essential metrics (occupancy, health score, clock) progressively hide on smaller viewports
- **Fan App**: Mockup phone frame collapses to full-screen native app layout on real phones
- **Volunteer Tablet**: Crew roster and task dispatch stack vertically on phones

---

## 🌐 Multilingual Support

Change the language using the dropdown in the top header. All UI text, alerts, and operational logs update instantly.

| Language | Code | RTL |
|----------|------|-----|
| English | `en` | No |
| Español | `es` | No |
| العربية | `ar` | **Yes** — full RTL layout |
| Português | `pt` | No |
| Français | `fr` | No |

Translation keys are defined in [`src/utils/translations.ts`](src/utils/translations.ts). Each key covers all 5 languages. When Arabic is selected, the root HTML element switches to `dir="rtl"` and all Tailwind flex/spacing utilities reverse automatically.

---

## 🔑 Environment Variables (Optional)

The application works **fully without any environment variables**. The optional Gemini API integration enables real AI responses in the Fan Copilot:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key for live AI copilot mode | ❌ Optional |

To enable it:
1. Create a `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```
2. Restart the dev server.

Without the key, the copilot runs in **Demo AI Mode** — a local keyword-parsing engine that generates realistic multilingual responses with no network calls.

---

## 🌍 Deployment

### Deploy to Render (Current)

The live site is deployed as a **static site** on [Render](https://render.com):

1. Fork or push this repository to GitHub
2. Create a new **Static Site** on Render
3. Set the build command: `npm run build`
4. Set the publish directory: `out`
5. Deploy — no environment variables required

### Deploy to Vercel

```bash
npx vercel --prod
```

### Deploy to Netlify

```bash
npm run build
npx netlify deploy --prod --dir=out
```

### Deploy to GitHub Pages

```bash
npm run build
npx gh-pages -d out
```

---

## 🏗️ Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     STADIUM OS PLATFORM                        │
│                                                                │
│  ┌──────────┐   ┌──────────────┐   ┌────────────────────────┐ │
│  │   Fan    │   │  Volunteer   │   │   Command Center       │ │
│  │  App     │   │   Tablet     │   │   Mission Control      │ │
│  │ /fan     │   │ /volunteer   │   │   /command             │ │
│  └────┬─────┘   └──────┬───────┘   └──────────┬─────────────┘ │
│       │                │                       │               │
│       └────────────────┴───────────────────────┘               │
│                         │                                      │
│              ┌──────────▼──────────┐                          │
│              │  StadiumOS Context  │                          │
│              │  (React Context +   │                          │
│              │   localStorage)     │                          │
│              └──────────┬──────────┘                          │
│                         │                                      │
│              ┌──────────▼──────────┐                          │
│              │   Agent Event Bus   │  ← window.storage sync   │
│              │  (agent_events[])   │    across browser tabs   │
│              └──────────┬──────────┘                          │
│                         │                                      │
│    ┌────────┬────────┬──┴──────┬────────┬────────┬─────────┐  │
│    │Command │Vision  │Navigate │Crowd   │Emrgncy │Voluntr  │  │
│    │Orchest │Agent   │Agent    │Intel   │Agent   │Agent    │  │
│    └────────┴────────┴─────────┴────────┴────────┴─────────┘  │
│                                                                │
│              ┌─────────────────────┐                          │
│              │   Dijkstra Router   │  ← SVG Stadium Graph     │
│              │ + Accessibility Mod │                          │
│              └─────────────────────┘                          │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security & Privacy

- **Zero data collection**: No user data is sent to any server. All state is stored locally in the browser's `localStorage`.
- **No authentication required**: The demo is open-access by design for hackathon evaluation.
- **No external API calls** in demo mode: All AI responses are generated locally.
- **Content Security**: No external scripts, trackers, or analytics are loaded.

---

## 🧪 Development Notes

### TypeScript Strict Mode

The project runs with `"strict": true` in `tsconfig.json`. All components are fully typed.

### CSS Architecture

- **Tailwind CSS** handles utility classes with a custom obsidian/neon cyberpunk design token system
- **Glassmorphism utilities** are defined in `src/app/globals.css`
- **Neon shadow tokens** (`shadow-neon-blue`, `shadow-neon-green`, etc.) are configured in `tailwind.config.js`

### Hydration Safety

Because Next.js statically pre-renders pages with `output: 'export'`, all `localStorage` reads and locale-dependent values (e.g., `toLocaleTimeString()`) are guarded by `isMounted` state flags to prevent hydration mismatches.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Make your changes with clear commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
4. Run the build to verify: `npm run build`
5. Open a Pull Request with a description of your changes

### Commit Convention

```
feat: add new agent capability
fix: resolve Dijkstra edge case for step-free paths
docs: update README installation steps
style: adjust mobile padding on volunteer tablet
refactor: extract translation logic into separate hook
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built for the FIFA World Cup 2026 Virtual Hackathon**

*Demonstrating production-grade multi-agent AI orchestration patterns with zero infrastructure cost.*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-stadium--os--2026--1.onrender.com-00e676?style=for-the-badge)](https://stadium-os-2026-1.onrender.com)

</div>
