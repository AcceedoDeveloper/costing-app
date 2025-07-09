import { Component, OnInit } from '@angular/core';
import {loadCustomers } from '../../../master/master/store/master.action';
import { loadProcesses} from '../../store/material.actions';
import { getAllProcesses} from '../../store/material.selector';
import { selectCustomers } from '../../../master/master/store/master.selector';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import {Process } from '../../../models/process.model';
import { getCustomerWithId } from '../../store/material.selector';
import { updateCustomerDetails } from '../../store/material.actions';
import { take } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { loadCustomerDetails } from '../../store/material.actions';
import { getCastingDetails} from '../../../modules/materialinput/store/casting.actions';
import { selectCastingData  } from '../../../modules/materialinput/store/casting.selectors';
import {CastingData } from '../../../models/casting-input.model';
import { getCostSummary } from '../../../modules/materialinput/store/casting.actions';
import {selectProductionCost } from '../../../modules/materialinput/store/casting.selectors';
import { CostSummary } from '../../../models/casting-input.model';
import { CustomerProcesss} from '../../../models/Customer-details.model';
import { addCustomerDetails } from '../../store/material.actions';



@Component({
  selector: 'app-addcustomerdetails',
  templateUrl: './addcustomerdetails.component.html',
  styleUrls: ['./addcustomerdetails.component.css']
})
export class AddcustomerdetailsComponent implements OnInit {
  customer$ : Observable<any>;
  customer: any[] = [];
  processes: Process[] =[];
  castingData: CastingData[] | null = null;
  costsummary: CostSummary[] | null = null;
  
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
  costForm: FormGroup;
  forthFormGroup!: FormGroup;
  costSummaryFormGroup!: FormGroup;



  constructor(private store: Store, private fb: FormBuilder, private dialog: MatDialog,  private dialogRef: MatDialogRef<AddcustomerdetailsComponent>) {} 

 ngOnInit(): void {
    this.store.dispatch(loadCustomers());
    this.store.dispatch(loadProcesses());
    this.store.dispatch(getCastingDetails());
    this.store.dispatch(getCostSummary());
   

     this.store.pipe(select(selectCastingData)).subscribe((castingData: CastingData[] | null) => {
          
            this.castingData = castingData;
            console.log('Casting Data:', this.castingData);
          
        });

      this.store.pipe(select(selectProductionCost)).subscribe((costSummary: any[] | null) => {
    if (costSummary && costSummary.length > 0) {
      const data = costSummary[0];

      this.costForm.patchValue({
        salaryforProcess: data.SalaryAndWages?.salaryforProcess || 0,
        salaryExcludingCoreMaking: data.SalaryAndWages?.salaryExcludingCoreMaking || 0,
        salaryForCoreProduction: data.SalaryAndWages?.salaryForCoreProduction || 0,
        outSourcingCost: data.SalaryAndWages?.outSourcingCost || 0,
        splOutSourcingCost: data.SalaryAndWages?.splOutSourcingCost || 0,

        repairAndMaintenance: data.OverHeads?.repairAndMaintenance || 0,
        sellingDistributionAndMiscOverHeads: data.OverHeads?.sellingDistributionAndMiscOverHeads || 0,
        financeCost: data.OverHeads?.financeCost || 0,

        paymentCreditPeriod: data.CommercialTerms?.paymentCreditPeriod || 0,
        bankInterest: data.CommercialTerms?.bankInterest || 0,

        profit: data.Margin?.profit || 0,
        rejection: data.AnticipatedRejection?.rejection || 0,
      });

      console.log('Cost Summary:', data);
    }
  });


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
  // Casting fields
  CastingWeight: [0, Validators.required],
  Cavities: [0, Validators.required],
  PouringWeight: [0, Validators.required],

  // Moulding fields
  MouldingWeight: [0, Validators.required],
  BakeMoulding: [0, Validators.required],

  // Core fields
  CoreWeight: [0, Validators.required],
  CoresPerMould: [0, Validators.required],
  CoreCavities: [0, Validators.required],
  ShootingPerShift: [0, Validators.required],
  CoreSand: [0, Validators.required],
});

 this.costForm = this.fb.group({
    // Salary fields
    salaryforProcess: [0],
    salaryExcludingCoreMaking: [0],
    salaryForCoreProduction: [0],
    outSourcingCost: [0],
    splOutSourcingCost: [0],

    // Overhead fields
    repairAndMaintenance: [0],
    sellingDistributionAndMiscOverHeads: [0],
    financeCost: [0],

    // Commercial terms
    paymentCreditPeriod: [0],
    bankInterest: [0],

    // Margin & Rejection
    profit: [0],
    rejection: [0],



    heatTreatment: [0],
  postProcess: [0],
  packingAndTransport: [0],
  NozzleShotBlasting: [0],
  highPressureCleaning: [0],
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
  drawing: ['', Validators.required],
  CastingInput: [false],
  MouldingInput: [false],
  CoreInput: [false]
});

this.forthFormGroup = this.fb.group({
  // Add relevant fields if needed
});







this.thirdFormGroup = this.fb.group({
  selectedProcesses: [[], Validators.required]
});


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


fristfrom() {
  const selectedInputs = this.firstFormGroup.value;

  if (selectedInputs.CastingInput) {
    const cast = this.castingData?.[0]?.CastingInput;
    if (cast) {
      this.secondFormGroup.patchValue({
        CastingWeight: cast.CastingWeight,
        Cavities: cast.Cavities,
        PouringWeight: cast.PouringWeight
      });
    }
  }

  if (selectedInputs.MouldingInput) {
    const mould = this.castingData?.[0]?.MouldingInput;
    if (mould) {
      this.secondFormGroup.patchValue({
        MouldingWeight: mould.MouldingWeight,
        BakeMoulding: mould.BakeMoulding
      });
    }
  }

  if (selectedInputs.CoreInput) {
    const core = this.castingData?.[0]?.CoreInput;
    if (core) {
      this.secondFormGroup.patchValue({
        CoreWeight: core.CoreWeight,
        CoresPerMould: core.CoresPerMould,
        CoreCavities: core.CoreCavities,
        ShootingPerShift: core.ShootingPerShift,
        CoreSand: core.CoreSand
      });
    }
  }
}





submitStep2() {
  const selectedFields: any = {};
  const selectedInputs = this.firstFormGroup.value;

  if (selectedInputs.CastingInput) {
    selectedFields['CastingInput'] = {
      CastingWeight: this.secondFormGroup.value.CastingWeight,
      Cavities: this.secondFormGroup.value.Cavities,
      PouringWeight: this.secondFormGroup.value.PouringWeight
    };
  }

  if (selectedInputs.MouldingInput) {
    selectedFields['MouldingInput'] = {
      MouldingWeight: this.secondFormGroup.value.MouldingWeight,
      BakeMoulding: this.secondFormGroup.value.BakeMoulding
    };
  }

  if (selectedInputs.CoreInput) {
    selectedFields['CoreInput'] = {
      CoreWeight: this.secondFormGroup.value.CoreWeight,
      CoresPerMould: this.secondFormGroup.value.CoresPerMould,
      CoreCavities: this.secondFormGroup.value.CoreCavities,
      ShootingPerShift: this.secondFormGroup.value.ShootingPerShift,
      CoreSand: this.secondFormGroup.value.CoreSand
    };
  }

  console.log('📝 Updated Input Data:', selectedFields);
}




submitCostForm(): void {
  console.log('Submitted Cost Form:', this.costForm.value);
}

processdata(){
  const selectedProcessObjects = this.thirdFormGroup.value.selectedProcesses;

  // Extract only the process names
  const processType = selectedProcessObjects.map((p: any) => p.processName);

  console.log('processType:', processType);

}


finalSubmit() {
  const first = this.firstFormGroup.value;
  const second = this.secondFormGroup.value;
  const cost = this.costForm.value;
  const processList = this.thirdFormGroup.value.selectedProcesses || [];

  // Extract process names
  const processName = processList.map((p: any) => p.processName);

  // Build final JSON object
  const finalData = {
    CustomerName: first.customerName,
    drawingNo: first.drawing,
    partName: first.partNo,
    processName,

    castingInputs: first.CastingInput || false,
    ...(first.CastingInput && {
      CastingWeight: second.CastingWeight,
      Cavities: second.Cavities,
      PouringWeight: second.PouringWeight
    }),

    mouldingInputs: first.MouldingInput || false,
    ...(first.MouldingInput && {
      MouldingWeight: second.MouldingWeight,
      BakeMoulding: second.BakeMoulding
    }),

    coreInputs: first.CoreInput || false,
    ...(first.CoreInput && {
      CoreWeight: second.CoreWeight,
      CoresPerMould: second.CoresPerMould,
      CoreCavities: second.CoreCavities,
      ShootingPerShift: second.ShootingPerShift,
      CoreSand: second.CoreSand
    }),

    // Cost Form
    salaryforProcess: cost.salaryforProcess,
    salaryExcludingCoreMaking: cost.salaryExcludingCoreMaking,
    salaryForCoreProduction: cost.salaryForCoreProduction,
    outSourcingCost: cost.outSourcingCost,
    splOutSourcingCost: cost.splOutSourcingCost,

    repairAndMaintenance: cost.repairAndMaintenance,
    sellingDistributionAndMiscOverHeads: cost.sellingDistributionAndMiscOverHeads,
    financeCost: cost.financeCost,

    paymentCreditPeriod: cost.paymentCreditPeriod,
    bankInterest: cost.bankInterest,

    profit: cost.profit,
    rejection: cost.rejection,

    heatTreatment: cost.heatTreatment,
    postProcess: cost.postProcess,
    packingAndTransport: cost.packingAndTransport,
    NozzleShotBlasting: cost.NozzleShotBlasting,
    highPressureCleaning: cost.highPressureCleaning
  };

  console.log('📦 Final Submission JSON:', finalData);
  this.store.dispatch(addCustomerDetails({ customer: finalData }));
}


}

