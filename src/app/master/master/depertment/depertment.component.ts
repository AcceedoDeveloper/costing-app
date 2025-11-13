import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { loadDepartments, addDepartment, updateDepartment, deleteDepartment  } from '../store/master.action';
import { selectDepartments } from '../store/master.selector';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-depertment',
  templateUrl: './depertment.component.html',
  styleUrls: ['./depertment.component.css']
})
export class DepertmentComponent implements OnInit {
  departments$: Observable<any>;
  departments: any[] = [];

  newDepartmentName: string = '';
  isEditMode: boolean = false;
  currentEditId: string | null = null;

  displayedColumns: string[] = ['name', 'actions'];

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.store.dispatch(loadDepartments());
    this.departments$ = this.store.select(selectDepartments);
    this.departments$.subscribe((departments) => {
      this.departments = departments;
      console.log('Departments:', this.departments);
    });
  }

  addDepartment() {
    const newDepartment = {
      name: this.newDepartmentName.trim()
    };
    console.log('Adding new department:', newDepartment);
    this.store.dispatch(addDepartment({ department: newDepartment }));
    this.cancelAction();
  }

  startEdit(department: any) {
    this.isEditMode = true;
    this.newDepartmentName = department.name;
    this.currentEditId = department._id;
  }

  updateDepartment() {
    if (this.currentEditId) {
      const updatedDepartment = {
        _id: this.currentEditId,
        name: this.newDepartmentName.trim()
      };
      this.store.dispatch(updateDepartment({ id: this.currentEditId, data: updatedDepartment }));
    }
    this.cancelAction();
  }

  deleteDepartment(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      height:'auto',
      disableClose: true,
      data: {
        title: 'Delete Confirmation',
        message: 'Are you sure you want to delete this department?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.store.dispatch(deleteDepartment({ id }));
        this.cancelAction();
      }
    });
  }

  cancelAction() {
    this.isEditMode = false;
    this.newDepartmentName = '';
    this.currentEditId = null;
  }
}
