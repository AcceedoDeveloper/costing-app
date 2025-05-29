import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { loadMouldingInputs, updateMouldingInput } from '../store/casting.actions';
import { MouldingInput } from '../../../models/casting-input.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-moulding-input',
  templateUrl: './moulding-input.component.html',
  styleUrls: ['./moulding-input.component.css']
})
export class MouldingInputComponent implements OnInit {
  mouldingData: MouldingInput[] = [];
  displayedColumns: string[] = [
    '_id',
    'BakeMoulding',
    'MouldingWeight',
    'MouldsPerHeat'
  ];
  editMode: { [key: string]: { [field: string]: boolean } } = {};
  editableData: { [key: string]: MouldingInput } = {};

  constructor(private store: Store<{ casting: { mouldingData: MouldingInput[] } }>) {}

  ngOnInit(): void {
    this.store.dispatch(loadMouldingInputs());

    this.store.pipe(select('casting'), map(state => state.mouldingData)).subscribe(data => {
      this.mouldingData = data;
      data.forEach(item => {
        this.editableData[item._id] = { ...item };
        this.editMode[item._id] = {
          BakeMoulding: false,
          MouldingWeight: false,
          MouldsPerHeat: false
        };
      });
      console.log('Moulding Inputs:', data);
    });
  }

  toggleEditMode(id: string, field: string): void {
    this.editMode[id][field] = !this.editMode[id][field];
  }

  saveField(item: MouldingInput, field: string): void {
    const id = item._id;
    const updatedValue = this.editableData[id][field];

  
    this.editableData[id][field] = updatedValue;

    const updatedItem: MouldingInput = {
      _id: id,
      BakeMoulding: this.editableData[id].BakeMoulding,
      MouldingWeight: this.editableData[id].MouldingWeight,
      MouldsPerHeat: this.editableData[id].MouldsPerHeat
    };

    console.log(`Dispatching update for item ${id}:`, updatedItem);
    this.store.dispatch(updateMouldingInput({ id, data: updatedItem }));

    this.editMode[id][field] = false;
  }

  cancelEdit(id: string, field: string): void {
    this.editMode[id][field] = false;
    const originalItem = this.mouldingData.find(item => item._id === id);
    if (originalItem) {
      this.editableData[id] = { ...originalItem };
    }
  }
}