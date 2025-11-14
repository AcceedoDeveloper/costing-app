import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-difference-graph-dialog',
  templateUrl: './difference-graph-dialog.component.html',
  styleUrls: ['./difference-graph-dialog.component.css']
})
export class DifferenceGraphDialogComponent implements OnInit {
  actualCost: number = 0;
  processCost: number = 0;
  difference: number = 0;
  maxCost: number = 0; // Max cost for Y-axis scaling
  
  customerName: string = '';
  partName: string = '';
  drawingNo: string = '';
  shortWeight: number = 0;
  meltingLoss: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { item: any, allData: any[] },
    public dialogRef: MatDialogRef<DifferenceGraphDialogComponent>
  ) {}

  ngOnInit(): void {
    this.prepareGraphData();
  }

  prepareGraphData(): void {
    try {
      // Extract values from the selected item
      console.log('Data:', this.data);
      const item = this.data.item;
      
      // Parse values - handle both string and number types
      this.actualCost = typeof item.actualCost === 'string' 
        ? parseFloat(item.actualCost) || 0 
        : (item.actualCost || 0);
      
      this.processCost = typeof item.TotalProcessCost === 'string'
        ? parseFloat(item.TotalProcessCost) || 0
        : (item.TotalProcessCost || 0);
      
      this.difference = typeof item.difference === 'string'
        ? parseFloat(item.difference) || 0
        : (item.difference || 0);
      
      // Set customer and part info
      this.customerName = item.CustomerName?.name || 'N/A';
      this.partName = item.partName || 'N/A';
      this.drawingNo = item.drawingNo || 'N/A';
      
      // Set additional data (using defaults if not available)
      this.shortWeight = item.shortWeight || 672;
      this.meltingLoss = item.meltingLoss || 892;
      
      // Calculate max cost for Y-axis scaling
      const allValues = [
        this.actualCost,
        this.processCost
      ];
      this.maxCost = Math.max(...allValues, 1); // Use 1 as minimum to avoid division by zero
      
      // Round up to nearest nice number for Y-axis
      const magnitude = Math.pow(10, Math.floor(Math.log10(this.maxCost)));
      this.maxCost = Math.ceil(this.maxCost / magnitude) * magnitude;
      
      console.log('Graph Data:', {
        actualCost: this.actualCost,
        processCost: this.processCost,
        difference: this.difference,
        maxCost: this.maxCost
      });
    } catch (error) {
      console.error('Error preparing graph data:', error);
      // Set default values
      this.actualCost = 4500;
      this.processCost = 4000;
      this.difference = 500;
      this.maxCost = 5000;
    }
  }

  getSegmentHeight(value: number): number {
    if (this.maxCost === 0) return 0;
    return (value / this.maxCost) * 100;
  }

  getYAxisLabel(index: number): number {
    return this.maxCost * (1 - index * 0.25);
  }
}


