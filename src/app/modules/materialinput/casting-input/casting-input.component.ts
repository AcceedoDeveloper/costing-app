import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import {
  loadCastingInputs,
  updateCastingInput,
  loadCoreInputs,
  updateCoreInput,
  loadMouldingInputs,
  updateMouldingInput
} from '../store/casting.actions';
import { CastingInput, CoreInput, MouldingInput } from '../../../models/casting-input.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-casting-input',
  templateUrl: './casting-input.component.html',
  styleUrls: ['./casting-input.component.css']
})
export class CastingInputComponent implements OnInit {
  castingData: CastingInput[] = [];
  coreData: CoreInput[] = [];
  mouldingData: MouldingInput[] = [];

  displayedCastingColumns: string[] = [
    '_id',
    'CastingWeight',
    'Cavities',
    'PouringWeight',
    'CastingWeightPerKg',
    'Yeild',
    'MaterialReturned'
  ];
  displayedCoreColumns: string[] = [
    '_id',
    'CoreSand',
    'CoreWeight',
    'ShootingPerShift',
    'coresPerMould'
  ];
  displayedMouldingColumns: string[] = [
    '_id',
    'BakeMoulding',
    'MouldingWeight',
    'MouldsPerHeat'
  ];

  editMode: {
    casting: { [key: string]: { [field: string]: boolean } };
    core: { [key: string]: { [field: string]: boolean } };
    moulding: { [key: string]: { [field: string]: boolean } };
  } = { casting: {}, core: {}, moulding: {} };

  editableData: {
    casting: { [key: string]: CastingInput };
    core: { [key: string]: CoreInput };
    moulding: { [key: string]: MouldingInput };
  } = { casting: {}, core: {}, moulding: {} };

  constructor(private store: Store<{
    casting: {
      data: CastingInput[];
      coreData: CoreInput[];
      mouldingData: MouldingInput[];
    }
  }>) {}

  ngOnInit(): void {
    // Dispatch actions to load all data
    this.store.dispatch(loadCastingInputs());
    this.store.dispatch(loadCoreInputs());
    this.store.dispatch(loadMouldingInputs());

    // Subscribe to casting data
    this.store.pipe(select('casting'), map(state => state.data)).subscribe(data => {
      this.castingData = data;
      data.forEach(item => {
        this.editableData.casting[item._id] = { ...item };
        this.editMode.casting[item._id] = {
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

    // Subscribe to core data
    this.store.pipe(select('casting'), map(state => state.coreData)).subscribe(data => {
      this.coreData = data;
      data.forEach(item => {
        this.editableData.core[item._id] = { ...item };
        this.editMode.core[item._id] = {
          CoreSand: false,
          CoreWeight: false,
          ShootingPerShift: false,
          coresPerMould: false
        };
      });
      console.log('Core Inputs:', data);
    });

    // Subscribe to moulding data
    this.store.pipe(select('casting'), map(state => state.mouldingData)).subscribe(data => {
      this.mouldingData = data;
      data.forEach(item => {
        this.editableData.moulding[item._id] = { ...item };
        this.editMode.moulding[item._id] = {
          BakeMoulding: false,
          MouldingWeight: false,
          MouldsPerHeat: false
        };
      });
      console.log('Moulding Inputs:', data);
    });
  }

  // Toggle edit mode for casting, core, or moulding
  toggleEditMode(type: 'casting' | 'core' | 'moulding', id: string, field: string): void {
    this.editMode[type][id][field] = !this.editMode[type][id][field];
  }

  // Save field for casting, core, or moulding
  saveField(type: 'casting' | 'core' | 'moulding', item: CastingInput | CoreInput | MouldingInput, field: string): void {
    const id = item._id;
    const updatedValue = this.editableData[type][id][field];

    this.editableData[type][id][field] = updatedValue;

    if (type === 'casting') {
      const updatedItem: CastingInput = {
        _id: id,
        CastingWeight: this.editableData.casting[id].CastingWeight,
        Cavities: this.editableData.casting[id].Cavities,
        PouringWeight: this.editableData.casting[id].PouringWeight,
        CastingWeightPerKg: this.editableData.casting[id].CastingWeightPerKg,
        Yeild: this.editableData.casting[id].Yeild,
        MaterialReturned: this.editableData.casting[id].MaterialReturned
      };
      console.log(`Dispatching update for casting item ${id}:`, updatedItem);
      this.store.dispatch(updateCastingInput({ id, data: updatedItem }));
    } else if (type === 'core') {
      const updatedItem: CoreInput = {
        _id: id,
        CoreSand: this.editableData.core[id].CoreSand,
        CoreWeight: this.editableData.core[id].CoreWeight,
        ShootingPerShift: this.editableData.core[id].ShootingPerShift,
        coresPerMould: this.editableData.core[id].coresPerMould,
        Cavities: this.editableData.core[id].Cavities
      };
      console.log(`Dispatching update for core item ${id}:`, updatedItem);
      this.store.dispatch(updateCoreInput({ id, data: updatedItem }));
    } else if (type === 'moulding') {
      const updatedItem: MouldingInput = {
        _id: id,
        BakeMoulding: this.editableData.moulding[id].BakeMoulding,
        MouldingWeight: this.editableData.moulding[id].MouldingWeight,
        MouldsPerHeat: this.editableData.moulding[id].MouldsPerHeat
      };
      console.log(`Dispatching update for moulding item ${id}:`, updatedItem);
      this.store.dispatch(updateMouldingInput({ id, data: updatedItem }));
    }

    this.editMode[type][id][field] = false;
  }

  // Cancel edit for casting, core, or moulding
  cancelEdit(type: 'casting' | 'core' | 'moulding', id: string, field: string): void {
    this.editMode[type][id][field] = false;
    if (type === 'casting') {
      const originalItem = this.castingData.find(item => item._id === id);
      if (originalItem) {
        this.editableData.casting[id] = { ...originalItem };
      }
    } else if (type === 'core') {
      const originalItem = this.coreData.find(item => item._id === id);
      if (originalItem) {
        this.editableData.core[id] = { ...originalItem };
      }
    } else if (type === 'moulding') {
      const originalItem = this.mouldingData.find(item => item._id === id);
      if (originalItem) {
        this.editableData.moulding[id] = { ...originalItem };
      }
    }
  }
}