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
  selectedMaterialType: string = '';
  materialTypes: string[] = []; 
  searchTerm: string = '';
  sortedPriceHistory: { unitCost: number; date: string }[] = [];
  expandedHistoryIndex: number | null = null;
  materials: Material[] = [];
  paginatedMaterials: Material[] = [];

  pageSize = 25;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    console.log('Dispatching loadMaterials action');
    this.store.dispatch(loadMaterials());

    this.store.select(getMaterials).subscribe((materials: Material[]) => {
    this.materials = materials;
    this.materialTypes = [...new Set(materials.map(m => m.materialType))];
    this.applyFilter();
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
  this.applyFilter();
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

  applyFilter(): void {
  const filtered = this.selectedMaterialType
    ? this.materials.filter(m => m.materialType === this.selectedMaterialType)
    : this.materials;

  const startIndex = this.pageIndex * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.paginatedMaterials = filtered.slice(startIndex, endIndex);
}

applyFilterMaterial(): void {
  let filtered = this.selectedMaterialType
    ? this.materials.filter(m => m.materialType === this.selectedMaterialType)
    : [...this.materials];

  if (this.searchTerm) {
    filtered = filtered.filter(m =>
      m.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  const startIndex = this.pageIndex * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.paginatedMaterials = filtered.slice(startIndex, endIndex);
}


toggleHistoryPopup(index: number): void {
  if (this.expandedHistoryIndex === index) {
    this.expandedHistoryIndex = null;
  } else {
    const selectedMaterial = this.paginatedMaterials[index];

    // Clone the price history array before sorting
    const sortedHistory = [...(selectedMaterial.priceHistory ?? [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Store the sorted history in a local variable (optional)
    this.sortedPriceHistory = sortedHistory;

    this.expandedHistoryIndex = index;
  }
}




}
