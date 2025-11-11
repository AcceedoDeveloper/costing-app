import { Component, OnInit, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Grade } from '../../../models/garde.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as GradeActions from '../../store/grade.actions';
import * as fromGrade from '../../store/grade.selectors';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-addgrade',
  templateUrl: './addgrade.component.html',
  styleUrls: ['./addgrade.component.css']
})
export class AddgradeComponent implements OnInit {
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
    nameSearchInput: string;
    filteredOptions: any[];
  }[] = [
    { selectedType: null, selectedName: null, quantity: null, filteredNames: [], nameSearchInput: '', filteredOptions: [] }
  ];

  private gradeData: Grade | null = null;

  constructor(
    private store: Store,
    public dialogRef: MatDialogRef<AddgradeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { grade: Grade; isEditMode: boolean }
  ) {
    if (data && data.grade && data.grade.name && data.grade.rawMaterial && data.grade.gradeNo) {
      this.isEditMode = data.isEditMode;
      this.gradeName = data.grade.name;
      this.gradeNo = data.grade.gradeNo;
      this.gradeData = data.grade;
    }
  }

  ngOnInit(): void {
    this.store.dispatch(GradeActions.loadMaterialMap());

    this.store.select(fromGrade.selectMaterialMap).subscribe(materialMap => {
      this.materialMap = materialMap;
      this.materialTypes = Object.keys(materialMap);

     
      if (this.isEditMode && this.gradeData && this.gradeData.rawMaterial) {
        this.dropdowns = [];
        this.gradeData.rawMaterial.forEach(material => {
          material.materialsUsed.forEach(item => {
            const filteredNames = this.materialMap[material.type] || [];
            this.dropdowns.push({
              selectedType: material.type,
              selectedName: item.name,
              quantity: item.quantity,
              filteredNames: filteredNames,
              nameSearchInput: item.name,
              filteredOptions: filteredNames
            });
          });
        });
      }
    });
  }

  onTypeChange(index: number, selectedType: string): void {
    const filtered = this.materialMap[selectedType] || [];
    this.dropdowns[index].filteredNames = filtered;
    this.dropdowns[index].filteredOptions = filtered;
    this.dropdowns[index].selectedName = null;
    this.dropdowns[index].quantity = null;
    this.dropdowns[index].nameSearchInput = '';
  }

  filterNames(index: number, value: string): void {
    if (!value || value.trim() === '') {
      this.dropdowns[index].filteredOptions = this.dropdowns[index].filteredNames;
    } else {
      const filterValue = value.toLowerCase();
      this.dropdowns[index].filteredOptions = this.dropdowns[index].filteredNames.filter(name =>
        name.name.toLowerCase().includes(filterValue)
      );
    }
  }

  onNameSelected(index: number, selectedName: string): void {
    this.dropdowns[index].selectedName = selectedName;
    this.dropdowns[index].nameSearchInput = selectedName;
  }

  displayNameFn(name: string): string {
    return name || '';
  }

  addDropdown(): void {
    // Get the last row (previous row) data
    const lastIndex = this.dropdowns.length - 1;
    const previousRow = this.dropdowns[lastIndex];
    
    // Copy only the Type from previous row
    const filteredNames = previousRow.selectedType 
      ? (this.materialMap[previousRow.selectedType] || [])
      : [];
    
    this.dropdowns.push({
      selectedType: previousRow.selectedType,
      selectedName: null,
      quantity: null,
      filteredNames: filteredNames,
      nameSearchInput: '',
      filteredOptions: filteredNames
    });
  }

  submitGrade(): void {
    if (!this.gradeName || !this.gradeNo) {
      // alert('Please enter both Grade Name and Grade Number.');
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

    
    if (this.isEditMode) {
      this.store.dispatch(GradeActions.updateGrade({ id: this.gradeData._id, grade: payload }));
      this.store.dispatch(GradeActions.loadGrades());
    } else {
      this.store.dispatch(GradeActions.addGrade({ grade: payload }));
      this.store.dispatch(GradeActions.loadGrades());
    }
    this.store.dispatch(GradeActions.loadGrades());
    this.dialogRef.close();
  }

cancel(): void {
  this.dialogRef.close();
}

  
}