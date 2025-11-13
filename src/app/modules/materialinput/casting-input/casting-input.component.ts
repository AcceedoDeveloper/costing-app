import { Component,HostListener, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { loadPowerCosts} from '../../../master/master/store/master.action';
import {getPowerCosts } from '../../../master/master/store/master.selector';
import { PowerCost } from '../../../models/over-head.model';
import {updatePowerCost, updatePowerCostSuccess, updateProductionCostSuccess, updateCastingFlatSummarySuccess} from '../store/casting.actions';
import { CastingData } from '../../../models/casting-input.model';
import { getCastingDetails} from '../store/casting.actions';
import { selectCastingData  } from '../store/casting.selectors';
import { getCostSummary } from '../store/casting.actions';
import {selectProductionCost } from '../store/casting.selectors';
import { CostSummary } from '../../../models/casting-input.model';
import {updateProductionCost } from '../store/casting.actions';
import {FlatCastingData } from '../../../models/casting-input.model';
import { updateCastingFlatSummary } from '../store/casting.actions'; // Import the new action
import { ProcessService } from '../../../services/process.service';
import { ProductPower } from '../../../models/ProductionPower.model';
import { take, filter } from 'rxjs/operators';


@Component({
  selector: 'app-casting-input',
  templateUrl: './casting-input.component.html',
  styleUrls: ['./casting-input.component.css']
})
export class CastingInputComponent implements OnInit {
 
  powerCosts : PowerCost[] = [];
  costsummary: CostSummary[] | null = null;
    activePopupId: string | null = null;

    editCostPerUnit = false;
editableCostPerUnit: number | null = null;
  castingData: CastingData[] | null = null;


 editMode: { [key: string]: boolean } = {};
editableItem: any = null;

productionPower!: ProductPower;

editablePower: any = {};




  constructor(private store: Store, private processServices: ProcessService) {}


  ngOnInit(): void {

    this.store.dispatch(getCostSummary());

    this.store.pipe(select(selectProductionCost)).subscribe((costSummary: CostSummary[] | null) => {
     
        this.costsummary = costSummary;
        console.log('Cost Summary:', this.costsummary);
      
    });


    this.store.dispatch(getCastingDetails());
    this.store.pipe(select(selectCastingData)).subscribe((castingData: CastingData[] | null) => {
      
        this.castingData = castingData;
        console.log('Casting Data:', this.castingData);
      
    });
    this.store.dispatch(loadPowerCosts());
   this.store.select(getPowerCosts).subscribe((powerCosts: PowerCost[]) => {
    if (powerCosts) {
      this.powerCosts = powerCosts.map(item => ({
        ...item,
        latestPreviousCost: item.previousCostDetails?.[item.previousCostDetails.length - 1]?.cost || null
      }));
      console.log('Processed Power Costs:', this.powerCosts);
    }
  });

this.getPower();
  
  }

  



togglePopup(id: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.activePopupId = this.activePopupId === id ? null : id;
  }

  closePopup(): void {
    this.activePopupId = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.activePopupId) {
      return;
    }
    const target = event.target as HTMLElement;
    // Don't close if clicking inside popup content or on info icon
    if (target.closest('.popup-content') || 
        target.closest('.info-icon') ||
        (target.tagName === 'MAT-ICON' && target.classList.contains('info-icon'))) {
      return;
    }
    // Close popup when clicking outside (overlay click is handled separately in template)
    this.closePopup();
  }


saveCostPerUnit(item: PowerCost) {
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${today.getFullYear()}`;

  if (item._id && this.editableCostPerUnit !== null) {
    const updatedPowerCost: PowerCost = {
      ...item,
      costPerUnit: this.editableCostPerUnit,
      effectiveDate: formattedDate
    };

    this.store.dispatch(updatePowerCost({ id: item._id, powerCost: updatedPowerCost }));
    
    // Wait for success action, then reload data
    this.store.pipe(
      select(state => state),
      filter(() => true),
      take(1)
    ).subscribe(() => {
      setTimeout(() => {
        this.store.dispatch(loadPowerCosts());
        this.cancelEditCostPerUnit();
      }, 500);
    });
  } else {
    this.cancelEditCostPerUnit();
  }
}



cancelEditCostPerUnit() {
  this.editCostPerUnit = false;
  this.editableCostPerUnit = null;
}

enableEdit(currentValue: number) {
  this.editableCostPerUnit = currentValue;
  this.editCostPerUnit = true;
}


enableEditMode(section: string, item: any) {
  this.editMode[section] = true;
  this.editableItem = { ...item, _id: item._id || item?.['_id'] }; // ensure _id is included
   this.editableItem = JSON.parse(JSON.stringify(item))
}

cancelEditMode(section: string) {
  this.editMode[section] = false;
  this.editableItem = null;
}
calculateSalary() {
  if (!this.editableItem || !this.editableItem.SalaryAndWages) {
    return;
  }

  const wages = this.editableItem.SalaryAndWages;

 
  const salaryForProcess = Number(wages.salaryforProcess) || 0;
  const salaryExcludingCoreMaking = Number(wages.salaryExcludingCoreMaking) || 0;
  const salaryForCoreProduction = Number(wages.salaryForCoreProduction) || 0;
  const outSourcingCost = Number(wages.outSourcingCost) || 0;
  const splOutSourcingCost = Number(wages.splOutSourcingCost) || 0;


  wages.TotalOutSourcingCost = outSourcingCost + splOutSourcingCost;


  console.log("Updated Salary & Wages:", wages);
}

saveSlaray(section: string) {
  const original = this.costsummary?.find(i => i._id === this.editableItem._id);
  if (!original) return;

  const wages = this.editableItem.SalaryAndWages;

  const id = wages._id;   
  const data = {
    salaryforProcess: wages.salaryforProcess,
    salaryExcludingCoreMaking: wages.salaryExcludingCoreMaking,
    salaryForCoreProduction: wages.salaryForCoreProduction,
    outSourcingCost: wages.outSourcingCost,
    splOutSourcingCost: wages.splOutSourcingCost,
    TotalOutSourcingCost: wages.TotalOutSourcingCost
  };

  console.log('id:', id);
  console.log('updated data:', data);

  this.processServices.updateSalary(id, data).subscribe({
    next: (res) => {
      console.log('Salary updated', res);
      // Reload data after successful update
      setTimeout(() => {
        this.store.dispatch(getCostSummary());
        this.cancelEditMode(section);
      }, 500);
    },
    error: (err) => {
      console.error('Error updating salary', err);
      this.cancelEditMode(section);
    }
  });
}

saveOverHeads(section: string) {
  const original = this.costsummary?.find(i => i._id === this.editableItem._id);
  if (!original) return;


  const overheads = this.editableItem.OverHeads;
  console.log('data', overheads);
  
  const id = overheads._id;
  const data = {
    repairAndMaintenance: overheads.repairAndMaintenance,
    financeCost: overheads.financeCost,
    sellingDistributionAndMiscOverHeads
: overheads.sellingDistributionAndMiscOverHeads,
  };

  console.log('id:', id);
  console.log('updated data:', data);
  this.processServices.updateOverheads(id, data).subscribe({
    next: (res) => {
      console.log('Overheads updated', res);
      // Reload data after successful update
      setTimeout(() => {
        this.store.dispatch(getCostSummary());
        this.cancelEditMode(section);
      }, 500);
    },
    error: (err) => {
      console.error('Error updating overheads', err);
      this.cancelEditMode(section);
    }
  });
}

saveChanges(section: string) {
  const original = this.costsummary?.find(i => i._id === this.editableItem._id);
  if (!original) return;

  const updatedData: any = {
    _id: original._id,
  };

  if (section === 'salary') {
    Object.assign(updatedData, this.editableItem.SalaryAndWages);
  }

  if (section === 'overhead') {
    Object.assign(updatedData, this.editableItem.OverHeads);
  }

  if (section === 'terms') {
    Object.assign(updatedData, this.editableItem.CommercialTerms);
  }

  if (section === 'margin') {
    Object.assign(updatedData, this.editableItem.Margin);
  }

  if (section === 'rejection') {
    Object.assign(updatedData, this.editableItem.AnticipatedRejection);
  }

  // OR all together:
  Object.assign(
    updatedData,
    this.editableItem.SalaryAndWages,
    this.editableItem.OverHeads,
    this.editableItem.CommercialTerms,
    this.editableItem.Margin,
    this.editableItem.AnticipatedRejection
  );

  console.log('Dispatching full updated payload:', updatedData);
  this.store.dispatch(updateProductionCost({ id: original._id, costSummary: updatedData }));

  // Wait for success action, then reload data
  this.store.pipe(
    select(state => state),
    filter(() => true),
    take(1)
  ).subscribe(() => {
    setTimeout(() => {
      this.store.dispatch(getCostSummary());
      this.cancelEditMode(section);
    }, 500);
  });
}






saveAllCastingChanges() {
  if (!this.editableItem) return;

  const id = this.editableItem._id;

  // ✅ Full nested model for backend
  const updatedCastingData: CastingData = {
    _id: id,
    __v: this.editableItem.__v || 0,

    CastingInput: {
      _id: this.editableItem.CastingInput._id,
      CastingWeight: this.editableItem.CastingInput.CastingWeight,
      Cavities: this.editableItem.CastingInput.Cavities,
      PouringWeight: this.editableItem.CastingInput.PouringWeight,
      CastingWeightKgPerHeat: this.editableItem.CastingInput.CastingWeightKgPerHeat,
      Yeild: this.editableItem.CastingInput.Yeild,
      MaterialReturned: this.editableItem.CastingInput.MaterialReturned,
      YeildPercent: this.editableItem.CastingInput.YeildPercent
    },

    MouldingInput: {
      _id: this.editableItem.MouldingInput._id,
      MouldingWeight: this.editableItem.MouldingInput.MouldingWeight,
      MouldsPerHeat: this.editableItem.MouldingInput.MouldsPerHeat,
      BakeMoulding: this.editableItem.MouldingInput.BakeMoulding
    },

    CoreInput: {
      _id: this.editableItem.CoreInput._id,
      CoreWeight: this.editableItem.CoreInput.CoreWeight,
      CoresPerMould: this.editableItem.CoreInput.CoresPerMould,
      CoreCavities: this.editableItem.CoreInput.CoreCavities,
      ShootingPerShift: this.editableItem.CoreInput.ShootingPerShift,
      CoreSand: this.editableItem.CoreInput.CoreSand
    }
  };


  const flatData: FlatCastingData = {
    CastingWeight: this.editableItem.CastingInput.CastingWeight,
    Cavities: this.editableItem.CastingInput.Cavities,
    PouringWeight: this.editableItem.CastingInput.PouringWeight,
    MouldingWeight: this.editableItem.MouldingInput.MouldingWeight,
    CoreWeight: this.editableItem.CoreInput.CoreWeight,
    CoresPerMould: this.editableItem.CoreInput.CoresPerMould,
    CoreCavities: this.editableItem.CoreInput.CoreCavities,
    ShootingPerShift: this.editableItem.CoreInput.ShootingPerShift,
    CoreSand: this.editableItem.CoreInput.CoreSand
  };

  console.log('✅ Dispatching full update payload:', updatedCastingData);
  console.log('📦 Dispatching flat summary data:', flatData);

  // Dispatch update
  this.store.dispatch(updateCastingFlatSummary({ id, data: flatData }));

  // Wait for success, then reload data
  this.store.pipe(
    select(state => state),
    filter(() => true),
    take(1)
  ).subscribe(() => {
    setTimeout(() => {
      this.store.dispatch(getCastingDetails());
      // Reset state
      this.editMode = {};
      this.editableItem = null;
    }, 500);
  });
}


getPower(): void {
  this.processServices.getProductionCost().subscribe(
    (res: ProductPower[]) => {
      if (res && res.length > 0) {
        this.productionPower = res[0]; // take first element
      }
      console.log('Power data:', this.productionPower);
    },
    (error) => {
      console.error('Error fetching power data:', error);
    }
  );
}

// Inside CastingInputComponent class

// Function to enable edit mode for power
enablePowerEdit() {
  this.editMode['power'] = true;
  // Make a copy of productionPower to avoid direct mutation
  this.editablePower = { ...this.productionPower };
}

// Function to cancel power edit
cancelPowerEdit() {
  this.editMode['power'] = false;
  this.editablePower = {};
}

// Function to save power
savePower() {
  if (!this.editablePower) return;
  console.log('data', this.editablePower);

  const { MeltAndOthersPower, mouldPower, corePower } = this.editablePower; 

  const play = { MeltAndOthersPower, mouldPower, corePower };

  console.log('data', play);
  this.processServices.updatePowerCost(this.editablePower._id, play).subscribe({
    next: (res) => {
      console.log('Update successful:', res);
      // Reload data after successful update
      setTimeout(() => {
        this.getPower();
        this.cancelPowerEdit();
      }, 500);
    },
    error: (err) => {
      console.error('Update failed:', err);
      this.cancelPowerEdit();
    }
  });
}




}