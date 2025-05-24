import { Component, OnInit, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {MaterialItem } from '../../../models/MaterialMap.model';
import { Grade } from '../../../models/garde.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


import * as GradeActions from '../../store/grade.actions';
import * as fromGrade from '../../store/grade.selectors';


@Component({
  selector: 'app-addgrade',
  templateUrl: './addgrade.component.html',
  styleUrls: ['./addgrade.component.css']
})


export class AddgradeComponent implements OnInit {
  constructor(private store: Store, @Inject(MAT_DIALOG_DATA) public editData: Grade) {
    if (editData && editData.name && editData.rawMaterial) {
  this.isEditMode = true;
  this.gradeName = editData.name;
  this.gradeNo = editData.gradeNo;
  this.dropdowns = [];

  editData.rawMaterial.forEach(material => {
    material.materialsUsed.forEach(item => {
      this.dropdowns.push({
        selectedType: material.type,
        selectedName: item.name,
        quantity: item.quantity,
        filteredNames: this.materialMap[material.type] || []
      });
    });
  });
}

  }

  materialMap: { [key: string]: any[] } = {};
  materialTypes: string[] = [];
  gradeName: string = '';
  gradeNo: string = '';
  isEditMode: boolean = false;

  dropdowns: {
    selectedType: string | null;
    selectedName: string | null;
    quantity: number | null;
    filteredNames: any[];
  }[] = [
    { selectedType: null, selectedName: null, quantity: null, filteredNames: [] }
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
    this.dropdowns[index].quantity = null;
  }

  addDropdown(): void {
    this.dropdowns.push({ selectedType: null, selectedName: null, quantity: null, filteredNames: [] });
  }

 submitGrade(): void {
  if (!this.gradeName || !this.gradeNo) {
    alert('Please enter both Grade Name and Grade Number.');
    return;
  }

  const groupedMaterials: { [type: string]: { name: string; quantity: number }[] } = {};

  this.dropdowns.forEach(entry => {
    if (entry.selectedType && entry.selectedName && entry.quantity != null) {
      if (!groupedMaterials[entry.selectedType]) {
        groupedMaterials[entry.selectedType] = [];
      }
      groupedMaterials[entry.selectedType].push({
        name: entry.selectedName,
        quantity: entry.quantity
      });
    }
  });

  const rawMaterial = Object.keys(groupedMaterials).map(type => ({
    type,
    materialsUsed: groupedMaterials[type]
  }));

  const payload = {
    name: this.gradeName,
    gradeNo: this.gradeNo,
    rawMaterial
  };

  console.log('Posting Grade:', payload);
  this.store.dispatch(GradeActions.addGrade({ grade: payload }));
   this.store.dispatch(GradeActions.loadGrades());
  
}

}


