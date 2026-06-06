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
7. **Local Caching:** Automatically persists preferences, meal plans, grocery checklists, and cooking checklist progress inside `localStorage` across page reloads.
8. **Exportable Plan:** Supports printing a clean, standard page layout using custom Tailwind print sheets (`print:hidden` styles).

---

## 🛠️ Technology Stack & Folder Structure

* **Framework:** Next.js 15/16 (App Router) & React 19
* **Styling:** Tailwind CSS (v4)
* **Validation:** Zod (Type-safe input/output schemas)
* **Testing:** Vitest & React Testing Library (15+ passing tests)
* **Icons:** Lucide React

### Folder Layout

```
/
├── app/
│   ├── api/plan/route.ts    # Server endpoint validating params & executing planner
│   ├── globals.css          # Tailwind imports & custom variables
│   ├── layout.tsx           # Global HTML shell
│   └── page.tsx             # Main dashboard page (state manager & layouts)
├── components/
│   ├── PreferencesForm.tsx      # Accessible inputs, validation, tags handling
│   ├── MealPlanSection.tsx      # Breakfast/Lunch/Dinner/Snacks tabs & cards
│   ├── GroceryListSection.tsx   # Segregated shopping checklist
│   ├── SubstitutionSection.tsx  # Dynamic swaps list with reason summaries
│   ├── BudgetAnalysisSection.tsx# Feasibility metrics, status cards & gauges
│   └── CookingChecklist.tsx     # Chronological task checklists & progress bar
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

### 2. Set Up Environment Variables
Create a `.env.local` file in the root folder:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> [!NOTE]
> If **no API key is provided**, ChefFlow automatically runs in **Sandbox Mode**. It will generate simulated mock cooking plans customized to your parameters, ensuring the app remains fully functional and testable immediately.

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

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

---

## 🔒 Security Parameters

* **Strict Input Sanitization:** Centralized Zod schemas parse and transform all incoming client requests on the server before invoking API calls.
* **XSS Shielding:** React's JSX automatically escapes text content. No custom `dangerouslySetInnerHTML` is used.
* **API Secrets Isolation:** The Gemini API client executes strictly on the server-side Next.js route handler. `GEMINI_API_KEY` is never exposed to client-side bundles.

---

## ♿ Accessibility Compliance (WCAG 2.1 AA)

* **Keyboard Navigation:** Native interactive elements (inputs, select buttons) are used with visible `:focus-visible` ring outlines.
* **Labeling:** Every form control is bound to a semantic `<label>` or described by an appropriate `aria-describedby` error element.
* **ARIA Live announcements:** Dynamic states (loading, completions) report screen-reader updates using `aria-live="polite"` or `role="alert"`.
* **Contrast-Ratio compliance:** Color parameters use Tailwind's `slate-950` backgrounds matched with high-value `indigo-300`, `emerald-300`, and `rose-300` text to ensure contrast ratios conform to WCAG AAA standards.

---

## ⚡ Performance Optimizations

* **Memoized Calculations:** Sums and list divisions are computed locally in the render flow using React state, avoiding unnecessary re-renders.
* **Print Stylesheets:** Specific stylesheets exclude heavy layout wrappers during printing, ensuring pages fit clean on A4 papers.
* **Bundle Efficiency:** Tree-shakeable libraries (Zod, Lucide Icons) are used to keep final bundle footprint small.
