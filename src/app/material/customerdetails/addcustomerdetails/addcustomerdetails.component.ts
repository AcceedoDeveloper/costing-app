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
import { MatDialogRef } from '@angular/material/dialog';
import { loadCustomerDetails } from '../../store/material.actions';
import { getCastingDetails} from '../../../modules/materialinput/store/casting.actions';
import { selectCastingData  } from '../../../modules/materialinput/store/casting.selectors';
import {CastingData } from '../../../models/casting-input.model';
import { getCostSummary } from '../../../modules/materialinput/store/casting.actions';
import {selectProductionCost } from '../../../modules/materialinput/store/casting.selectors';
import { CostSummary } from '../../../models/casting-input.model';
import { addCustomerDetails } from '../../store/material.actions';
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
    private processService: ProcessService
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

submitCostForm(): void {
  console.log('Submitted Cost Form:', this.costForm.value);
  this.isSaved = true; 
}

processdata(){
  const selectedProcessObjects = this.thirdFormGroup.value.selectedProcesses;
  const processType = selectedProcessObjects.map((p: any) => p.processName);

  console.log('processType:', processType);
  this.selectedProcesses = [];

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
    highPressureCleaning: cost.highPressureCleaning,
    otherConsumables: cost.otherConsumables  
  };

  console.log('📦 Final Submission JSON:', finalData);

  if(this.data?.mode === 'edit'){
    this.store.dispatch(updateCustomerDetails({ id: this.editId!, customer: finalData }));
  }
  this.store.dispatch(addCustomerDetails({ customer: finalData }));
   this.store.dispatch(loadCustomerDetails());
}

toggleRow(index: number): void {
  this.expandedRowIndex = this.expandedRowIndex === index ? null : index;
}


logUpdatedData(): void {
  console.log('📦 Updated Process Data:', this.selectedProcesses);
}


getFullUpdatedProcessData(): any[] {
  return this.thirdFormGroup.value.selectedProcesses.map((process: any) => {
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
    Status: 'Completed',
    // power1: cost.power1,
    // power2: cost.power2,
    // power3: cost.power3,
    powerCost: {
    MeltAndOthersPower: cost.power1,
    mouldPower: cost.power2,
    corePower: cost.power3
  }

  };

  console.log('✅ Final Full JSON Format:', finalData);

  // ✅ Call the API here using form values
  this.dhashboardServices.getQuoteData(first.customerName, first.drawing, first.partNo).subscribe(
    response => {
      console.log('🚀 API Success:', response);

      this.quotationData = response;
      this.quotationCalc = response.calculations?.[0] || {};
    },
    error => {
      console.error('❌ API Error:', error);
    }
  );

   if (this.customerId) {
    console.log('✅ Final Payload:', finalData);
    this.store.dispatch(updateCustomerDetails({ id: this.customerId, customer: finalData }));
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



}

