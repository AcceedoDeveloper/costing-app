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
import { updateCustomerDetails, updateCustomerDetailsSuccess, addCustomerDetailsSuccess } from '../../store/material.actions';
import { MatDialogRef } from '@angular/material/dialog';
import { loadCustomerDetails } from '../../store/material.actions';
import {CastingData } from '../../../models/casting-input.model';
import { getCostSummary } from '../../../modules/materialinput/store/casting.actions';
import {selectProductionCost } from '../../../modules/materialinput/store/casting.selectors';
import { addCustomerDetails } from '../../store/material.actions';
import { DashboardService } from '../../../services/dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';


@Component({
  selector: 'app-update-customer-details',
  templateUrl: './update-customer-details.component.html',
  styleUrls: ['./update-customer-details.component.css']
})
export class UpdateCustomerDetailsComponent implements OnInit {
  customer$ : Observable<any>;
  customer: any[] = [];
  processes: Process[] =[];
  castingData: CastingData[] | null = null;
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
  showAddProcessSelector: boolean = false;
  selectedProcessToAdd: any = null;
  currentStatus: string = 'pending'; // Store current status to preserve it on update
  quotationData: any;
  quotationCalc: any;
  today: Date = new Date();
  castingWeightKg : number = 0;
  yeild : number = 0;
  NoOfMouldperHeat : number = 0;
  meterialRefund : number = 0;
  isSaved = false;
  storedRevision: number | null = null;
  ID : string | null = null;
  storedCustomerId: string | null = null;
  storedRevisionData: any = null;
  revisionCount: number = 0;
  showRevisionDetails: boolean = false;
  hasUserEdits: boolean = false;
  isApplyingRevision: boolean = false;
  pendingRevisionIncrement: boolean = false;


   



   @ViewChild('stepper') stepper!: MatStepper;

  thirdFormGroup!: FormGroup;
  isLinear = true;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  costForm: FormGroup;
  forthFormGroup!: FormGroup;
  costSummaryFormGroup!: FormGroup;



  constructor( private store: Store, private fb: FormBuilder, 
    private dialog: MatDialog,  
     @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UpdateCustomerDetailsComponent>,
    private dhashboardServices: DashboardService ,
    private tooster: ToastrService,
    private actions$: Actions
   ) { }

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
  this.costForm.valueChanges.subscribe(() => {
    if (!this.isApplyingRevision) {
      this.hasUserEdits = true;
    }
  });
    this.store.dispatch(loadCustomers());
    this.store.dispatch(loadProcesses());
   
   

  

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

    // Subscribe to updateCustomerDetailsSuccess and addCustomerDetailsSuccess to capture revision
    this.actions$.pipe(
      ofType(updateCustomerDetailsSuccess, addCustomerDetailsSuccess),
      take(1)
    ).subscribe((action: any) => {
      if (action && action.customer) {
        this.storedRevision = action.customer.revision || action.customer.data?.revision || null;
        this.ID = action.customer.ID || action.customer.data?.ID || null;
        this.storedCustomerId = action.customer._id || action.customer.data?._id || null;
        this.setRevisionData(action.customer);
        console.log('✅ Customer updated/added successfully. Revision:', this.storedRevision, 'Customer ID:', this.storedCustomerId);
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

// Initialize selectedProcesses as empty array if not already set
if (!this.selectedProcesses) {
  this.selectedProcesses = [];
}



this.store.select(getCustomerWithId).subscribe((state) => {
  console.log(' Selector State:', state);

   if (state?.customer?._id) {
    // Save customer ID
   
    this.customerId = state.customer._id;
     console.log('customer ID', this.customerId);
  }

  if (state?.customer) {
    const extractedId = state.customer.ID || state.customer.data?.ID || null;
    if (extractedId) {
      this.ID = extractedId;
      console.log('Stored Customer API ID:', this.ID);
    }
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

if (this.data?.mode === 'edit' && this.data.customerData) {
    const customer = JSON.parse(JSON.stringify(this.data.customerData));

    this.editId = customer._id; 
    this.customerId = customer._id || this.customerId;
    const initialId = customer.ID || customer.data?.ID || customer._id || null;
    if (initialId) {
      this.ID = initialId;
    }

    this.selectedProcesses = this.cloneProcesses(customer.processName || []);

this.secondFormGroup.valueChanges.subscribe(values => {
  const { CastingWeight = 0, Cavities = 0, PouringWeight = 1 } = values;

  if (!this.isApplyingRevision) {
    this.hasUserEdits = true;
  }

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
      selectedProcesses: this.selectedProcesses
    });

    this.isApplyingRevision = true;
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
      highPressureCleaning: customer.specialProcess?.highPressureCleaning || 0,
      otherConsumables: customer.otherConsumables?.otherConsumableCost || 0,
       power1 :customer.powerCost?.MeltAndOthersPower || 0,
      power2 : customer.powerCost?.mouldPower || 0,
      power3 : customer.powerCost?.corePower || 0,

    });
    this.isApplyingRevision = false;

    // Initialize selectedProcesses (will be overridden by setRevisionData if revision exists)
    if (!this.selectedProcesses || this.selectedProcesses.length === 0) {
      this.selectedProcesses = this.cloneProcesses(customer.processName || []);
    }
    
    // Store current Status to preserve it on update
    this.currentStatus = customer.Status || 
                        (customer.revision && Array.isArray(customer.revision) && customer.revision.length > 0 
                          ? customer.revision[customer.revision.length - 1]?.Status 
                          : null) ||
                        'pending';
    
    // Store revision and customer ID from existing data if available
    this.setRevisionData(customer);
    if (customer.revision !== undefined) {
      this.storedRevision = customer.revision;
    }
    if (customer._id) {
      this.storedCustomerId = customer._id;
    }
    if (customer.ID) {
      this.ID = customer.ID;
    }
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
  const selectedInputs = this.firstFormGroup.value;
  const flatFields: any = {};

  this.hasUserEdits = true;

  if (selectedInputs.CastingInput) {
    flatFields['castingInputs'] = true;
    flatFields['CastingWeight'] = this.secondFormGroup.value.CastingWeight;
    flatFields['Cavities'] = this.secondFormGroup.value.Cavities;
    flatFields['PouringWeight'] = this.secondFormGroup.value.PouringWeight;
  }

  if (selectedInputs.MouldingInput) {
    flatFields['mouldingInputs'] = true;
    flatFields['MouldingWeight'] = this.secondFormGroup.value.MouldingWeight;
    flatFields['BakeMoulding'] = this.secondFormGroup.value.BakeMoulding;
  }
  
  if (selectedInputs.CoreInput) {
    flatFields['coreInputs'] = true;
    flatFields['CoreWeight'] = this.secondFormGroup.value.CoreWeight;
    flatFields['CoresPerMould'] = this.secondFormGroup.value.CoresPerMould;
    flatFields['CoreCavities'] = this.secondFormGroup.value.CoreCavities;
    flatFields['ShootingPerShift'] = this.secondFormGroup.value.ShootingPerShift;
    flatFields['CoreSand'] = this.secondFormGroup.value.CoreSand;
  }

  console.log('📝 Flattened Input Data:', flatFields);

}


// submitCostForm(revision?: number, customerId?: string, id?: string): void {
//   // Use passed parameters or stored values
//   const finalRevision = revision !== undefined ? revision : this.storedRevision;
//   const ID = id || this.ID;

//   const finalCustomerId = customerId || this.storedCustomerId;
  
//   console.log('Submitted Cost Form:', this.costForm.value);
//   console.log('Revision:', finalRevision);
//   console.log('Customer ID:', finalCustomerId);
  
//   this.isSaved = true;
  
//   // You can use finalRevision and finalCustomerId here for further processing
// }

processdata(){
  const selectedProcessObjects = this.thirdFormGroup.value.selectedProcesses || [];
  const processType = selectedProcessObjects.map((p: any) => p.processName || p.name);

  console.log('processType:', processType);
  this.selectedProcesses = this.cloneProcesses(selectedProcessObjects);
  console.log('✅ Stored selectedProcesses:', this.selectedProcesses);

}


finalSubmit() {
  const first = this.firstFormGroup.value;
  const second = this.secondFormGroup.value;
  const cost = this.costForm.value;
  
  // Get the full process data (with updated quantities/costs)
  const fullProcessData = this.getFullUpdatedProcessData();
  const revisionValue = this.getCurrentRevisionNumber();

  // Extract process names from full process data
  const processName = fullProcessData.map((p: any) => p.processName || p.name);

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
    otherConsumables: cost.otherConsumables,
    Status: this.currentStatus, // Preserve existing status
    revision: revisionValue  
  };

  console.log(' Final Submission JSON:', finalData);

  if(this.data?.mode === 'edit'){
    // Dispatch updateCustomerDetails and wait for success response
    this.store.dispatch(updateCustomerDetails({ id: this.editId!, customer: finalData }));
    
    // Subscribe to success action to get revision (one-time subscription)
    this.actions$.pipe(
      ofType(updateCustomerDetailsSuccess),
      take(1)
    ).subscribe((action: any) => {
      if (action && action.customer) {
        const revision = action.customer.revision || action.customer.data?.revision || null;
        const customerId = action.customer._id || action.customer.data?._id || null;
        const responseId = action.customer.ID || action.customer.data?.ID || null;
        
        // Store revision and customer ID only when provided
        if (revision !== null && revision !== undefined) {
          this.storedRevision = revision;
        }
        if (customerId) {
          this.storedCustomerId = customerId;
        }
        if (responseId) {
          this.ID = responseId;
        } else if (!this.ID && customerId) {
          this.ID = customerId;
        }
        
        console.log('✅ Customer updated. Revision:', revision, 'Customer ID:', customerId);
        
        // Call submitCostForm with revision and customerId
      }
    });
  } else {
    // Dispatch addCustomerDetails and wait for success response
    this.store.dispatch(addCustomerDetails({ customer: finalData }));
    
    // Subscribe to success action to get revision (one-time subscription)
    this.actions$.pipe(
      ofType(addCustomerDetailsSuccess),
      take(1)
    ).subscribe((action: any) => {
      if (action && action.customer) {
        const revision = action.customer.revision || action.customer.data?.revision || null;
        const ID = action.customer.ID || action.customer.data?.ID || null;
        const customerId = action.customer._id || action.customer.data?._id || null;
        
        // Store revision and customer ID
        if (revision !== null && revision !== undefined) {
          this.storedRevision = revision;
        }
        if (customerId) {
          this.storedCustomerId = customerId;
        }
        if (ID) {
          this.ID = ID;
        } else if (!this.ID && customerId) {
          this.ID = customerId;
        }
        
        console.log('✅ Customer added. Revision:', revision, 'Customer ID:', customerId);
        
        // Call submitCostForm with revision and customerId
      }
    });
  }
  
  this.store.dispatch(loadCustomerDetails());
}










generateFinalJson(): void {
  const first = this.firstFormGroup.value;
  const second = this.secondFormGroup.value;
  const cost = this.costForm.value;
  this.isSaved = true;

  const fullProcessData = this.getFullUpdatedProcessData();
const revisionValue = this.getCurrentRevisionNumber();

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
    Status: this.currentStatus, // Preserve existing status

    powerCost: {
    MeltAndOthersPower: cost.power1,
    mouldPower: cost.power2,
    corePower: cost.power3
},
revision: revisionValue

  };

  console.log(' Final Full JSON Format:', finalData);
    this.store.dispatch(updateCustomerDetails({ id: this.editId!, customer: finalData }));
    
    // Subscribe to success action to get revision
    this.actions$.pipe(
      ofType(updateCustomerDetailsSuccess),
      take(1)
    ).subscribe((action: any) => {
      console.log('action:', action);
      if (action && action.customer) {
        const revision = action.customer.revision || action.customer.data?.revision || null;
        const customerId = action.customer._id || action.customer.data?._id || null;
        
        // Store revision and customer ID
        this.storedRevision = revision;
        this.storedCustomerId = customerId;
        
        console.log('✅ Customer updated. Revision:', revision, 'Customer ID:', customerId);
      }
    });

// ✅ Call the API here using form values (use revision array length)
  const custID = this.ID !== null ? this.ID : '';
console.log('📊 Revision array length:', revisionValue);

this.dhashboardServices.getQuoteData(first.customerName, first.drawing, first.partNo, custID, revisionValue).subscribe(
    response => {
      console.log('Calculation ', response);

      this.quotationData = response;
      this.quotationCalc = response.calculations?.[0] || {};
    },
    error => {
      console.error('API Error:', error);
    }
  );

if (this.pendingRevisionIncrement) {
  this.revisionCount = revisionValue;
  this.storedRevision = revisionValue;
  this.pendingRevisionIncrement = false;
  this.hasUserEdits = false;
}
}



submitForm() {
   this.tooster.success('Customer Details updated successfully!', 'Success');
   this.store.dispatch(loadCustomerDetails())
  this.dialogRef.close(); 
}

  toggleRow(index: number): void {
    this.expandedRowIndex = this.expandedRowIndex === index ? null : index;
  }

  logUpdatedData() {
    console.log('Updated Processes:', this.selectedProcesses);
    this.hasUserEdits = true;
  }

  // Toggle add process selector
  toggleAddProcessSelector(): void {
    this.showAddProcessSelector = !this.showAddProcessSelector;
    if (this.showAddProcessSelector) {
      this.selectedProcessToAdd = null;
    }
  }

  // Get available processes that can be added
  getAvailableProcesses(): Process[] {
    const currentProcessIds = (this.selectedProcesses || []).map((p: any) => p._id);
    return this.processes.filter((p: Process) => !currentProcessIds.includes(p._id));
  }

  // Add the selected process
  confirmAddProcess(): void {
    if (!this.selectedProcessToAdd) {
      this.tooster.warning('Please select a process to add', 'Warning');
      return;
    }

    const processName = this.selectedProcessToAdd.processName;
    const clonedProcess = this.cloneProcesses([this.selectedProcessToAdd])[0];
    if (!this.selectedProcesses) {
      this.selectedProcesses = [];
    }
    this.selectedProcesses.push(clonedProcess);
    this.hasUserEdits = true;
    this.showAddProcessSelector = false;
    this.selectedProcessToAdd = null;
    this.tooster.success(`Process "${processName}" added successfully`, 'Success');
  }

  // Cancel adding process
  cancelAddProcess(): void {
    this.showAddProcessSelector = false;
    this.selectedProcessToAdd = null;
  }

  // Delete a process
  deleteProcess(index: number): void {
    const process = this.selectedProcesses[index];
    const processName = process?.processName || process?.name || 'this process';
    
    if (confirm(`Are you sure you want to delete "${processName}"?`)) {
      this.selectedProcesses.splice(index, 1);
      // Close expanded row if it was the deleted one
      if (this.expandedRowIndex === index) {
        this.expandedRowIndex = null;
      } else if (this.expandedRowIndex !== null && this.expandedRowIndex > index) {
        // Adjust expanded index if a row before it was deleted
        this.expandedRowIndex = this.expandedRowIndex - 1;
      }
      this.hasUserEdits = true;
      this.tooster.success(`Process "${processName}" deleted successfully`, 'Success');
    }
  }

  // Get grade name from process (handles different grade structures)
  getProcessGradeName(process: any): string {
    if (!process || !process.grade) {
      return 'Material';
    }

    if (Array.isArray(process.grade) && process.grade.length > 0) {
      const firstGrade = process.grade[0];
      
      if (Array.isArray(firstGrade) && firstGrade.length > 0) {
        // Nested structure: grade[0] is an array
        const gradeObj = firstGrade[0];
        return gradeObj?.gradeNo || gradeObj?.name || 'Material';
      } else if (firstGrade) {
        // Direct structure: grade[0] is a grade object
        return firstGrade.gradeNo || firstGrade.name || 'Material';
      }
    }
    
    return 'Material';
  }

  // Get raw materials from a process (handles both grade and direct rawMaterial)
  getProcessRawMaterials(process: any): any[] {
    const rawMaterials: any[] = [];
    
    // Check if process has grade structure
    if (process.grade && Array.isArray(process.grade) && process.grade.length > 0) {
      const firstGrade = process.grade[0];
      
      if (Array.isArray(firstGrade) && firstGrade.length > 0) {
        // Nested structure: grade[0] is an array
        const gradeObj = firstGrade[0];
        if (gradeObj && gradeObj.rawMaterial && Array.isArray(gradeObj.rawMaterial)) {
          return gradeObj.rawMaterial;
        }
      } else if (firstGrade && firstGrade.rawMaterial && Array.isArray(firstGrade.rawMaterial)) {
        // Direct structure: grade[0] is a grade object
        return firstGrade.rawMaterial;
      }
    } else if (process.rawMaterial && Array.isArray(process.rawMaterial)) {
      // Direct rawMaterial on process
      return process.rawMaterial;
    }
    
    return rawMaterials;
  }

  calculateProcessTotalCost(process: any): number {
    let total = 0;

    if (process.grade && Array.isArray(process.grade) && process.grade.length > 0) {
      const firstGrade = process.grade[0];
      
      // Check if firstGrade is an array (nested structure) or a direct object
      if (Array.isArray(firstGrade)) {
        // Nested structure: grade[0] is an array
        for (let g of firstGrade) {
          if (g && g.rawMaterial && Array.isArray(g.rawMaterial)) {
            for (let rm of g.rawMaterial) {
              if (rm && rm.materialsUsed && Array.isArray(rm.materialsUsed)) {
                for (let m of rm.materialsUsed) {
                  const qty = m.updatedQuantity || m.quantity || 0;
                  const cost = m.updatedUnitCost || m.unitCost || 0;
                  total += qty * cost;
                }
              }
            }
          }
        }
      } else if (firstGrade && firstGrade.rawMaterial && Array.isArray(firstGrade.rawMaterial)) {
        // Direct structure: grade[0] is a grade object
        for (let rm of firstGrade.rawMaterial) {
          if (rm && rm.materialsUsed && Array.isArray(rm.materialsUsed)) {
            for (let m of rm.materialsUsed) {
              const qty = m.updatedQuantity || m.quantity || 0;
              const cost = m.updatedUnitCost || m.unitCost || 0;
              total += qty * cost;
            }
          }
        }
      }
    } else if (process.rawMaterial && Array.isArray(process.rawMaterial) && process.rawMaterial.length > 0) {
      for (let rm of process.rawMaterial) {
        if (rm && rm.materialsUsed && Array.isArray(rm.materialsUsed)) {
          for (let m of rm.materialsUsed) {
            const qty = m.updatedQuantity || m.quantity || 0;
            const cost = m.updatedUnitCost || m.unitCost || 0;
            total += qty * cost;
          }
        }
      }
    }

    return total;
  }


 getFullUpdatedProcessData(): any[] {
  // Use selectedProcesses if available, otherwise use storedRevisionData
  const processesToUse = this.selectedProcesses && this.selectedProcesses.length > 0 
    ? this.selectedProcesses 
    : (this.storedRevisionData?.processName || []);
  
  return processesToUse.map(process => {
    const newProcess = { ...process };

    // Handle grade structure - can be nested array or simple array
    if (newProcess.grade && Array.isArray(newProcess.grade) && newProcess.grade.length > 0) {
      newProcess.grade = newProcess.grade.map((inner: any) => {
        // Check if inner is an array (nested structure)
        if (Array.isArray(inner)) {
          return inner.map((g: any) => {
            if (g && g.rawMaterial && Array.isArray(g.rawMaterial)) {
              return {
                ...g,
                rawMaterial: g.rawMaterial.map((rm: any) => ({
                  type: rm.type,
                  materialsUsed: (rm.materialsUsed || []).map((mat: any) => ({
                    name: mat.name,
                    updateQuantity: mat.updatedQuantity ?? mat.quantity,
                    updateCost: mat.updatedUnitCost ?? mat.unitCost
                  }))
                }))
              };
            }
            return g;
          });
        } else {
          // inner is a grade object directly
          if (inner && inner.rawMaterial && Array.isArray(inner.rawMaterial)) {
            return {
              ...inner,
              rawMaterial: inner.rawMaterial.map((rm: any) => ({
                type: rm.type,
                materialsUsed: (rm.materialsUsed || []).map((mat: any) => ({
                  name: mat.name,
                  updateQuantity: mat.updatedQuantity ?? mat.quantity,
                  updateCost: mat.updatedUnitCost ?? mat.unitCost
                }))
              }))
            };
          }
          return inner;
        }
      });
    } else if (newProcess.rawMaterial && Array.isArray(newProcess.rawMaterial) && newProcess.rawMaterial.length > 0) {
      newProcess.rawMaterial = newProcess.rawMaterial.map((rm: any) => ({
        type: rm.type,
        materialsUsed: (rm.materialsUsed || []).map((mat: any) => ({
          name: mat.name,
          updateQuantity: mat.updatedQuantity ?? mat.quantity,
          updateCost: mat.updatedUnitCost ?? mat.unitCost
        }))
      }));
    }

    return newProcess;
  });
}


// generateFinalJsonFromLoadedData(): void {
//   const d = this.data?.customerData || this.customer?.[0];
//   if (!d) {
//     console.error(' No customer data available');
//     return;
//   }
//   const fullProcessData = this.getFullUpdatedProcessData();
// const revisionValue = this.getCurrentRevisionNumber();
//    const finalData: any = {
//     CustomerName: d.CustomerName?.name  ?? '',  
//     drawingNo: d.drawingNo ?? '',
//     partName: d.partName ?? '',
//     processName: fullProcessData,

//     castingInputs: !!d.castingInputs,
//     ...(d.castingInputs && {
//       CastingWeight: d.castingInputs?.CastingWeight ?? 0,
//       Cavities: d.castingInputs?.Cavities ?? 0,
//       PouringWeight: d.castingInputs?.PouringWeight ?? 0
//     }),

//     mouldingInputs: !!d.mouldingInputs,
//     ...(d.mouldingInputs && {
//       MouldingWeight: d.mouldingInputs?.MouldingWeight ?? 0,
//       BakeMoulding: d.mouldingInputs?.BakeMoulding ?? 0
//     }),

//     coreInputs: !!d.coreInputs,
//     ...(d.coreInputs && {
//       CoreWeight: d.coreInputs?.CoreWeight ?? 0,
//       CoresPerMould: d.coreInputs?.CoresPerMould ?? 0,
//       CoreCavities: d.coreInputs?.CoreCavities ?? 0,
//       ShootingPerShift: d.coreInputs?.ShootingPerShift ?? 0,
//       CoreSand: d.coreInputs?.CoreSand ?? 0
//     }),

//     // Salary & Wages
//     salaryforProcess: d.SalaryAndWages?.salaryforProcess ?? 0,
//     salaryExcludingCoreMaking: d.SalaryAndWages?.salaryExcludingCoreMaking ?? 0,
//     salaryForCoreProduction: d.SalaryAndWages?.salaryForCoreProduction ?? 0,
//     outSourcingCost: d.SalaryAndWages?.outSourcingCost ?? 0,
//     splOutSourcingCost: d.SalaryAndWages?.splOutSourcingCost ?? 0,

//     // Overheads
//     repairAndMaintenance: d.OverHeads?.repairAndMaintenance ?? 0,
//     sellingDistributionAndMiscOverHeads: d.OverHeads?.sellingDistributionAndMiscOverHeads ?? 0,
//     financeCost: d.OverHeads?.financeCost ?? 0,

//     // Commercial Terms
//     paymentCreditPeriod: d.CommercialTerms?.paymentCreditPeriod ?? 0,
//     bankInterest: d.CommercialTerms?.bankInterest ?? 0,

//     // Margin & Rejection
//     profit: d.Margin?.profit ?? 0,
//     rejection: d.AnticipatedRejection?.rejection ?? 0,

//     // UltraSonicWashing
//     heatTreatment: d.UltraSonicWashing?.heatTreatment ?? 0,
//     postProcess: d.UltraSonicWashing?.postProcess ?? 0,
//     packingAndTransport: d.UltraSonicWashing?.packingAndTransport ?? 0,
//     NozzleShotBlasting: d.UltraSonicWashing?.NozzleShotBlasting ?? 0,

//     // Special Process
//   highPressureCleaning: d.specialProcess?.highPressureCleaning ?? 0,
//   revision: revisionValue
//   };
  

//   console.log(' Final JSON from Loaded Data:', finalData);

//   if (this.pendingRevisionIncrement) {
//     this.revisionCount = revisionValue;
//     this.storedRevision = revisionValue;
//     this.pendingRevisionIncrement = false;
//     this.hasUserEdits = false;
//   }
// }

createNewRevision(revision?: number, customerId?: string, id?: string): void {

  // Use passed parameters or stored values
  this.revisionCount = this.revisionCount + 1;
  console.log('Revision Count:', this.revisionCount);
  this.generateFinalJsonForNewRevision();
  this.isSaved = true;
  
}

generateFinalJsonForNewRevision(): void {
  const first = this.firstFormGroup.value;
  const second = this.secondFormGroup.value;
  const cost = this.costForm.value;
  this.isSaved = true;

  const fullProcessData = this.getFullUpdatedProcessData();
const revisionValue = this.getCurrentRevisionNumber();

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
    Status: this.currentStatus, // Preserve existing status

    powerCost: {
    MeltAndOthersPower: cost.power1,
    mouldPower: cost.power2,
    corePower: cost.power3
},
revision: revisionValue

  };

  console.log(' Final Full JSON Format:', finalData);
    this.store.dispatch(updateCustomerDetails({ id: this.editId!, customer: finalData }));
    
    // Subscribe to success action to get revision
    this.actions$.pipe(
      ofType(updateCustomerDetailsSuccess),
      take(1)
    ).subscribe((action: any) => {
      console.log('action:', action);
      if (action && action.customer) {
        const revision = action.customer.revision || action.customer.data?.revision || null;
        const customerId = action.customer._id || action.customer.data?._id || null;
        
        // Store revision and customer ID
        this.storedRevision = revision;
        this.storedCustomerId = customerId;
        
        console.log('✅ Customer updated. Revision:', revision, 'Customer ID:', customerId);
      }
    });

// ✅ Call the API here using form values (use revision array length)
  const custID = this.ID !== null ? this.ID : '';
console.log('📊 Revision array length:', revisionValue);

this.dhashboardServices.getQuoteData(first.customerName, first.drawing, first.partNo, custID, revisionValue).subscribe(
    response => {
      console.log('Calculation ', response);

      this.quotationData = response;
      this.quotationCalc = response.calculations?.[0] || {};
    },
    error => {
      console.error('API Error:', error);
    }
  );

if (this.pendingRevisionIncrement) {
  this.revisionCount = revisionValue;
  this.storedRevision = revisionValue;
  this.pendingRevisionIncrement = false;
  this.hasUserEdits = false;
}
}

private getCurrentRevisionNumber(): number {
  let base = this.revisionCount || 0;

  if (!base && Array.isArray(this.data?.customerData?.revision)) {
    base = this.data.customerData.revision.length;
  }

  if (!base && typeof this.storedRevision === 'number') {
    base = this.storedRevision;
  }

  if (!base && Array.isArray(this.storedRevisionData?.processName)) {
    base = 1;
  }

  if (this.pendingRevisionIncrement) {
    return base + 1;
  }

  return base;
}

getRevisionTotalCost(revision: any): number {
  if (revision?.totalProcessCost) {
    return revision.totalProcessCost;
  }
  if (revision?.processName && Array.isArray(revision.processName)) {
    return revision.processName.reduce((sum: number, process: any) => {
      return sum + (process.processCost || 0);
    }, 0);
  }
  return 0;
}

toggleRevisionDetails(): void {
  this.showRevisionDetails = !this.showRevisionDetails;
}

onStepChange(event: any): void {
  if (event.selectedIndex === 3) {
    this.refreshRevisionData();
  }
}

refreshRevisionData(): void {
  if (this.hasUserEdits) {
    return;
  }

  if (this.data?.customerData) {
    this.setRevisionData(this.data.customerData);
  } else if (this.storedCustomerId) {
    this.store.select(getCustomerWithId).pipe(take(1)).subscribe((state) => {
      if (state?.customer) {
        this.setRevisionData(state.customer);
      }
    });
  }
}

private setRevisionData(customer: any): void {
  const revisionArray = customer?.revision || customer?.Revision;
  if (revisionArray && Array.isArray(revisionArray) && revisionArray.length > 0) {
    this.revisionCount = revisionArray.length;
    this.storedRevisionData = revisionArray[revisionArray.length - 1];
    // Preserve Status from latest revision if available
    if (this.storedRevisionData?.Status) {
      this.currentStatus = this.storedRevisionData.Status;
    }
    this.applyRevisionData(this.storedRevisionData);
  } else {
    this.revisionCount = Array.isArray(revisionArray) ? revisionArray.length : Number(revisionArray || 0);
    this.storedRevisionData = null;
  }
}

private applyRevisionData(revision: any): void {
  if (!revision) {
    return;
  }

  const castingInputs = revision.castingInputs;
  const mouldingInputs = revision.mouldingInputs;
  const coreInputs = revision.coreInputs;

  if (castingInputs) {
    this.firstFormGroup.patchValue({ CastingInput: true });
    this.secondFormGroup.patchValue({
      CastingWeight: castingInputs.CastingWeight || 0,
      Cavities: castingInputs.Cavities || 0,
      PouringWeight: castingInputs.PouringWeight || 0
    });
  }

  if (mouldingInputs) {
    this.firstFormGroup.patchValue({ MouldingInput: true });
    this.secondFormGroup.patchValue({
      MouldingWeight: mouldingInputs.MouldingWeight || 0,
      BakeMoulding: mouldingInputs.BakeMoulding || 0
    });
  }

  if (coreInputs) {
    this.firstFormGroup.patchValue({ CoreInput: true });
    this.secondFormGroup.patchValue({
      CoreWeight: coreInputs.CoreWeight || 0,
      CoresPerMould: coreInputs.CoresPerMould || 0,
      CoreCavities: coreInputs.CoreCavities || 0,
      ShootingPerShift: coreInputs.ShootingPerShift || 0,
      CoreSand: coreInputs.CoreSand || 0
    });
  }

  if (revision.SalaryAndWages) {
    const salary = revision.SalaryAndWages;
    this.costForm.patchValue({
      salaryforProcess: salary.salaryforProcess || 0,
      salaryExcludingCoreMaking: salary.salaryExcludingCoreMaking || 0,
      salaryForCoreProduction: salary.salaryForCoreProduction || 0,
      outSourcingCost: salary.outSourcingCost || 0,
      splOutSourcingCost: salary.splOutSourcingCost || 0
    });
  }

  if (revision.OverHeads) {
    const overHeads = revision.OverHeads;
    this.costForm.patchValue({
      repairAndMaintenance: overHeads.repairAndMaintenance || 0,
      sellingDistributionAndMiscOverHeads: overHeads.sellingDistributionAndMiscOverHeads || 0,
      financeCost: overHeads.financeCost || 0
    });
  }

  if (revision.CommercialTerms) {
    const commercial = revision.CommercialTerms;
    this.costForm.patchValue({
      paymentCreditPeriod: commercial.paymentCreditPeriod || 0,
      bankInterest: commercial.bankInterest || 0
    });
  }

  if (revision.Margin) {
    this.costForm.patchValue({ profit: revision.Margin.profit || 0 });
  }

  if (revision.AnticipatedRejection) {
    this.costForm.patchValue({ rejection: revision.AnticipatedRejection.rejection || 0 });
  }

  if (revision.UltraSonicWashing) {
    const ultra = revision.UltraSonicWashing;
    this.costForm.patchValue({
      heatTreatment: ultra.heatTreatment || 0,
      postProcess: ultra.postProcess || 0,
      packingAndTransport: ultra.packingAndTransport || 0,
      NozzleShotBlasting: ultra.NozzleShotBlasting || 0
    });
  }

  if (revision.specialProcess) {
    this.costForm.patchValue({
      highPressureCleaning: revision.specialProcess.highPressureCleaning || 0
    });
  }

  if (revision.otherConsumables) {
    this.costForm.patchValue({
      otherConsumables: revision.otherConsumables.otherConsumableCost || 0
    });
  }

  if (revision.powerCost) {
    this.costForm.patchValue({
      power1: revision.powerCost.MeltAndOthersPower || 0,
      power2: revision.powerCost.mouldPower || 0,
      power3: revision.powerCost.corePower || 0
    });
  }

  if (revision.processName && Array.isArray(revision.processName)) {
    this.selectedProcesses = this.cloneProcesses(revision.processName);
    this.thirdFormGroup.patchValue({ selectedProcesses: this.selectedProcesses });
  }
}

private cloneProcesses(processes: any[]): any[] {
  return (processes || []).map((p) => {
    const process = { ...p };

    // Handle grade structure - can be nested array or simple array
    if (process.grade && Array.isArray(process.grade) && process.grade.length > 0) {
      process.grade = process.grade.map((inner: any) => {
        // Check if inner is an array (nested structure)
        if (Array.isArray(inner)) {
          return inner.map((g: any) => {
            if (g && g.rawMaterial && Array.isArray(g.rawMaterial)) {
              return {
                ...g,
                rawMaterial: g.rawMaterial.map((rm: any) => ({
                  ...rm,
                  materialsUsed: (rm.materialsUsed || []).map((m: any) => ({
                    ...m,
                    updatedQuantity: m.updatedQuantity ?? m.quantity ?? 0,
                    updatedUnitCost: m.updatedUnitCost ?? m.unitCost ?? 0,
                  })),
                })),
              };
            }
            return g;
          });
        } else {
          // inner is a grade object directly
          if (inner && inner.rawMaterial && Array.isArray(inner.rawMaterial)) {
            return {
              ...inner,
              rawMaterial: inner.rawMaterial.map((rm: any) => ({
                ...rm,
                materialsUsed: (rm.materialsUsed || []).map((m: any) => ({
                  ...m,
                  updatedQuantity: m.updatedQuantity ?? m.quantity ?? 0,
                  updatedUnitCost: m.updatedUnitCost ?? m.unitCost ?? 0,
                })),
              })),
            };
          }
          return inner;
        }
      });
    } else if (process.rawMaterial && Array.isArray(process.rawMaterial) && process.rawMaterial.length > 0) {
      process.rawMaterial = process.rawMaterial.map((rm: any) => ({
        ...rm,
        materialsUsed: (rm.materialsUsed || []).map((m: any) => ({
          ...m,
          updatedQuantity: m.updatedQuantity ?? m.quantity ?? 0,
          updatedUnitCost: m.updatedUnitCost ?? m.unitCost ?? 0,
        })),
      }));
    }

    return process;
  });
}

}
