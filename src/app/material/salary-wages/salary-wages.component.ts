import { Component, OnInit } from '@angular/core';
import {PowerService} from '../../services/power.service';

@Component({
  selector: 'app-salary-wages',
  templateUrl: './salary-wages.component.html',
  styleUrls: ['./salary-wages.component.css']
})
export class SalaryWagesComponent implements OnInit {

  constructor(private powerservices: PowerService) { }

  ngOnInit(): void {
     this.powerservices.getSalaryMap().subscribe(data => {
      console.log(' Salary data from service:', data);
    });
  }

}
