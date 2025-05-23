import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { Process } from '../../models/process.model'; // Adjust the path as needed
import * as ProcessActions from '../store/material-type.actions'; // Adjust the import as needed
import { selectAllProcesses } from '../store/material-type.selectors';

@Component({
  selector: 'app-process-type',
  templateUrl: './process-type.component.html',
  styleUrls: ['./process-type.component.css']
})
export class ProcessTypeComponent implements OnInit {
  processes$!: Observable<Process[]>;
  dataSource = new MatTableDataSource<Process>([]);
  displayedColumns: string[] = ['name', 'actions'];

  isEditMode = false;
  editProcessId: string | null = null;
  newProcessName: string = '';
  isSaving = false;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(ProcessActions.loadProcesses());
    this.processes$ = this.store.select(selectAllProcesses);

    this.processes$.subscribe((processes) => {
      console.log('Process Data:', processes);
      this.dataSource.data = processes;
    });
  }

  addProcess() {
    if (!this.newProcessName.trim()) return;
    this.isSaving = true;
    const newProcess = { name: this.newProcessName.trim() };
    this.store.dispatch(ProcessActions.addProcess({ process: newProcess }));
    this.resetForm();
    this.isSaving = false;
  }

  updateProcess() {
    if (!this.editProcessId || !this.newProcessName.trim()) return;
    this.isSaving = true;
    const updatedProcess = { name: this.newProcessName.trim() };
    this.store.dispatch(ProcessActions.updateProcess({ id: this.editProcessId, process: updatedProcess }));
    this.resetForm();
    this.isSaving = false;
  }

  startEdit(process: Process) {
    this.isEditMode = true;
    this.editProcessId = process._id;
    this.newProcessName = process.name;
  }

  deleteProcess(id: string) {
    this.store.dispatch(ProcessActions.deleteProcess({ id }));
  }

  cancelAction() {
    this.resetForm();
  }

  private resetForm() {
    this.newProcessName = '';
    this.editProcessId = null;
    this.isEditMode = false;
  }
}