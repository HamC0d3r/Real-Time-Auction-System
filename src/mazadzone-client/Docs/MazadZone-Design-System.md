# MazadZone Design System

> A comprehensive reference for the MazadZone visual identity and design token system.

---

## 1. Brand Identity

MazadZone is a luxury C2C e-auction marketplace. The visual language communicates **trust**, **sophistication**, and **urgency** through:

- **Vivid orange** — CTAs that demand attention (Sell, Bid, Explore, Confirm)
- **Deep navy** — Premium dark surfaces (header, hero sections, footer)
- **Warm off-white** — Approachable page backgrounds
- **Pure white** — Clean card surfaces

---

## 2. Color Tokens

All colors use the OKLCH color space. They are defined as CSS custom properties in `src/app/globals.css` and registered with Tailwind v4 via the `@theme inline` block.

### Core Palette

| Token | OKLCH Value | Tailwind Class | Usage |
|---|---|---|---|
| `--primary` | `oklch(0.7049 0.1989 45.77)` | `bg-primary` | CTA buttons, interactive highlights, links |
| `--primary-foreground` | `oklch(1 0 0)` | `text-primary-foreground` | Text/icons on primary surfaces |
| `--dark` | `oklch(0.1724 0.0419 272.78)` | `bg-dark` | Header, hero section, footer |
| `--dark-foreground` | `oklch(1 0 0)` | `text-dark-foreground` | Text/icons on dark navy surfaces |
| `--background` | `oklch(0.9367 0.0055 95.1)` | `bg-background` | Page background (warm off-white) |
| `--foreground` | `oklch(0.1724 0.0419 272.78)` | `text-foreground` | Default body text |
| `--card` | `oklch(1 0 0)` | `bg-card` | Card/panel surfaces (white) |
| `--card-foreground` | `oklch(0.1724 0.0419 272.78)` | `text-card-foreground` | Text on cards |
| `--destructive` | `oklch(0.5095 0.2086 28.51)` | `bg-destructive` | Error states, destructive actions |
| `--destructive-foreground` | `oklch(1 0 0)` | `text-destructive-foreground` | Text on destructive surfaces |

### Secondary & Muted

| Token | OKLCH Value | Tailwind Class | Usage |
|---|---|---|---|
| `--secondary` | `oklch(0.967 0.0029 264.54)` | `bg-secondary` | Secondary buttons, subtle surfaces |
| `--secondary-foreground` | `oklch(0.3731 0.0343 260.17)` | `text-secondary-foreground` | Text on secondary surfaces |
| `--muted` | `oklch(0.9683 0.0069 247.9)` | `bg-muted` | Disabled/muted backgrounds |
| `--muted-foreground` | `oklch(0.5544 0.0407 257.42)` | `text-muted-foreground` | Secondary text, placeholders, captions |

### Interactive & Structural

| Token | OKLCH Value | Tailwind Class | Usage |
|---|---|---|---|
| `--accent` | `oklch(0.9551 0.0243 62.8)` | `bg-accent` | Hover states, soft warm surfaces |
| `--accent-foreground` | `oklch(0.3731 0.0343 260.17)` | `text-accent-foreground` | Text on accent surfaces |
| `--border` | `oklch(0.9142 0.0076 264.54)` | `border-border` | Default borders |
| `--input` | `oklch(0.9142 0.0076 264.54)` | `border-input` | Form input borders |
| `--input-background` | `oklch(1 0 0)` | `bg-input-background` | Form input background (white) |
| `--ring` | `oklch(0.7049 0.1989 45.77)` | `ring-ring` | Focus ring (orange, matching primary) |
| `--popover` | `oklch(1 0 0)` | `bg-popover` | Dropdown/popover backgrounds |
| `--popover-foreground` | `oklch(0.1724 0.0419 272.78)` | `text-popover-foreground` | Text in popovers |

---

## 3. Typography

### Font Family

- **Primary (sans)**: [Inter](https://fonts.google.com/specimen/Inter) — loaded via `next/font/google`
- **Monospace**: Geist Mono — for code blocks and technical data

Inter is configured as the CSS variable `--font-inter` and mapped to Tailwind's `font-sans` in `globals.css`:

```css
@theme inline {
  --font-sans: var(--font-inter);
}
```

### Type Scale

Use Tailwind's default type scale. Key reference sizes:

| Element | Classes | Notes |
|---|---|---|
| Page headings | `text-4xl font-bold tracking-tight` | H1-level content |
| Section headings | `text-2xl font-bold` | H2-level content |
| Sub-headings | `text-xl font-semibold` | H3-level content |
| Body text | `text-base` (default) | Standard paragraphs |
| Small/caption text | `text-sm` | Labels, metadata |
| Extra small | `text-xs` | Validation errors, fine print |

### Navigation Text (from Figma)

Navigation items use: `text-lg font-normal leading-7` (Inter)

> Only apply this to actual navigation links. Do not use it for general body text.

---

## 4. Semantic Usage Guide

### Page Backgrounds

```tsx
// ✅ Correct — warm off-white page
<div className="bg-background text-foreground">

// ❌ Wrong — hardcoded colors
<div className="bg-[#f5f3ef]">
<div className="bg-slate-50">
```

### Dark Surfaces (Header, Hero, Footer)

```tsx
// ✅ Correct — deep navy
<header className="bg-dark text-dark-foreground">
<footer className="bg-dark text-dark-foreground">

// ❌ Wrong — hardcoded
<header className="bg-[#0f1424]">
<div className="bg-slate-950 text-white">
```

### Cards

```tsx
// ✅ Correct
<div className="bg-card text-card-foreground border-border rounded-lg">

// ❌ Wrong
<div className="bg-white text-gray-900 border-gray-200">
```

### CTA Buttons

```tsx
// ✅ Correct — primary orange
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Place Bid
</Button>

// ❌ Wrong — hardcoded hex
<button className="bg-[#f97316] text-white hover:bg-[#ea580c]">
```

### Links

```tsx
// ✅ Correct — uses primary color
<Link className="text-primary hover:underline">Sign in</Link>

// ❌ Wrong
<Link className="text-blue-500 hover:underline">Sign in</Link>
```

### Muted / Secondary Text

```tsx
// ✅ Correct
<p className="text-muted-foreground">Helper text or description</p>
<span className="text-secondary-foreground">Metadata</span>

// ❌ Wrong
<p className="text-slate-600">Helper text</p>
<p className="text-gray-500">Description</p>
```

---

## 5. Component Styling Conventions

### Buttons (via shadcn `Button` variants)

| Variant | Classes Applied | Use Case |
|---|---|---|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/80` | Primary CTAs |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | Secondary actions |
| `destructive` | `bg-destructive/10 text-destructive hover:bg-destructive/20` | Delete, cancel |
| `outline` | `border-border bg-background hover:bg-muted` | Neutral actions |
| `ghost` | `hover:bg-muted hover:text-foreground` | Minimal actions |
| `link` | `text-primary underline-offset-4 hover:underline` | Inline links |

**Disabled state**: All buttons use `disabled:pointer-events-none disabled:opacity-50` — no custom disabled colors needed.

### Cards

```tsx
<Card className="bg-card text-card-foreground border-border">
  <CardHeader>
    <CardTitle>Auction Item</CardTitle>
    <CardDescription className="text-muted-foreground">
      Description here
    </CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Form Inputs

Inputs inherit the design system via `border-input`, `bg-background`, `text-foreground`, `placeholder:text-muted-foreground`, and focus states via `focus-visible:border-ring focus-visible:ring-ring/50`.

### Badges

Use semantic variants (`default`, `secondary`, `destructive`, `outline`) — never raw color classes.

---

## 6. Hover & State Patterns

Follow shadcn conventions. Do **not** create custom hover tokens.

```css
/* ✅ Correct patterns */
hover:bg-primary/90        /* Primary buttons */
hover:bg-primary/80        /* Link-style hover */
hover:bg-secondary/80      /* Secondary buttons */
hover:bg-destructive/90    /* Destructive buttons */
hover:bg-muted             /* Ghost/outline hover */
active:bg-primary/80       /* Active press */
disabled:opacity-50        /* Disabled state */

/* ❌ Wrong — don't create extra tokens */
--primary-hover: ...;
--primary-pressed: ...;
```

---

## 7. Border Radius

The project uses `--radius: 0.625rem` as the base. Derived values:

| Class | Value |
|---|---|
| `rounded-sm` | `calc(0.625rem × 0.6)` = 6px |
| `rounded-md` | `calc(0.625rem × 0.8)` = 8px |
| `rounded-lg` | `0.625rem` = 10px |
| `rounded-xl` | `calc(0.625rem × 1.4)` = 14px |
| `rounded-2xl` | `calc(0.625rem × 1.8)` = 18px |
| `rounded-full` | `9999px` (pill shape) |

---

## 8. Dark Mode

Dark mode is available via the `.dark` class (toggled by `next-themes`). All semantic tokens have dark mode overrides in `globals.css`.

Key behavior:
- Primary orange stays the same in both modes
- Background inverts to deep navy
- Cards become slightly lighter navy
- Border and input become transparent white overlays
- `--dark` inverts to an even deeper navy

**Default theme** is `light` with `enableSystem={false}`.

---

## 9. File Reference

| File | Purpose |
|---|---|
| `src/app/globals.css` | All CSS variables, Tailwind theme registration |
| `src/app/layout.tsx` | Font loading (Inter via `next/font/google`) |
| `components.json` | shadcn/ui configuration |
| `src/components/ui/button.tsx` | Button variants (CVA) |
| `src/components/ui/input.tsx` | Base input component |
| `src/components/ui/checkbox.tsx` | Checkbox (uses `data-checked:bg-primary`) |
| `document.md` | This file |
