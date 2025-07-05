import { createReducer, on } from '@ngrx/store';
import {  updatePowerCost, updatePowerCostSuccess, error, 
  getCastingDetailsSuccess, getCostSummarySuccess,
   updateProductionCost, updateProductionCostSuccess
, updateCastingData, updateCastingDataSuccess
} from './casting.actions';
import { PowerCost } from '../../../models/over-head.model';
import { CastingData } from '../../../models/casting-input.model';
import { CostSummary } from '../../../models/casting-input.model';



export interface CastingState {
  castingData: CastingData[] | null;
  powerCosts: PowerCost[];
  costSummary: CostSummary[] | null;
  error: string | null;

}

const initialState: CastingState = {
  castingData: null,
  powerCosts: [],
  costSummary: null,
  error: null
};

export const castingReducer = createReducer(
  initialState,
 

  on(updatePowerCost, (state, { powerCost }) => ({
    ...state,
    powerCosts: state.powerCosts.map(item => item._id === powerCost._id ? { ...item, ...powerCost } : item)
  })),
  on(updatePowerCostSuccess, (state, { updated }) => ({
    ...state,
    powerCosts: state.powerCosts.map(item => item._id === updated._id ? updated : item)
  })),
  on(error, (state, { error }) => ({
    ...state,
    error
  })),


  on(getCastingDetailsSuccess, (state, { castingData }) => ({
    ...state,
    castingData
  })),

  


  on(getCostSummarySuccess, (state, { costSummary }) => ({
    ...state,
    costSummary
  })),

  on(updateProductionCost, (state, { costSummary }) => ({
    ...state,
    costSummary: state.costSummary?.map(item => item._id === costSummary._id ? { ...item, ...costSummary } : item) || []
  })),

  on(updateProductionCostSuccess, (state, { updatedCostSummary }) => ({
    ...state,
    costSummary: state.costSummary?.map(item => item._id === updatedCostSummary._id ? updatedCostSummary : item) || []
  })),


  on(updateCastingData, (state, { castingData }) => ({
    ...state,
    castingData: state.castingData?.map(item => item._id === castingData._id ? castingData : item) || []
  })),
  on(updateCastingDataSuccess, (state, { updatedCastingData }) => ({
    ...state,
    castingData: state.castingData?.map(item => item._id === updatedCastingData._id ? updatedCastingData : item) || []
  }))






);
