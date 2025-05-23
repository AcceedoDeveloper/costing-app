import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MaterialType } from '../../models/material-type.model';
import * as MaterialTypeActions from '../store/material-type.actions';
import * as fromMaterialType from '../store/material-type.selectors';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-meterialtype',
  templateUrl: './meterialtype.component.html',
  styleUrls: ['./meterialtype.component.css']
})
export class MeterialtypeComponent implements OnInit {
  materialTypes$!: Observable<MaterialType[]>;
  dataSource = new MatTableDataSource<MaterialType>([]);
  displayedColumns: string[] = ['name', 'actions']; // Updated to remove 'update' column

  isEditMode = false;
  editMaterialId: string | null = null;
  showAddInput = false;
  newMaterialType: string = '';
  isSaving = false; // Added for optional loading state

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.store.dispatch(MaterialTypeActions.loadMaterialTypes());
    this.materialTypes$ = this.store.select(fromMaterialType.selectAllMaterialTypes);
    this.materialTypes$.subscribe(materials => {
      this.dataSource.data = materials;
    });
  }

  addMaterial() {
    if (!this.newMaterialType.trim()) {
      // Optional: Add feedback to the user (e.g., a toast or alert)
      return;
    }

    this.isSaving = true; // Optional: Show loading state
    const newMaterial = { name: this.newMaterialType.trim() };
    this.store.dispatch(MaterialTypeActions.addMaterialType({ material: newMaterial }));
    this.resetForm();
    this.isSaving = false; // Note: Ideally, reset this in an effect after success
  }

  updateMaterial() {
    if (!this.editMaterialId || !this.newMaterialType.trim()) {
      return;
    }

    this.isSaving = true; // Optional: Show loading state
    const updatedMaterial = { name: this.newMaterialType.trim() };
    this.store.dispatch(
      MaterialTypeActions.updateMaterialType({
        id: this.editMaterialId,
        material: updatedMaterial
      })
    );
    this.resetForm();
    this.isSaving = false; // Note: Ideally, reset this in an effect after success
  }

  startEdit(material: MaterialType) {
    this.showAddInput = true;
    this.isEditMode = true;
    this.editMaterialId = material._id;
    this.newMaterialType = material.name;
  }

 deleteMaterialType(id: string) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '300px',
    data: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this material type?'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      this.store.dispatch(MaterialTypeActions.deleteMaterialType({ id }));
    }
  });
}


  

  cancelAction() {
    this.resetForm(); 
  }

  private resetForm() {
    this.newMaterialType = '';
    this.showAddInput = false;
    this.isEditMode = false;
    this.editMaterialId = null;
  }
}