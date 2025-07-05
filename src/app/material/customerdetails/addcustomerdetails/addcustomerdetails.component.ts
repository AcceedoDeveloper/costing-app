import { Component, OnInit } from '@angular/core';
import {loadCustomers } from '../../../master/master/store/master.action';
import { loadProcesses} from '../../store/material.actions';
import { getAllProcesses} from '../../store/material.selector';
import { selectCustomers } from '../../../master/master/store/master.selector';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { addCustomerDetails} from '../../store/material.actions';
import { ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import {Process } from '../../../models/process.model';
import { getCustomerWithId } from '../../store/material.selector';
import { updateCustomerDetails } from '../../store/material.actions';
import { take } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { loadCustomerDetails } from '../../store/material.actions';


@Component({
  selector: 'app-addcustomerdetails',
  templateUrl: './addcustomerdetails.component.html',
  styleUrls: ['./addcustomerdetails.component.css']
})
export class AddcustomerdetailsComponent implements OnInit {
  customer$ : Observable<any>;
  customer: any[] = [];
  processes: Process[] =[];
  
  expandedProcessIndex: number | null = null;
  selectedProcessForEdit: any = null;
  expandedMaterialTypes: { [key: string]: boolean } = {};
  groupedRawMaterials: { [index: number]: any[] } = {};
  editedProcessFlags: { [index: number]: boolean } = {};
  editedProcesses: { [index: number]: any } = {};



  

  @ViewChild('stepper') stepper!: MatStepper;

  thirdFormGroup!: FormGroup;


  isLinear = false;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  forthFormGroup!: FormGroup;


  constructor(private store: Store, private fb: FormBuilder, private dialog: MatDialog,  private dialogRef: MatDialogRef<AddcustomerdetailsComponent>) {} 

 ngOnInit(): void {
    this.store.dispatch(loadCustomers());
    this.store.dispatch(loadProcesses());
   



    this.customer$ = this.store.select(selectCustomers);
    this.customer$.subscribe(customer => {
      this.customer = customer;
      console.log(customer);
    });

    this.store.select(getAllProcesses).subscribe((data: Process[]) => {


  this.processes = data.map(p => ({
    ...p,
    grade: Array.isArray(p.grade) && Array.isArray(p.grade[0]) ? p.grade[0] : p.grade
  }));

 
});




this.secondFormGroup = this.fb.group({
  castingWeight: ['', Validators.required],
  cavities: ['', Validators.required],
  pouringWeight: ['', Validators.required],
  goodCastingWeight: ['', Validators.required],
  yield: ['', Validators.required],
  materialReturned: ['', Validators.required],
  yieldPercentage: ['', Validators.required]
});


this.secondFormGroup.valueChanges.subscribe(values => {
  const castingWeight = parseFloat(values.castingWeight) || 0;
  const cavities = parseFloat(values.cavities) || 0;
  const pouringWeight = parseFloat(values.pouringWeight) || 0;

  if (castingWeight && cavities && pouringWeight) {
    // Perform calculations
    const yieldPercentage = (castingWeight * cavities) / pouringWeight;
    const goodCastingWeight = Math.round(yieldPercentage * 1050);
    const yieldVal = (goodCastingWeight / 1050) * 100;
    const materialReturned = 1050 - goodCastingWeight;

    // Update the form
    this.secondFormGroup.patchValue({
      goodCastingWeight: goodCastingWeight,
      yield: yieldVal.toFixed(2),
      materialReturned: materialReturned.toFixed(2),
      yieldPercentage: yieldPercentage.toFixed(2)
    }, { emitEvent: false }); // Avoid infinite loop
  }
});



this.store.select(getCustomerWithId).subscribe((state) => {
  console.log('👀 Selector State:', state); // Add this log

  if (state.customer && state.id) {
    console.log('✅ Customer ID from response:', state.id);
  }
});






    

  this.firstFormGroup = this.fb.group({
  customerName: ['', Validators.required],
  partNo: ['', Validators.required],
  drawing: ['', Validators.required]
});

this.forthFormGroup = this.fb.group({
  // Add relevant fields if needed
});







this.thirdFormGroup = this.fb.group({
  selectedProcesses: [[], Validators.required]
});


  }

submit() {
  if (this.firstFormGroup.valid && this.secondFormGroup.valid && this.thirdFormGroup.valid) {
    const customerDetails = this.firstFormGroup.value;
    const engineeringDetails = this.secondFormGroup.value;
    const selectedProcesses = this.thirdFormGroup.get('selectedProcesses')?.value || [];

   const finalPayload = {
  CustomerName: customerDetails.customerName,
  drawingNo: customerDetails.drawing,
  partName: customerDetails.partNo,
  processName: selectedProcesses.map((p: any) => p.processName),  // <-- fix here
  castingInputs: true,
  CastingWeight: engineeringDetails.castingWeight,
  Cavities: engineeringDetails.cavities,
  PouringWeight: engineeringDetails.pouringWeight,
  mouldingInputs: false,
  coreInputs: false
};


    console.log('Final Payload:', finalPayload);
    this.store.dispatch(addCustomerDetails({ customer: finalPayload }));
     

  } else {
    console.log('One or more steps are invalid');
  }

 
}

compareProcesses(a: any, b: any): boolean {
  return a?.processName === b?.processName;
}

toggleExpandedRow(index: number, row: Process): void {
  this.expandedProcessIndex = this.expandedProcessIndex === index ? null : index;
  console.log('Expanded Process:', row);
}

getProcessByRow(row: Process): Process {
  return row;
}

expandedReviewIndex: number | null = null;




deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }

  onTotalCostEdit(event: Event, material: any): void {
  const value = (event.target as HTMLElement).innerText;
  const parsed = parseFloat(value);

  if (isNaN(parsed)) {
    console.warn('Invalid number entered');
    return;
  }

  if (!this.selectedProcessForEdit) {
    console.warn('No selected process to edit');
    return;
  }

  // Loop and find the material in grade/rawMaterial
  for (let grade of this.selectedProcessForEdit.grade || []) {
    for (let raw of grade.rawMaterial || []) {
      raw.materialsUsed = raw.materialsUsed.map(m => {
        if (m.objectId === material.objectId) {
          return { ...m, totalCost: parsed };
        }
        return m;
      });
    }
  }

  for (let raw of this.selectedProcessForEdit.rawMaterial || []) {
    raw.materialsUsed = raw.materialsUsed.map(m => {
      if (m.objectId === material.objectId) {
        return { ...m, totalCost: parsed };
      }
      return m;
    });
  }

  console.log('Updated cloned data:', this.selectedProcessForEdit);
}



trackByIndex(index: number, item: any): number {
  return index;
}





onCustomCostChange(value: string, material: any): void {
  const cost = parseFloat(value);
  material.customCost = isNaN(cost) ? null : cost;

  console.log('Updated:', material.name, '| New Custom Cost:', material.customCost);
}

onUpdatedValueChange(newVal: string, material: any): void {
  const parsedQuantity = parseFloat(newVal);
  if (isNaN(parsedQuantity)) {
    console.warn('Invalid input');
    return;
  }

  if (!this.editedProcesses) this.editedProcesses = {};
this.editedProcesses[this.expandedReviewIndex!] = this.deepClone(this.selectedProcessForEdit);


  if (!this.selectedProcessForEdit) {
    console.warn('No selected process to edit');
    return;
  }

  // ✅ Update inside grade -> rawMaterial
  if (this.selectedProcessForEdit.grade) {
    for (let grade of this.selectedProcessForEdit.grade) {
      for (let raw of grade.rawMaterial || []) {
        raw.materialsUsed = raw.materialsUsed.map(m => {
          if (m.objectId === material.objectId) {
            const updated = {
              ...m,
              quantity: parsedQuantity,
              totalCost: parsedQuantity * m.unitCost // ✅ Recalculate total cost
            };
            console.log('✅ Updated Grade Material:', updated.name, '=> QTY:', updated.quantity, 'TOTAL:', updated.totalCost);
            return updated;
          }
          return m;
        });
      }
    }
  }

  // ✅ Update inside rawMaterial
  if (this.selectedProcessForEdit.rawMaterial) {
    for (let raw of this.selectedProcessForEdit.rawMaterial) {
      raw.materialsUsed = raw.materialsUsed.map(m => {
        if (m.objectId === material.objectId) {
          const updated = {
            ...m,
            quantity: parsedQuantity,
            totalCost: parsedQuantity * m.unitCost // ✅ Recalculate total cost
          };
          console.log('✅ Updated Raw Material:', updated.name, '=> QTY:', updated.quantity, 'TOTAL:', updated.totalCost);
          return updated;
        }
        return m;
      });
    }
  }

  console.log('✅ Final updated process clone:', this.selectedProcessForEdit);
  this.editedProcessFlags[this.expandedReviewIndex!] = true;
}




toggleExpandedReview(index: number): void {
  const selectedProcesses = this.thirdFormGroup.get('selectedProcesses')?.value;
  this.expandedReviewIndex = this.expandedReviewIndex === index ? null : index;

  if (this.expandedReviewIndex !== null) {
    const selectedProcess = selectedProcesses[this.expandedReviewIndex];
    this.selectedProcessForEdit = this.deepClone(selectedProcess); // ✅

    // 👇 NEW: Cache the grouped result only once per process
    this.groupedRawMaterials[index] = this.groupRawMaterialsByType(selectedProcess.rawMaterial || []);
    
    console.log('Selected for review:', this.selectedProcessForEdit);
  }
}



logReviewedProcess(): void {
  if (this.expandedReviewIndex !== null && this.selectedProcessForEdit) {
    const selectedProcesses = [...this.thirdFormGroup.get('selectedProcesses')?.value];
    selectedProcesses[this.expandedReviewIndex] = this.selectedProcessForEdit;

    this.thirdFormGroup.get('selectedProcesses')?.setValue(selectedProcesses);
    console.log('✅ Updated FormGroup with edited process:', selectedProcesses);
  }
}


submitdata() {
  if (this.firstFormGroup.valid && this.secondFormGroup.valid && this.thirdFormGroup.valid) {
    const customerDetails = this.firstFormGroup.value;
    const engineeringDetails = this.secondFormGroup.value;
    const selectedProcesses = this.thirdFormGroup.get('selectedProcesses')?.value || [];

    const formattedProcesses = selectedProcesses.map((proc: any) => {
      const grade = proc.grade?.map((g: any) => ({
        name: g.name,
        rawMaterial: g.rawMaterial?.map((raw: any) => ({
          type: raw.type,
          materialsUsed: raw.materialsUsed.map((mat: any) => ({
            objectId: mat.objectId,
            name: mat.name,
            updateCost: mat.totalCost
          }))
        }))
      }));

      const rawMaterial = proc.rawMaterial?.map((raw: any) => ({
        type: raw.type,
        materialsUsed: raw.materialsUsed.map((mat: any) => ({
          objectId: mat.objectId,
          name: mat.name,
          updateCost: mat.totalCost
        }))
      }));

      return {
        _id: proc._id,
        processName: proc.processName,
        grade: grade,
        rawMaterial: rawMaterial?.length ? rawMaterial : undefined
      };
    });

    const updatePayload = {
      CustomerName: customerDetails.customerName,
      drawingNo: customerDetails.drawing,
      partName: customerDetails.partNo,
      processName: formattedProcesses,
      castingInputs: true,
      mouldingInputs: false,
      coreInputs: false,
      CastingWeight: engineeringDetails.castingWeight,
      Cavities: engineeringDetails.cavities,
      PouringWeight: engineeringDetails.pouringWeight
    };

    console.log('data', updatePayload);

    // 👉 FIX: Use `take(1)` so it runs only once
    this.store.select(getCustomerWithId).pipe(take(1)).subscribe((state) => {
      if (state?.id) {
        console.log('✅ Dispatching Update for ID:', state.id);
        this.store.dispatch(updateCustomerDetails({ id: state.id, customer: updatePayload }));
        this.dialogRef.close(true); 
      } else {
        console.warn('❌ No ID found in state to update');
      }
    });


    this.store.dispatch(loadCustomerDetails());
    

  } else {
    console.warn('❌ One or more steps are invalid!');
  }
}

toggleMaterialType(type: string): void {
  this.expandedMaterialTypes[type] = !this.expandedMaterialTypes[type];
}



isMaterialTypeExpanded(type: string): boolean {
  return !!this.expandedMaterialTypes[type];
}


groupRawMaterialsByType(rawMaterialList: any[]): any[] {
  const grouped: { [type: string]: any[] } = {};

  for (const item of rawMaterialList) {
    const key = item.type || 'Unknown';
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(...(item.materialsUsed || []));
  }

  return Object.entries(grouped).map(([type, materials]) => ({
    type,
    materials
  }));
}


saveProcessEdit(index: number): void {
  // 👇 Sync back the edited data into FormGroup
  const selectedProcesses = [...this.thirdFormGroup.get('selectedProcesses')?.value];
  selectedProcesses[index] = this.selectedProcessForEdit;

  this.thirdFormGroup.get('selectedProcesses')?.setValue(selectedProcesses);
  this.editedProcessFlags[index] = false;

  console.log('✅ Saved Process Index:', index);
  console.log('Updated Process Data:', selectedProcesses[index]); // ✅ Now shows updated quantity
}


saveAllProcesses(): void {
  const selectedProcesses = [...this.thirdFormGroup.get('selectedProcesses')?.value];
  let didUpdate = false;

  Object.keys(this.editedProcessFlags).forEach((keyStr) => {
    const index = parseInt(keyStr, 10);

    if (this.editedProcessFlags[index]) {
      if (this.editedProcesses[index]) {
        selectedProcesses[index] = this.editedProcesses[index]; // Use cached edit
        delete this.editedProcesses[index]; // Clean up
      }

      this.editedProcessFlags[index] = false;
      didUpdate = true;
    }
  });

  if (didUpdate) {
    this.thirdFormGroup.get('selectedProcesses')?.setValue(selectedProcesses);
    console.log('✅ All changes saved:', selectedProcesses);
  } else {
    console.log('ℹ️ No edits to save.');
  }
}



}

