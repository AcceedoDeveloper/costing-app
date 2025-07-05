import { Component,HostListener, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { loadPowerCosts} from '../../../master/master/store/master.action';
import {getPowerCosts } from '../../../master/master/store/master.selector';
import { PowerCost } from '../../../models/over-head.model';
import {updatePowerCost } from '../store/casting.actions';

@Component({
  selector: 'app-casting-input',
  templateUrl: './casting-input.component.html',
  styleUrls: ['./casting-input.component.css']
})
export class CastingInputComponent implements OnInit {
 
  powerCosts : PowerCost[] = [];
    activePopupId: string | null = null;

    editCostPerUnit = false;
editableCostPerUnit: number | null = null;





  constructor(private store: Store) {}


  ngOnInit(): void {

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
    const updatedpowerCost: PowerCost = {
      costPerUnit: this.editableCostPerUnit,
      effectiveDate: formattedDate,
      _id: item._id,
      previousCostDetails: item.previousCostDetails 
    };

    this.store.dispatch(updatePowerCost({ id: item._id, powerCost: updatedpowerCost }));
    this.store.dispatch(loadPowerCosts());
  }

  this.editCostPerUnit = false;
}



cancelEditCostPerUnit() {
  this.editCostPerUnit = false;
  this.editableCostPerUnit = null;
}

enableEdit(currentValue: number) {
  this.editableCostPerUnit = currentValue;
  this.editCostPerUnit = true;
}

}