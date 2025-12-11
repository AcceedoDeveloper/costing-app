export interface Pdfmaker {
    _id: string
  header: HeaderSection;
  salutation: string;
  introduction: string;
  quoteTable: QuoteTable;
  rawMaterialComposition: RawMaterialComposition;
  generalConsiderations: GeneralConsiderations;
  commercialTermsAndConditions: CommercialTermsAndConditions;
  contactInfo: ContactInfo;
  closingStatement: string;
  signature: Signature;
}

/* ---------------- HEADER ---------------- */
export interface HeaderSection {
  quoteRefNumber: LabelValue;
  date: LabelValue;
  customer: LabelValue;
  attention: LabelValue;
}

export interface LabelValue {
  label: string;
  value: string;
}

/* ---------------- QUOTE TABLE ---------------- */
export interface QuoteTable {
  title: string;
  columns: QuoteColumnHeader | QuoteTableRow[]; // Support both old and new structure
  parts?: QuotePart[]; 
}

// New structure: Array of data rows
export interface QuoteTableRow {
  sno: LabelValue;
  drawingNumber: LabelValue;
  partName: LabelValue;
  castingMaterial: LabelValue;
  castingWeightInKgs: LabelValue;
  annualVolume: LabelValue;
  partPriceInINR: LabelValue;
  patternCostINR: LabelValue;
  moqInNos: LabelValue;
}

// Old structure: Column headers (for backward compatibility)
export interface QuoteColumnHeader {
  sno: string;
  drawingNumber: string;
  partName: string;
  castingMaterial: string;
  castingWeightInKgs: string;
  annualVolume: string;
  partPriceInINR: string;
  patternCostINR: string;
  moqInNos: string;
}

export interface QuotePart {
  castingMaterial: string;
  castingWeight: string;
  annualVolume?: string;
  partPrice: string;
  patternCost: string;
  moq: string;
}

/* ---------------- RAW MATERIAL COMPOSITION ---------------- */
export interface RawMaterialComposition {
  title: string;
  materials: RawMaterial[];
}

export interface RawMaterial {
  materialName: string;
  elements: ElementRange[];
}

export interface ElementRange {
  element: string;
  range: string;
}

/* ---------------- GENERAL CONSIDERATIONS ---------------- */
export interface GeneralConsiderations {
  title: string;
  items: GeneralConsiderationItem[];
}

export interface GeneralConsiderationItem {
  title: string;
  description: string;

}

/* ---------------- COMMERCIAL TERMS & CONDITIONS - UPDATED ---------------- */
export interface CommercialTermsAndConditions {
  title: string;
  sections: CommercialSection[];
}

export interface CommercialSection {
  sectionTitle: string;
  items: CommercialItem[];

}

export interface CommercialItem {
  text?: string;                    // Main paragraph text
  subheading?: string;              // e.g. "HSN Codes as GST:"
  bulletPoints?: string[];          // Array of bullet points under this item

}

/* ---------------- CONTACT INFO ---------------- */
export interface ContactInfo {
  address: LabelValue;
  phone: LabelValue;
  website: LabelValue;
}

/* ---------------- SIGNATURE ---------------- */
export interface Signature {
  thanks: string;
  name: string;
  designation: string;
  department: string;
}

export interface PdfPartialUpdate {
  _id: string;
  path: string;
  value: any;
}