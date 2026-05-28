# 🧠 Frontend Architecture Rules (Strict)

This project follows a **feature-driven modular architecture**.

AI MUST follow these rules strictly when generating code.

---

# 📁 Core Structure

```text
src/
├── app/          # routing only
├── features/     # business logic (core)
├── shared/       # reusable UI & utilities
├── services/     # API + HTTP layer
├── lib/          # helpers
├── providers/    # global providers
├── config/       # constants & env
├── styles/       # global styles
```

---

# 🧩 Responsibilities

## 1. app/

* Only routing (`page.tsx`, `layout.tsx`)
* Only composes UI
* No logic, no API calls

---

## 2. features/

* Core business logic
* Each feature is isolated

Structure:

```text
feature-name/
  api.ts
  hooks.ts
  store.ts (only when needed)
  components/
  containers/
  types.ts
  index.ts
```

---

## 3. shared/

* Reusable across entire app

Contains:

* ui → base components (button, card, input)
* components → reusable composed UI
* hooks → generic hooks
* layout → navbar, sidebar, layout

---

## 4. services/

* API clients
* HTTP logic
* interceptors

<!-- RBAC -->
src/
├── config/
│   └── rbac.ts              # Role & permission constants
├── lib/
│   └── rbac/
│       ├── index.ts
│       ├── checkPermission.ts
│       ├── hasRole.ts
│       └── types.ts         # Role, Permission types
├── providers/
│   └── rbac-provider.tsx    # Global RBAC context provider
└── shared/
    └── hooks/
        └── useRbac.ts       # Hook to consume RBAC

## 5. lib/

* utility functions
* helpers
* formatters

---

## 6. providers/

* global React providers

---

## 7. config/

* constants
* environment config

---

# 🔒 Import Rules (CRITICAL)

Hierarchy:

app → features → shared → lib/services

Rules:

* app can import everything
* features can import shared, lib, services
* shared CANNOT import features
* lib/services CANNOT import features

❌ Never break this

---

# 🚫 Strict Anti-Rules

DO NOT:

* create random `components/` folders
* mix UI and business logic
* place API calls outside features/services
* duplicate logic across features
* put reusable UI inside features

---

# 🎯 Key Principle

* features = logic
* shared = reusable UI
* app = composition

---

# ⚡ Final Instruction

Always:

* place code in correct layer
* follow import hierarchy
* keep features isolated
* avoid shortcuts

This architecture is strict and must be followed.
