// store/casting/casting.actions.ts
import { createAction, props } from '@ngrx/store';
import { PowerCost} from '../../../models/over-head.model';
import { CastingData } from '../../../models/casting-input.model';
import { CostSummary } from '../../../models/casting-input.model';
import {FlatCastingData } from '../../../models/casting-input.model';


export const error = createAction('[Casting] Error', props<{ error: string }>());


export const updatePowerCost = createAction('[Casting] Update Power Cost', props<{ id : string; powerCost: PowerCost }>());
export const updatePowerCostSuccess = createAction(
  '[Casting] Update Power Cost Success',
  props<{ updated: PowerCost }>()
);


export const getCastingDetails = createAction('[Casting] Get Casting Details');
export const getCastingDetailsSuccess = createAction(
  '[Casting] Get Casting Details Success',
  props<{ castingData: CastingData[] }>()
);


export const getCostSummary = createAction('[Casting] Get Cost Summary');
export const getCostSummarySuccess = createAction(
  '[Casting] Get Cost Summary Success',
  props<{ costSummary: CostSummary[] }>()
);


export const updateProductionCost = createAction(
  '[Casting] Update Production Cost',
  props<{ id: string; costSummary: CostSummary }>()
);
export const updateProductionCostSuccess = createAction(
  '[Casting] Update Production Cost Success',
  props<{ id: string; updatedCostSummary: CostSummary }>()
);


export const updateCastingData = createAction(
  '[Casting] Update Casting Data',
  props<{ id: string; castingData: CastingData }>()
);
export const updateCastingDataSuccess = createAction(
  '[Casting] Update Casting Data Success',
  props<{ id: string; updatedCastingData: CastingData }>()
);



export const updateCastingFlatSummary = createAction(
  '[Casting] Update Flat Summary',
  props<{ id: string; data: FlatCastingData }>()
);


export const updateCastingFlatSummarySuccess = createAction(
  '[Casting] Update Flat Summary Success',
  props<{ id: string; updated: FlatCastingData }>()
);
