import { Component, OnInit } from '@angular/core';
import {AddpowerCostComponent } from './addpower-cost/addpower-cost.component';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { PowerCost } from '../../../models/over-head.model';
import { getPowerCosts} from '../store/master.selector';
import { loadPowerCosts } from '../store/master.action';

@Component({
  selector: 'app-power-cost',
  templateUrl: './power-cost.component.html',
  styleUrls: ['./power-cost.component.css']
})
export class PowerCostComponent implements OnInit {

  constructor(private dialog: MatDialog, private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(loadPowerCosts());
    this.store.select(getPowerCosts).subscribe((powerCosts: PowerCost[]) => {
      console.log('Power Costs:', powerCosts);
    });
  }

  openAddPowerCostDialog(): void {
    const dialogRef = this.dialog.open(AddpowerCostComponent, {
      width: '400px',
      data: { }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
      }
    });
  }

}
