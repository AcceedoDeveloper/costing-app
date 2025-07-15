import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PowerCostData } from '../../models/PowerCostData.model';
import { loadPowerCosts } from '../store/material.actions';
import {getPowerCostHistory } from '../store/material.selector';

@Component({
  selector: 'app-process-power',
  templateUrl: './process-power.component.html',
  styleUrls: ['./process-power.component.css']
})
export class ProcessPowerComponent implements OnInit {
 powerCosts$: Observable<PowerCostData[]>;
  constructor(private store: Store, ) {
    this.powerCosts$ = this.store.select(getPowerCostHistory);
  }
ngOnInit(): void {
    // Dispatch the action to load power cost data
    this.store.dispatch(loadPowerCosts());

    // Subscribe to data and log it
    this.powerCosts$.subscribe((data) => {
      console.log('Power Cost History:', data); // ✅ Console log here
    });

    
  }

}
