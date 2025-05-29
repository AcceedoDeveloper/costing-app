import { createReducer, on } from '@ngrx/store';
import { loadCastingInputs, loadCastingInputsSuccess, loadCastingInputsFailure 
, updateCastingInputSuccess, loadMouldingInputs, loadMouldingInputsSuccess, 
loadMouldingInputsFailure, updateMouldingInput, updateMouldingInputSuccess, 
updateMouldingInputFailure, loadCoreInputs, loadCoreInputsSuccess, loadCoreInputsFailure
, updateCoreInput, updateCoreInputSuccess, updateCoreInputFailure
} from './casting.actions';
import { CastingInput, MouldingInput, CoreInput } from '../../../models/casting-input.model';

export interface CastingState {
  data: CastingInput[];
  mouldingData: MouldingInput[];
  coreData: CoreInput[];
  error: string | null;
}

const initialState: CastingState = {
  data: [],
  mouldingData: [],
  coreData: [],
  error: null
};

export const castingReducer = createReducer(
  initialState,
  on(loadCastingInputs, (state) => ({ ...state })),
  on(loadCastingInputsSuccess, (state, { data }) => ({
    ...state,
    data,
    error: null
  })),
  on(loadCastingInputsFailure, (state, { error }) => ({
    ...state,
    error
  })),
  on(updateCastingInputSuccess, (state, { updated }) => ({
    ...state,
    data: state.data.map(item => item._id === updated._id ? updated : item)
  })),
  on(loadMouldingInputsSuccess, (state, { data }) => ({
    ...state,
    mouldingData: data,
    error: null
  }))
  , on(loadMouldingInputsFailure, (state, { error }) => ({
    ...state,
    error
  })),

  on(updateMouldingInput, (state, { id, data }) => ({
    ...state,
    mouldingData: state.mouldingData.map(item => item._id === id ? { ...item, ...data } : item)
  })),
  on(updateMouldingInputSuccess, (state, { updated }) => ({
    ...state,
    mouldingData: state.mouldingData.map(item => item._id === updated._id ? updated : item)
  })),
  on(updateMouldingInputFailure, (state, { error }) => ({
    ...state,
    error
  })),


  on(loadCoreInputsSuccess, (state, { data }) => ({
    ...state,
    coreData: data,
    error: null
  })),
  on(loadCoreInputsFailure, (state, { error }) => ({
    ...state,
    error
  })),

  on(updateCoreInput, (state, { id, data }) => ({
    ...state,
    coreData: state.coreData.map(item => item._id === id ? { ...item, ...data } : item)
  })),
  on(updateCoreInputSuccess, (state, { updated }) => ({
    ...state,
    coreData: state.coreData.map(item => item._id === updated._id ? updated : item)
  })),
  on(updateCoreInputFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
