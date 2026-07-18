# 🏟️ Stadium OS — World Cup 2026 Mission Control

Stadium OS is a premium, real-time "Stadium Operating System & Mission Control" dashboard designed for FIFA-scale stadium operations (simulated for MetLife Stadium). Built for high-frequency operational clarity, it coordinates a decentralized swarm of **12 specialized AI Agents** to route navigation, concessions, transport, and critical emergency dispatches dynamically.

## 🚀 Live Demo Views

The dashboard features four interconnected layouts that coordinate in real time:
- **Integrated Simulator Canvas (`/simulator`)**: A side-by-side widescreen layout showing the Fan Mobile, Volunteer Tablet, and Mission Control Digital Twin simultaneously.
- **Fan Companion App (`/fan`)**: A mobile interface showing ticket scanning, step-free access profiles, concessions wait times, and a context-aware AI Copilot.
- **Volunteer Tablet Flow (`/volunteer`)**: A tablet interface showing active responder rosters, skills-based dispatches, and real-time Spanish-to-English translation panels.
- **Mission Control Digital Twin (`/command`)**: An operations cockpit featuring MetLife's Digital Twin map, dynamic occupancy statistics, and an immutable audit log terminal.

---

## 🧠 Key Features & Architecture

### 1. Decentralized Multi-Agent Orchestrator
- Operates on a dedicated event bus (`agent_events`) rather than hardcoded logical chains.
- Uses an explicit **Capability Registry** to match incoming user queries to specialized agents (e.g., Navigation, Crowd Intelligence, Fan Experience, Emergency Support, Transport, Accessibility).
- Handles event leasing, leasing expiration timeouts, worker ID labels, dead-letter-queue (DLQ) state transitions, and retries.

### 2. Digital Twin & Dijkstra Routing Engine
- Features an interactive, responsive SVG layout mapping gates, concourses, and seats.
- Runs a built-in **Dijkstra Pathfinding Algorithm** to calculate optimal routes.
- Handles step-free accessibility rerouting. If a user profiles as needing accessibility assistance, the engine reroutes away from stairs concourses and flags warning overlays on stairs sections (WCAG compliance).

### 3. Cross-Tab Real-time Synchronization
- Syncs all active events, volunteer dispatch statuses, Dijkstra paths, language choices, and audit logs across separate browser tabs and windows in real time using a window `storage` listener.

### 4. Multilingual Translation Layer
- Includes a global translation lookup system supporting **English**, **Spanish**, **Arabic** (with automatic RTL layout adjustment), **Portuguese**, and **Français**.
- Displays original foreign strings side-by-side with English translations in critical operational logs to ensure cross-country staff coordination.

### 5. Swarm Incident Dispatching (Amber Alert & Panic support)
- **Amber Alert**: Submitting a lost child report triggers the Vision Agent to analyze the description. It automatically claims the event, updates the volunteer roster to assign the task to an available responder, plots their Dijkstra route on the map, and broadcasts warnings to all staff.
- **AED Panic Alarm**: Initiates highest-priority routing with dual-event dispatch and guides users to the closest AED cabinet.

---

## 🛠️ Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Programming Language**: TypeScript (Strict Type Safety enabled)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Icons & Animations**: Lucide Icons & Framer Motion
- **Architecture**: Zero-Billing Static Architecture (`output: 'export'`) with localStorage state persistence.

---

## 💻 Installation & Quick Start

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Priyan120-dev/Stadium-os-2026.git
   cd Stadium-os-2026
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Compile Production Static Build**:
   ```bash
   npm run build
   ```
   The static export files will be compiled inside the `out/` directory.

---

## 📂 Directory Structure

```
├── .vscode/               # Workspace settings & linter rules
├── src/
│   ├── agents/            # Multi-Agent Orchestrator & Capabilities
│   ├── app/               # Next.js App Router Page Layouts
│   │   ├── command/       # Operations Cockpit
│   │   ├── fan/           # Mobile Companion
│   │   ├── simulator/     # Integrated Simulator Canvas
│   │   ├── volunteer/     # Touch Tablet
│   │   ├── layout.tsx     # Root Layout & Fixed Header
│   │   └── page.tsx       # Role Selection Gateway
│   ├── components/        # MetLife Digital Twin SVG Component
│   ├── context/           # StadiumOSContext for state and Event Bus
│   ├── utils/             # Dijkstra Routing and Translations Dictionary
│   └── mockData.ts        # Roster, Transit, and Concessions default values
├── tailwind.config.js     # Design system color tokens & shadow configuration
└── next.config.js         # Export configurations
```
