import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { loadSuppliers } from '../store/material.actions';
import { getSuppliers } from '../store/material.selector';
import { Supplier } from '../../models/Supplier.model'; 
import {deleteSupplier} from '../store/material.actions';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css']
})
export class SupplierComponent implements OnInit {
  suppliers$: Observable<Supplier[]> = new Observable<Supplier[]>();
  suppliers: Supplier[] = [];
  paginatedSuppliers: Supplier[] = [];

  selectedMaterialType: string = '';
searchTerm: string = '';
materialTypes: string[] = [];


  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = 25;
  pageIndex = 0;

  constructor(private dialog: MatDialog, private store: Store) {}

  ngOnInit(): void {
  this.store.dispatch(loadSuppliers());

  this.suppliers$ = this.store.pipe(select(getSuppliers));
  
  this.suppliers$.subscribe(suppliers => {
    console.log('Suppliers from store:', suppliers); 

    this.suppliers = suppliers;
    this.materialTypes = [...new Set(suppliers.map(s => s.materialType))];

  this.applyFilter();
    this.updatePaginatedSuppliers();
  });
}


  updatePaginatedSuppliers() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedSuppliers = this.suppliers.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
     this.applyFilter();
  }

  addSupplier() {
    this.dialog.open(AddSupplierComponent, {
      width: '500px',
    });
  }

startEdit(supplier: Supplier) {
  const dialogRef = this.dialog.open(AddSupplierComponent, {
    width: '500px',
    data: supplier // Pass the supplier data to the form
  });

  dialogRef.afterClosed().subscribe(updatedData => {
    if (updatedData) {
      console.log('Supplier updated:', updatedData);
    }
  });
}

deleteSupplier(id: string) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '300px',
    data: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this supplier?'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      this.store.dispatch(deleteSupplier({ id }));
    }
  });
}

applyFilter() {
  let filtered = this.suppliers;

  if (this.selectedMaterialType) {
    filtered = filtered.filter(s => s.materialType === this.selectedMaterialType);
  }

  if (this.searchTerm) {
    filtered = filtered.filter(s =>
      s.materialName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  const startIndex = this.pageIndex * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.paginatedSuppliers = filtered.slice(startIndex, endIndex);
}

}
