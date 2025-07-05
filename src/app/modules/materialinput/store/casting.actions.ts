// store/casting/casting.actions.ts
import { createAction, props } from '@ngrx/store';
import { CastingInput,  MouldingInput, CoreInput } from '../../../models/casting-input.model';
import { PowerCost} from '../../../models/over-head.model';




export const loadCastingInputs = createAction('[Casting] Load Casting Inputs');
export const loadCastingInputsSuccess = createAction(
  '[Casting] Load Casting Inputs Success',
  props<{ data: CastingInput[] }>()
);
export const loadCastingInputsFailure = createAction(
  '[Casting] Load Casting Inputs Failure',
  props<{ error: string }>()
);


export const updateCastingInput = createAction('[Casting] Update Input', props<{ id: string, data: CastingInput }>());
export const updateCastingInputSuccess = createAction('[Casting] Update Input Success', props<{ updated: CastingInput }>());


export const loadMouldingInputs = createAction('[Casting] Load Moulding Inputs');
export const loadMouldingInputsSuccess = createAction(
  '[Casting] Load Moulding Inputs Success',
  props<{ data: MouldingInput[] }>()
);

export const loadMouldingInputsFailure = createAction(
  '[Casting] Load Moulding Inputs Failure',
  props<{ error: string }>()
);


export const updateMouldingInput = createAction('[Casting] Update Moulding Input', props<{ id: string, data: MouldingInput }>());
export const updateMouldingInputSuccess = createAction('[Casting] Update Moulding Input Success', props<{ updated: MouldingInput }>());
export const updateMouldingInputFailure = createAction(
  '[Casting] Update Moulding Input Failure',
  props<{ error: string }>()
);



export const loadCoreInputs = createAction('[Casting] Load Core Inputs');
export const loadCoreInputsSuccess = createAction(
  '[Casting] Load Core Inputs Success',
  props<{ data: CoreInput[] }>()
);
export const loadCoreInputsFailure = createAction(
  '[Casting] Load Core Inputs Failure',
  props<{ error: string }>()
);


export const updateCoreInput = createAction('[Casting] Update Core Input', props<{ id: string, data: CoreInput }>());
export const updateCoreInputSuccess = createAction('[Casting] Update Core Input Success', props<{ updated: CoreInput }>());
export const updateCoreInputFailure = createAction(
  '[Casting] Update Core Input Failure',
  props<{ error: string }>()
);


export const updatePowerCost = createAction('[Casting] Update Power Cost', props<{ powerCost: PowerCost }>());
export const updatePowerCostSuccess = createAction(
  '[Casting] Update Power Cost Success',
  props<{ updated: PowerCost }>()
);
export const error = createAction('[Casting] Error', props<{ error: string }>());