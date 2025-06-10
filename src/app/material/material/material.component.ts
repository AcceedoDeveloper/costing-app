import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getMaterials, getMaterialCount } from '../store/material.selector';
import { loadMaterials, deleteMaterial } from '../store/material.actions';
import { Material } from '../../models/material.model';
import { MatDialog } from '@angular/material/dialog';
import { AddMaterialComponent } from './add-material/add-material.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css']
})
export class MaterialComponent implements OnInit, AfterViewInit {
  materials: Material[] = [];
  paginatedMaterials: Material[] = [];

  pageSize = 5;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    console.log('Dispatching loadMaterials action');
    this.store.dispatch(loadMaterials());

    this.store.select(getMaterials).subscribe((materials: Material[]) => {
      console.log('Materials from Store:', materials);
      this.materials = materials;
      this.updatePaginatedMaterials();
    });
  }

  ngAfterViewInit(): void {
    // Optional: hook if needed
  }

  updatePaginatedMaterials(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedMaterials = this.materials.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedMaterials();
  }

  openAddMeterialPopup(): void {
    this.dialog.open(AddMaterialComponent, {
      width: '500px',
    });
  }

  onEdit(material: Material): void {
    console.log('Edit clicked for:', material);
    this.dialog.open(AddMaterialComponent, {
      width: '500px',
      data: { material, isEditMode: true }
    });
  }

  deleteMaterial(material: Material): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Delete Confirmation',
        message: `Are you sure you want to delete ${material.name}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.store.dispatch(deleteMaterial({ id: material._id }));
        this.store.dispatch(loadMaterials());
      }
    });
  }
}
