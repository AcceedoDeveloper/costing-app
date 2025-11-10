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
  console.log('Original Data:', data);

  // Flatten grade array
  this.processes = data.map(p => ({
    ...p,
    grade: Array.isArray(p.grade) && Array.isArray(p.grade[0]) ? p.grade[0] : p.grade
  }));

  console.log('Processed Data:', this.processes);
});

   
  }

  toggleExpand(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  openAddMaterial() {
    this.dialog.open(AddprocessComponent, {
      width: '60%',
      disableClose: true,
       panelClass: 'custom-dialog-container'
    });
  }

 deleteProcess(id: string) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '300px',
    height:'auto',
    disableClose: true,
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
      width: '70%',
      maxWidth: '900px',
      maxHeight: '90vh',
      disableClose: true,
     
      data: clonedProcess  
    });
  } else {
    console.error('Process not found for ID:', id);
  }
}




}
