import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-compare-revisions',
  templateUrl: './compare-revisions.component.html',
  styleUrls: ['./compare-revisions.component.css']
})
export class CompareRevisionsComponent implements OnInit {
  customer: any;
  allRevisions: any[] = [];
  selectedRevisions: number[] = []; // Array of revision indices to compare
  comparisonData: any[] = []; // Processed data for comparison
  uniqueProcesses: any[] = []; // Cached unique processes

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CompareRevisionsComponent>
  ) {
    if (data) {
      console.log("data", data);
      this.customer = data.customer || data;
      this.initializeRevisions();
    }
  }

  ngOnInit(): void {
    // If revisions are pre-selected (from customer data), use those
    // Otherwise auto-select last 2 revisions if available
    if (this.data?.preSelectedRevisions && Array.isArray(this.data.preSelectedRevisions) && this.data.preSelectedRevisions.length > 0) {
      // Map pre-selected revisions to indices
      const preSelected = this.data.preSelectedRevisions;
      this.selectedRevisions = preSelected.map((rev: any, idx: number) => {
        const index = this.allRevisions.findIndex(r => r === rev);
        return index >= 0 ? index : idx;
      }).filter((idx: number) => idx >= 0 && idx < this.allRevisions.length);
    } else if (this.allRevisions.length >= 2) {
      this.selectedRevisions = [this.allRevisions.length - 2, this.allRevisions.length - 1];
    } else if (this.allRevisions.length === 1) {
      this.selectedRevisions = [0];
    }
    this.updateComparison();
  }

  initializeRevisions(): void {
    const revisionArray = this.customer?.revision || this.customer?.Revision;
    if (revisionArray && Array.isArray(revisionArray)) {
      this.allRevisions = revisionArray;
    } else {
      this.allRevisions = [];
    }
  }

  toggleRevisionSelection(index: number): void {
    const idx = this.selectedRevisions.indexOf(index);
    if (idx > -1) {
      this.selectedRevisions.splice(idx, 1);
    } else {
      if (this.selectedRevisions.length < 4) { // Limit to 4 revisions max
        this.selectedRevisions.push(index);
        this.selectedRevisions.sort(); // Keep sorted
      }
    }
    this.updateComparison();
  }

  isRevisionSelected(index: number): boolean {
    return this.selectedRevisions.includes(index);
  }

  updateComparison(): void {
    this.comparisonData = this.selectedRevisions.map(idx => ({
      index: idx,
      revision: this.allRevisions[idx],
      revisionNumber: idx + 1
    }));
    // Update cached unique processes
    this.uniqueProcesses = this.getAllUniqueProcesses();
  }

  // Compare two values and return if they're different
  areDifferent(value1: any, value2: any): boolean {
    if (value1 === value2) return false;
    if (value1 == null && value2 == null) return false;
    if (value1 == null || value2 == null) return true;
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      return Math.abs(value1 - value2) > 0.01; // Account for floating point precision
    }
    return String(value1) !== String(value2);
  }

  // Check if a value differs from the first selected revision
  isValueDifferent(value: any, fieldPath: string): boolean {
    if (this.comparisonData.length < 2) return false;
    
    const firstValue = this.getNestedValue(this.comparisonData[0].revision, fieldPath);
    return this.areDifferent(value, firstValue);
  }

  // Get nested value from object using dot notation path
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  // Get process count for a revision
  getProcessCount(revision: any): number {
    if (revision?.processName && Array.isArray(revision.processName)) {
      return revision.processName.length;
    }
    return 0;
  }

  // Get all processes for a revision
  getProcesses(revision: any): any[] {
    if (revision?.processName && Array.isArray(revision.processName)) {
      return revision.processName;
    }
    return [];
  }

  // Get all unique processes across all selected revisions
  getAllUniqueProcesses(): any[] {
    const processMap = new Map<string, any>();

    // Collect all processes from all selected revisions
    this.comparisonData.forEach(comp => {
      const processes = this.getProcesses(comp.revision);
      processes.forEach((process: any, index: number) => {
        const processName = process?.name || process?.processName || `Process ${index + 1}`;
        if (!processMap.has(processName)) {
          processMap.set(processName, process);
        }
      });
    });

    return Array.from(processMap.values());
  }

  // Get process display name
  getProcessDisplayName(process: any, index: number): string {
    return process?.name || process?.processName || `Process ${index + 1}`;
  }

  // Get process cost helper method
  getProcessCost(revision: any, process: any, index: number): number {
    const processName = this.getProcessDisplayName(process, index);
    const foundProcess = this.getProcessByName(revision, processName);
    return foundProcess?.processCost || 0;
  }

  // Get process from revision by name
  getProcessByName(revision: any, processName: string): any {
    if (!processName) return null;
    const processes = this.getProcesses(revision);
    return processes.find((p: any) => {
      const pName = p?.name || p?.processName;
      return pName === processName;
    }) || null;
  }

  // Get process by index from a specific revision
  getProcessByIndex(revision: any, index: number): any {
    const processes = this.getProcesses(revision);
    return processes[index] || null;
  }

  // Find process index by name in a revision
  findProcessIndex(revision: any, processName: string): number {
    const processes = this.getProcesses(revision);
    return processes.findIndex((p: any) => 
      (p.name || p.processName) === processName
    );
  }

  // Get process materials
  getProcessMaterials(process: any): any[] {
    const materials: any[] = [];
    
    if (process?.rawMaterial && Array.isArray(process.rawMaterial) && process.rawMaterial.length > 0) {
      materials.push(...process.rawMaterial);
    }
    
    if (process?.grade && Array.isArray(process.grade) && process.grade.length > 0) {
      const firstGradeArray = process.grade[0];
      if (Array.isArray(firstGradeArray) && firstGradeArray.length > 0) {
        const gradeObj = firstGradeArray[0];
        if (gradeObj?.rawMaterial && Array.isArray(gradeObj.rawMaterial) && gradeObj.rawMaterial.length > 0) {
          gradeObj.rawMaterial.forEach((rm: any) => {
            const existingIndex = materials.findIndex(m => m.type === rm.type);
            if (existingIndex >= 0) {
              if (rm.materialsUsed && Array.isArray(rm.materialsUsed)) {
                if (!materials[existingIndex].materialsUsed) {
                  materials[existingIndex].materialsUsed = [];
                }
                materials[existingIndex].materialsUsed.push(...rm.materialsUsed);
              }
            } else {
              materials.push(rm);
            }
          });
        }
      }
    }
    
    return materials;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
