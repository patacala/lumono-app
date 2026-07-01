# Next.js Inventory UI — Lumono Frontend

## Trigger
When working on files inside `apps/web/`

## Instructions

### Vertical Slice Architecture
- Organize code by feature module in `src/modules/` (auth, products, inventory, locations, suppliers, reports)
- Each module contains its own `hooks/`, `components/`, and page files
- Shared/reusable code goes in `src/shared/`

### TanStack Query Hooks
- Create custom hooks in `modules/<feature>/hooks/` for API calls
- Use `useQuery` for reads, `useMutation` for writes
- Invalidate related queries on successful mutations
- Follow naming: `useProducts()`, `useCreateProduct()`, `useUpdateProduct()`

### Authentication & Permissions
- Use `useAuth()` hook from `modules/auth/context/auth-context.tsx`
- Check permissions with `hasPermission('resource.action')` before rendering actions
- Wrap protected routes/components with permission checks
- Token refresh is automatic via `api-client.ts` interceptor

### API Client
- Use the Axios wrapper from `src/shared/lib/api-client.ts`
- Never create raw Axios/fetch calls — always use the shared client
- The client automatically handles auth headers and token refresh

### Styling
- Use Tailwind CSS utility classes
- Follow existing component patterns in `src/shared/components/ui/`
- Use Tremor components (`@tremor/react`) for data visualization

### i18n
- Use `react-i18next` for all user-facing strings
- Use `useTranslation()` hook — never hardcode text strings
- Translation keys follow `module.component.key` pattern

### Forms
- Use controlled components with React state or form libraries
- Validate with Zod schemas matching backend DTOs
- Show inline validation errors

### Testing
- Unit tests with Vitest in `*.test.tsx` or `*.spec.tsx`
- E2E tests with Playwright in `e2e/` directory
- Use `@testing-library/react` for component tests
