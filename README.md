# ChefFlow: AI-Powered Cooking To-Do List Micro-App

ChefFlow is a production-quality, responsive, and highly accessible daily meal planner that helps users generate a personalized, budget-friendly cooking schedule. Built with **Next.js 15/16**, **React 19**, **TypeScript**, and **Tailwind CSS**, it leverages **Gemini AI** to optimize menus under strict constraints.

---

## 🚀 Key Features

1. **User Preferences Capture:** Interactive forms for cooking skill level, number of people, cuisines, meal selections, daily budget, available pantry ingredients, cooking time, and allergies.
2. **AI Meal Planning Engine:** Integrates `gemini-2.5-flash` with structured JSON schemas to plan breakfast, lunch, dinner, and snacks.
3. **Pantry-aware Grocery List:** Compares meal requirements with pantry stock using an $O(n + m)$ normalization and matching engine.
4. **Interactive Shopping Checklist:** Segregates missing items, lists prices/quantities, and allows checking them off in real-time with automatic cost adjustments.
5. **Interactive Cooking To-Do List:** Consolidates cooking tasks into chronologically ordered lists, showing interactive checkboxes and a progress bar.
6. **Budget Feasibility:** Compares estimated menu prep costs against daily budgets, rendering warnings and optimization suggestions if exceeded.
7. **Client-Side API Key Input:** Provides a secure password-masked API Key input in the header, storing the key in `localStorage` and forwarding it via `x-gemini-api-key` headers for dynamic backend initialization.
8. **Interactive Cooking Team UI:** Manage a cooking crew (e.g. roommates or family helpers). Assign tasks in the cooking checklist to crew members, display initials badges, and filter tasks so active cooks see only their assigned items.
9. **Dark & Light Themes:** Toggle between a stunning, high-contrast Slate Space dark mode and a sleek, polished glassmorphic light mode with high-contrast elements.
10. **Local Caching:** Automatically persists preferences, meal plans, team helpers, grocery checklists, and cooking checklist progress inside `localStorage` across page reloads.
11. **Exportable Plan:** Supports printing a clean, standard page layout using custom Tailwind print sheets (`print:hidden` styles).

---

## 🛠️ Technology Stack & Folder Structure

* **Framework:** Next.js 15/16 (App Router) & React 19
* **Styling:** Tailwind CSS (v4)
* **Validation:** Zod (Type-safe input/output schemas)
* **Testing:** Vitest & React Testing Library (20 passing tests)
* **Icons:** Lucide React

### Folder Layout

```
/
├── app/
│   ├── api/plan/route.ts    # Server endpoint validating params & executing planner
│   ├── globals.css          # Tailwind imports, theme declarations & custom variables
│   ├── layout.tsx           # Global HTML shell
│   └── page.tsx             # Main dashboard page (state manager, team UI & layouts)
├── components/
│   ├── PreferencesForm.tsx      # Accessible inputs, validation, adaptive theme styles
│   ├── MealPlanSection.tsx      # Breakfast/Lunch/Dinner/Snacks tabs & cards
│   ├── GroceryListSection.tsx   # Segregated shopping checklist with progress gauge
│   ├── SubstitutionSection.tsx  # Dynamic swaps list with reason summaries
│   ├── BudgetAnalysisSection.tsx# Feasibility metrics, status cards & gauges
│   └── CookingChecklist.tsx     # Chronological task checklists, assignee badges, selectors & filters
├── lib/
│   ├── gemini.ts                # Gemini API Structured JSON Client
│   └── mockData.ts              # Local mock fallback planner (offline test sandbox)
├── types/
│   └── index.ts                 # Strongly typed TypeScript interfaces
├── utils/
│   ├── ingredientMatcher.ts     # Singularization, O(n) de-duplication & matching
│   └── validators.ts            # Zod validation schemas
└── tests/                       # Unit, Component, and Integration test suites
```

---

## 📥 Setup and Run Instructions

### Prerequisites
* Node.js `v18.0.0` or higher (tested on `v25.2.1`)
* npm `v9.0.0` or higher (tested on `v11.6.2`)

### 1. Install Dependencies
Clone the repository, navigate into the directory, and install:
```bash
npm install
```

### 2. Set Up Environment Variables / UI Keys
Create a `.env.local` file in the root folder:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*Alternatively, you can supply your `GEMINI_API_KEY` directly from the client-side input in the header.*
> [!NOTE]
> If **no API key is provided**, ChefFlow automatically runs in **Sandbox Mode**. It will generate simulated mock cooking plans customized to your parameters, ensuring the app remains fully functional and testable immediately.

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if specified) in your browser.

### 4. Running the Tests
We use Vitest as our runner:
```bash
# Run all tests once
npm run test

# Run tests in interactive watch mode
npm run test:watch

# Generate code coverage reports
npm run test:coverage
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📐 Architecture & Engineering Decisions

### 1. Separation of Concerns
Input capture is isolated to the client, validation schemas are centralized, and the AI plan generation occurs securely in Next.js Server Route Handlers. Data arithmetic (budget differences, shopping progress percentages) is computed deterministically in React using pure helper functions.

### 2. $O(n)$ Matching & Normalization Engine
Instead of fuzzy-comparing ingredient arrays in $O(n \cdot m)$ time, `ingredientMatcher.ts` does:
* **Singularization:** Stems plurals (`onions` -> `onion`, `tomatoes` -> `tomato`, `berries` -> `berry`).
* **Sub-phrase checking:** Checks string containment (`organic eggs` matches `eggs`) with a length constraint to prevent false hits (like `oil` matching `soil`).
* **De-duplication:** Gathers duplicate required items across meals and merges their prices and quantities.

### 3. Crew Assignment & Filtering
Checkpoint assignees are kept in memory and synchronized under the `FullCookingDashboardData` interface. Filtering checks are implemented using standard state array mappings, avoiding expensive database queries.

---

## 🔒 Security Parameters

* **Strict Input Sanitization:** Centralized Zod schemas parse and transform all incoming client requests on the server before invoking API calls.
* **XSS Shielding:** React's JSX automatically escapes text content. No custom `dangerouslySetInnerHTML` is used.
* **API Secrets Isolation:** If specified on server environment variables, the Gemini key remains fully hidden from clients. If supplied via client-side UI, keys are masked using password text types for privacy.

---

## ♿ Accessibility Compliance (WCAG 2.1 AA)

* **Keyboard Navigation:** Native interactive elements (inputs, select buttons, select lists) are used with visible `:focus-visible` ring outlines.
* **Labeling:** Every form control is bound to a semantic `<label>` or described by an appropriate `aria-describedby` error element.
* **ARIA Live announcements:** Dynamic states (loading, completions) report screen-reader updates using `aria-live="polite"` or `role="alert"`.
* **Contrast-Ratio compliance:** Colors satisfy AA contrast ratios in both light mode (using grey-slate text on white backgrounds) and dark mode (using glowing colors on dark backdrops).
