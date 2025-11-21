import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { MatStepper } from '@angular/material/stepper';
import { ViewChild } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-view-quotation',
  templateUrl: './view-quotation.component.html',
  styleUrls: ['./view-quotation.component.css']
})
export class ViewQuotationComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  
  isLinear = true;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  forthFormGroup!: FormGroup;
  costSummaryFormGroup!: FormGroup;
  costForm: FormGroup;

  quotationData: any = null;
  quotationCalc: any = null;
  today = new Date();
  
  // Revision management
  allRevisions: any[] = [];
  selectedRevisionIndex: number = -1;
  selectedRevision: any = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ViewQuotationComponent>,
    private fb: FormBuilder,
    private dashboardService: DashboardService
  ) {
    this.initializeForms();
    this.initializeRevisions();
  }

  ngOnInit(): void {
    this.loadSelectedRevision();
  }

  // Initialize revisions from customer data
  initializeRevisions(): void {
    const customer = this.data;
    const revisionArray = customer?.revision || customer?.Revision;
    
    if (revisionArray && Array.isArray(revisionArray) && revisionArray.length > 0) {
      this.allRevisions = revisionArray;
      // Default to last revision (index = length - 1)
      this.selectedRevisionIndex = revisionArray.length - 1;
      this.selectedRevision = revisionArray[this.selectedRevisionIndex];
    } else {
      // No revisions, use root customer data
      this.allRevisions = [];
      this.selectedRevisionIndex = -1;
      this.selectedRevision = null;
    }
  }

  // Load data for selected revision
  loadSelectedRevision(): void {
    if (this.selectedRevisionIndex >= 0 && this.selectedRevision) {
      // Use revision data
      this.populateFormsWithRevisionData(this.selectedRevision);
    } else {
      // Use root customer data
      this.populateFormsWithData();
    }
    this.generateQuotationData();
  }

  // Handle revision selection
  onRevisionSelect(revisionIndex: number): void {
    if (revisionIndex >= 0 && revisionIndex < this.allRevisions.length) {
      this.selectedRevisionIndex = revisionIndex;
      this.selectedRevision = this.allRevisions[revisionIndex];
      this.loadSelectedRevision();
    }
  }

  initializeForms(): void {
    this.firstFormGroup = this.fb.group({
      customerName: ['', Validators.required],
      partNo: ['', Validators.required],
      drawing: ['', Validators.required],
      CastingInput: [false],
      MouldingInput: [false],
      CoreInput: [false]
    });

    this.secondFormGroup = this.fb.group({
      CastingWeight: [0],
      Cavities: [0],
      PouringWeight: [0],
      MouldingWeight: [0],
      BakeMoulding: [0],
      CoreWeight: [0],
      CoresPerMould: [0],
      CoreCavities: [0],
      ShootingPerShift: [0],
      CoreSand: [0]
    });

    this.thirdFormGroup = this.fb.group({
      selectedProcesses: this.fb.control([])
    });

    this.forthFormGroup = this.fb.group({});
    this.costSummaryFormGroup = this.fb.group({});

    this.costForm = this.fb.group({
      salaryforProcess: [0],
      salaryExcludingCoreMaking: [0],
      salaryForCoreProduction: [0],
      outSourcingCost: [0],
      splOutSourcingCost: [0],
      repairAndMaintenance: [0],
      sellingDistributionAndMiscOverHeads: [0],
      financeCost: [0],
      paymentCreditPeriod: [0],
      bankInterest: [0],
      profit: [0],
      rejection: [0],
      heatTreatment: [0],
      postProcess: [0],
      packingAndTransport: [0],
      NozzleShotBlasting: [0],
      highPressureCleaning: [0],
      otherConsumables: [0],
      power1: [0],
      power2: [0],
      power3: [0]
    });
  }

  // Populate forms with root customer data
  populateFormsWithData(): void {
    const customer = this.data;
    
    this.firstFormGroup.patchValue({
      customerName: customer.CustomerName?.name || '',
      partNo: customer.partName || '',
      drawing: customer.drawingNo || '',
      CastingInput: !!customer.castingInputs,
      MouldingInput: !!customer.mouldingInputs,
      CoreInput: !!customer.coreInputs
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
      CoreSand: customer.coreInputs?.CoreSand || 0
    });

    this.thirdFormGroup.patchValue({
      selectedProcesses: customer.processName || []
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
      power1: customer.powerCost?.MeltAndOthersPower || 0,
      power2: customer.powerCost?.mouldPower || 0,
      power3: customer.powerCost?.corePower || 0,
      ID : customer.ID || 0
    });
  }

  // Populate forms with revision data
  populateFormsWithRevisionData(revision: any): void {
    const customer = this.data;
    
    // Use revision data, fallback to root customer data if not available in revision
    this.firstFormGroup.patchValue({
      customerName: customer.CustomerName?.name || '',
      partNo: customer.partName || '',
      drawing: customer.drawingNo || '',
      CastingInput: !!(revision.castingInputs || customer.castingInputs),
      MouldingInput: !!(revision.mouldingInputs || customer.mouldingInputs),
      CoreInput: !!(revision.coreInputs || customer.coreInputs)
    });

    this.secondFormGroup.patchValue({
      CastingWeight: revision.castingInputs?.CastingWeight || customer.castingInputs?.CastingWeight || 0,
      Cavities: revision.castingInputs?.Cavities || customer.castingInputs?.Cavities || 0,
      PouringWeight: revision.castingInputs?.PouringWeight || customer.castingInputs?.PouringWeight || 0,
      MouldingWeight: revision.mouldingInputs?.MouldingWeight || customer.mouldingInputs?.MouldingWeight || 0,
      BakeMoulding: revision.mouldingInputs?.BakeMoulding || customer.mouldingInputs?.BakeMoulding || 0,
      CoreWeight: revision.coreInputs?.CoreWeight || customer.coreInputs?.CoreWeight || 0,
      CoresPerMould: revision.coreInputs?.CoresPerMould || customer.coreInputs?.CoresPerMould || 0,
      CoreCavities: revision.coreInputs?.CoreCavities || customer.coreInputs?.CoreCavities || 0,
      ShootingPerShift: revision.coreInputs?.ShootingPerShift || customer.coreInputs?.ShootingPerShift || 0,
      CoreSand: revision.coreInputs?.CoreSand || customer.coreInputs?.CoreSand || 0
    });

    this.thirdFormGroup.patchValue({
      selectedProcesses: revision.processName || customer.processName || []
    });

    this.costForm.patchValue({
      salaryforProcess: revision.SalaryAndWages?.salaryforProcess || customer.SalaryAndWages?.salaryforProcess || 0,
      salaryExcludingCoreMaking: revision.SalaryAndWages?.salaryExcludingCoreMaking || customer.SalaryAndWages?.salaryExcludingCoreMaking || 0,
      salaryForCoreProduction: revision.SalaryAndWages?.salaryForCoreProduction || customer.SalaryAndWages?.salaryForCoreProduction || 0,
      outSourcingCost: revision.SalaryAndWages?.outSourcingCost || customer.SalaryAndWages?.outSourcingCost || 0,
      splOutSourcingCost: revision.SalaryAndWages?.splOutSourcingCost || customer.SalaryAndWages?.splOutSourcingCost || 0,
      repairAndMaintenance: revision.OverHeads?.repairAndMaintenance || customer.OverHeads?.repairAndMaintenance || 0,
      sellingDistributionAndMiscOverHeads: revision.OverHeads?.sellingDistributionAndMiscOverHeads || customer.OverHeads?.sellingDistributionAndMiscOverHeads || 0,
      financeCost: revision.OverHeads?.financeCost || customer.OverHeads?.financeCost || 0,
      paymentCreditPeriod: revision.CommercialTerms?.paymentCreditPeriod || customer.CommercialTerms?.paymentCreditPeriod || 0,
      bankInterest: revision.CommercialTerms?.bankInterest || customer.CommercialTerms?.bankInterest || 0,
      profit: revision.Margin?.profit || customer.Margin?.profit || 0,
      rejection: revision.AnticipatedRejection?.rejection || customer.AnticipatedRejection?.rejection || 0,
      heatTreatment: revision.UltraSonicWashing?.heatTreatment || customer.UltraSonicWashing?.heatTreatment || 0,
      postProcess: revision.UltraSonicWashing?.postProcess || customer.UltraSonicWashing?.postProcess || 0,
      packingAndTransport: revision.UltraSonicWashing?.packingAndTransport || customer.UltraSonicWashing?.packingAndTransport || 0,
      NozzleShotBlasting: revision.UltraSonicWashing?.NozzleShotBlasting || customer.UltraSonicWashing?.NozzleShotBlasting || 0,
      highPressureCleaning: revision.UltraSonicWashing?.highPressureCleaning || customer.UltraSonicWashing?.highPressureCleaning || 0,
      otherConsumables: revision.otherConsumables?.otherConsumableCost || customer.otherConsumables?.otherConsumableCost || 0,
      power1: revision.powerCost?.MeltAndOthersPower || customer.powerCost?.MeltAndOthersPower || 0,
      power2: revision.powerCost?.mouldPower || customer.powerCost?.mouldPower || 0,
      power3: revision.powerCost?.corePower || customer.powerCost?.corePower || 0,
      ID: customer.ID || 0
    });
  }

  generateQuotationData(): void {
    const first = this.firstFormGroup.value;
    console.log(' First Form Group Value:', first);
    console.log(' Data:', this.data);
    console.log(' ID Value:', this.data.ID);
    const ID = this.data.ID;
    
    // Use selected revision index + 1 (since API expects 1-based revision number)
    // If no revision selected, use total revision count (for latest)
    let revisionCount = this.selectedRevisionIndex + 1;
    if (revisionCount <= 0) {
      // Fallback: get total revision count
      const revisionArray = this.data?.revision || this.data?.Revision;
      revisionCount = (revisionArray && Array.isArray(revisionArray)) ? revisionArray.length : 0;
    }
    
    console.log('📊 Selected Revision Index:', this.selectedRevisionIndex);
    console.log('📊 Revision Count for API:', revisionCount);
    
    this.dashboardService.getQuoteData(first.customerName, first.drawing, first.partNo, ID, revisionCount).subscribe(
      response => {
        console.log(' API Success:', response);
        this.quotationData = response;
        this.quotationCalc = response.calculations?.[0] || {};
      },
      error => {
        console.error(' API Error:', error);
      }
    );
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  submitForm(){
    this.dialogRef.close();
  }
}
