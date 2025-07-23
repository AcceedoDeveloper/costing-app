import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service'; 

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
  constructor(private dashboardServices: DashboardService) { }

  ngOnInit(): void {

    this.dashboardServices.getdata().subscribe((res) => {
    console.log(res);
    this.customersList = res.customersMap;
  });

    


   this.chart = {
  type: 'LineChart',  // ✅ change from 'ColumnChart' to 'LineChart'
  columns: ['Month', 'Power Cost (₹)'],
  data: [
    ['January', 12000],
    ['February', 15000],
    ['March', 13000],
    ['April', 14000],
    ['May', 12500],
    ['June', 16000]
  ],
  options: {
    title: 'Monthly Power Cost',
    hAxis: {
      title: 'Month'
    },
    vAxis: {
      title: 'Cost (₹)',
      minValue: 0
    },
    legend: 'none',
    curveType: 'function', 
    colors: ['#007bff']   
  },
   width: '500',  // <-- Set this in HTML instead
  height: '400'
};



this.barChart = {
  type: 'LineChart',
  data: [
    ['2019', 450000],
    ['2020', 480000],
    ['2021', 500000],
    ['2022', 550000],
    ['2023', 600000],
  ],
  columnNames: ['Year', 'Salary (₹)'],
  options: {
    title: 'Yearly Salary Growth',
    legend: { position: 'bottom' },
    hAxis: {
      title: 'Year'
    },
    vAxis: {
      title: 'Salary (₹)',
      format: 'short' // or use 'currency'
    },
    colors: ['#2a9df4']
    // ✅ No curveType option for sharp edges
  },
  width: '500',  // <-- Set this in HTML instead
  height: '400'
};





this.materilachart = {
  type: 'ColumnChart', // grouped bars
  data: [
    ['April', 1200, 900, 600],
    ['May', 1250, 950, 640],
    ['June', 1300, 970, 660]
  ],
  columnNames: ['Month', 'PIG IRON', 'RETURNS', 'CATALYST RATE'],
  options: {
    title: 'Material Prices Over 3 Months',
    chartArea: {
      width: '50%', // Leave space for axis titles
      height: '60%' // Optional height optimization
    },
    hAxis: {
      title: 'Month',
    },
    vAxis: {
      title: 'Price (₹)',
      minValue: 0
    },
    colors: [
      {
        // PIG IRON: gradient blue
        fill: 'gradient',
        color: '#1E88E5'
      },
      {
        // RETURNS: gradient green
        fill: 'gradient',
        color: '#43A047'
      },
      {
        // CATALYST RATE: gradient orange
        fill: 'gradient',
        color: '#FB8C00'
      }
    ],
    isStacked: false, // grouped, not stacked
  },
   width: '500',  // <-- Set this in HTML instead
  height: '400' 
};







  }



 
}
