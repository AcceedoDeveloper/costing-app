import { Component, OnInit } from '@angular/core';
import {loadCustomers } from '../../../master/master/store/master.action';
import { loadProcesses} from '../../store/material.actions';
import { getAllProcesses} from '../../store/material.selector';
import { selectCustomers } from '../../../master/master/store/master.selector';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { Store, select } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import {Process } from '../../../models/process.model';
import { getCustomerWithId } from '../../store/material.selector';
import { updateCustomerDetails } from '../../store/material.actions';
import { MatDialogRef } from '@angular/material/dialog';
import { loadCustomerDetails } from '../../store/material.actions';
import { getCastingDetails} from '../../../modules/materialinput/store/casting.actions';
import { selectCastingData  } from '../../../modules/materialinput/store/casting.selectors';
import {CastingData } from '../../../models/casting-input.model';
import { getCostSummary } from '../../../modules/materialinput/store/casting.actions';
import {selectProductionCost } from '../../../modules/materialinput/store/casting.selectors';
import { CostSummary } from '../../../models/casting-input.model';
import { addCustomerDetails, addCustomerDetailsSuccess } from '../../store/material.actions';
import { DashboardService } from '../../../services/dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { ProcessService } from '../../../services/process.service';
import { ProductPower } from '../../../models/ProductionPower.model';





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
  selectedProcesses: any[] = [];
  expandedProcessIndex: number | null = null;
  selectedProcessForEdit: any = null;
  expandedMaterialTypes: { [key: string]: boolean } = {};
  groupedRawMaterials: { [index: number]: any[] } = {};
  editedProcessFlags: { [index: number]: boolean } = {};
  editedProcesses: { [index: number]: any } = {};
  expandedRowIndex: number | null = null;
  editMode: { [index: number]: boolean } = {};
  customerId: string | null = null;
  editId: string | null = null;
  castingWeightKg : number = 0;
  yeild : number = 0;
  NoOfMouldperHeat : number = 0;
  meterialRefund : number = 0;
  isSaved = false;


  quotationData: any = null;
  quotationCalc: any = null;
  productionPower: ProductPower | null = null;
  storedRevision: number | null = null;
  storedRevisionData: any = null; // Store full revision data
  ID : string | null = null;
  storedCustomerId: string | null = null;
  showRevisionDetails: boolean = false;

  selectedFileName: string = '';
selectedFile: File | null = null;

  


  @ViewChild('stepper') stepper!: MatStepper;

  thirdFormGroup!: FormGroup;
  isLinear = true;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  costForm: FormGroup;
  forthFormGroup!: FormGroup;
  costSummaryFormGroup!: FormGroup;



  constructor(
    private store: Store,
    private fb: FormBuilder,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddcustomerdetailsComponent>,
    private dhashboardServices: DashboardService,
    private tooster: ToastrService,
    private processService: ProcessService,
    private actions$: Actions
  ) {} 

  closeDialog() {
    this.dialogRef.close();
  }

 ngOnInit(): void {



  



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


  otherConsumables: [0], // Add this line for other consumables
  power1 : [0],
  power2: [0],
  power3: [0]
  });
    this.store.dispatch(loadCustomers());
    this.store.dispatch(loadProcesses());
    this.store.dispatch(getCastingDetails());
    this.store.dispatch(getCostSummary());
    
    // Fetch power cost data
    this.getPowerCostData();
     

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

      console.log('Processes Data:', data);
  this.processes = data.map(p => ({
    ...p,
    grade: Array.isArray(p.grade) && Array.isArray(p.grade[0]) ? p.grade[0] : p.grade
  }));

 
});

    // Subscribe to addCustomerDetailsSuccess to capture revision
    this.actions$.pipe(
      ofType(addCustomerDetailsSuccess),
      take(1)
    ).subscribe((action: any) => {
      if (action && action.customer) {
        this.storedRevision = action.customer.revision || action.customer.data?.revision || null;
        this.ID = action.customer.ID || action.customer.data?.ID || null;
        this.storedCustomerId = action.customer._id || action.customer.data?._id || null;
        
        // Store full revision data if available
        const revisionArray = action.customer.revision || action.customer.Revision || action.customer.data?.revision || action.customer.data?.Revision;
        if (revisionArray && Array.isArray(revisionArray) && revisionArray.length > 0) {
          this.storedRevisionData = revisionArray[revisionArray.length - 1];
          console.log('✅ Stored Revision Data:', this.storedRevisionData);
        }
        
        console.log('✅ Customer added successfully. Revision:', this.storedRevision, 'Customer ID:', this.storedCustomerId);
      }
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


this.thirdFormGroup = this.fb.group({
  selectedProcesses: this.fb.control([])
});




this.store.select(getCustomerWithId).subscribe((state) => {
  console.log('👀 Selector State:', state);
  

   if (state?.customer?._id) {
    // Save customer ID
   
    this.customerId = state.customer._id;
     console.log('customer ID', this.customerId);
  }

  if (state?.customer?.processName) {
    this.selectedProcesses = state.customer.processName.map(process => {
  const updatedProcess = { ...process };

  if (updatedProcess.grade?.length > 0) {
    const clonedGrade = updatedProcess.grade.map(innerArray =>
      innerArray.map(g => ({
        ...g,
        rawMaterial: g.rawMaterial.map(rm => ({
          ...rm,
          materialsUsed: rm.materialsUsed.map(mat => ({
            ...mat,
            updatedQuantity: mat.quantity,
            updatedUnitCost: mat.unitCost
          }))
        }))
      }))
    );

    updatedProcess.grade = clonedGrade;

  } else if (updatedProcess.rawMaterial?.length > 0) {
    updatedProcess.rawMaterial = updatedProcess.rawMaterial.map(rm => ({
      ...rm,
      materialsUsed: rm.materialsUsed.map(mat => ({
        ...mat,
        updatedQuantity: mat.quantity,
        updatedUnitCost: mat.unitCost
      }))
    }));
  }

  return updatedProcess;
});


    console.log('✅ Extracted Processes (Cloned & Editable):', this.selectedProcesses);

    this.thirdFormGroup.patchValue({
      selectedProcesses: this.selectedProcesses
    });
  }
});


this.secondFormGroup.valueChanges.subscribe(values => {
  const { CastingWeight = 0, Cavities = 0, PouringWeight = 1 } = values;

  if (PouringWeight === 0) {
    this.castingWeightKg = 0;
    return;
  }
  this.castingWeightKg = Math.round(((CastingWeight * Cavities) / PouringWeight) * 1050);
  this.yeild = (this.castingWeightKg / 1050) * 100;
  this.meterialRefund = 1050 - this.castingWeightKg;
  this.NoOfMouldperHeat = Math.round(1050 / PouringWeight);
  console.log('Calculated Value:', this.castingWeightKg);
});



this.firstFormGroup = this.fb.group({
  customerName: ['', Validators.required],
  partNo: ['', Validators.required],
  drawing: ['', Validators.required],
  CastingInput: [true],
  MouldingInput: [true],
  CoreInput: [false]
});

this.forthFormGroup = this.fb.group({
  // Add relevant fields if needed
});

if (this.data?.mode === 'edit' && this.data.customerData) {
    const customer = this.data.customerData;
    this.editId = customer._id; 

    console.log('Edit Mode - Customer ID:', this.data.customerData._id);

    this.firstFormGroup.patchValue({
      customerName: customer.CustomerName?.name || '',
      partNo: customer.partName || '',
      drawing: customer.drawingNo || '',
      CastingInput: !!customer.castingInputs,
      MouldingInput: !!customer.mouldingInputs,
      CoreInput: !!customer.coreInputs,
    });

    this.secondFormGroup.patchValue({
      CastingWeight: customer.castingInputs?.CastingWeight || 0,
      Cavities: customer.castingInputs?.Cavities || 0,
      PouringWeight: customer.castingInputs?.PouringWeight || 0,
      MouldingWeight: customer.mouldingInputs?.MouldingWeight || 0,
      BakeMoulding: customer.mouldingInputs?.BakeMoulding || 0,
      CoreWeight: customer.coreInputs?.CoreWeight || 0,
      CoresPerMould: customer.coreInputs?.CoresPerMould || 0,
      CoreCavities: customer.coreInputs?.CoreCavities || 0,
      ShootingPerShift: customer.coreInputs?.ShootingPerShift || 0,
      CoreSand: customer.coreInputs?.CoreSand || 0,
    });





    this.thirdFormGroup.patchValue({
      selectedProcesses: customer.processName
    });

    this.costForm.patchValue({
      salaryforProcess: customer.SalaryAndWages?.salaryforProcess || 0,
      salaryExcludingCoreMaking: customer.SalaryAndWages?.salaryExcludingCoreMaking || 0,
      salaryForCoreProduction: customer.SalaryAndWages?.salaryForCoreProduction || 0,
      outSourcingCost: customer.SalaryAndWages?.outSourcingCost || 0,
      splOutSourcingCost: customer.SalaryAndWages?.splOutSourcingCost || 0,
      repairAndMaintenance: customer.OverHeads?.repairAndMaintenance || 0,
      sellingDistributionAndMiscOverHeads: customer.OverHeads?.sellingDistributionAndMiscOverHeads || 0,
      financeCost: customer.OverHeads?.financeCost || 0,
      paymentCreditPeriod: customer.CommercialTerms?.paymentCreditPeriod || 0,
      bankInterest: customer.CommercialTerms?.bankInterest || 0,
      profit: customer.Margin?.profit || 0,
      rejection: customer.AnticipatedRejection?.rejection || 0,
      heatTreatment: customer.UltraSonicWashing?.heatTreatment || 0,
      postProcess: customer.UltraSonicWashing?.postProcess || 0,
      packingAndTransport: customer.UltraSonicWashing?.packingAndTransport || 0,
      NozzleShotBlasting: customer.UltraSonicWashing?.NozzleShotBlasting || 0,
      highPressureCleaning: customer.UltraSonicWashing?.highPressureCleaning || 0,
      otherConsumables: customer.otherConsumables?.otherConsumableCost || 0,
      powerCost1 :customer.otherConsumables?.otherConsumableCost|| 0,
      powerCost2 : customer.otherConsumables?.otherConsumableCost || 0,
      powerCost3 : customer.otherConsumables?.otherConsumableCost || 0,

    });

    this.selectedProcesses = customer.processName || [];
  }
  }


expandedReviewIndex: number | null = null;


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

  console.log(' Updated Input Data:', selectedFields);
  this.thirdFormGroup.get('selectedProcesses')?.setValue([]);
this.selectedProcesses = [];

}

submitCostForm(revision?: any, customerId?: string, id?: string): void {
  // Use passed parameters or stored values
  const finalRevision = revision !== undefined ? revision : this.storedRevision;
  const ID = id !== undefined ? id : this.ID;

  const finalCustomerId = customerId || this.storedCustomerId;
  
  console.log('Submitted Cost Form:', this.costForm.value);
  console.log('Revision:', finalRevision);
  console.log('Customer ID:', finalCustomerId);
  console.log('ID ', ID);
  
  // If revision is an array, extract the latest revision data
  if (Array.isArray(finalRevision) && finalRevision.length > 0) {
    this.storedRevisionData = finalRevision[finalRevision.length - 1];
    console.log('✅ Extracted Revision Data from array:', this.storedRevisionData);
  } else if (finalRevision && typeof finalRevision === 'object' && !Array.isArray(finalRevision)) {
    // If it's already an object, use it directly
    this.storedRevisionData = finalRevision;
    console.log('✅ Using Revision Data object:', this.storedRevisionData);
  }
  
  // You can use finalRevision and finalCustomerId here for further processing
}

button(){
  this.isSaved = true;

}

processdata(){
  const selectedProcessObjects = this.thirdFormGroup.value.selectedProcesses;
  const processType = selectedProcessObjects?.map((p: any) => p.processName) || [];

  console.log('processType:', processType);
  // Don't clear selectedProcesses - preserve them for later use
  // Store the selected processes for later use
  if (selectedProcessObjects && selectedProcessObjects.length > 0) {
    this.selectedProcesses = selectedProcessObjects.map((process: any) => {
      const updatedProcess = { ...process };
      
      // Clone with editable fields
      if (updatedProcess.grade?.length > 0) {
        const clonedGrade = updatedProcess.grade.map((innerArray: any[]) =>
          innerArray.map((g: any) => ({
            ...g,
            rawMaterial: g.rawMaterial.map((rm: any) => ({
              ...rm,
              materialsUsed: rm.materialsUsed.map((mat: any) => ({
                ...mat,
                updatedQuantity: mat.updatedQuantity ?? mat.quantity,
                updatedUnitCost: mat.updatedUnitCost ?? mat.unitCost
              }))
            }))
          }))
        );
        updatedProcess.grade = clonedGrade;
      } else if (updatedProcess.rawMaterial?.length > 0) {
        updatedProcess.rawMaterial = updatedProcess.rawMaterial.map((rm: any) => ({
          ...rm,
          materialsUsed: rm.materialsUsed.map((mat: any) => ({
            ...mat,
            updatedQuantity: mat.updatedQuantity ?? mat.quantity,
            updatedUnitCost: mat.updatedUnitCost ?? mat.unitCost
          }))
        }));
      }
      
      return updatedProcess;
    });
    console.log('✅ Stored selectedProcesses:', this.selectedProcesses);
  }
}


finalSubmit() {
  const first = this.firstFormGroup.value;
  const second = this.secondFormGroup.value;
  const cost = this.costForm.value;
  
  // Use selectedProcesses if available, otherwise use form value
  const processList = this.selectedProcesses.length > 0 
    ? this.selectedProcesses 
    : (this.thirdFormGroup.value.selectedProcesses || []);

  // Extract process names
  const processName = processList.map((p: any) => p.processName || p.name);

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
    highPressureCleaning: cost.highPressureCleaning,
    otherConsumables: cost.otherConsumables  ,
    revision: 1
  };

  console.log('📦 Final Submission JSON:', finalData);

  if(this.data?.mode === 'edit'){
    this.store.dispatch(updateCustomerDetails({ id: this.editId!, customer: finalData }));
  } else {
    // Dispatch addCustomerDetails and wait for success response
    this.store.dispatch(addCustomerDetails({ customer: finalData }));
    
    // Subscribe to success action to get revision (one-time subscription)
    this.actions$.pipe(
      ofType(addCustomerDetailsSuccess),
      take(1)
    ).subscribe((action: any) => {
      if (action && action.customer) {
        const iD = action.customer.ID || action.customer.data?.ID || null;
        const revision = action.customer.revision || action.customer.data?.revision || null;
        const customerId = action.customer._id || action.customer.data?._id || null;
        
        // Store revision and customer ID
        this.storedRevision = revision;
        this.storedCustomerId = customerId;
        this.ID = iD;
        
        // Store full revision data if available
        const revisionArray = action.customer.revision || action.customer.Revision || action.customer.data?.revision || action.customer.data?.Revision;
        if (revisionArray && Array.isArray(revisionArray) && revisionArray.length > 0) {
          this.storedRevisionData = revisionArray[revisionArray.length - 1];
          console.log('✅ Stored Revision Data:', this.storedRevisionData);
        }
        
        console.log('✅ Customer added. Revision:', revision, 'Customer ID:', customerId);
        
        // Call submitCostForm with revision array and customerId
        this.submitCostForm(revisionArray, customerId, iD);
      }
    });
  }
  
  this.store.dispatch(loadCustomerDetails());
}

toggleRow(index: number): void {
  this.expandedRowIndex = this.expandedRowIndex === index ? null : index;
}


logUpdatedData(): void {
  console.log('📦 Updated Process Data:', this.selectedProcesses);
}


getFullUpdatedProcessData(): any[] {
  // Priority: 1. storedRevisionData, 2. selectedProcesses array, 3. thirdFormGroup value
  let processesToUse: any[] = [];
  
  if (this.storedRevisionData?.processName && Array.isArray(this.storedRevisionData.processName) && this.storedRevisionData.processName.length > 0) {
    // Use revision data if available
    processesToUse = this.storedRevisionData.processName;
    console.log('✅ Using processes from storedRevisionData:', processesToUse);
  } else if (this.selectedProcesses && this.selectedProcesses.length > 0) {
    // Use selectedProcesses array
    processesToUse = this.selectedProcesses;
    console.log('✅ Using processes from selectedProcesses:', processesToUse);
  } else if (this.thirdFormGroup.value.selectedProcesses && Array.isArray(this.thirdFormGroup.value.selectedProcesses) && this.thirdFormGroup.value.selectedProcesses.length > 0) {
    // Use form value as fallback
    processesToUse = this.thirdFormGroup.value.selectedProcesses;
    console.log('✅ Using processes from thirdFormGroup:', processesToUse);
  } else {
    console.warn('⚠️ No processes found in any source');
    return [];
  }

  return processesToUse.map((process: any) => {
    const updated = { ...process };

    if (updated.grade?.length > 0) {
      updated.grade = updated.grade.map((gradeArray: any[]) =>
        gradeArray.map((grade: any) => ({
          ...grade,
          rawMaterial: grade.rawMaterial.map((rm: any) => ({
            type: rm.type,
            materialsUsed: rm.materialsUsed.map((mat: any) => ({
              name: mat.name,
              updateQuantity: mat.updatedQuantity ?? mat.updateQuantity ?? mat.quantity,
              updateCost: mat.updatedUnitCost ?? mat.updateCost ?? mat.unitCost
            }))
          }))
        }))
      );
    } else if (updated.rawMaterial?.length > 0) {
      updated.rawMaterial = updated.rawMaterial.map((rm: any) => ({
        type: rm.type,
        materialsUsed: rm.materialsUsed.map((mat: any) => ({
          name: mat.name,
          updateQuantity: mat.updatedQuantity ?? mat.updateQuantity ?? mat.quantity,
          updateCost: mat.updatedUnitCost ?? mat.updateCost ?? mat.unitCost
        }))
      }));
    }

    return updated;
  });
}



generateFinalJson(): void {
  const first = this.firstFormGroup.value;
  const second = this.secondFormGroup.value;
  const cost = this.costForm.value;

  const fullProcessData = this.getFullUpdatedProcessData();

  const finalData = {
    CustomerName: first.customerName,
    drawingNo: first.drawing,
    partName: first.partNo,
    processName: fullProcessData,

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

    // Cost
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
    highPressureCleaning: cost.highPressureCleaning,
    otherConsumableCost: cost.otherConsumables,
    Status: 'pending',
    // power1: cost.power1,
    // power2: cost.power2,
    // power3: cost.power3,
    powerCost: {
    MeltAndOthersPower: cost.power1,
    mouldPower: cost.power2,
    corePower: cost.power3,
  },
  revision: 1

  };

  console.log('✅ Final Full JSON Format:', finalData);

  // ✅ Call the API here using form values (use revision array length)
  const customID = this.ID !== null ? this.ID : '';
  
  // Get revision count from store (revision array length)
  this.store.select(getCustomerWithId).pipe(take(1)).subscribe((state) => {
    let revisionCount = 0;
    if (state?.customer?.revision && Array.isArray(state.customer.revision)) {
      revisionCount = state.customer.revision.length;
    }
    
    console.log('📊 Revision array length:', revisionCount);
    
      this.dhashboardServices.getQuoteData(first.customerName, first.drawing, first.partNo, customID, revisionCount).subscribe(
        response => {
          console.log('🚀 API Success:', response);

          this.quotationData = response;
          this.quotationCalc = response.calculations?.[0] || {};
        },
        error => {
          console.error('❌ API Error:', error);
        }
      );
    });

   if (this.customerId) {
    console.log('✅ Final Payload:', finalData);
    this.store.dispatch(updateCustomerDetails({ id: this.customerId,  customer: finalData }));
    this.store.dispatch(loadCustomerDetails());
  } else {
    console.error('❌ No customer ID found to update');
  }

}

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
    this.selectedFileName = this.selectedFile.name;

   
    console.log("Selected file:", this.selectedFile);
  }
}

submitForm() {
   this.tooster.success('Customer Details created successfully!', 'Success');
  this.dialogRef.close(); 
}

getPowerCostData(): void {
  this.processService.getProductionCost().subscribe(
    (res: ProductPower[]) => {
      if (res && res.length > 0) {
        this.productionPower = res[0]; // Take first element
        
        // Populate the form with power cost data
        this.costForm.patchValue({
          power1: this.productionPower.MeltAndOthersPower,
          power2: this.productionPower.mouldPower,
          power3: this.productionPower.corePower
        });
        
        console.log('Power cost data loaded:', this.productionPower);
      }
    },
    (error) => {
      console.error('Error fetching power cost data:', error);
    }
  );
}

// Get revision total process cost
getRevisionTotalCost(revision: any): number {
  if (revision?.totalProcessCost) {
    return revision.totalProcessCost;
  }
  // Calculate from processName if totalProcessCost is not available
  if (revision?.processName && Array.isArray(revision.processName)) {
    return revision.processName.reduce((sum: number, process: any) => {
      return sum + (process.processCost || 0);
    }, 0);
  }
  return 0;
}

// Toggle revision details display
toggleRevisionDetails(): void {
  this.showRevisionDetails = !this.showRevisionDetails;
}

// Handle step change to refresh revision data when Review Cost step is accessed
onStepChange(event: any): void {
  // When Review Cost step (step 3, index 3) is accessed, try to get latest revision data
  if (event.selectedIndex === 3 && this.storedCustomerId) {
    // Try to get revision data from store if not already stored
    this.refreshRevisionData();
  }
}

// Refresh revision data from store
refreshRevisionData(): void {
  this.store.select(getCustomerWithId).pipe(take(1)).subscribe((state) => {
    if (state?.customer) {
      const customer = state.customer;
      const revisionArray = customer.revision || customer.Revision;
      
      if (revisionArray && Array.isArray(revisionArray) && revisionArray.length > 0) {
        this.storedRevisionData = revisionArray[revisionArray.length - 1];
        this.ID = customer.ID;
        console.log('✅ Refreshed Revision Data on step change:', this.storedRevisionData);
      }
    }
  });
}

}

