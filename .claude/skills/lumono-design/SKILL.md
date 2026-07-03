# Lumono Dark Premium Design System

## Trigger
When working on any file inside `apps/web/`

## Visual Philosophy
- **Sobrio / High-end**: Dark carbon aesthetic, minimal ornamentation
- **Orange accent with intention**: Max 2 accent uses per widget
- **Anti-semaphore**: No green/red/yellow anywhere — use dark status tokens only
- **Densidad operativa**: Compact, data-dense layouts (bento grid)

## Color Tokens (CSS Variables)

### Backgrounds & Surfaces
```
--bg:           #0E0E0E    /* Page background - deep carbon */
--bg-sidebar:   #111111    /* Sidebar background */
--surface:      #161616    /* Card/panel background */
--surface-2:    #1C1C1C    /* Elevated surface (hover, nested) */
--surface-3:    #222222    /* Input backgrounds */
```

### Foreground & Text
```
--fg:           #E8E8E8    /* Primary text */
--fg-secondary: #A0A0A0    /* Secondary text */
--muted:        #666666    /* Muted/placeholder text */
```

### Borders
```
--border:       #2A2A2A    /* Default border */
--border-hover: #3A3A3A    /* Hover border */
```

### Accent (Orange Electric)
```
--accent:       #FF9900    /* Primary accent */
--accent-hover: #FFB340    /* Accent hover */
--accent-dim:   rgba(255, 153, 0, 0.12)  /* Accent background tint */
--accent-glow:  0 0 20px rgba(255, 153, 0, 0.15)  /* Accent glow shadow */
```

### Status Tokens (Dark Only — NO Semaphore)
```
--status-neutral:   rgba(255,255,255, 0.06)   /* Default status */
--status-attention: rgba(255, 170, 50, 0.10)  /* Needs attention */
--status-critical:  rgba(255, 80, 80, 0.10)   /* Critical/urgent */
--status-ok:        rgba(100, 200, 150, 0.08) /* Completed/ok */
```

## Typography
- **Body**: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- **Mono**: `'JetBrains Mono', 'Fira Code', monospace` — for values, metrics, codes
- **Tabular nums**: Always use `font-variant-numeric: tabular-nums` on numeric displays
- **Size scale**: 10px labels, 12px body, 13px titles, 20-24px headings, 22px+ KPI values

## Component Rules

### Cards
- `bg-[var(--surface)]` + `border border-[var(--border)]` + `rounded-xl` (12px)
- Padding: 18px
- NO glass-card, NO backdrop-blur, NO white backgrounds, NO gradients

### Buttons
- Primary: `bg-[var(--accent)]` + dark text (#111) + hover brighter
- Ghost: transparent + `border border-[var(--border)]` + hover `bg-[var(--surface-2)]`
- NO gradients, NO glass, NO shadow-elevated
- Padding: 8px 16px, radius 8px, font 12px weight 500

### Badges (Anti-Semaphore)
- `neutral` → `bg-[var(--status-neutral)]` + muted text
- `attention` → `bg-[var(--status-attention)]` + warm muted text
- `accent` → `bg-[var(--accent-dim)]` + orange-tinted text
- `ok` → `bg-[var(--status-ok)]` + cool muted text
- `critical` → `bg-[var(--status-critical)]` + warm text + weight 600
- Size: 10px, padding 3px 8px, radius 5px
- NEVER use green/red/yellow/blue badge backgrounds

### Tables
- Wrapper: `bg-[var(--surface)]` + border + rounded-xl
- `th`: 10px uppercase muted, border-bottom
- `td`: 12px, border-bottom hairline
- Row hover: slightly lighter surface
- NO glass-card wrapper, NO gradient thead

### Inputs
- `bg-[var(--surface)]` + `border-[var(--border)]`
- Focus: orange accent border (`var(--accent)`)
- Text: `var(--fg)`, placeholder: `var(--muted)`
- NO backdrop-blur, NO white backgrounds

### Modals
- `bg-[var(--surface)]` + border
- Backdrop: dark overlay
- NO white/95, NO backdrop-blur-xl

## Anti-Patterns Checklist
- [ ] No `backdrop-blur` anywhere on pages
- [ ] No `bg-white`, `bg-white/xx`, `rgba(255,255,255,x)` on surfaces
- [ ] No `bg-success-*`, `bg-danger-*`, `bg-warning-*`, `bg-info-*` on badges/status
- [ ] No `bg-gradient-to-*` on cards, buttons, headers
- [ ] No `shadow-glass`, `shadow-elevated`, `glass-card` classes
- [ ] No bright green (#10b981), red (#ef4444), yellow (#f59e0b) anywhere
- [ ] No emoji icons in UI
- [ ] No Inter/Roboto as display font
- [ ] Max 2 accent color uses per widget/card
- [ ] No heavy drop shadows on cards
