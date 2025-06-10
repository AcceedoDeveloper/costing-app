import { Component, Inject, OnInit } from '@angular/core';
import { Grade } from '../../../models/garde.model';
import * as GradeActions from '../../store/grade.actions';
import * as fromGrade from '../../store/grade.selectors';
import { Store } from '@ngrx/store';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { selectMaterialMap } from '../../store/grade.selectors';

@Component({
  selector: 'app-edit-grade',
  templateUrl: './edit-grade.component.html',
  styleUrls: ['./edit-grade.component.css']
})
export class EditGradeComponent implements OnInit {

  materialMap: { [key: string]: any[] } = {};
  fullGradeData!: Grade;
  showDropdown: { [key: string]: boolean } = {};
  availableMaterialTypes: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
    private store: Store,
    private dialogRef: MatDialogRef<EditGradeComponent>
  ) {}

  ngOnInit(): void {
    console.log('Dialog opened with ID:', this.data.id);
    this.store.dispatch(GradeActions.loadGrades());
    this.store.dispatch(GradeActions.loadMaterialMap());

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
      }
    });

    this.store.select(selectMaterialMap).subscribe(materialMap => {
      this.materialMap = materialMap;
      this.availableMaterialTypes = Object.keys(materialMap);
      this.availableMaterialTypes.forEach(type => {
        if (!(type in this.showDropdown)) {
          this.showDropdown[type] = false;
        }
      });
      console.log("Shared materialMap:", this.materialMap);
    });
  }

  toggleDropdown(type: string): void {
    this.showDropdown[type] = !this.showDropdown[type];
  }

  isMaterialTypeAdded(type: string): boolean {
    return this.fullGradeData.rawMaterial?.some(r => r.type === type) ?? false;
  }

  addMaterialType(type: string): void {
    if (!this.isMaterialTypeAdded(type)) {
      this.fullGradeData.rawMaterial.push({
        type,
        materialsUsed: []
      });
      this.showDropdown[type] = true; // auto-expand dropdown
    }
  }

  addMaterial(type: string, selectedMaterialId: string): void {
    const materials = this.materialMap[type];
    const selectedMaterial = materials.find(m => m._id === selectedMaterialId);
    if (!selectedMaterial) return;

    const rawSection = this.fullGradeData.rawMaterial.find(r => r.type === type);
    if (!rawSection) return;

    rawSection.materialsUsed.push({
      name: selectedMaterial.name,
      quantity: 0,
      objectId: selectedMaterial._id,
      selected: false
    });

    this.showDropdown[type] = false;
  }

  removeMaterial(type: string, materialToRemove: any): void {
    const targetRaw = this.fullGradeData.rawMaterial.find(r => r.type === type);
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

    this.store.dispatch(GradeActions.updateGrade({
      id: this.fullGradeData._id,
      grade: this.fullGradeData
    }));

    console.log('Updating grade with data:', this.fullGradeData);
    this.dialogRef.close(this.fullGradeData);
  }

  close(): void {
    this.dialogRef.close();
  }
}
