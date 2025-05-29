import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { loadCastingInputs } from '../store/casting.actions';
import { CastingInput } from '../../../models/casting-input.model';
import { map } from 'rxjs/operators';
import { updateCastingInput } from '../store/casting.actions';

@Component({
  selector: 'app-casting-input',
  templateUrl: './casting-input.component.html',
  styleUrls: ['./casting-input.component.css']
})
export class CastingInputComponent implements OnInit {
  castingData: CastingInput[] = [];
  displayedColumns: string[] = [
    '_id',
    'CastingWeight',
    'Cavities',
    'PouringWeight',
    'CastingWeightPerKg',
    'Yeild',
    'MaterialReturned'
  ];
  editMode: { [key: string]: { [field: string]: boolean } } = {}; // Track edit mode for each field of each item
  editableData: { [key: string]: CastingInput } = {};




  constructor(private store: Store<{ casting: { data: CastingInput[] } }>) {}

  ngOnInit(): void {
    this.store.dispatch(loadCastingInputs());

    this.store.pipe(select('casting'), map(state => state.data)).subscribe(data => {
      this.castingData = data;
      this.castingData.forEach(item => {
        this.editMode[item._id] = {
          CastingWeight: false,
          Cavities: false,
          PouringWeight: false,
          CastingWeightPerKg: false,
          Yeild: false,
          MaterialReturned: false
        };
      });
      console.log('Casting Inputs:', data);
    });

    this.store.pipe(select('casting'), map(state => state.data)).subscribe(data => {
  this.castingData = data;

  data.forEach(item => {
    this.editableData[item._id] = { ...item };
    this.editMode[item._id] = {
      CastingWeight: false,
      Cavities: false,
      PouringWeight: false,
      CastingWeightPerKg: false,
      Yeild: false,
      MaterialReturned: false
    };
  });
});

  }

  toggleEditMode(id: string, field: string): void {
    this.editMode[id][field] = !this.editMode[id][field];
  }

saveField(item: CastingInput, field: string): void {
  const id = item._id;
  const updatedValue = this.editableData[id][field];

  // Update the specific field in editableData
  this.editableData[id][field] = updatedValue;

  // Build the full updated object including _id
  const updatedItem: CastingInput = {
    _id: id,
    CastingWeight: this.editableData[id].CastingWeight,
    Cavities: this.editableData[id].Cavities,
    PouringWeight: this.editableData[id].PouringWeight,
    CastingWeightPerKg: this.editableData[id].CastingWeightPerKg,
    Yeild: this.editableData[id].Yeild,
    MaterialReturned: this.editableData[id].MaterialReturned
  };

  console.log(`Dispatching update for item ${id}:`, updatedItem);

  // Dispatch the update with full CastingInput object
  this.store.dispatch(updateCastingInput({ id, data: updatedItem }));

  this.editMode[id][field] = false;
}



  cancelEdit(id: string, field: string): void {
    this.editMode[id][field] = false;
  }
}