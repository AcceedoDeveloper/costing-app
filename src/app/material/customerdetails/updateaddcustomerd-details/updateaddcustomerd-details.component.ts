import { Component, Inject, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { MaterialState } from '../../store/material.reducer';
import { getCustomerDetails } from '../../store/material.selector';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { updateCustomerDetails } from '../../store/material.actions';


@Component({
  selector: 'app-updateaddcustomerd-details',
  templateUrl: './updateaddcustomerd-details.component.html',
  styleUrls: ['./updateaddcustomerd-details.component.css']
})
export class UpdateaddcustomerdDetailsComponent implements OnInit {
  customerId: string = '';
  customerData: any;
  selectedProcesses: any[] = [];
  expandedRowIndex: number | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private store: Store<{ materials: MaterialState }>
  ) {
    this.customerId = data.id;
  }

  ngOnInit(): void {
    this.store.select(getCustomerDetails).subscribe((customers) => {
      const customer = customers.find((c) => c._id === this.customerId);
      if (customer) {
        this.customerData = customer;

        this.selectedProcesses = customer.processName.map((p) => {
          const process = { ...p };

          if (process.grade?.length > 0) {
            process.grade = process.grade.map((inner) =>
              inner.map((g) => ({
                ...g,
                rawMaterial: g.rawMaterial.map((rm) => ({
                  ...rm,
                  materialsUsed: rm.materialsUsed.map((m) => ({
                    ...m,
                    updatedQuantity: m.quantity,
                    updatedUnitCost: m.unitCost,
                  })),
                })),
              }))
            );
          } else {
            process.rawMaterial = process.rawMaterial.map((rm) => ({
              ...rm,
              materialsUsed: rm.materialsUsed.map((m) => ({
                ...m,
                updatedQuantity: m.quantity,
                updatedUnitCost: m.unitCost,
              })),
            }));
          }

          return process;
        });
      }
    });
  }

  toggleRow(index: number): void {
    this.expandedRowIndex = this.expandedRowIndex === index ? null : index;
  }

  logUpdatedData() {
    console.log('Updated Processes:', this.selectedProcesses);
  }

  calculateProcessTotalCost(process: any): number {
    let total = 0;

    if (process.grade?.length > 0) {
      for (let g of process.grade[0]) {
        for (let rm of g.rawMaterial) {
          for (let m of rm.materialsUsed) {
            const qty = m.updatedQuantity || m.quantity;
            const cost = m.updatedUnitCost || m.unitCost;
            total += qty * cost;
          }
        }
      }
    } else if (process.rawMaterial?.length > 0) {
      for (let rm of process.rawMaterial) {
        for (let m of rm.materialsUsed) {
          const qty = m.updatedQuantity || m.quantity;
          const cost = m.updatedUnitCost || m.unitCost;
          total += qty * cost;
        }
      }
    }

    return total;
  }


  getFullUpdatedProcessData(): any[] {
  return this.selectedProcesses.map(process => {
    const newProcess = { ...process };

    if (newProcess.grade?.length > 0) {
      newProcess.grade = newProcess.grade.map(inner =>
        inner.map(g => ({
          ...g,
          rawMaterial: g.rawMaterial.map(rm => ({
            ...rm,
            materialsUsed: rm.materialsUsed.map(mat => ({
              ...mat,
              quantity: mat.updatedQuantity ?? mat.quantity,
              unitCost: mat.updatedUnitCost ?? mat.unitCost
            }))
          }))
        }))
      );
    } else {
      newProcess.rawMaterial = newProcess.rawMaterial.map(rm => ({
        ...rm,
        materialsUsed: rm.materialsUsed.map(mat => ({
          ...mat,
          quantity: mat.updatedQuantity ?? mat.quantity,
          unitCost: mat.updatedUnitCost ?? mat.unitCost
        }))
      }));
    }

    return newProcess;
  });
}

generateFinalJsonFromLoadedData(): void {
  if (!this.customerData) {
    console.error('❌ No customer data available');
    return;
  }

  const d = this.customerData;
  const fullProcessData = this.getFullUpdatedProcessData();

  const finalData: any = {
    CustomerName: d.CustomerName?.name ?? '',  // ✅ string only
    drawingNo: d.drawingNo ?? '',
    partName: d.partName ?? '',
    processName: fullProcessData,

    castingInputs: !!d.castingInputs,
    ...(d.castingInputs && {
      CastingWeight: d.castingInputs?.CastingWeight ?? 0,
      Cavities: d.castingInputs?.Cavities ?? 0,
      PouringWeight: d.castingInputs?.PouringWeight ?? 0
    }),

    mouldingInputs: !!d.mouldingInputs,
    ...(d.mouldingInputs && {
      MouldingWeight: d.mouldingInputs?.MouldingWeight ?? 0,
      BakeMoulding: d.mouldingInputs?.BakeMoulding ?? 0
    }),

    coreInputs: !!d.coreInputs,
    ...(d.coreInputs && {
      CoreWeight: d.coreInputs?.CoreWeight ?? 0,
      CoresPerMould: d.coreInputs?.CoresPerMould ?? 0,
      CoreCavities: d.coreInputs?.CoreCavities ?? 0,
      ShootingPerShift: d.coreInputs?.ShootingPerShift ?? 0,
      CoreSand: d.coreInputs?.CoreSand ?? 0
    }),

    // Salary & Wages
    salaryforProcess: d.SalaryAndWages?.salaryforProcess ?? 0,
    salaryExcludingCoreMaking: d.SalaryAndWages?.salaryExcludingCoreMaking ?? 0,
    salaryForCoreProduction: d.SalaryAndWages?.salaryForCoreProduction ?? 0,
    outSourcingCost: d.SalaryAndWages?.outSourcingCost ?? 0,
    splOutSourcingCost: d.SalaryAndWages?.splOutSourcingCost ?? 0,

    // Overheads
    repairAndMaintenance: d.OverHeads?.repairAndMaintenance ?? 0,
    sellingDistributionAndMiscOverHeads: d.OverHeads?.sellingDistributionAndMiscOverHeads ?? 0,
    financeCost: d.OverHeads?.financeCost ?? 0,

    // Commercial Terms
    paymentCreditPeriod: d.CommercialTerms?.paymentCreditPeriod ?? 0,
    bankInterest: d.CommercialTerms?.bankInterest ?? 0,

    // Margin & Rejection
    profit: d.Margin?.profit ?? 0,
    rejection: d.AnticipatedRejection?.rejection ?? 0,

    // UltraSonicWashing
    heatTreatment: d.UltraSonicWashing?.heatTreatment ?? 0,
    postProcess: d.UltraSonicWashing?.postProcess ?? 0,
    packingAndTransport: d.UltraSonicWashing?.packingAndTransport ?? 0,
    NozzleShotBlasting: d.UltraSonicWashing?.NozzleShotBlasting ?? 0,

    // Special Process
    highPressureCleaning: d.specialProcess?.highPressureCleaning ?? 0
  };

  console.log('✅ Final JSON Ready:', finalData);

  if (this.customerId) {
    this.store.dispatch(updateCustomerDetails({ id: this.customerId, customer: finalData }));
  } else {
    console.error('❌ No customer ID to update');
  }
}



}