import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service'; 
import {loadCustomerDetails } from '../../material/store/material.actions';
import { getCustomerDetails} from '../../material/store/material.selector';
import { CustomerdetailsIn } from '../../models/Customer-details.model';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    chart : any;
    barChart:any;
    materilachart:any;
    customersList: any[] = [];
    recentUpdates: any[] = [];
    ActualEstimationCost: any[] = [];
    customerDetails : CustomerdetailsIn[] = [];
    pendingQuotations: CustomerdetailsIn[] = [];
  completedQuotations: CustomerdetailsIn[] = [];
  selectedCustomerDetails$: Observable<any>;
  chartType = 'ColumnChart';
  chartData: any[] = [];


  paginatedData: any[] = [];
currentPage: number = 1;
itemsPerPage: number = 5;
totalPages: number = 1;
startDate!: Date;
endDate!: Date;
estimationStartDate!: Date;
estimationEndDate!: Date;
actualEstimationCost: any[] = [];
filteredEstimationCost: any[] = [];



  constructor(private dashboardServices: DashboardService, private store : Store) { }

 chartColumns = ['Material', 'May', 'June', 'July']; 

chartOptions = {
  title: '3-Month Price Comparison by Material',
  legend: { position: 'top' },
  vAxis: { title: 'Price (₹)' },
  hAxis: { title: 'Material' },
  bar: { groupWidth: '75%' },
};




ngOnInit(): void {


    



  

   const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    this.estimationStartDate = sixMonthsAgo;
  this.estimationEndDate = today;

  this.startDate = sixMonthsAgo;
  this.endDate = today;
  this.fetchActualEstimationCost();

  this.fetchMaterialGraphData();

  
  this.fetchRecentUpdatedData();
   this.store.dispatch(loadCustomerDetails());

  this.selectedCustomerDetails$ = this.store.select(getCustomerDetails); 

  this.selectedCustomerDetails$.subscribe(data => {
     this.customerDetails = data;
    console.log('Simplified Data:', data);

    this.pendingQuotations = this.customerDetails.filter(item => item.Status?.toLowerCase() === 'pending');
      this.completedQuotations = this.customerDetails.filter(item => item.Status?.toLowerCase() === 'completed');
  });


let fullCostHistory: any[] = [];

this.dashboardServices.getdata().subscribe((res) => {
  console.log('power data', res);
  const powerCostMap = res.powerCostMap?.[0];
  const previousCosts = powerCostMap?.previousCostDetails || [];

  if (powerCostMap?.costPerUnit && powerCostMap?.effectiveDate) {
    const exists = previousCosts.some(
      (entry: any) => entry.date === powerCostMap.effectiveDate
    );
    if (!exists) {
      previousCosts.push({
        cost: powerCostMap.costPerUnit,
        date: powerCostMap.effectiveDate
      });
    }
  }

  const formattedData = previousCosts.map((entry: any) => {
    let formattedDate = entry.date;
    if (formattedDate.includes('T')) {
      const d = new Date(formattedDate);
      formattedDate = `${String(d.getDate()).padStart(2, '0')}-${String(
        d.getMonth() + 1
      ).padStart(2, '0')}-${d.getFullYear()}`;
    }

    const [day, month, year] = formattedDate.split('-');
    return {
      cost: entry.cost,
      date: new Date(+year, +month - 1, +day)
    };
  });

  formattedData.sort((a, b) => a.date.getTime() - b.date.getTime());
  const chartData = formattedData.map(m => [m.date, m.cost]);

  this.chart = {
    type: 'LineChart',
    data: chartData,
    columnNames: ['Date', 'Power Cost (₹)'],
    options: {
      title: 'Power Cost Over Time',
      hAxis: {
        title: 'Date',
        format: 'MMM dd', // Example: Jul 24
        gridlines: { count: 6 }, // Show fewer X-axis gridlines/labels
        slantedText: true,
        slantedTextAngle: 45,
        showTextEvery: 2, // Show every 2nd label only
      },
      vAxis: {
        title: 'Cost (₹)',
        minValue: 0
      },
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        axis: 'horizontal',
        keepInBounds: true,
        maxZoomIn: 4.0
      },
      legend: 'none',
      colors: ['#4CAF50'],
      pointSize: 6,
      lineWidth: 2
    },
    width: '100%',
    height: '400'
  };
});












 

}


fetchRecentUpdatedData(): void {
  const today = new Date();

  
  const endDateObj = new Date(today);
  endDateObj.setDate(endDateObj.getDate() + 1);
  const endDate = endDateObj.toISOString().split('T')[0]; 


  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  const startDate = sixMonthsAgo.toISOString().split('T')[0]; 

  const yearNo = today.getFullYear();

  console.log('Start Date:', startDate);
  console.log('End Date (+1 day):', endDate);

  this.dashboardServices.getResentUpdatedData(yearNo, startDate, endDate).subscribe({
    next: (res) => {
      this.recentUpdates = res.data;
      console.log('Recent Updates:', this.recentUpdates);
    },
    error: (err) => {
      console.error('Error fetching data:', err);
    }
  });
}

onSearch(event: any): void {
  const searchTerm = event.target.value.toLowerCase();
  this.filteredEstimationCost = this.ActualEstimationCost.filter(item =>
    item.CustomerName?.name.toLowerCase().includes(searchTerm)
  );
}

setPagination(): void {
  this.totalPages = Math.ceil(this.filteredEstimationCost.length / this.itemsPerPage);
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.paginatedData = this.filteredEstimationCost.slice(startIndex, endIndex);
}

nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.setPagination();
  }
}

prevPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.setPagination();
  }
}







fetchMaterialGraphData() {
  const start = this.formatDate(this.startDate);
  const end = this.formatDate(this.endDate);

  this.dashboardServices.materialGraphData(start, end).subscribe((res) => {
  const groupedMaterials: {
    name: string;
    priceHistory: { date: string; unitCost: number }[];
  }[] = [];

  const materialMap: { [key: string]: { name: string; priceHistory: { date: string; unitCost: number }[] } } = {};

  Object.keys(res.data).forEach(category => {
    const materials = res.data[category];

    materials.forEach((material: any) => {
      const name = material.name;

      if (!materialMap[name]) {
        materialMap[name] = {
          name: name,
          priceHistory: []
        };
      }

      material.priceHistory.forEach((entry: any) => {
        materialMap[name].priceHistory.push({
          date: entry.date,
          unitCost: entry.unitCost
        });
      });
    });
  });

  // Convert map to array
  const resultArray = Object.values(materialMap);

  // Sort by latest price in descending order
  const sorted = resultArray.sort((a, b) => {
    const latestA = a.priceHistory[a.priceHistory.length - 1]?.unitCost || 0;
    const latestB = b.priceHistory[b.priceHistory.length - 1]?.unitCost || 0;
    return latestB - latestA;
  });

  // Take top 3
  const top3 = sorted.slice(0, 3);

  console.log('Top 3 Materials by Latest Unit Cost:', top3);

  // Step 1: Get last 3 months
const today = new Date();
const months = [...Array(3)].map((_, i) => {
  const d = new Date(today.getFullYear(), today.getMonth() - (2 - i), 1);
  return {
    label: d.toLocaleString('default', { month: 'short' }), // e.g., Jul
    key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`     // e.g., 2025-07
  };
});

// Step 2: Set chart columns (e.g., ['Material', 'May', 'June', 'July'])
this.chartColumns = ['Material', ...months.map(m => m.label)];

this.chartData = top3.map(material => {
  const row: (string | number)[] = [material.name]; // 👈 Fix the type here

  months.forEach(month => {
    const found = material.priceHistory.find(entry => {
      const entryMonth = entry.date.substring(0, 7);
      return entryMonth === month.key;
    });

    row.push(found ? found.unitCost : 0);
  });

  return row;
});


console.log('Chart Columns:', this.chartColumns);
console.log('Chart Data:', this.chartData);

});
}

// Helper
formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}
onDateChange() {
  if (this.startDate && this.endDate) {
    this.fetchMaterialGraphData();
  }
}
fetchActualEstimationCost() {
  const start = this.formatDate(this.estimationStartDate);
  const end = this.formatDate(this.estimationEndDate);

  this.dashboardServices.ActualEstimationCost(start, end).subscribe((res) => {
    this.actualEstimationCost = res.data;
    this.filteredEstimationCost = res.data;
    this.setPagination();
    console.log('Actual Estimation Cost Data:', this.actualEstimationCost);
  });
}


onEstimationDateChange() {
  if (this.estimationStartDate && this.estimationEndDate) {
    this.fetchActualEstimationCost();
  }
}

 
}
