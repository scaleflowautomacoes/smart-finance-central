# AI Development Rules for smart-finance-central

This document outlines the technical stack and specific rules for developing and modifying this application. Adhering to these rules ensures consistency, maintainability, and alignment with the project's architecture.

## 1. Tech Stack Overview

*   **Framework:** React (Functional Components with Hooks).
*   **Language:** TypeScript (Mandatory for all new and modified files).
*   **Build Tool:** Vite.
*   **Styling:** Tailwind CSS (Utility-first approach for all styling).
*   **UI Components:** shadcn/ui (Used for all standard UI elements like buttons, cards, forms, etc.).
*   **Routing:** React Router DOM (Used for client-side navigation).
*   **State Management/Data Fetching:** React Query (`@tanstack/react-query`) for server state management.
*   **Database/Backend:** Supabase (Used for database, functions, and authentication).
*   **Icons:** Lucide React (`lucide-react`).
*   **Charts:** Recharts (`recharts`).
*   **Date Handling:** `date-fns`.
*   **Notifications:** Sonner (`sonner`) and shadcn/ui Toast (`@radix-ui/react-toast`).

## 2. Architectural Guidelines

*   **File Structure:**
    *   Pages go into `src/pages/`.
    *   Reusable components go into `src/components/`.
    *   Hooks go into `src/hooks/`.
    *   Utility functions go into `src/utils/`.
    *   Supabase integration files are in `src/integrations/supabase/`.
*   **Component Size:** Components should be small and focused (ideally under 100 lines). Extract new components into separate files immediately.
*   **Routing:** All main routes must be defined in `src/App.tsx`.

## 3. Library Usage Rules

| Feature | Recommended Library | Notes |
| :--- | :--- | :--- |
| **UI Components** | `shadcn/ui` (Radix UI) | Use pre-built components whenever possible. If customization is needed, create a new component wrapper in `src/components/`. |
| **Styling** | Tailwind CSS | Use utility classes exclusively. Avoid custom CSS files (`.css` or `.scss`) unless absolutely necessary for global styles. |
| **Data Fetching/Caching** | React Query | Use for managing asynchronous data, loading states, and caching. |
| **Database Interaction** | Supabase Client (`@supabase/supabase-js`) | All direct database calls must use the client imported from `src/integrations/supabase/client.ts`. |
| **Icons** | `lucide-react` | Use this package for all icons. |
| **Date Formatting** | `date-fns` | Use for all date manipulation and formatting (e.g., `format`, `startOfMonth`). |
| **Notifications** | `sonner` (for persistent/global toasts) and `useToast` (for transient/contextual toasts) | Use `useToastNotifications` hook for simplified access. |
| **Forms** | `react-hook-form` and `zod` | Use for complex form validation and state management. |

## 4. Code Quality and Best Practices

*   **TypeScript:** Always use explicit types and interfaces (`src/types/financial.ts` for domain models).
*   **Responsiveness:** All new components and layouts must be responsive (mobile-first design using Tailwind breakpoints).
*   **Error Handling:** Do not use `try/catch` blocks for API calls unless specifically requested. Errors should bubble up to React Query or the component boundary for centralized handling.
*   **Imports:** Use path aliases (`@/`) for internal imports (e.g., `@/components/ui/button`).