
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AddgradeComponent } from './addgrade/addgrade.component';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Grade } from '../../models/garde.model';
import * as GradeActions from '../store/grade.actions';
import * as fromGrade from '../store/grade.selectors';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';



@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.css']
})



export class GradeComponent implements OnInit {
  gradesList: Grade[] = [];
allMaterials: { name: string, unitCost: number }[] = [];
gradeColumns: { gradeNo: string, gradeName: string }[] = [];
materialQuantityMap: { [materialName: string]: { [gradeNo: string]: number } } = {};

  materialMap: { [key: string]: any[] } = {};
   materialTypes: string[] = [];
   private gradeData: Grade | null = null;
  isEditMode: boolean = false;
  grades$!: Observable<Grade[]>;
  dataSource!: MatTableDataSource<Grade>;
displayedColumns: string[] = ['gradeNo', 'name',  'rawMaterial', 'actions', 'delete'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog, private store: Store) {
    this.dataSource = new MatTableDataSource<Grade>();
  }

  ngOnInit(): void {
   
    this.store.dispatch(GradeActions.loadGrades());
    this.grades$ = this.store.select(fromGrade.selectAllGrades);
    this.grades$.subscribe(grades => {
      console.log('Grades from store:', grades);
      this.dataSource.data = grades;
      this.dataSource.paginator = this.paginator;
    });



    this.store.dispatch(GradeActions.loadMaterialMap());

  this.store.select(fromGrade.selectMaterialMap).subscribe(materialMap => {
    this.materialMap = materialMap;

    console.log('Material Map:', materialMap); 

    this.materialTypes = Object.keys(materialMap);

   
  });

  this.grades$ = this.store.select(fromGrade.selectAllGrades);
this.grades$.subscribe(grades => {
  this.gradesList = grades;
  this.gradeColumns = grades.map(g => ({
    gradeNo: g.gradeNo,
    gradeName: g.name,
  }));

  // Collect materials and quantities
  const materialSet = new Map<string, { name: string; unitCost: number }>();
  this.materialQuantityMap = {};

  grades.forEach(grade => {
    grade.rawMaterial?.forEach(material => {
      material.materialsUsed.forEach(item => {
materialSet.set(item.name, { name: item.name, unitCost: 0 }); // Mock value

        if (!this.materialQuantityMap[item.name]) {
          this.materialQuantityMap[item.name] = {};
        }

        this.materialQuantityMap[item.name][grade.gradeNo] = item.quantity;
      });
    });
  });

  this.allMaterials = Array.from(materialSet.values());
});

    
  }

  openAddMeterialPopup() {
    this.dialog.open(AddgradeComponent, {
      width: '480px',
    });
  }

  deleteGrade(gradeNo: string): void {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '300px',
    data: {
      title: 'Delete Confirmation',
      message: 'Are you sure you want to delete this grade?'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      this.store.dispatch(GradeActions.deleteGrade({ gradeNo }));
      this.store.dispatch(GradeActions.loadGrades()); 
    }
  });
}


openeditMeterialPopup(grade: Grade):void {
  console.log('Opening edit popup for grade:', grade);
  this.dialog.open(AddgradeComponent, {
    width: '480px',
    data: { grade, isEditMode: true } 
  });
}

getQuantity(materialName: string, gradeNo: string): number | string {
  return this.materialQuantityMap?.[materialName]?.[gradeNo] ?? '-';
}


}
