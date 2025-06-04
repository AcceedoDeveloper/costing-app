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
    data: { grade, isEditMode: true } // pass the grade data and edit mode flag to the popup
  });
}



}

