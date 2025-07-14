import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Process } from '../../models/process.model';
import { loadProcesses } from '../store/material.actions';
import { getAllProcesses } from '../store/material.selector';

@Component({
  selector: 'app-process-power',
  templateUrl: './process-power.component.html',
  styleUrls: ['./process-power.component.css']
})
export class ProcessPowerComponent implements OnInit {
  processes: Process[] = [];
  constructor( private store: Store) { }

  ngOnInit(): void {
     this.store.dispatch(loadProcesses());

    this.store.select(getAllProcesses).subscribe((data: Process[]) => {
      console.log('Original Data:', data);
    });

  }

}
