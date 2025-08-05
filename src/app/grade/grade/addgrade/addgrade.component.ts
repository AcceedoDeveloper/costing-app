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
  }[] = [
    { selectedType: null, selectedName: null, quantity: null, filteredNames: [] }
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
            this.dropdowns.push({
              selectedType: material.type,
              selectedName: item.name,
              quantity: item.quantity,
              filteredNames: this.materialMap[material.type] || []
            });
          });
        });
      }
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