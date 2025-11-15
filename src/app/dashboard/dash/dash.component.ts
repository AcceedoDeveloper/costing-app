import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DashboardService } from '../../services/dashboard.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DifferenceGraphDialogComponent } from './difference-graph-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.css']
})
export class DashComponent implements OnInit, AfterViewInit {


  constructor(
    private dashboardServices: DashboardService,
    private dialog: MatDialog,
    private router: Router
  ) { }
  actualEstimationCost: any[] = [];
  filteredEstimationCost: any[] = [];
  estimationStartDate!: Date | null;
  estimationEndDate!: Date | null;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>();

  // Quotations Table
  displayedColumns: string[] = ['customer', 'email', 'partName', 'status', 'sentAt', 'actualCost', 'difference'];
  quotationsDataSource = new MatTableDataSource<any>([]);
  allQuotations: any[] = []; // Store all quotations for filtering
  selectedDate: Date = new Date(); // Will be set to current date in ngOnInit
  selectedMonth: string = ''; // Will store YYYY-MM format
  pageSize = 4;
  
  // Status Filter
  selectedStatus: string = 'All';
  statusOptions: string[] = ['All', 'Pending', 'Approved', 'Rejected'];

  // Total Quotations Summary
  totalQuotations = 0;
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;
  pendingPercent = 0;
  approvedPercent = 0;
  rejectedPercent = 0;

  // Overall Cost Data
  totalProfit = 0;
  totalLosses = 0;
  profitPercent = 0;
  lossesPercent = 0;
  totalCostDifference = 0;

  // Dashboard Charts Data
  selectedGrade: string = 'Grade';
  gradeOptions: string[] = ['Grade', 'SGI-NIL Cu', 'SGI-HIGH Cu', 'SGI-LOW Cu', 'GCI'];
  
  gradeChartSegments: any[] = [];
  gradeChartLegend: any[] = [];
  gradeTotalValue: number = 0;
  
  costChartSegments: any[] = [];
  costChartLegend: any[] = [];
  
  quotationBars: any[] = [];
  yAxisLabels: number[] = [];
  
  aiPrediction: string = 'Switching to SGI-LOW Cu could reduce cost by 6% next month.';
  
  materialForecast: any[] = [];
  currentMonth: string = 'Mar 2025';
  
  recentUpdates: any[] = [];

  ngOnInit(): void {
    // Initialize date range for current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.estimationStartDate = firstDayOfMonth;
    this.estimationEndDate = today;
    this.selectedDate = today; // Set date picker to current date
    // Initialize month selector to current month (YYYY-MM format)
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    this.selectedMonth = `${year}-${month}`;

    this.initializeQuotations();
   
    this.fetchActualEstimationCost();
    this.initializeDashboardCharts();
    this.initializeMaterialForecast();
    this.initializeRecentUpdates();
  }

  initializeQuotations(): void {
    // Data will be loaded from API in fetchActualEstimationCost
    // Keep empty initially, will be populated after API call
    this.quotationsDataSource.data = [];
  }



  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') return 'status-approved';
    if (statusLower === 'rejected') return 'status-rejected';
    return 'status-pending';
  }

  getMonthInputValue(): string {
    // Return YYYY-MM format for HTML month input
    return this.selectedMonth;
  }

  onMonthInputChange(event: any): void {
    const selectedMonthString = event.target.value; // Format: YYYY-MM
    if (selectedMonthString) {
      this.selectedMonth = selectedMonthString;
      this.onMonthChange();
    }
  }

  onMonthChange(): void {
    // When month picker changes, update the date range to the selected month
    if (this.selectedMonth) {
      const [year, month] = this.selectedMonth.split('-').map(Number);
      const firstDayOfMonth = new Date(year, month - 1, 1);
      const lastDayOfMonth = new Date(year, month, 0);
      
      // If selected month is the current month, use today as end date
      const today = new Date();
      const isCurrentMonth = month - 1 === today.getMonth() && year === today.getFullYear();
      
      this.estimationStartDate = firstDayOfMonth;
      this.estimationEndDate = isCurrentMonth ? today : lastDayOfMonth;
      this.selectedDate = firstDayOfMonth; // Keep selectedDate in sync for compatibility
      
      // Fetch data for the selected month
      this.fetchActualEstimationCost();
    }
  }

  navigateToPreviousMonth(): void {
    if (this.selectedMonth) {
      const [year, month] = this.selectedMonth.split('-').map(Number);
      let newYear = year;
      let newMonth = month - 1;
      
      if (newMonth < 1) {
        newMonth = 12;
        newYear = year - 1;
      }
      
      this.selectedMonth = `${newYear}-${String(newMonth).padStart(2, '0')}`;
      this.onMonthChange();
    }
  }

  navigateToNextMonth(): void {
    if (this.selectedMonth) {
      const [year, month] = this.selectedMonth.split('-').map(Number);
      let newYear = year;
      let newMonth = month + 1;
      
      if (newMonth > 12) {
        newMonth = 1;
        newYear = year + 1;
      }
      
      // Don't allow navigation to future months
      const today = new Date();
      const maxYear = today.getFullYear();
      const maxMonth = today.getMonth() + 1;
      
      if (newYear > maxYear || (newYear === maxYear && newMonth > maxMonth)) {
        return; // Don't navigate to future months
      }
      
      this.selectedMonth = `${newYear}-${String(newMonth).padStart(2, '0')}`;
      this.onMonthChange();
    }
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.quotationsDataSource.paginator = this.paginator;
    }
  }

  formatDate(date: Date | null): string {
    if (!date) {
      return '';
    }
    return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  }


  fetchActualEstimationCost() {
    if (!this.estimationStartDate || !this.estimationEndDate) {
      console.warn('Date range not initialized');
      return;
    }

    const start = this.formatDate(this.estimationStartDate);
    const endDateWithOneDay = new Date(this.estimationEndDate);
    endDateWithOneDay.setDate(endDateWithOneDay.getDate() + 1);
    const end = this.formatDate(endDateWithOneDay);
  
    this.dashboardServices.ActualEstimationCost(start, end).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.actualEstimationCost = res.data;
          this.filteredEstimationCost = res.data;
    
          // Map API data to quotations table format
          const mappedQuotations = this.mapApiDataToQuotations(res.data);
          this.allQuotations = mappedQuotations; // Store all quotations
          
          // Apply status filter
          this.applyStatusFilter();
          
          // Update summary counts (use all quotations, not filtered)
          this.updateSummaryCounts(mappedQuotations);
    
          // Also set dataSource for compatibility
          this.dataSource = new MatTableDataSource(this.filteredEstimationCost);
    
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
            this.quotationsDataSource.paginator = this.paginator;
          }
    
          console.log('Actual Estimation Cost Data:', this.actualEstimationCost);
        } else {
          console.warn('No data received from API');
          this.allQuotations = [];
          this.quotationsDataSource.data = [];
          this.updateSummaryCounts([]);
        }
      },
      error: (error) => {
        console.error('Error fetching actual estimation cost:', error);
        // Set empty data to prevent white screen
        this.allQuotations = [];
        this.quotationsDataSource.data = [];
        this.actualEstimationCost = [];
        this.filteredEstimationCost = [];
        // Reset all counts
        this.updateSummaryCounts([]);
      }
    });
  }

  mapApiDataToQuotations(apiData: any[]): any[] {
    return apiData.map(item => {
      const customerName = item.CustomerName?.name || 'N/A';
      const email = item.CustomerName?.phoneNo || item.CustomerName?.email || 'N/A';
      const sentAt = item.updatedAt ? this.formatDisplayDate(item.updatedAt) : 'N/A';
      const actualCost = parseFloat(item.actualCost) || 0;
      const difference = parseFloat(item.difference) || 0;
      
      // Set all status as Pending for now - can be updated in future
      const status = 'Pending';

      return {
        customer: customerName,
        email: email,
        partName: item.partName || 'N/A',
        status: status,
        sentAt: sentAt,
        actualCost: actualCost,
        difference: difference, // Keep original difference (can be positive or negative)
        differenceAbs: Math.abs(difference), // Absolute value for display
        // Keep original data for reference
        originalData: item
      };
    });
  }

  formatDisplayDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return 'N/A';
    }
  }

  updateSummaryCounts(quotations: any[]): void {
    this.totalQuotations = quotations.length;
    this.pendingCount = quotations.filter(q => q.status === 'Pending').length;
    this.approvedCount = quotations.filter(q => q.status === 'Approved').length;
    this.rejectedCount = quotations.filter(q => q.status === 'Rejected').length;
    
    if (this.totalQuotations > 0) {
      this.pendingPercent = Math.round((this.pendingCount / this.totalQuotations) * 100);
      this.approvedPercent = Math.round((this.approvedCount / this.totalQuotations) * 100);
      this.rejectedPercent = Math.round((this.rejectedCount / this.totalQuotations) * 100);
    } else {
      // Reset to 0 when there are no quotations
      this.pendingPercent = 0;
      this.approvedPercent = 0;
      this.rejectedPercent = 0;
    }

    // Calculate cost data
    this.calculateCostData(quotations);
  }

  calculateCostData(quotations: any[]): void {
    // Calculate profit (positive differences) and losses (negative differences)
    const profits = quotations
      .filter(q => q.difference > 0)
      .reduce((sum, q) => sum + Math.abs(q.difference), 0);
    
    const losses = quotations
      .filter(q => q.difference < 0)
      .reduce((sum, q) => sum + Math.abs(q.difference), 0);
    
    this.totalProfit = profits;
    this.totalLosses = losses;
    this.totalCostDifference = profits - losses;
    
    const totalDifference = profits + losses;
    
    if (totalDifference > 0) {
      this.profitPercent = Math.round((profits / totalDifference) * 100);
      this.lossesPercent = Math.round((losses / totalDifference) * 100);
    } else {
      this.profitPercent = 0;
      this.lossesPercent = 0;
    }
  }

  formatNumberInK(value: number): string {
    if (value >= 1000) {
      const kValue = value / 1000;
      return `${kValue.toFixed(1)} `;
    }
    return value.toString();
  }

  getNetDifferencePercent(): number {
    const total = this.totalProfit + this.totalLosses;
    if (total > 0) {
      return Math.round((Math.abs(this.totalCostDifference) / total) * 100);
    }
    return 0;
  }

  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }

  applyStatusFilter(): void {
    let filtered = this.allQuotations;
    
    if (this.selectedStatus !== 'All') {
      filtered = this.allQuotations.filter(q => 
        q.status.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    }
    
    this.quotationsDataSource.data = filtered;
    
    // Reset paginator to first page when filter changes
    if (this.paginator) {
      this.paginator.firstPage();
      this.quotationsDataSource.paginator = this.paginator;
    }
  }

  onStatusChange(): void {
    this.applyStatusFilter();
  }

  openDifferenceGraph(row: any): void {
    try {
      // Get the original data from the row
      const itemData = row.originalData || row;
      
      console.log('Opening graph for item:', itemData);
      
      const dialogRef = this.dialog.open(DifferenceGraphDialogComponent, {
        width: '800px',
        maxWidth: '95vw',
        data: {
          item: itemData,
          allData: this.actualEstimationCost
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('Difference graph dialog closed');
      });
    } catch (error) {
      console.error('Error opening difference graph:', error);
    }
  }

  // Dashboard Charts Methods
  initializeDashboardCharts(): void {
    this.initializeGradeChart();
    this.initializeCostChart();
    this.initializeQuotationChart();
  }

  initializeGradeChart(): void {
    // Sample data based on image description
    const gradeData: [string, number][] = [
      ['SGI-NIL Cu', 6999],
      ['SGI-HIGH Cu', 4900],
      ['SGI-LOW Cu', 3150],
      ['GCI', 2449]
    ];

    const total = gradeData.reduce((sum, item) => sum + item[1], 0);
    this.gradeTotalValue = total;

    const colors = ['#4A90E2', '#50C878', '#FFB347', '#FF6B6B'];
    const circumference = 2 * Math.PI * 80; // radius = 80
    let accumulatedLength = 0;

    this.gradeChartSegments = gradeData.map((item, index) => {
      const percentage = item[1] / total;
      const segmentLength = circumference * percentage;
      const dashOffset = -accumulatedLength; // Negative to move backwards
      
      accumulatedLength += segmentLength;

      return {
        color: colors[index],
        dashArray: `${segmentLength} ${circumference}`,
        dashOffset: dashOffset,
        percentage: percentage
      };
    });

    this.gradeChartLegend = gradeData.map((item, index) => ({
      label: item[0],
      value: item[1],
      percent: Math.round((item[1] / total) * 100),
      color: colors[index]
    }));
  }

  initializeCostChart(): void {
    const costData: [string, number][] = [
      ['Material', 42],
      ['Labor', 18],
      ['Power', 8],
      ['Overheads', 12],
      ['Outsourcing', 6],
      ['Core Making', 3],
      ['Moulding', 9]
    ];

    const colors = ['#4A90E2', '#50C878', '#FFB347', '#FF6B6B', '#9B59B6', '#E74C3C', '#3498DB'];
    const circumference = 2 * Math.PI * 80; // radius = 80
    let accumulatedLength = 0;

    this.costChartSegments = costData.map((item, index) => {
      const percentage = item[1] / 100; // percentages already sum to 100
      const segmentLength = circumference * percentage;
      const dashOffset = -accumulatedLength; // Negative to move backwards
      
      accumulatedLength += segmentLength;

      return {
        color: colors[index],
        dashArray: `${segmentLength} ${circumference}`,
        dashOffset: dashOffset,
        percentage: percentage
      };
    });

    this.costChartLegend = costData.map((item, index) => ({
      label: item[0],
      percent: item[1],
      color: colors[index]
    }));
  }

  initializeQuotationChart(): void {
    const quotationData: [string, number][] = [
      ['Jan', 0],
      ['Feb', 65],
      ['Mar', 57],
      ['Apr', 52],
      ['May', 48],
      ['Jun', 0],
      ['Jul', 0],
      ['Aug', 0],
      ['Sep', 87],
      ['Oct', 0],
      ['Nov', 0],
      ['Dec', 0]
    ];

    // Determine bar colors based on value ranges
    this.quotationBars = quotationData.map(item => {
      let color = '#e0e0e0'; // default gray for 0
      if (item[1] > 0 && item[1] < 50) {
        color = '#4A90E2'; // blue for low values
      } else if (item[1] >= 50 && item[1] < 80) {
        color = '#50C878'; // green for medium values
      } else if (item[1] >= 80) {
        color = '#10b981'; // darker green for high values
      }

      return {
        month: item[0],
        percentage: item[1],
        color: color
      };
    });

    // Generate Y-axis labels (0 to 90 in steps of 10)
    this.yAxisLabels = [];
    for (let i = 0; i <= 90; i += 10) {
      this.yAxisLabels.push(i);
    }
    this.yAxisLabels.reverse(); // Reverse so 90 is at top
  }

  onGradeChange(): void {
    // Update chart based on selected grade
    // This can be extended to fetch different data based on grade selection
    this.initializeGradeChart();
  }

  initializeMaterialForecast(): void {
    this.materialForecast = [
      {
        name: 'SGI-NIL Cu',
        currentPrice: 118,
        junePrice: 121,
        juneChange: 2.5,
        septPrice: 124,
        septChange: 2.4,
        decPrice: 127,
        decChange: 2.4
      },
      {
        name: 'SGI-HIGH Cu',
        currentPrice: 132,
        junePrice: 138,
        juneChange: 4.5,
        septPrice: 142,
        septChange: 2.9,
        decPrice: 147,
        decChange: 3.2
      },
      {
        name: 'SGI-LOW Cu',
        currentPrice: 105,
        junePrice: 107,
        juneChange: 1.9,
        septPrice: 109,
        septChange: 1.8,
        decPrice: 111,
        decChange: 1.8
      },
      {
        name: 'GCI',
        currentPrice: 72,
        junePrice: 73,
        juneChange: 1.4,
        septPrice: 74,
        septChange: 1.3,
        decPrice: 76,
        decChange: 2.7
      },
      {
        name: 'Aluminum',
        currentPrice: 248,
        junePrice: 253,
        juneChange: 2.0,
        septPrice: 258,
        septChange: 2.1,
        decPrice: 946,
        decChange: 4.6
      }
    ];
  }

  initializeRecentUpdates(): void {
    this.recentUpdates = [
      {
        initials: 'EK',
        name: 'Karthik',
        action: 'Updated in Material.',
        color: '#4A90E2'
      },
      {
        initials: 'JH',
        name: 'Prabha',
        action: 'Updated in Grade.',
        color: '#9B59B6'
      },
      {
        initials: 'AF',
        name: 'Prabha',
        action: 'Updated in Grade.',
        color: '#4A90E2'
      }
    ];
  }

  navigateToSection(section: string): void {
    // Navigate to different sections based on button click
    console.log('Navigating to:', section);
    // You can implement routing logic here
    // this.router.navigate([`/${section}`]);
  }
}
