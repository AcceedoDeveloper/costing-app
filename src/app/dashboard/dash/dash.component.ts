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
  pageSize = 3;
  
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
  
  // Chart data source dropdown
  chartDataSource: string = 'rawMaterial'; // 'rawMaterial', 'process', or 'grade'
  chartDataSourceOptions: string[] = ['rawMaterial', 'process', 'grade'];
  
  // Chart limit filter (high/low)
  chartDataLimit: string = 'high'; // 'high' or 'low'
  
  // Store API data
  rawMaterialData: any[] = [];
  processData: any[] = [];
  gradeData: any[] = [];
  
  gradeChartSegments: any[] = [];
  gradeChartLegend: any[] = [];
  gradeTotalValue: number = 0;
  
  costChartSegments: any[] = [];
  costChartLegend: any[] = [];
  costContributionData: any = null; // Store cost contribution API data
  costContributionSelectedMonth: string = ''; // Selected month for cost contribution filter
  
  quotationBars: any[] = [];
  yAxisLabels: number[] = [];
  quotationCountData: any = null; // Store quotation count API data
  quotationCountSelectedYear: number = new Date().getFullYear(); // Selected year for quotation count filter
  
  aiPrediction: string = 'Switching to SGI-LOW Cu could reduce cost by 6% next month.';
  
  materialForecast: any[] = [];
  currentMonth: string = 'Mar 2025';
  
  recentUpdates: any[] = [];
  recentUpdatesSelectedDate: Date = new Date(); // Date filter for recent updates

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
    // Initialize cost contribution month filter (MM-YYYY format)
    this.costContributionSelectedMonth = `${month}-${year}`;

    this.initializeQuotations();
   
    this.fetchActualEstimationCost();
    this.initializeDashboardCharts();
    this.initializeMaterialForecast();
    this.initializeRecentUpdates();
    this.getrecentupdates(this.recentUpdatesSelectedDate);
    this.getRawmaterialData();
    this.getGradeData();
    this.getProcessUsageData();
    this.getQuotationCount();
    this.getCostContribution();
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

  initializeGradeChart(rawMaterialData?: any[]): void {
    // Use API data if provided, otherwise use default sample data
    let gradeData: [string, number][];
    
    if (rawMaterialData && rawMaterialData.length > 0) {
      // Map API data: use count as value
      gradeData = rawMaterialData.map(item => [item.name, item.count]);
    } else {
      // Sample data as fallback
      gradeData = [
        ['SGI-NIL Cu', 6999],
        ['SGI-HIGH Cu', 4900],
        ['SGI-LOW Cu', 3150],
        ['GCI', 2449]
      ];
    }

    const total = gradeData.reduce((sum, item) => sum + item[1], 0);
    this.gradeTotalValue = total;

    const colors = ['#4A90E2', '#50C878', '#FFB347', '#FF6B6B', '#9B59B6'];
    const circumference = 2 * Math.PI * 80; // radius = 80
    let accumulatedLength = 0;

    this.gradeChartSegments = gradeData.map((item, index) => {
      const percentage = item[1] / total;
      const segmentLength = circumference * percentage;
      const dashOffset = -accumulatedLength; // Negative to move backwards
      
      accumulatedLength += segmentLength;

      return {
        color: colors[index % colors.length],
        dashArray: `${segmentLength} ${circumference}`,
        dashOffset: dashOffset,
        percentage: percentage
      };
    });

    this.gradeChartLegend = gradeData.map((item, index) => {
      // Use percentage from API if available, otherwise calculate
      let percent: number;
      if (rawMaterialData && rawMaterialData[index]) {
        // Parse percentage string like "28.57%" to number
        const percentStr = rawMaterialData[index].percentage || '';
        percent = parseFloat(percentStr.replace('%', '')) || Math.round((item[1] / total) * 100);
      } else {
        percent = Math.round((item[1] / total) * 100);
      }
      
      return {
        label: item[0],
        value: item[1],
        percent: percent,
        color: colors[index % colors.length]
      };
    });
  }

  initializeCostChart(apiData?: any): void {
    let costData: [string, number][];
    
    if (apiData && apiData.contributions) {
      // Map API contributions object to array format
      const contributions = apiData.contributions;
      costData = [
        ['Material', contributions.Material?.percentage || 0],
        ['Labor', contributions.Labor?.percentage || 0],
        ['Power', contributions.Power?.percentage || 0],
        ['Overheads', contributions.Overheads?.percentage || 0],
        ['Outsourcing', contributions.Outsourcing?.percentage || 0],
        ['Core Making', contributions.CoreMaking?.percentage || 0],
        ['Moulding', contributions.Moulding?.percentage || 0]
      ];
    } else {
      // Fallback to sample data
      costData = [
        ['Material', 42],
        ['Labor', 18],
        ['Power', 8],
        ['Overheads', 12],
        ['Outsourcing', 6],
        ['Core Making', 3],
        ['Moulding', 9]
      ];
    }

    // Calculate total percentage for normalization (in case percentages don't sum to 100)
    const totalPercentage = costData.reduce((sum, item) => sum + item[1], 0);
    const normalizedTotal = totalPercentage > 0 ? totalPercentage : 100;

    const colors = ['#4A90E2', '#50C878', '#FFB347', '#FF6B6B', '#9B59B6', '#E74C3C', '#3498DB'];
    const circumference = 2 * Math.PI * 80; // radius = 80
    let accumulatedLength = 0;

    this.costChartSegments = costData.map((item, index) => {
      // Normalize percentage to 0-1 range for chart display
      const percentage = (item[1] / normalizedTotal);
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
      percent: Math.round(item[1] * 100) / 100, // Round to 2 decimal places
      color: colors[index]
    }));
  }

  initializeQuotationChart(apiData?: any[]): void {
    let quotationData: [string, number][];
    
    if (apiData && apiData.length > 0) {
      // Map API data: convert month name to short form and use count
      const monthMap: { [key: string]: string } = {
        'January': 'Jan', 'February': 'Feb', 'March': 'Mar', 'April': 'Apr',
        'May': 'May', 'June': 'Jun', 'July': 'Jul', 'August': 'Aug',
        'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec'
      };
      
      quotationData = apiData.map(item => [
        monthMap[item.month] || item.month.substring(0, 3),
        item.count || 0
      ]);
    } else {
      // Fallback to sample data
      quotationData = [
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
    }

    // Find max value for dynamic Y-axis scaling
    const maxValue = Math.max(...quotationData.map(item => item[1]), 1);
    const maxAxisValue = Math.ceil(maxValue / 10) * 10; // Round up to nearest 10
    const step = maxAxisValue > 100 ? 20 : maxAxisValue > 50 ? 10 : 5;

    // Determine bar colors based on value ranges
    this.quotationBars = quotationData.map(item => {
      let color = '#e0e0e0'; // default gray for 0
      const value = item[1];
      if (value > 0 && value < maxAxisValue * 0.4) {
        color = '#4A90E2'; // blue for low values
      } else if (value >= maxAxisValue * 0.4 && value < maxAxisValue * 0.7) {
        color = '#50C878'; // green for medium values
      } else if (value >= maxAxisValue * 0.7) {
        color = '#10b981'; // darker green for high values
      }

      // Calculate percentage for display (relative to max value)
      const percentage = maxAxisValue > 0 ? (value / maxAxisValue) * 100 : 0;

      return {
        month: item[0],
        percentage: percentage,
        count: value,
        color: color
      };
    });

    // Generate Y-axis labels dynamically based on max value
    this.yAxisLabels = [];
    for (let i = 0; i <= maxAxisValue; i += step) {
      this.yAxisLabels.push(i);
    }
    this.yAxisLabels.reverse(); // Reverse so max is at top
  }

  onGradeChange(): void {
    // Update chart based on selected grade
    // This can be extended to fetch different data based on grade selection
    this.updateChartBasedOnDataSource();
  }

  // Handle chart data source change (Raw Material / Process / Grade)
  onChartDataSourceChange(): void {
    // Clear existing data and fetch new data with current limit
    this.fetchChartData();
  }

  // Get label for chart data source
  getChartDataSourceLabel(): string {
    switch (this.chartDataSource) {
      case 'rawMaterial':
        return 'Raw Material';
      case 'process':
        return 'Process';
      case 'grade':
        return 'Grade';
      default:
        return 'Grade';
    }
  }

  // Handle chart limit change (High / Low)
  onChartDataLimitChange(limit: string): void {
    this.chartDataLimit = limit;
    // Clear existing data and fetch new data with new limit
    this.fetchChartData();
  }

  // Fetch chart data based on selected source and limit
  fetchChartData(): void {
    if (this.chartDataSource === 'rawMaterial') {
      this.getRawmaterialData();
    } else if (this.chartDataSource === 'process') {
      this.getProcessUsageData();
    } else if (this.chartDataSource === 'grade') {
      this.getGradeData();
    }
  }

  // Update chart based on selected data source
  updateChartBasedOnDataSource(): void {
    if (this.chartDataSource === 'rawMaterial' && this.rawMaterialData.length > 0) {
      this.initializeGradeChart(this.rawMaterialData);
    } else if (this.chartDataSource === 'process' && this.processData.length > 0) {
      this.initializeGradeChart(this.processData);
    } else if (this.chartDataSource === 'grade' && this.gradeData.length > 0) {
      this.initializeGradeChart(this.gradeData);
    } else {
      // Fallback to default data if selected data source is not available
      this.initializeGradeChart();
    }
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

  getrecentupdates(date: Date): void {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); 
    const formatDate = (d: Date): string => {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const yearNo = startDate.getFullYear();

    this.dashboardServices.getResentUpdatedData(yearNo, formattedStartDate, formattedEndDate).subscribe({
      next: (res) => {
        console.log('Recent updates:', res.data);
        const dateField = 'updatedAt';
  
        const filteredData = (res.data || []).filter(item => {
          if (!item[dateField]) return false;
          const itemDate = new Date(item[dateField]);
          return formatDate(itemDate) === formattedStartDate;
        });

        // Map API data to template format
        this.recentUpdates = filteredData.map(item => {
          const userName = item.user?.userName || 'Unknown';
          const initials = this.getInitials(userName);
          const color = this.getColorForUser(userName);
          const formattedTime = this.formatTime(item.updatedAt);
          
          return {
            initials: initials,
            name: userName,
            action: item.message || 'Updated',
            color: color,
            time: formattedTime
          };
        });
      },
      error: (err) => {
        console.error('API error:', err);
        this.recentUpdates = [];
      }
    });
  }

  // Helper method to get initials from user name
  getInitials(userName: string): string {
    if (!userName) return '??';
    const words = userName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  }

  // Helper method to generate consistent color for a user
  getColorForUser(userName: string): string {
    const colors = ['#4A90E2', '#50C878', '#FFB347', '#FF6B6B', '#9B59B6', '#E74C3C', '#3498DB', '#1ABC9C', '#F39C12'];
    if (!userName) return colors[0];
    
    // Generate a consistent color based on user name
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // Helper method to format time from updatedAt
  formatTime(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours}:${displayMinutes} ${ampm}`;
    } catch (e) {
      return '';
    }
  }

  // Handle date change for recent updates filter
  onRecentUpdatesDateChange(event: any): void {
    const selectedDate = event.target.value ? new Date(event.target.value) : new Date();
    this.recentUpdatesSelectedDate = selectedDate;
    this.getrecentupdates(selectedDate);
  }

  // Get formatted date for date input (YYYY-MM-DD)
  getRecentUpdatesDateValue(): string {
    const year = this.recentUpdatesSelectedDate.getFullYear();
    const month = String(this.recentUpdatesSelectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.recentUpdatesSelectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  navigateDate(direction: number): void {
    const newDate = new Date(this.recentUpdatesSelectedDate);
    newDate.setDate(newDate.getDate() + direction);
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); 
    
    if (newDate <= today) {
      this.recentUpdatesSelectedDate = newDate;
      this.getrecentupdates(newDate);
    }
  }

  isToday(): boolean {
    const today = new Date();
    const selected = this.recentUpdatesSelectedDate;
    return (
      selected.getFullYear() === today.getFullYear() &&
      selected.getMonth() === today.getMonth() &&
      selected.getDate() === today.getDate()
    );
  }


  getRawmaterialData(){
    this.dashboardServices.materialUsage(this.chartDataLimit).subscribe({
      next: (res) => {
        console.log('Raw material data:', res);
        if (res && res.rawMaterial) {
          // Handle both topFiveHighest and topFiveLowest based on limit
          const dataKey = this.chartDataLimit === 'high' ? 'topFiveHighest' : 'topFiveLowest';
          if (res.rawMaterial[dataKey]) {
            this.rawMaterialData = res.rawMaterial[dataKey];
            // Update chart if raw material is selected
            if (this.chartDataSource === 'rawMaterial') {
              this.initializeGradeChart(this.rawMaterialData);
            }
          } else {
            console.warn('Raw material data format not as expected');
            this.rawMaterialData = [];
          }
        } else {
          console.warn('Raw material data format not as expected');
          this.rawMaterialData = [];
        }
      },
      error: (err) => {
        console.error('API error:', err);
        this.rawMaterialData = [];
      }
    });
  }

  getGradeData(){
    this.dashboardServices.gradeUsage(this.chartDataLimit).subscribe({
      next: (res) => {
        console.log('Grade data:', res);
        if (res && res.grade) {
          // Handle both topFiveHighest and topFiveLowest based on limit
          const dataKey = this.chartDataLimit === 'high' ? 'topFiveHighest' : 'topFiveLowest';
          if (res.grade[dataKey]) {
            this.gradeData = res.grade[dataKey];
            // Update chart if grade is selected
            if (this.chartDataSource === 'grade') {
              this.initializeGradeChart(this.gradeData);
            }
          } else {
            console.warn('Grade data format not as expected');
            this.gradeData = [];
          }
        } else {
          console.warn('Grade data format not as expected');
          this.gradeData = [];
        }
      },
      error: (err) => {
        console.error('API error:', err);
        this.gradeData = [];
      }
    });
  }
  getProcessUsageData(){
    this.dashboardServices.getProcessUsage(this.chartDataLimit).subscribe({
      next: (res) => {
        console.log('Process usage data:', res);
        if (res && res.process) {
          // Handle both topFiveHighest and topFiveLowest based on limit
          const dataKey = this.chartDataLimit === 'high' ? 'topFiveHighest' : 'topFiveLowest';
          if (res.process[dataKey]) {
            this.processData = res.process[dataKey];
            // Update chart if process is selected
            if (this.chartDataSource === 'process') {
              this.initializeGradeChart(this.processData);
            }
          } else {
            console.warn('Process data format not as expected');
            this.processData = [];
          }
        } else {
          console.warn('Process data format not as expected');
          this.processData = [];
        }
      },
      error: (err) => {
        console.error('API error:', err);
        this.processData = [];
      }
    });
  }

  getQuotationCount(year?: number){
    const selectedYear = year || this.quotationCountSelectedYear || new Date().getFullYear();

    this.dashboardServices.getQuotationCount(selectedYear).subscribe({
      next: (res) => {
        console.log('Quotation count:', res);
        if (res && res.result && Array.isArray(res.result)) {
          this.quotationCountData = res;
          // Update chart with API data
          this.initializeQuotationChart(res.result);
        } else {
          console.warn('Quotation count data format not as expected');
          // Fallback to default data
          this.initializeQuotationChart();
        }
      },
      error: (err) => {
        console.error('API error:', err);
        // Fallback to default data on error
        this.initializeQuotationChart();
      }
    });
  }

  // Handle quotation count year change
  onQuotationCountYearChange(event: any): void {
    const selectedYear = parseInt(event.target.value, 10);
    if (selectedYear && !isNaN(selectedYear)) {
      this.quotationCountSelectedYear = selectedYear;
      this.getQuotationCount(selectedYear);
    }
  }


  getCostContribution(month?: string){
    const selectedMonth = month || this.costContributionSelectedMonth || 
      `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;

    this.dashboardServices.getCostContribution(selectedMonth).subscribe({
      next: (res) => {
        console.log('Cost contribution:', res);
        if (res && res.contributions) {
          this.costContributionData = res;
          // Update chart with API data
          this.initializeCostChart(res);
        } else {
          console.warn('Cost contribution data format not as expected');
          // Fallback to default data
          this.initializeCostChart();
        }
      },
      error: (err) => {
        console.error('API error:', err);
        // Fallback to default data on error
        this.initializeCostChart();
      }
    });
  }

  // Handle cost contribution month change
  onCostContributionMonthChange(event: any): void {
    const selectedMonthString = event.target.value; // Format: YYYY-MM
    if (selectedMonthString) {
      const [year, month] = selectedMonthString.split('-');
      this.costContributionSelectedMonth = `${month}-${year}`;
      this.getCostContribution(this.costContributionSelectedMonth);
    }
  }

  // Get formatted month for cost contribution input (YYYY-MM)
  getCostContributionMonthValue(): string {
    if (!this.costContributionSelectedMonth) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }
    
    // Convert MM-YYYY to YYYY-MM
    const [month, year] = this.costContributionSelectedMonth.split('-');
    return `${year}-${month}`;
  }

  // Navigate cost contribution month (previous/next)
  navigateCostContributionMonth(direction: number): void {
    if (!this.costContributionSelectedMonth) {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      this.costContributionSelectedMonth = `${month}-${year}`;
    }

    const [month, year] = this.costContributionSelectedMonth.split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    currentDate.setMonth(currentDate.getMonth() + direction);
    
    const newMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const newYear = currentDate.getFullYear();
    this.costContributionSelectedMonth = `${newMonth}-${newYear}`;
    
    this.getCostContribution(this.costContributionSelectedMonth);
  }

  // Check if cost contribution selected month is current month
  isCostContributionCurrentMonth(): boolean {
    if (!this.costContributionSelectedMonth) {
      return true;
    }
    
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentYear = today.getFullYear();
    const [selectedMonth, selectedYear] = this.costContributionSelectedMonth.split('-');
    
    return parseInt(selectedMonth) === parseInt(currentMonth) && 
           parseInt(selectedYear) === currentYear;
  }
}
