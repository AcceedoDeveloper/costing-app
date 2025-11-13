import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MaterialType } from '../../models/material-type.model';
import * as MaterialTypeActions from '../store/material.actions';
import * as fromMaterialType from '../store/material.reducer';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import * as fromMaterialSelectors from '../store/material.selector'; 
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-materialtype',
  templateUrl: './materialtype.component.html',
  styleUrls: ['./materialtype.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class MaterialtypeComponent implements OnInit {
  materialTypes$!: Observable<MaterialType[]>;
  dataSource = new MatTableDataSource<MaterialType>([]);
  displayedColumns: string[] = ['name', 'actions']; // Updated to remove 'update' column

  isEditMode = false;
  editMaterialId: string | null = null;
  showAddInput = false;
  newMaterialType: string = '';
  isSaving = false; // Added for optional loading state
  isNavigating = false; // Loading state for navigation

  constructor(private store: Store, private dialog: MatDialog, private router: Router) {}

ngOnInit(): void {
  this.store.dispatch(MaterialTypeActions.loadMaterialTypes());
  this.materialTypes$ = this.store.select(fromMaterialSelectors.selectAllMaterialTypes);
  
  // Listen to navigation events to hide loading
  this.router.events.subscribe(event => {
    if (event instanceof NavigationStart) {
      this.isNavigating = false;
    }
  });
}

navigateToMaterial(event: Event) {
  event.preventDefault();
  this.isNavigating = true;
  
  // Navigate after a brief delay to show loading animation
  setTimeout(() => {
    this.router.navigate(['/material/list']).then(() => {
      // Keep loading visible briefly after navigation
      setTimeout(() => {
        this.isNavigating = false;
      }, 200);
    }).catch(() => {
      this.isNavigating = false;
    });
  }, 800); // 0.8 seconds delay
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
