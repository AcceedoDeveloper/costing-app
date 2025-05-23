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
  constructor(private store: Store) {}

  materialMap: { [key: string]: any[] } = {};
  materialTypes: string[] = [];

  dropdowns: { selectedType: string | null; selectedName: string | null; filteredNames: any[] }[] = [
    { selectedType: null, selectedName: null, filteredNames: [] }
  ];

  ngOnInit(): void {
    this.store.dispatch(GradeActions.loadMaterialMap());

    this.store.select(fromGrade.selectMaterialMap).subscribe(materialMap => {
      this.materialMap = materialMap;
      this.materialTypes = Object.keys(materialMap);
    });
  }

  onTypeChange(index: number, selectedType: string): void {
    const filtered = this.materialMap[selectedType] || [];
    this.dropdowns[index].filteredNames = filtered;
    this.dropdowns[index].selectedName = null;
  }

  addDropdown(): void {
    this.dropdowns.push({ selectedType: null, selectedName: null, filteredNames: [] });
  }
}

