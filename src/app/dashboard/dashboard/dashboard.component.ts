import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service'; 
import { } from '../../material/store/material.actions';
import { } from '../../material/store/material.selector';

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
    this.customersList = res.customersMap;

    const powerCostMap = res.powerCostMap?.[0];
    const previousCosts = powerCostMap?.previousCostDetails || [];

    
    if (powerCostMap?.costPerUnit && powerCostMap?.effectiveDate) {
      previousCosts.push({
        cost: powerCostMap.costPerUnit,
        date: powerCostMap.effectiveDate
      });
    }

    previousCosts.sort((a: any, b: any) => {
      const dateA = a.date.includes('-') ? new Date(a.date.split('-').reverse().join('-')) : new Date(a.date);
      const dateB = b.date.includes('-') ? new Date(b.date.split('-').reverse().join('-')) : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });


  const chartData = previousCosts.map((entry: any) => {
  let date: Date;

  if (entry.date.includes('-') && entry.date.split('-')[0].length === 2) {
    const [day, month, year] = entry.date.split('-');
    date = new Date(+year, +month - 1, +day);
  } else {
    date = new Date(entry.date);
  }

  return [date, entry.cost]; 
});



this.chart = {
  type: 'AreaChart',
  data: chartData,
  columnNames: ['Date', 'Power Cost (₹)'],
  options: {
    title: 'Power Cost Over Time',
    hAxis: {
      title: 'Date',
      format: 'd-MMM',
      slantedText: true,
      slantedTextAngle: 45
    },
    vAxis: {
      title: 'Cost (₹)',
      minValue: 0,
      viewWindow: { min: 0 },
      baseline: 0
    },
    legend: 'none',
    colors: ['#4CAF50'], // green for cost
    areaOpacity: 0.3, // slightly transparent area fill
    pointSize: 6,
    lineWidth: 2
  },
  width: '500',
  height: '400'
};



  });
}














 
}
