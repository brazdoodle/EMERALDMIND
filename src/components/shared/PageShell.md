# PageShell UI Standard

## Overview
`PageShell` is the unified page layout component that ensures consistent styling across all pages in EmeraldMind. All pages MUST use PageShell to maintain design consistency.

## Required Props

### Core Props
- `title` (string): Page title - should be the main page name (e.g., "Dashboard", "Trainer Architect")
- `description` (string): Brief description of page functionality 
- `icon` (LucideIcon): Page icon - will be rendered in emerald gradient circle
- `children` (ReactNode): Page content

### Optional Props
- `actions` (ReactNode): Action buttons for the header (right side)
- `statusIndicator` (ReactNode): Status indicator component (right side, after stats)
- `stats` (Array): Array of stat badges, format: `[{ label: string, value: string|number, variant?: "secondary"|"outline"|... }]`
- `className` (string): Additional CSS classes for outer container
- `contentClassName` (string): Additional CSS classes for content area

## Standard Usage Pattern

```jsx
import { PageShell, PageCard, StatusIndicator } from '@/components/shared/PageShell.jsx';
import { YourIcon } from 'lucide-react';

export default function YourPage() {
  return (
    <PageShell
      icon={YourIcon}
      title="Your Page"
      description="Brief description of functionality"
      statusIndicator={
        <StatusIndicator 
          status={yourStatus} 
          label="Status Label"
        />
      }
      actions={
        <div className="flex items-center gap-3">
          <Button>Action 1</Button>
          <Button>Action 2</Button>
        </div>
      }
      stats={[
        { label: "Count", value: 42, variant: "secondary" },
        { label: "Status", value: "Active", variant: "outline" }
      ]}
    >
      <PageCard title="Main Content">
        {/* Your page content */}
      </PageCard>
    </PageShell>
  );
}
```

## Design Standards

### Icon Styling
- All page icons are automatically styled with emerald gradient background
- Icon size: `w-6 h-6` inside `w-12 h-12` container
- Gradient: `from-emerald-500 to-teal-500`
- DO NOT customize icon colors - let PageShell handle it

### Typography
- Title: `text-3xl font-bold tracking-tight`
- Description: `text-slate-600 dark:text-slate-400`
- All text supports dark mode automatically

### Spacing & Layout
- Container: `p-6 space-y-6`
- Header spacing: `gap-4` between elements
- Content spacing: `space-y-6`
- DO NOT add custom padding/margins - let PageShell handle it

### Animation
- Standard fade-in animation on mount
- Header: `opacity: 0, y: -20` → `opacity: 1, y: 0`
- Content: `opacity: 0, y: 20` → `opacity: 1, y: 0` (delayed)

## Components to Use

### PageCard
Wrap content sections in `PageCard` for consistent styling:

```jsx
<PageCard title="Section Title" description="Optional description">
  {/* Content */}
</PageCard>
```

### StatusIndicator
Use for showing system/service status:

```jsx
<StatusIndicator 
  status="ready|slow|offline|checking" 
  label="AI Status"
  labels={{ ready: "AI Ready", slow: "AI Slow", offline: "AI Offline" }}
/>
```

## Migration Checklist

When converting a page to PageShell:

1. [x] Import PageShell, PageCard, StatusIndicator
2. [x] Replace custom header with PageShell props
3. [x] Use `icon` prop (not custom icon styling)
4. [x] Use `title` and `description` props
5. [x] Move action buttons to `actions` prop
6. [x] Move status indicators to `statusIndicator` prop
7. [x] Move stats/badges to `stats` prop
8. [x] Wrap content sections in PageCard
9. [x] Remove custom padding/spacing classes
10. [x] Test responsiveness and dark mode

## Examples

### Dashboard Pattern
```jsx
<PageShell
  icon={Home}
  title="Dashboard"
  description="Welcome to your ROM hacking command center"
  statusIndicator={<StatusIndicator status={ollamaStatus} label="AI Status" />}
>
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
    <div className="xl:col-span-2 space-y-8">
      <PageCard><ProjectSelector /></PageCard>
      <PageCard><QuickActions /></PageCard>
    </div>
    <div className="space-y-8">
      <PageCard><SystemStatus /></PageCard>
    </div>
  </div>
</PageShell>
```

### Tool Page Pattern
```jsx
<PageShell
  icon={Zap}
  title="Tool Name"
  description="Tool description"
  actions={
    <Button onClick={handleAction}>
      <Plus className="w-4 h-4 mr-2" />
      New Item
    </Button>
  }
  stats={[{ label: "Items", value: itemCount, variant: "secondary" }]}
>
  <PageCard title="Main Tool Interface">
    {/* Tool content */}
  </PageCard>
</PageShell>
```

## DO NOT
- Don't use custom header layouts
- Don't apply custom icon colors/styling
- Don't add custom padding to page root
- Don't use inconsistent spacing
- Don't skip PageCard for content sections
- Don't use ThemeToggle directly (PageShell handles it)
- Don't create custom animation patterns

## MUST DO
- Do use PageShell for ALL pages
- Do follow the prop interface exactly
- Do wrap content in PageCard
- Do use provided StatusIndicator
- ✅ Test dark mode compatibility
- ✅ Ensure responsive behavior