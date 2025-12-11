export interface Quote{
    customer: string;
    Attention: string;
    Regards: {
      UserCode: string;
    };
    quoteTable: QuoteTableRow[];
    rawMaterial: RawMaterial[];
    generalConsiderations: GeneralConsiderations;
    commercialTermsAndConditions: CommercialTerm[];
  }
  
  export interface QuoteTableRow {
    Sno: string;
    drawingNumber: string;
    partName: string;
    castingMaterial: string;
    castingWeightInKgs: string;
    annualVolume: string;
    partPriceInINR: string;
    patternCostINR: string;
    moqInNos: string;
  }
  
  export interface RawMaterial {
    materialName: string;
    composition: MaterialComposition[];
  }
  
  export interface MaterialComposition {
    element: string;
    range: string;
  }
  
  export interface GeneralConsiderations {
    title: string;
    items: ConsiderationItem[];
  }
  
  export interface ConsiderationItem {
    title: string;
    description: string[];
    isActive: boolean;
  }
  
  export interface CommercialTerm {
    heading: string;
    subPoints: SubPoint[];
    isActive?: boolean;           // optional because not all have it
  }
  
  export interface SubPoint {
    text: string;
    subSubPoints?: string[];      // optional (some have, some don't)
  }

  