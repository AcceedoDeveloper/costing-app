import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddprocessComponent } from './addprocess/addprocess.component';
import { Store } from '@ngrx/store';
import { loadProcesses } from '../store/material.actions';
import { getAllProcesses } from '../store/material.selector';
import { Process } from '../../models/process.model';
import { deleteProcess } from '../store/material.actions';
import { ProcesseditComponent } from './processedit/processedit.component';
import { ConfirmDialogComponent} from '../../shared/confirm-dialog/confirm-dialog.component';

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

 deleteProcess(id: string) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '300px',
    data: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this process?'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      this.store.dispatch(deleteProcess({ id }));
    }
  });
}


editAllMaterials(id: string): void {
  const process = this.processes.find(p => p._id === id);

  if (process) {
    const clonedProcess = JSON.parse(JSON.stringify(process));

    console.log('Full process object:', clonedProcess);

    this.dialog.open(ProcesseditComponent, {
      width: '700px',
      data: clonedProcess  
    });
  } else {
    console.error('Process not found for ID:', id);
  }
}




}
