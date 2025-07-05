import { Component,HostListener, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { loadPowerCosts} from '../../../master/master/store/master.action';
import {getPowerCosts } from '../../../master/master/store/master.selector';
import { PowerCost } from '../../../models/over-head.model';
import {updatePowerCost } from '../store/casting.actions';
import { CastingData } from '../../../models/casting-input.model';
import { getCastingDetails} from '../store/casting.actions';
import { selectCastingData  } from '../store/casting.selectors';
import { getCostSummary } from '../store/casting.actions';
import {selectProductionCost } from '../store/casting.selectors';
import { CostSummary } from '../../../models/casting-input.model';
import {updateProductionCost } from '../store/casting.actions';

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






  constructor(private store: Store) {}


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


  
  }

  



togglePopup(id: string): void {
    this.activePopupId = this.activePopupId === id ? null : id;
  }

  closePopup(): void {
    this.activePopupId = null;
  }

  @HostListener('document:click')
  onClickOutside(): void {
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
    this.store.dispatch(loadPowerCosts());
  }

  this.cancelEditCostPerUnit();
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

saveChanges(section: string) {
  const original = this.costsummary?.find(i => i._id === this.editableItem._id);

  if (original) {
    const updatedData: any = {
      _id: original._id,
    };

    if (section === 'overhead') {
      Object.assign(updatedData, this.editableItem.OverHeads);
    }

    if (section === 'salary') {
      Object.assign(updatedData, this.editableItem.SalaryAndWages);
    }

    // If both should be sent together:
    Object.assign(updatedData, this.editableItem.OverHeads, this.editableItem.SalaryAndWages);

    console.log('Dispatching full updated payload:', updatedData);
    this.store.dispatch(updateProductionCost({ id: original._id, costSummary: updatedData }));
  }

  this.cancelEditMode(section);
}





}