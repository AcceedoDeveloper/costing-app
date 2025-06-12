import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddprocessComponent } from './addprocess/addprocess.component';
import { Store } from '@ngrx/store';
import { loadProcesses } from '../store/material.actions';
import { getAllProcesses } from '../store/material.selector';
import { Process } from '../../models/process.model';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent implements OnInit {
  processes: Process[] = [];
  expandedIndex: number | null = null;

  constructor(private dialog: MatDialog, private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(loadProcesses());

    this.store.select(getAllProcesses).subscribe((data: Process[]) => {
      console.log(data);
      this.processes = data;
    });
   
  }

  toggleExpand(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  openAddMaterial() {
    this.dialog.open(AddprocessComponent, {
      width: '600px'
    });
  }
}
