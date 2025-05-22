import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getMaterials, getMaterialCount } from '../store/material.selector';
import { loadMaterials, deleteMaterial } from '../store/material.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Material } from '../../models/material.model';
import { AddMaterialComponent} from './add-material/add-material.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css']
})
export class MaterialComponent implements OnInit, AfterViewInit {
  materials$: Observable<Material[]>;
  materialCount$: Observable<number>;
  dataSource = new MatTableDataSource<Material>();
  displayedColumns: string[] = ['name', 'type', 'unitCost', 'actions', 'delete'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store, private dialog: MatDialog) {
    this.materials$ = this.store.select(getMaterials);
    this.materialCount$ = this.store.select(getMaterialCount);
  }

  ngOnInit(): void {
    console.log('Dispatching loadMaterials action');
    this.store.dispatch(loadMaterials());

    this.materials$.subscribe((materialsData: any) => {
      console.log('Materials received in component:', materialsData);
      if (Array.isArray(materialsData)) {
        this.dataSource.data = materialsData;
      } else if (materialsData && Array.isArray(materialsData.materials)) {
        this.dataSource.data = materialsData.materials;
      } else {
        this.dataSource.data = [];
        console.warn('Materials data is not an array:', materialsData);
      }

      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

 


  onDelete(material: Material): void {
    console.log('Delete clicked for:', material);
  }

 deleteMaterial(meterial: Material) {
      if (confirm(`Are you sure you want to delete ${meterial.name}?`)) {
        console.log(meterial.name);
        this.store.dispatch(deleteMaterial({ id: meterial._id }));
          this.store.dispatch(loadMaterials());
          
      }
    }

    openAddMeterialPopup(){
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

}
