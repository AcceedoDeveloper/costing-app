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

@Component({
  selector: 'app-grade',
  templateUrl: './grade.component.html',
  styleUrls: ['./grade.component.css']
})



export class GradeComponent implements OnInit {
  grades$!: Observable<Grade[]>;
  dataSource!: MatTableDataSource<Grade>;
  displayedColumns: string[] = ['gradeNo', 'name', 'price', 'totalQuantity', 'materialsUsed', 'actions', 'delete'];

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
    
  }

  openAddMeterialPopup() {
    this.dialog.open(AddgradeComponent, {
      width: '500px',
    });
  }

  deleteGrade(gradeNo: string) {
  if (confirm('Are you sure you want to delete this grade?')) {
    this.store.dispatch(GradeActions.deleteGrade({ gradeNo }));
  }
}



}

