import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  chart = {
    type: 'PieChart',
    data: [
      ['Work', 8],
      ['Eat', 2],
      ['TV', 2],
      ['Sleep', 8],
      ['Exercise', 4]
    ],
    columns: ['Task', 'Hours per Day'],
    options: {
      title: 'My Daily Activities',
      is3D: true
    },
    width: 600,
    height: 400
  };

}
