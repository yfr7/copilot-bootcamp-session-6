<!--
  Sync Impact Report
  ==================
  Version change: N/A → 1.0.0 (initial ratification)
  Modified principles: N/A (all new)
  Added sections:
    - Core Principles (7 principles derived from project docs)
    - Technology Stack & Constraints
    - Development Workflow
    - Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ compatible (Constitution Check is generic)
    - .specify/templates/spec-template.md ✅ compatible (no principle-specific refs)
    - .specify/templates/tasks-template.md ✅ compatible (test optionality aligns)
    - .specify/templates/commands/ — directory does not exist, N/A
  Follow-up TODOs: None
-->

# Copilot Bootcamp Todo App Constitution

## Core Principles

### I. Simplicity First (NON-NEGOTIABLE)

- All solutions MUST prefer simple, straightforward implementations
  over complex alternatives (KISS).
- No premature optimization — write clear code first, optimize only
  when measured need exists.
- YAGNI applies: features outside the defined functional requirements
  (filtering, search, bulk operations, categories, undo/redo) MUST NOT
  be added unless explicitly approved.
- Complex logic MUST be broken into smaller, understandable functions.

**Rationale**: The project is a focused single-user todo app. Scope
creep and over-engineering are the primary risks to delivery.

### II. Test-Driven Quality

- Tests MUST be written as part of the development process;
  TDD workflow (write failing test → implement → refactor) is the
  expected cadence.
- Target code coverage: **80%+** across all packages; **100%** on
  critical user workflows (create, toggle, delete, edit todo).
- Tests MUST verify **behavior, not implementation details** — they
  MUST NOT break on internal refactoring.
- Every test MUST follow the **Arrange-Act-Assert** pattern.
- Tests MUST be **isolated**: no shared mutable state, no ordering
  dependencies. External dependencies (API calls, timers) MUST be
  mocked.
- Test names MUST clearly describe the behavior under test.

**Rationale**: Behavioral tests and high coverage provide regression
safety while keeping the test suite maintainable.

### III. Consistent Code Style

- **Indentation**: 2 spaces for all files (JS, JSON, CSS, Markdown).
- **Naming**: `camelCase` for variables/functions, `PascalCase` for
  React components and classes, `UPPER_SNAKE_CASE` for constants.
- **Import order**: (1) external libraries → (2) internal modules →
  (3) styles, separated by blank lines.
- **Line length**: SHOULD stay under 100 characters.
- **ESLint**: All code MUST pass ESLint before being committed; no
  unresolved warnings in pull requests.
- **No circular dependencies** between modules.
- Comments MUST explain **"why"**, not **"what"**. Obvious comments
  MUST be removed. Public functions SHOULD use JSDoc annotations.

**Rationale**: Uniform style reduces cognitive load during reviews and
enables reliable automated linting.

### IV. Single Responsibility & DRY

- Every module, component, and function MUST have **one well-defined
  responsibility** (SRP).
- Duplicated logic MUST be extracted into shared utility functions or
  reusable components.
- SOLID principles MUST be followed:
  - Open/Closed: extend via props and composition, not modification.
  - Liskov Substitution: component prop contracts MUST be honored.
  - Interface Segregation: components MUST NOT receive unnecessary
    props.
  - Dependency Inversion: depend on abstractions; inject dependencies
    rather than hard-coding them.
- Code organization MUST follow: imports → constants → utilities →
  main component/class → helpers → exports.

**Rationale**: SRP and DRY keep the codebase navigable and reduce the
blast radius of changes.

### V. Accessible & Themed UI

- All interactive elements MUST be **keyboard accessible**.
- Color contrast MUST meet **WCAG AA** standards.
- Form labels MUST be properly associated with inputs; icon buttons
  MUST have descriptive `title` or `aria-label` attributes.
- Spacing MUST follow the **8 px grid** system (xs=8, sm=16, md=24,
  lg=32, xl=48).
- **Dark/light mode** MUST be supported; user preference MUST persist
  via `localStorage` and default to the system preference on first
  visit.
- Material Design elevation (subtle shadows) and color hierarchy MUST
  guide visual attention.

**Rationale**: Accessibility is a baseline quality bar, and theming
consistency keeps the UI professional and predictable.

### VI. Graceful Error Handling

- All operations that can fail (API calls, async work) MUST be wrapped
  in `try-catch` blocks.
- Error messages MUST be **meaningful and actionable** — never surface
  raw stack traces to users.
- The UI MUST inform users when an operation fails and provide guidance
  to retry.
- Console errors MUST include sufficient context for debugging
  (operation name, relevant IDs).

**Rationale**: Robust error handling prevents silent failures and
improves both developer and user experience.

### VII. Monorepo Discipline

- The project MUST use **npm workspaces** to manage the `frontend`
  (React) and `backend` (Express.js) packages.
- Each package MUST be independently runnable and testable.
- Tests MUST be collocated with source code in `__tests__/` directories.
- **Jest** is the sole test runner for both packages.
- Git commits MUST be **atomic** (one logical change per commit) with
  descriptive messages explaining "why".
- Feature work MUST occur on **feature branches** and be merged via
  pull requests.

**Rationale**: Clear package boundaries and disciplined version control
sustain a healthy monorepo workflow.

## Technology Stack & Constraints

- **Frontend**: React, React DOM, CSS (no CSS-in-JS), system font
  stack.
- **Backend**: Node.js (≥ v16), Express.js.
- **Testing**: Jest + React Testing Library (frontend),
  Jest (backend).
- **Package management**: npm (≥ v7) with workspace hoisting.
- **Target environment**: Desktop browsers; no mobile-specific
  optimization required.
- **Single-user scope**: No authentication, authorization, or
  multi-user isolation.

## Development Workflow

1. **Branch**: Create a feature branch from `main`
   (e.g., `feature/todo-editing`).
2. **Write tests**: Author failing tests that describe the new
   behavior.
3. **Implement**: Write minimal code to make tests pass.
4. **Refactor**: Clean up while keeping tests green.
5. **Lint**: Run `npm run lint` and resolve all issues.
6. **Commit**: Atomic commits with conventional messages
   (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
7. **Pull Request**: Open a PR, ensure all tests and lint pass,
   and request review.

## Governance

- This constitution **supersedes** ad-hoc practices and conflicting
  guidance. When in doubt, the constitution is authoritative.
- **Amendments** MUST be documented with a version bump following
  semantic versioning:
  - **MAJOR**: Backward-incompatible principle removal or redefinition.
  - **MINOR**: New principle added or existing guidance materially
    expanded.
  - **PATCH**: Clarifications, typos, non-semantic refinements.
- All pull requests and code reviews MUST verify compliance with
  these principles.
- Complexity beyond what the principles allow MUST be justified in
  writing (e.g., in a plan document's Complexity Tracking table).
- Refer to the project documentation in `docs/` for detailed
  runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-02-27 | **Last Amended**: 2026-02-27
