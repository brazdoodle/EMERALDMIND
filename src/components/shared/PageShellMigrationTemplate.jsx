// PageShell Migration Helper
// Copy and paste this template for migrating pages to PageShell

import React from 'react';
import { PageShell, PageCard, StatusIndicator } from '@/components/shared/PageShell.jsx';
import { YourIcon } from 'lucide-react'; // Replace with your page icon

export default function YourPage() {
  // Your existing state and logic here...

  return (
    <PageShell
      icon={YourIcon}                    // Required: Page icon from lucide-react
      title="Your Page Title"            // Required: Page name
      description="Brief page description" // Required: What this page does
      
      // Optional: Status indicator (for AI/service status)
      statusIndicator={
        <StatusIndicator 
          status={yourStatus}            // "ready"|"slow"|"offline"|"checking"
          label="Status Label"           // e.g., "AI Status"
        />
      }
      
      // Optional: Action buttons (right side of header)
      actions={
        <div className="flex items-center gap-3">
          <Button onClick={handleAction}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Action Button
          </Button>
        </div>
      }
      
      // Optional: Stats badges (shown before actions)
      stats={[
        { label: "Count", value: itemCount, variant: "secondary" },
        { label: "Status", value: "Active", variant: "outline" }
      ]}
    >
      {/* Wrap your content sections in PageCard */}
      <PageCard title="Main Content" description="Optional description">
        {/* Your existing page content goes here */}
      </PageCard>
      
      {/* Multiple cards for different sections */}
      <PageCard title="Another Section">
        {/* More content */}
      </PageCard>
      
      {/* Grid layouts work great with PageCard */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <PageCard>
            {/* Main content */}
          </PageCard>
        </div>
        <div className="space-y-8">
          <PageCard>
            {/* Sidebar content */}
          </PageCard>
        </div>
      </div>
    </PageShell>
  );
}

/*
MIGRATION CHECKLIST:
1. [x] Import PageShell, PageCard, StatusIndicator
2. [x] Replace entire custom header with PageShell props
3. [x] Move title to `title` prop
4. [x] Move description to `description` prop  
5. [x] Move icon to `icon` prop (remove custom styling)
6. [x] Move action buttons to `actions` prop
7. [x] Move status indicators to `statusIndicator` prop
8. [x] Move stats/counts to `stats` prop
9. [x] Wrap content in PageCard components
10. [x] Remove custom padding/spacing (PageShell handles it)
11. [x] Remove custom header animations (PageShell handles it)
12. [x] Remove ThemeToggle imports (PageShell includes it)
13. [x] Test dark mode and responsiveness
*/