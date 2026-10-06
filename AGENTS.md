# AGENTS PROTOCOL: SKILL-DRIVEN VIBE CODING ENGINE

This document trains and governs the AI agent's reasoning, tool use, and code generation across **every prompt** in this repository.

---

## 🧠 Core Law: Skills-First Execution
Never write code or propose architectures from raw generic instincts when specialized skills exist. Every prompt must be matched to its corresponding skills and executed according to their established standards.

```
                   User Request
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
    [CREATIVE / UI]            [ENGINEERING / FIX]
         │                             │
 ┌───────┴───────┐             ┌───────┴───────┐
 ▼               ▼             ▼               ▼
Design Taste   Component     Performance    Debugging
(ui-ux-pro-max (shadcn,      (vercel-react- (systematic-
 high-end)      21st-dev)     best-pract)    debugging)
         │               │             │               │
         └───────────────┼─────────────┴───────────────┘
                         ▼
             Delight & Fluid Motion
             (framer-motion-animator)
```

---

## ⚡ Skill Routing & Activation Matrix

Before generating any code or executing tasks, determine which skills apply:

| Task Type | Primary Skills to Activate | Golden Rules |
| :--- | :--- | :--- |
| **New UI / Redesign / Landing / Dashboard** | `ui-ux-pro-max`, `high-end-visual-design`, `web-design-guidelines` | • Banish generic AI gradients and default cards.<br>• Use curated color palettes (HSL variables), high-contrast hierarchy, and intentional spacing.<br>• Consult `ui-ux-pro-max` for design system tokens. |
| **Components & Layouts** | `shadcn`, `tailwind-design-system`, `21st-cli-use`, `21st-ui-build` | • Prefer shadcn/ui and 21st.dev components over ad-hoc raw markup.<br>• Search 21st (`21st search "<query>"`) or install shadcn blocks.<br>• Use Tailwind v4 / utility tokens cleanly. |
| **Icons & Visual Assets** | `lucide-icons` | • Never use generic SVG placeholders or emojis as icons.<br>• Use Lucide React icons with correct semantic names and consistent stroke widths. |
| **Motion, Gestures & Transitions** | `framer-motion-animator`, `framer-motion`, `gsap-react` | • Only animate GPU-friendly properties: `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`.<br>• Never animate layout-heavy properties (`top`, `left`, `width`, `height`).<br>• Use springs over linear easings; implement exit animations with `AnimatePresence`. |
| **React / Next.js Development** | `vercel-react-best-practices`, `nextjs-app-router-patterns` | • Prevent client re-render cascades.<br>• Keep state local; push state down.<br>• Leverage Server Components by default; only add `'use client'` when interactivity is required. |
| **Backend, Auth & Database** | `supabase`, `better-auth-best-practices` | • Design clean relational schemas with RLS policies.<br>• Follow type-safe auth flows and secure session handling. |
| **AI Features & Streaming** | `ai-sdk` | • Use Vercel AI SDK (`streamText`, `useChat`, generative UI tools). |
| **Bugs, Test Failures, Regressions** | `systematic-debugging`, `diagnosing-bugs` | • **No random guessing or shotgun fixing**.<br>• Formulate hypotheses, isolate root cause, verify with minimal repros, and fix cleanly. |
| **Complex Feature Planning** | `brainstorming` | • Clarify edge cases, user flows, and state machines before diving into implementation. |

---

## 🚀 Execution Standards on Every Prompt

1. **Precision & Speed**:
   - Don't reinvent existing utilities or components. Check the installed skills and 21st catalog first.
   - Use `view_file` to review specific skill recipes in `.agents/skills/<skill-name>/SKILL.md` when crafting specialized components.

2. **Aesthetic Excellence (The Vibe Standard)**:
   - Interfaces must feel modern, snappy, and tactile.
   - Micro-interactions (hover scales, active presses, subtle springs) must be present on all interactive elements.
   - Dark mode and light mode must feel intentional, with subtle border glows and backdrop filters (`backdrop-blur`).

3. **Performance First**:
   - Every animation must run at 60fps/120fps.
   - Zero layout thrashing, zero unnecessary re-renders.

4. **Self-Correction & Quality**:
   - Run linter/type checks and test commands cleanly.
   - If something breaks, activate `systematic-debugging` immediately.
