import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateVersionDialogComponent } from './create-version-dialog/create-version-dialog.component';
import { EditVersionDialogComponent } from './edit-version-dialog/edit-version-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { VersionService } from '../../services/version.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

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
export class UserManagementUpdateComponent implements OnInit {
  isLoading = false;
  versionComparisons: VersionComparison[] = [];
  versionDataMap: Map<string, any> = new Map(); // Store raw backend data for editing

  constructor(
    private dialog: MatDialog,
    private versionService: VersionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadVersions();
  }

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

  // Default/mock data - will be used as fallback if API fails or returns no data
  defaultVersionComparisons: VersionComparison[] = [
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

  getImageUrl(imagePath: string): string {
    if (!imagePath || imagePath.trim() === '') {
      return '';
    }
    
    // If already a full URL (http:// or https://), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it starts with /uploads/version, it's already the correct path
    if (imagePath.startsWith('/uploads/version')) {
      return `${environment.apiUrl}${imagePath}`;
    }
    
    // If it starts with uploads/version (without leading /)
    if (imagePath.startsWith('uploads/version')) {
      return `${environment.apiUrl}/${imagePath}`;
    }
    
    // If it starts with /uploads, it's a relative path from backend root
    if (imagePath.startsWith('/uploads')) {
      return `${environment.apiUrl}${imagePath}`;
    }
    
    // If it starts with uploads (without /), add the slash
    if (imagePath.startsWith('uploads')) {
      return `${environment.apiUrl}/${imagePath}`;
    }
    
    // If it's just a filename or relative path, construct the full URL
    // Backend saves to public/uploads/version, so the URL should be /uploads/version/filename
    const cleanPath = imagePath.replace(/^\/+/, ''); // Remove leading slashes
    const imageUrl = `${environment.apiUrl}/uploads/version/${cleanPath}`;
    console.log('🖼️ Constructed image URL:', { 
      original: imagePath, 
      constructed: imageUrl,
      apiUrl: environment.apiUrl
    });
    return imageUrl;
  }

  getBackgroundImage(url: string): string {
    const imageUrl = this.getImageUrl(url);
    return imageUrl ? `url('${imageUrl}')` : 'none';
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

  loadVersions(): void {
    this.isLoading = true;
    this.versionService.getVersions().subscribe({
      next: (response) => {
        console.log('✅ Versions loaded:', response);
        
        // Handle different response formats
        const versions = Array.isArray(response) ? response : (response.data || response.versions || []);
        
        if (versions.length > 0) {
          // Clear previous data map
          this.versionDataMap.clear();
          
          // Map backend response to VersionComparison interface
          this.versionComparisons = versions.map((version: any, index: number) => {
            // Store raw version data for editing
            const versionId = version.id || version._id?.$oid || version._id || `version-${index}`;
            this.versionDataMap.set(versionId, version);
            return this.mapToVersionComparison(version, index);
          });
        } else {
          // If no versions from API, use default data
          this.versionComparisons = this.defaultVersionComparisons;
        }
        
        this.isLoading = false;
        this.updateQuickLinks();
      },
      error: (error) => {
        console.error('❌ Error loading versions:', error);
        this.toastr.error('Failed to load versions. Using default data.', 'Warning');
        // Fallback to default data on error
        this.versionComparisons = this.defaultVersionComparisons;
        this.isLoading = false;
      }
    });
  }

  mapToVersionComparison(version: any, index: number): VersionComparison {
    // Map backend data to VersionComparison interface
    // Backend structure: { heading: "Dashboard", images: [{ oldImage: "9.PNG", newImage: "Capture.PNG" }] }
    
    // Get image paths from the images array
    let oldImagePath = '';
    let newImagePath = '';
    
    if (version.images && Array.isArray(version.images) && version.images.length > 0) {
      // Get the first image object from the array
      const firstImage = version.images[0];
      oldImagePath = firstImage.oldImage || firstImage.oldImages || '';
      newImagePath = firstImage.newImage || firstImage.newImages || '';
    }
    
    // Fallback to direct properties if images array doesn't exist
    if (!oldImagePath) {
      oldImagePath = version.oldImages || version.oldImage || version.old?.image || '';
    }
    if (!newImagePath) {
      newImagePath = version.newImages || version.newImage || version.new?.image || '';
    }
    
    console.log('📋 Mapping version:', {
      heading: version.heading,
      oldImagePath,
      newImagePath,
      imagesArray: version.images,
      fullVersion: version
    });
    
    // Extract ID - handle MongoDB ObjectId format
    let versionId = version.id || version._id?.$oid || version._id || `version-${index}`;
    if (typeof versionId !== 'string') {
      versionId = String(versionId);
    }
    
    return {
      id: versionId,
      title: version.heading || version.title || 'Untitled',
      description: version.description || '',
      owner: version.owner || 'Unknown',
      lastUpdated: version.lastUpdated || version.updatedAt?.$date || version.updatedAt || new Date().toISOString(),
      tags: version.tags || [version.heading || ''],
      status: (version.status || 'Draft') as 'In Review' | 'Ready' | 'Draft',
      old: {
        caption: version.oldCaption || version.old?.caption || '',
        image: this.getImageUrl(oldImagePath),
        notes: version.oldNotes || version.old?.notes || []
      },
      newer: {
        caption: version.newCaption || version.new?.caption || '',
        image: this.getImageUrl(newImagePath),
        notes: version.newNotes || version.new?.notes || [],
        highlights: version.highlights || version.new?.highlights || []
      }
    };
  }

  updateQuickLinks(): void {
    // Update quick links based on loaded versions
    if (this.versionComparisons.length > 0) {
      this.quickLinks = this.versionComparisons.map((version, index) => ({
        label: version.title,
        anchor: version.id
      }));
    }
  }

  openCreateVersionDialog(): void {
    const dialogRef = this.dialog.open(CreateVersionDialogComponent, {
      width: '600px',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the version list after creating a new version
        this.loadVersions();
        this.toastr.success('Version list refreshed');
      }
    });
  }

  openEditVersionDialog(comparison: VersionComparison): void {
    const rawVersionData = this.versionDataMap.get(comparison.id);
    
    // Extract original image filenames from raw data
    let oldImageFilename = '';
    let newImageFilename = '';
    
    if (rawVersionData?.images && Array.isArray(rawVersionData.images) && rawVersionData.images.length > 0) {
      const firstImage = rawVersionData.images[0];
      oldImageFilename = firstImage.oldImage || firstImage.oldImages || '';
      newImageFilename = firstImage.newImage || firstImage.newImages || '';
    }
    
    // Extract ID - handle MongoDB ObjectId format
    let versionId = rawVersionData?.id || rawVersionData?._id?.$oid || rawVersionData?._id || comparison.id;
    if (typeof versionId !== 'string') {
      versionId = String(versionId);
    }
    
    const dialogRef = this.dialog.open(EditVersionDialogComponent, {
      width: '600px',
      disableClose: true,
      autoFocus: false,
      data: {
        versionId: versionId,
        heading: comparison.title,
        oldImage: oldImageFilename,
        newImage: newImageFilename
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the version list after updating
        this.loadVersions();
      }
    });
  }

  deleteVersion(comparison: VersionComparison): void {
    const rawVersionData = this.versionDataMap.get(comparison.id);
    
    // Extract ID - handle MongoDB ObjectId format
    let versionId = rawVersionData?.id || rawVersionData?._id?.$oid || rawVersionData?._id || comparison.id;
    if (typeof versionId !== 'string') {
      versionId = String(versionId);
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Delete Confirmation',
        message: `Are you sure you want to delete "${comparison.title}"? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.versionService.deleteVersion(versionId).subscribe({
          next: (response) => {
            console.log('✅ Version deleted successfully:', response);
            this.toastr.success('Version deleted successfully');
            // Refresh the version list after deletion
            this.loadVersions();
          },
          error: (error) => {
            console.error('❌ Error deleting version:', error);
            this.toastr.error('Failed to delete version');
          }
        });
      }
    });
  }
}

