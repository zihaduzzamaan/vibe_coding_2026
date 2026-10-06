# GEMINI & ANTIGRAVITY ENGINE PROTOCOL

This file enforces the skill-driven execution rules for Antigravity on every prompt.

## Active Rules & Skills Directive

1. **Always-On Skill Utilization**:
   - For any UI, design, layout, styling, motion, performance, fullstack, or debugging task, reference and apply the corresponding skills located in `.agents/skills/`.
   - Never generate default, generic AI styling or uninspired UI.

2. **Skill Matrix Summary**:
   - **Visuals & Design**: `.agents/skills/ui-ux-pro-max`, `.agents/skills/high-end-visual-design`, `.agents/skills/web-design-guidelines`
   - **Components & Layout**: `.agents/skills/shadcn`, `.agents/skills/tailwind-design-system`, `@21st-dev/cli`
   - **Icons**: `.agents/skills/lucide-icons`
   - **Animations & Delight**: `.agents/skills/framer-motion-animator`, `.agents/skills/framer-motion`, `.agents/skills/gsap-react`
   - **Performance**: `.agents/skills/vercel-react-best-practices`, `.agents/skills/nextjs-app-router-patterns`
   - **Backend & Auth**: `.agents/skills/supabase`, `.agents/skills/better-auth-best-practices`
   - **AI Integrations**: `.agents/skills/ai-sdk`
   - **Debugging**: `.agents/skills/systematic-debugging`, `.agents/skills/diagnosing-bugs`

3. **Motion Architecture**:
   - Only GPU properties (`x`, `y`, `scale`, `rotate`, `opacity`).
   - Use springs (`type: "spring"`, `stiffness`, `damping`).
   - Clean unmounting transitions via `AnimatePresence`.

4. **Zero-Guesswork Debugging**:
   - When encountering errors, follow root-cause diagnosis without trial-and-error guessing.
