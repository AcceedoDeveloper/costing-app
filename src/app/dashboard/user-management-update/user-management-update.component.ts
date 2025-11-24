import { Component } from '@angular/core';

type VersionNote = string;

interface VersionSlice {
  caption: string;
  image: string;
  notes: VersionNote[];
}

interface VersionComparison {
  id: string;
  title: string;
  description: string;
  owner: string;
  lastUpdated: string;
  tags: string[];
  status: 'In Review' | 'Ready' | 'Draft';
  old: VersionSlice;
  newer: VersionSlice & { highlights: string[] };
}

@Component({
  selector: 'app-user-management-update',
  templateUrl: './user-management-update.component.html',
  styleUrls: ['./user-management-update.component.css']
})
export class UserManagementUpdateComponent {
  quickLinks = [
    { label: 'Dashboard', anchor: 'dashboard-overview' },
    { label: 'Customer', anchor: 'customer-flow' },
    { label: 'Cost Inputs', anchor: 'cost-inputs' },
    { label: 'Material', anchor: 'material-flow' },
    { label: 'Material Type', anchor: 'material-type' },
    { label: 'Process', anchor: 'process-flow' },
    { label: 'Role & Access', anchor: 'access-control' },
    { label: 'Department', anchor: 'department-flow' },
    { label: 'Grade', anchor: 'grade-flow' },
    { label: 'User Profiles', anchor: 'profile-screens' },
    { label: 'Reports', anchor: 'reporting' },
    { label: 'Team Approvals', anchor: 'team-approvals' }
  ];

  upcomingRelease = {
    title: 'Sprint 14 • Rollout Plan',
    date: 'Dec 04, 2025',
    summary: 'Consolidated release that aligns the new UI with the latest access policies and SOC2 compliance updates.'
  };

  versionComparisons: VersionComparison[] = [
    {
      id: 'dashboard-overview',
      title: 'Dashboard',
      description: 'High-level landing page showing user health, pending approvals and activity trails.',
      owner: 'Product Design',
      lastUpdated: 'Nov 24, 2025',
      tags: ['Dashboard', 'Insights'],
      status: 'Ready',
      old: {
        caption: 'Static cards without drill-down or quick actions.',
        image: 'assets/Dashboard-v1.png',
        notes: [
          'No quick entry points for approval queues.',
          'KPIs use legacy color palette.',
          'Limited support for smaller viewports.'
        ]
      },
      newer: {
        caption: 'Interactive overview with contextual quick links.',
        image: 'assets/Dashboard-v2.png',
        notes: [
          'Responsive panel layout with live stats.',
          'Inline escalations and mentions.',
          'Support for exporting filtered data.'
        ],
        highlights: ['Ready for UAT', 'Dark-mode friendly']
      }
    },
    {
      id: 'customer-flow',
      title: 'Customer',
      description: 'Before / after for the customer table, filters and inline CTA experience.',
      owner: 'CX Delivery',
      lastUpdated: 'Nov 23, 2025',
      tags: ['Customer', 'Lists'],
      status: 'Ready',
      old: {
        caption: 'Legacy customer table without grouping or quick filters.',
        image: 'assets/Customer-v1.png',
        notes: [
          'No pinned filters or quick export.',
          'Row hover actions inconsistent.'
        ]
      },
      newer: {
        caption: 'Segmented view with multi-select actions.',
        image: 'assets/Customer-v2.png',
        notes: [
          'Grouped by part / drawing.',
          'Contextual actions per row.'
        ],
        highlights: ['Approved for rollout']
      }
    },
    {
      id: 'cost-inputs',
      title: 'Costing Inputs Board',
      description: 'Comparing the legacy cost input worksheet with the new modular grid.',
      owner: 'Cost Ops',
      lastUpdated: 'Nov 23, 2025',
      tags: ['Cost', 'Inputs'],
      status: 'In Review',
      old: {
        caption: 'Single sheet with horizontal scroll.',
        image: 'assets/Costing-input-v1.png',
        notes: [
          'Difficult to edit on laptops.',
          'Info icons overlap on smaller screens.'
        ]
      },
      newer: {
        caption: 'Responsive layout with anchored summary cards.',
        image: 'assets/Costing-input-v2.png',
        notes: [
          'Sticky calculated values on the right.',
          'Better popover placement.'
        ],
        highlights: ['QA approved', 'Docs pending']
      }
    },
    {
      id: 'material-flow',
      title: 'Material Master',
      description: 'Side-by-side comparison for the material management page.',
      owner: 'Master Data Team',
      lastUpdated: 'Nov 20, 2025',
      tags: ['Material', 'Master'],
      status: 'Ready',
      old: {
        caption: 'Basic CRUD list with limited validation.',
        image: 'assets/Material-v1.png',
        notes: [
          'No inline duplicate detection.',
          'Missing context on grade usage.'
        ]
      },
      newer: {
        caption: 'Modular cards with grade references.',
        image: 'assets/Material-v2.png',
        notes: [
          'Inline duplicate hints.',
          'Grade references and quick links.'
        ],
        highlights: ['Launched']
      }
    },
    {
      id: 'material-type',
      title: 'Material Type Library',
      description: 'Refresh of the material type catalog.',
      owner: 'Master Data Team',
      lastUpdated: 'Nov 19, 2025',
      tags: ['Material', 'Library'],
      status: 'Ready',
      old: {
        caption: 'Static list with no usage indicator.',
        image: 'assets/MaterialType-v1.png',
        notes: [
          'Unclear where a type is used.',
          'Manual pagination toggles.'
        ]
      },
      newer: {
        caption: 'Card-based directory with usage stats.',
        image: 'assets/MaterialType-v2.png',
        notes: [
          'Usage counters and badges.',
          'Filterable by department.'
        ],
        highlights: ['Deployed']
      }
    },
    {
      id: 'process-flow',
      title: 'Process Builder',
      description: 'Legacy process setup vs the refreshed flow.',
      owner: 'Process Lab',
      lastUpdated: 'Nov 21, 2025',
      tags: ['Process', 'Builder'],
      status: 'In Review',
      old: {
        caption: 'Linear form with multiple modal hops.',
        image: 'assets/Process-v1.png',
        notes: [
          'No preview before save.',
          'Raw material association hidden.'
        ]
      },
      newer: {
        caption: 'Stepper flow with live preview.',
        image: 'assets/Process-v2.png',
        notes: [
          'Embedded preview + activity.',
          'Better raw material mapping.'
        ],
        highlights: ['Awaiting SME review']
      }
    },
    {
      id: 'access-control',
      title: 'Role',
      description: 'Comparing the legacy permissions modal with the redesigned matrix-based experience.',
      owner: 'Security UX Guild',
      lastUpdated: 'Nov 22, 2025',
      tags: ['Roles', 'Permissions'],
      status: 'In Review',
      old: {
        caption: 'Modal based list that required multiple clicks.',
        image: 'assets/Role-v1.png',
        notes: [
          'No bulk role updates.',
          'Difficult to audit per-module permissions.'
        ]
      },
      newer: {
        caption: 'Two-column layout with instant diff preview.',
        image: 'assets/Role-v2.png',
        notes: [
          'Multi-select with keyboard shortcuts.',
          'Audit friendly changelog panel.'
        ],
        highlights: ['Awaiting security sign-off']
      }
    },
    {
      id: 'department-flow',
      title: 'Department',
      description: 'Legacy department approvals experience vs the new collaborative board.',
      owner: 'Operations Studio',
      lastUpdated: 'Nov 15, 2025',
      tags: ['Approvals', 'Workflow'],
      status: 'In Review',
      old: {
        caption: 'Sequential approvals with limited visibility.',
        image: 'assets/Department-v1.png',
        notes: [
          'Single approver view only.',
          'No attachment context for requests.',
          'Status updates buried in email.'
        ]
      },
      newer: {
        caption: 'Kanban style approvals with inline context.',
        image: 'assets/Department-v2.png',
        notes: [
          'Live collaboration indicators.',
          'Batch approve / reject with notes.',
          'Attachment lightbox for every card.'
        ],
        highlights: ['Awaiting Ops sign-off', 'QA pass pending']
      }
    },
    {
      id: 'grade-flow',
      title: 'Grade Matrix',
      description: 'Visual update for the grade catalog and mapping.',
      owner: 'Quality Guild',
      lastUpdated: 'Nov 17, 2025',
      tags: ['Grade', 'Quality'],
      status: 'Ready',
      old: {
        caption: 'Dense table showing grade references.',
        image: 'assets/grade-v1.png',
        notes: [
          'Difficult to scan references.',
          'No status badges.'
        ]
      },
      newer: {
        caption: 'Segmented grid with inline usage chips.',
        image: 'assets/grade-v2.png',
        notes: [
          'Hover cards for references.',
          'Color-coded status badges.'
        ],
        highlights: ['Live']
      }
    },
    {
      id: 'profile-screens',
      title: 'QuotePro',
      description: 'Side-by-side refresh of the core profile page with the new modular widgets.',
      owner: 'CX Studio',
      lastUpdated: 'Nov 18, 2025',
      tags: ['Profiles', 'Activity', 'Widgets'],
      status: 'Draft',
      old: {
        caption: 'Single column layout with stacked cards.',
        image: 'assets/Customer-details-v1.png',
        notes: [
          'Audit trail hidden behind tabs.',
          'Attachments open in a new tab.'
        ]
      },
      newer: {
        caption: 'Modular grid with collapsible audit + attachment drawers.',
        image: 'assets/Customer-details-v2.png',
        notes: [
          'Inline attachment previewer.',
          'Sticky activity timeline.'
        ],
        highlights: ['Needs copy edit', 'Awaiting QA screenshots']
      }
    },
    {
      id: 'reporting',
      title: 'Reporting Workspace',
      description: 'Transitioning from PDF heavy reports to the new table + grid modes.',
      owner: 'Reporting Team',
      lastUpdated: 'Nov 12, 2025',
      tags: ['Reports', 'Analytics'],
      status: 'Draft',
      old: {
        caption: 'Legacy reporting view (image still pending).',
        image: '',
        notes: [
          'Static PDF only.',
          'Filters applied post-export.'
        ]
      },
      newer: {
        caption: 'Responsive grid + table export modes.',
        image: 'assets/report-v2.png',
        notes: [
          'CSV export respects column filters.',
          'Inline stats cards for context.'
        ],
        highlights: ['Need V1 screenshot', 'Docs WIP']
      }
    },
    {
      id: 'team-approvals',
      title: 'User Profile',
      description: 'Snapshot for the dedicated user approvals board.',
      owner: 'Operations Studio',
      lastUpdated: 'Nov 14, 2025',
      tags: ['Approvals'],
      status: 'Draft',
      old: {
        caption: 'Team approvals baked into user table.',
        image: 'assets/User-v1.png',
        notes: [
          'No dedicated queue.',
          'Manual reminders.'
        ]
      },
      newer: {
        caption: 'Dedicated approvals board with mentions.',
        image: 'assets/User-v2.png',
        notes: [
          'Mentions and reminders inline.',
          'Board filtered by role.'
        ],
        highlights: ['Need Ops training']
      }
    }
  ];

  lightboxImage: { url: string; title: string } | null = null;

  getBackgroundImage(url: string): string {
    return url ? `url('${url}')` : 'none';
  }

  scrollTo(anchor: string): void {
    const el = document.getElementById(anchor);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  handleNavKey(event: KeyboardEvent, anchor: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.scrollTo(anchor);
    }
  }

  openLightbox(imageUrl: string, title: string): void {
    if (!imageUrl) return;
    this.lightboxImage = { url: imageUrl, title };
  }

  handleImageKey(event: KeyboardEvent, imageUrl: string, title: string): void {
    if ((event.key === 'Enter' || event.key === ' ') && imageUrl) {
      event.preventDefault();
      this.openLightbox(imageUrl, title);
    }
  }

  closeLightbox(): void {
    this.lightboxImage = null;
  }
}

