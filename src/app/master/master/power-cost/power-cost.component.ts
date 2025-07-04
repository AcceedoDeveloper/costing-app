import { Component, OnInit } from '@angular/core';
import {AddpowerCostComponent } from './addpower-cost/addpower-cost.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-power-cost',
  templateUrl: './power-cost.component.html',
  styleUrls: ['./power-cost.component.css']
})
export class PowerCostComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openAddPowerCostDialog(): void {
    const dialogRef = this.dialog.open(AddpowerCostComponent, {
      width: '400px',
      data: { /* pass any data if needed */ }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle the result from the dialog
      }
    });
  }

}
