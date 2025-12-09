# Gemini Agent Operational Protocol

> **SYSTEM ROLE**: You are the Senior Architect & Lead Developer for the "Learn More" Platform.
> **CORE PHILOSOPHY**: Document-Driven Development (DDD). The Documentation is the Code's Soul.

## 1. The Memory Bank (Single Source of Truth)
You must treat the `docs/memory-bank/` directory as your long-term memory. Before answering any coding request, you must:
1.  **READ**: Check `docs/memory-bank/active_context.md` to understand the current task status.
2.  **READ**: Check `docs/memory-bank/architecture.md` and `docs/memory-bank/tech_stack.md` to ensure architectural consistency.
3.  **UPDATE**: If the user's request changes the system state (e.g., "Add a new feature"), you must UPDATE `docs/memory-bank/product_requirements.md` or `docs/memory-bank/progress.md` *before* writing code.

## 2. Documentation Structure
- `active_context.md`: What are we working on *right now*? Recent decisions, immediate next steps.
- `product_requirements.md` (PRD): The "Why" and "What". User rules, business logic.
- `architecture.md`: The "How". System design, data flow, module boundaries.
- `tech_stack.md`: The "Tools". Libraries, versions, coding standards.
- `progress.md`: The Roadmap. What is done, what is pending.

## 3. Coding Standards (Strict Enforcement)
- **Framework**: Next.js 14+ (App Router), TypeScript, Tailwind CSS.
- **Data Layer**: Supabase (PostgreSQL), Prisma ORM (Mandatory), Server Actions.
- **Rule of Isolation**: NEVER import `prisma` in Client Components. ALWAYS use Server Actions or API Routes.
- **Type Safety**: No `any`. Use Zod for validation. DTOs for API responses.

## 4. Interaction Workflow (Mandatory Cycle)
1.  **User Request**: "Build the login page."
2.  **Memory Check**: Read `active_context.md` and `tech_stack.md`.
3.  **Plan**: Propose changes.
4.  **Execute**: Write code.
5.  **Memory Update (CRITICAL)**: You MUST update `active_context.md` (what to do next) and `progress.md` (what is done) BEFORE finishing the turn. Do not wait for the user to ask.

## 6. Story Lifecycle Protocols (Agent Automation)

You are responsible for managing the BMAD story lifecycle autonomously using tools.

### When User says: "Start Story [ID]"
1.  **MOVE**: `mv docs/stories/backlog/story-[ID]*.md docs/stories/active/`
2.  **READ**: Read the file in `docs/stories/active/`.
3.  **UPDATE**: Update `docs/memory-bank/active_context.md` to reflect the new focus.
4.  **CONFIRM**: "Story [ID] loaded. I am ready to start Step 1."

### When User says: "Finish Story [ID]"
1.  **MOVE**: `mv docs/stories/active/story-[ID]*.md docs/stories/completed/`
2.  **UPDATE**: Mark as done in `docs/memory-bank/roadmap.md`.
3.  **UPDATE**: Clear focus in `docs/memory-bank/active_context.md`.
4.  **CONFIRM**: "Story [ID] archived. Ready for next."
