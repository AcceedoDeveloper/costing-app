import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {MaterialItem } from '../../../models/MaterialMap.model';


import * as GradeActions from '../../store/grade.actions';
import * as fromGrade from '../../store/grade.selectors';

@Component({
  selector: 'app-addgrade',
  templateUrl: './addgrade.component.html',
  styleUrls: ['./addgrade.component.css']
})
export class AddgradeComponent implements OnInit {

  constructor(private store : Store){}

 materialMap: { [key: string]: any[] } = {};
materialTypes: string[] = [];
filteredNames: any[] = [];

selectedType: string | null = null;
selectedName: string | null = null;

ngOnInit(): void {
  this.store.dispatch(GradeActions.loadMaterialMap());

  this.store.select(fromGrade.selectMaterialMap).subscribe(materialMap => {
    console.log('data', materialMap);
    this.materialMap = materialMap;
    this.materialTypes = Object.keys(materialMap);
  });
}

onTypeChange(type: string): void {
  this.filteredNames = this.materialMap[type] || [];
  this.selectedName = null; // Reset name selection
}

}
