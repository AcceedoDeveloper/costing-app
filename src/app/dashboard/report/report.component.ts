import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomerdetailsIn } from '../../models/Customer-details.model';
import { MatDialog } from '@angular/material/dialog';
import { ReportDetailsDialogComponent } from './report-details-dialog/report-details-dialog.component';
import { ViewQuotationComponent } from '../../material/customerdetails/view-quotation/view-quotation.component';
import { PowerService } from '../../services/power.service';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from '../../services/dashboard.service';
import { ReportQuotationDialogComponent } from './report-quotation-dialog/report-quotation-dialog.component';
import { ReportsService } from '../../services/reports.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit, OnDestroy {
  customerDetails: CustomerdetailsIn[] = [];
  private subscription: Subscription = new Subscription();
  loading: boolean = false;

  // Statistics
  totalCustomers: number = 0;
  totalProcesses: number = 0;
  completedCustomers: number = 0;
  pendingCustomers: number = 0;
  modifiedCustomers: number = 0;
  uniqueCustomers: Set<string> = new Set();

  // Filter properties
  searchText: string = '';
  selectedStatus: string = 'all';
  selectedStatFilter: string = ''; // 'completed', 'pending', 'modified', or ''
  
  // Date filter properties
  dateFilterType: string = 'custom';
  startDate: string = new Date().toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];
  selectedWeek: string = '';
  selectedMonth: string = '';
  selectedYear: string = '';
  currentYear: number = new Date().getFullYear();

  // Pagination
  currentPage: number = 1;
  pageLimit: number = 10;
  totalRecords: number = 0;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;
  totalPages: number = 0;
  pageIndex: number = 0;

  // View mode
  viewMode: 'grid' | 'table' = 'table';

  constructor(
    private reportsService: ReportsService,
    private dialog: MatDialog,
    private powerService: PowerService,
    private toastr: ToastrService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    // Initialize default year value
    if (!this.selectedYear) {
      this.selectedYear = new Date().getFullYear().toString();
    }
    this.loadCustomerDetails();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadCustomerDetails(): void {
    this.loading = true;
    
    // Prepare date parameters
    let startDateParam = '';
    let endDateParam = '';

    if (this.dateFilterType === 'custom') {
      startDateParam = this.startDate || '';
      endDateParam = this.endDate || '';
    } else {
      const dateRange = this.getDateRange(this.dateFilterType);
      startDateParam = dateRange.start.toISOString().split('T')[0];
      endDateParam = dateRange.end.toISOString().split('T')[0];
    }

    // Only proceed if we have valid date parameters or custom range
    if (this.dateFilterType !== 'custom' && !startDateParam && !endDateParam) {
      this.loading = false;
      return;
    }

    const params = {
      customerName: '',
      partName: '',
      drawingNo: '',
      ID: '',
      StartDate: startDateParam,
      EndDate: endDateParam,
      page: this.currentPage,
      limit: this.pageLimit
    };

    const sub = this.reportsService.getCustomerDetails(params).subscribe({
      next: (response: any) => {
        this.customerDetails = response.data || [];
        // Use pagination object from API response
        if (response.pagination) {
          this.totalRecords = response.pagination.totalRecords || 0;
          this.hasNextPage = response.pagination.hasNextPage || false;
          this.hasPreviousPage = response.pagination.hasPreviousPage || false;
          this.totalPages = response.pagination.totalPages || 0;
          this.currentPage = response.pagination.currentPage || 1;
          this.pageIndex = (response.pagination.currentPage || 1) - 1; // Convert to 0-based index
        } else {
          // Fallback if pagination object is not present
          this.totalRecords = response.total || response.count || this.customerDetails.length;
          this.hasNextPage = false;
          this.hasPreviousPage = false;
          this.totalPages = Math.ceil(this.totalRecords / this.pageLimit);
        }
        this.calculateStatistics();
        this.loading = false;
        console.log('Pagination:', {
          totalRecords: this.totalRecords,
          hasNextPage: this.hasNextPage,
          hasPreviousPage: this.hasPreviousPage,
          totalPages: this.totalPages,
          currentPage: this.currentPage
        });
      },
      error: (error) => {
        console.error('Error loading customer details:', error);
        this.toastr.error('Failed to load customer details', 'Error');
        this.customerDetails = [];
        this.calculateStatistics();
        this.loading = false;
      }
    });

    this.subscription.add(sub);
  }

  calculateStatistics(): void {
    this.totalCustomers = this.customerDetails.length;
    this.uniqueCustomers.clear();
    this.completedCustomers = 0;
    this.pendingCustomers = 0;
    this.modifiedCustomers = 0;
    
    this.customerDetails.forEach(customer => {
      if (customer.CustomerName?.name) {
        this.uniqueCustomers.add(customer.CustomerName.name);
      }
      if (customer.processName && Array.isArray(customer.processName)) {
        this.totalProcesses += customer.processName.length;
      }
      
      const status = customer.Status?.toLowerCase() || '';
      if (status === 'completed') {
        this.completedCustomers++;
      } else if (status === 'pending') {
        this.pendingCustomers++;
      }
      
      // Check if record has been modified (has updatedAt and it's different from createdAt)
      if (customer.updatedAt && customer.createdAt) {
        const createdAt = new Date(customer.createdAt);
        const updatedAt = new Date(customer.updatedAt);
        if (updatedAt.getTime() !== createdAt.getTime()) {
          this.modifiedCustomers++;
        }
      }
    });
  }

  get filteredCustomers(): CustomerdetailsIn[] {
    let filtered = [...this.customerDetails];

    // Search filter
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(customer => 
        customer.CustomerName?.name?.toLowerCase().includes(search) ||
        customer.drawingNo?.toLowerCase().includes(search) ||
        customer.partName?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(customer => 
        customer.Status?.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    }

    // Stat filter (from clicking stat cards)
    if (this.selectedStatFilter) {
      filtered = filtered.filter(customer => {
        switch (this.selectedStatFilter) {
          case 'completed':
            return customer.Status?.toLowerCase() === 'completed';
          case 'pending':
            return customer.Status?.toLowerCase() === 'pending';
          case 'modified':
            if (customer.updatedAt && customer.createdAt) {
              const createdAt = new Date(customer.createdAt);
              const updatedAt = new Date(customer.updatedAt);
              return updatedAt.getTime() !== createdAt.getTime();
            }
            return false;
          default:
            return true;
        }
      });
    }

    // Note: Date filtering is now handled server-side via ReportsService
    // Client-side filtering removed to avoid double filtering

    return filtered;
  }

  getProcessCount(customer: CustomerdetailsIn): number {
    return customer.processName && Array.isArray(customer.processName) 
      ? customer.processName.length 
      : 0;
  }

  getProcessNames(customer: CustomerdetailsIn): string {
    if (!customer.processName || !Array.isArray(customer.processName) || customer.processName.length === 0) {
      return 'No processes';
    }
    
    const processNames = customer.processName
      .map(process => process?.processName || process?.name || 'N/A')
      .filter(name => name !== 'N/A');
    
    return processNames.length > 0 ? processNames.join(', ') : 'No processes';
  }

  getProcessDetails(customer: CustomerdetailsIn): string {
    if (!customer.processName || !Array.isArray(customer.processName) || customer.processName.length === 0) {
      return 'No process details';
    }

    const details = customer.processName.map((process, index) => {
      const processName = process?.processName || process?.name || `Process ${index + 1}`;
      const materials: string[] = [];
      

      
      // Extract raw materials
      if (process?.rawMaterial && Array.isArray(process.rawMaterial)) {
        process.rawMaterial.forEach((rm: any) => {
          if (rm?.materialsUsed && Array.isArray(rm.materialsUsed)) {
            rm.materialsUsed.forEach((mat: any) => {
              const matInfo = `${mat?.name || 'N/A'} (Qty: ${mat?.quantity || 0}, Cost: ${mat?.totalCost || 0})`;
              materials.push(`${rm?.type || 'Unknown'}: ${matInfo}`);
            });
          }
        });
      }

      // Get type costs
      const typeCosts = process?.typeCosts || {};
      const alloyCost = typeCosts?.AlloyTotalCost || process?.totalRawAlloyCost || 0;
      const baseMetalCost = typeCosts?.['Base MetaTotalCost'] || typeCosts?.BaseMetaTotalCost || process?.totalRawMetalCost || 0;
      const sandCost = process?.totalRawSandCost || 0;
      const powerCost = typeCosts?.totalPowerCost || 0;
      const processCost = typeCosts?.totalProcessCost || process?.processCost || 0;

      const costSummary = `Alloy: ${alloyCost}, Base Metal: ${baseMetalCost}, Sand: ${sandCost}, Power: ${powerCost}, Process: ${processCost}`;
      
      return `${processName} | Materials: ${materials.length > 0 ? materials.join('; ') : 'None'} | Costs: ${costSummary}`;
    });

    return details.join(' || ');
  }

  getTotalProcessCosts(customer: CustomerdetailsIn): string {
    if (!customer.processName || !Array.isArray(customer.processName) || customer.processName.length === 0) {
      return '0,0,0,0,0';
    }

    let totalAlloy = 0;
    let totalBaseMetal = 0;
    let totalSand = 0;
    let totalPower = 0;
    let totalProcess = 0;

    customer.processName.forEach((process: any) => {
      const typeCosts = process?.typeCosts || {};
      totalAlloy += typeCosts?.AlloyTotalCost || process?.totalRawAlloyCost || 0;
      totalBaseMetal += typeCosts?.['Base MetaTotalCost'] || typeCosts?.BaseMetaTotalCost || process?.totalRawMetalCost || 0;
      totalSand += process?.totalRawSandCost || 0;
      totalPower += typeCosts?.totalPowerCost || 0;
      totalProcess += typeCosts?.totalProcessCost || process?.processCost || 0;
    });

    return `${totalAlloy},${totalBaseMetal},${totalSand},${totalPower},${totalProcess}`;
  }

  getMaterialsSummary(customer: CustomerdetailsIn): string {
    if (!customer.processName || !Array.isArray(customer.processName) || customer.processName.length === 0) {
      return 'No materials';
    }

    const materialMap = new Map<string, { quantity: number; totalCost: number }>();

    customer.processName.forEach((process: any) => {
      if (process?.rawMaterial && Array.isArray(process.rawMaterial)) {
        process.rawMaterial.forEach((rm: any) => {
          if (rm?.materialsUsed && Array.isArray(rm.materialsUsed)) {
            rm.materialsUsed.forEach((mat: any) => {
              const matName = mat?.name || 'Unknown';
              const quantity = mat?.quantity || 0;
              const cost = mat?.totalCost || 0;
              
              if (materialMap.has(matName)) {
                const existing = materialMap.get(matName)!;
                existing.quantity += quantity;
                existing.totalCost += cost;
              } else {
                materialMap.set(matName, { quantity, totalCost: cost });
              }
            });
          }
        });
      }
    });

    if (materialMap.size === 0) {
      return 'No materials';
    }

    const summary = Array.from(materialMap.entries())
      .map(([name, data]) => `${name} (Qty: ${data.quantity}, Cost: ${data.totalCost})`)
      .join('; ');

    return summary;
  }

  getStatusColor(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'active':
        return 'check_circle';
      case 'completed':
        return 'done_all';
      case 'pending':
        return 'schedule';
      default:
        return 'info';
    }
  }

  getTruncatedCustomerName(customer: CustomerdetailsIn, maxWords: number = 2): string {
    const name = customer?.CustomerName?.name || 'N/A';
    if (name === 'N/A') return name;
    
    const words = name.trim().split(/\s+/);
    if (words.length <= maxWords) {
      return name;
    }
    
    return words.slice(0, maxWords).join(' ') + '...';
  }

  trackByCustomerId(index: number, customer: CustomerdetailsIn): string {
    return customer._id || index.toString();
  }

  viewDetails(customer: CustomerdetailsIn): void {
    console.log('Customer:', customer);
    this.dialog.open(ReportDetailsDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { customer },
      autoFocus: false
    });
  }

  viewQuotation(customer: CustomerdetailsIn): void {
    console.log('Customer:', customer);
    this.dialog.open(ViewQuotationComponent, {
      width: '100%',
      height: '650px',
      data: customer,
      autoFocus: false,
      disableClose: false
    });
  }


  downloadQuotation(customer: any) {
    const customerName = customer?.CustomerName?.name || '';
    const drawingNo = customer?.drawingNo || '';
    const partName = customer?.partName || '';
    const ID = customer?.ID || 0;
  
    const now = new Date();
    const yearNo = now.getFullYear();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
    const revisionCount = customer?.revision?.length || 0;
  
    this.powerService.downloadQuotation({
      CustomerName: customerName,
      drawingNo: drawingNo,
      partName: partName,
      ID: ID,
      yearNo: yearNo,
      start: start,
      end: end,
      revision: revisionCount   // ✅ critical
    }).subscribe({
      next: blob => {
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = `${customerName}_quotation.xlsx`;
        link.click();
        this.toastr.success('Quotation downloaded successfully!', 'Success');
      },
      error: err => {
        console.error("Download Failed:", err);
        this.toastr.error('Failed to download quotation!', 'Error');
      }
    });
  }

  exportToCSV(): void {
    const headers = [
      'Customer Name', 
      'Drawing No', 
      'Part Name', 
      'Status', 
      'Process Count', 
      'Process Names', 
      'Process Details',
      'Materials Summary',
      'Total Alloy Cost',
      'Total Base Metal Cost',
      'Total Sand Cost',
      'Total Power Cost',
      'Total Process Cost',
      'Created At'
    ];
    
    const rows = this.filteredCustomers.map(customer => {
      const costs = this.getTotalProcessCosts(customer).split(',');
      return [
        customer.CustomerName?.name || 'N/A',
        customer.drawingNo || 'N/A',
        customer.partName || 'N/A',
        customer.Status || 'N/A',
        this.getProcessCount(customer).toString(),
        this.getProcessNames(customer),
        this.getProcessDetails(customer),
        this.getMaterialsSummary(customer),
        costs[0] || '0',
        costs[1] || '0',
        costs[2] || '0',
        costs[3] || '0',
        costs[4] || '0',
        customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customer_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastr.success('Report exported successfully!', 'Success');
  }

  viewQuotationsreport(customer: CustomerdetailsIn): void {
    this.dialog.open(ReportQuotationDialogComponent, {
      width: '80%',
      maxWidth: '1200px',
      maxHeight: '95vh',
      data: { customer },
      autoFocus: false,
      disableClose: false
    });
  }

  // Date filter methods
  getDateRange(filterType: string): { start: Date; end: Date } {
    let start: Date;
    let end: Date = new Date();
    end.setHours(23, 59, 59, 999);

    switch (filterType) {
      case 'week':
        if (this.selectedWeek) {
          // Parse week input (format: YYYY-Www)
          const [year, week] = this.selectedWeek.split('-W').map(Number);
          // Calculate the date for the first day of the week (Monday)
          const simple = new Date(year, 0, 1 + (week - 1) * 7);
          const dow = simple.getDay();
          const ISOweekStart = simple;
          if (dow <= 4) {
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
          } else {
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
          }
          start = new Date(ISOweekStart);
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
        } else {
          // Default to current week (Monday to Sunday)
          const now = new Date();
          start = new Date(now);
          const dayOfWeek = now.getDay();
          const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
          start.setDate(diff);
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
        }
        break;

      case 'month':
        if (this.selectedMonth) {
          // Parse month input (format: YYYY-MM)
          const [year, month] = this.selectedMonth.split('-').map(Number);
          start = new Date(year, month - 1, 1);
          start.setHours(0, 0, 0, 0);
          end = new Date(year, month, 0); // Last day of the month
          end.setHours(23, 59, 59, 999);
        } else {
          // Default to current month
          const now = new Date();
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          start.setHours(0, 0, 0, 0);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          end.setHours(23, 59, 59, 999);
        }
        break;

      case 'year':
        if (this.selectedYear) {
          const year = parseInt(this.selectedYear);
          start = new Date(year, 0, 1);
          start.setHours(0, 0, 0, 0);
          end = new Date(year, 11, 31);
          end.setHours(23, 59, 59, 999);
        } else {
          // Default to current year
          const now = new Date();
          start = new Date(now.getFullYear(), 0, 1);
          start.setHours(0, 0, 0, 0);
          end = new Date(now.getFullYear(), 11, 31);
          end.setHours(23, 59, 59, 999);
        }
        break;

      default:
        start = new Date(0);
        end = new Date();
    }

    return { start, end };
  }

  getDateFilterDisplay(): string {
    switch (this.dateFilterType) {
      case 'week':
        if (this.selectedWeek) {
          const dateRange = this.getDateRange('week');
          return `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`;
        }
        return 'Select a week';
      
      case 'month':
        if (this.selectedMonth) {
          const dateRange = this.getDateRange('month');
          return dateRange.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
        return 'Select a month';
      
      case 'year':
        if (this.selectedYear) {
          return `Year: ${this.selectedYear}`;
        }
        return 'Select a year';
      
      default:
        return '';
    }
  }

  onDateFilterTypeChange(): void {
    // Clear dates when switching filter types
    if (this.dateFilterType === 'custom') {
      this.selectedWeek = '';
      this.selectedMonth = '';
      this.selectedYear = '';
    } else {
      this.startDate = '';
      this.endDate = '';
      // Set default values if empty
      if (this.dateFilterType === 'week' && !this.selectedWeek) {
        // Set to current week (ISO week format)
        const now = new Date();
        const year = now.getFullYear();
        const oneJan = new Date(year, 0, 1);
        const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
        this.selectedWeek = `${year}-W${week.toString().padStart(2, '0')}`;
      } else if (this.dateFilterType === 'month' && !this.selectedMonth) {
        const now = new Date();
        this.selectedMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      } else if (this.dateFilterType === 'year' && !this.selectedYear) {
        this.selectedYear = new Date().getFullYear().toString();
      }
    }
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.pageIndex = 0;
    this.loadCustomerDetails();
  }

  clearFilter(): void {
    this.dateFilterType = 'custom';
    this.startDate = new Date().toISOString().split('T')[0];
    this.endDate = new Date().toISOString().split('T')[0];
    this.selectedWeek = '';
    this.selectedMonth = '';
    this.selectedYear = '';
    this.searchText = '';
    this.selectedStatus = 'all';
    this.selectedStatFilter = '';
    this.currentPage = 1;
    this.pageIndex = 0;
    this.loadCustomerDetails();
  }

  filterByStat(statType: string): void {
    // Toggle: if clicking the same stat, deselect it
    if (this.selectedStatFilter === statType) {
      this.selectedStatFilter = '';
    } else {
      this.selectedStatFilter = statType;
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.currentPage = event.pageIndex + 1; // API uses 1-based page numbers
    this.pageLimit = event.pageSize;
    this.loadCustomerDetails();
  }

  // View mode methods
  switchToTableView(): void {
    this.viewMode = 'table';
  }

  switchToGridView(): void {
    this.viewMode = 'grid';
  }
}
