import { Component, Inject, OnInit } from '@angular/core';
import { Grade } from '../../../models/garde.model';
import * as GradeActions from '../../store/grade.actions';
import * as fromGrade from '../../store/grade.selectors';
import { Store } from '@ngrx/store';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { selectMaterialMap } from '../../store/grade.selectors';
import { gradeReducer } from '../../store/grade.reducer';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-edit-grade',
  templateUrl: './edit-grade.component.html',
  styleUrls: ['./edit-grade.component.css']
})
export class EditGradeComponent implements OnInit {
  
  materialMap: { [key: string]: any[] } = {};
  fullGradeData!: Grade;
  showDropdown: { [key: string]: boolean } = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
    private store: Store,
    private dialogRef: MatDialogRef<EditGradeComponent>
  ) {}

  ngOnInit(): void {
    console.log('Dialog opened with ID:', this.data.id);

    this.store.dispatch(GradeActions.loadGrades());

    this.store.select(fromGrade.selectAllGrades).subscribe(grades => {
      const found = grades.find(g => g._id === this.data.id);
      if (found) {
        this.fullGradeData = JSON.parse(JSON.stringify(found));
        if (!this.fullGradeData.rawMaterial) {
          this.fullGradeData.rawMaterial = [];
        }
        this.fullGradeData.rawMaterial.forEach(raw => {
          this.showDropdown[raw.type] = false;
        });
        console.log('Full Grade Data:', this.fullGradeData);
      } else {
        console.warn('Grade not found with ID:', this.data.id);
      }
    });

    this.store.dispatch(GradeActions.loadMaterialMap());

    this.store.select(selectMaterialMap).subscribe(materialMap => {
      this.materialMap = materialMap;
      Object.keys(this.materialMap).forEach(type => {
        if (!this.showDropdown[type]) {
          this.showDropdown[type] = false;
        }
      });
      console.log("Shared materialMap:", this.materialMap);
    });
  }

  toggleDropdown(type: string): void {
    this.showDropdown[type] = !this.showDropdown[type];
  }

  addMaterial(type: string, selectedMaterialId: string): void {
    const materials = this.materialMap[type];
    if (!materials || materials.length === 0) {
      console.warn(`No materials available for type ${type}`);
      return;
    }

    const selectedMaterial = materials.find(m => m._id === selectedMaterialId);
    if (!selectedMaterial) {
      console.warn(`Material with ID ${selectedMaterialId} not found in type ${type}`);
      return;
    }

    let rawSection = this.fullGradeData.rawMaterial?.find(r => r.type === type);
    if (!rawSection) {
      rawSection = {
        type,
        materialsUsed: []
      };
      this.fullGradeData.rawMaterial?.push(rawSection);
    }

    rawSection.materialsUsed.push({
      name: selectedMaterial.name,
      quantity: 0,
      objectId: selectedMaterial._id || '',
      selected: false // Add selected field
    });

    console.log(`Added new ${type} material`, this.fullGradeData);
    this.showDropdown[type] = false;
  }

  removeMaterial(type: string, materialToRemove: any) {
  const targetRaw = this.fullGradeData.rawMaterial?.find(r => r.type === type);
  if (targetRaw) {
    targetRaw.materialsUsed = targetRaw.materialsUsed.filter(m => m !== materialToRemove);
  }
}


updateGrade(): void {
  if (this.fullGradeData?.rawMaterial) {
    this.fullGradeData.rawMaterial.forEach(raw => {
      raw.materialsUsed = raw.materialsUsed.filter(mat => !mat.selected);
    });
  }

  this.store.dispatch(GradeActions.updateGrade({ id: this.fullGradeData._id, grade: this.fullGradeData }));

  console.log('Updating grade with data:', this.fullGradeData);

  // 👇 Close the dialog and send result back
  this.dialogRef.close(this.fullGradeData);
}
close(){
  this.dialogRef.close();
}

}
