import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { loadCoreInputs, updateCoreInput } from '../store/casting.actions';
import { CoreInput } from '../../../models/casting-input.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-core-input',
  templateUrl: './core-input.component.html',
  styleUrls: ['./core-input.component.css']
})
export class CoreInputComponent implements OnInit {
  coreData: CoreInput[] = [];
  displayedColumns: string[] = [
    '_id',
    'CoreSand',
    'CoreWeight',
    'ShootingPerShift',
    'coresPerMould'
  ];
  editMode: { [key: string]: { [field: string]: boolean } } = {};
  editableData: { [key: string]: CoreInput } = {};

  constructor(private store: Store<{ casting: { coreData: CoreInput[] } }>) {}

  ngOnInit(): void {
    this.store.dispatch(loadCoreInputs());

    this.store.pipe(select('casting'), map(state => state.coreData)).subscribe(data => {
      this.coreData = data;
      data.forEach(item => {
        this.editableData[item._id] = { ...item };
        this.editMode[item._id] = {
          CoreSand: false,
          CoreWeight: false,
          ShootingPerShift: false,
          coresPerMould: false
        };
      });
      console.log('Core Inputs:', data);
    });
  }

  toggleEditMode(id: string, field: string): void {
    this.editMode[id][field] = !this.editMode[id][field];
  }

  saveField(item: CoreInput, field: string): void {
    const id = item._id;
    const updatedValue = this.editableData[id][field];

    // Update the specific field in editableData
    this.editableData[id][field] = updatedValue;

    // Build the full updated object including _id
    const updatedItem: CoreInput = {
      _id: id,
      CoreSand: this.editableData[id].CoreSand,
      CoreWeight: this.editableData[id].CoreWeight,
      ShootingPerShift: this.editableData[id].ShootingPerShift,
      coresPerMould: this.editableData[id].coresPerMould,
      Cavities: this.editableData[id].Cavities // Include Cavities if required
    };

    console.log(`Dispatching update for item ${id}:`, updatedItem);

    // Dispatch the update with full CoreInput object
    this.store.dispatch(updateCoreInput({ id, data: updatedItem }));

    this.editMode[id][field] = false;
  }

  cancelEdit(id: string, field: string): void {
    this.editMode[id][field] = false;
  }
}