import { HeaderSection, QuoteTable, RawMaterialComposition, ContactInfo, Signature } from '../master/master/pdfmaker/pdfmaker.model';

export interface Quotation {
  _id?: string;
  ID: string[];
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

/* ---------------- GENERAL CONSIDERATIONS (Quotation specific) ---------------- */
export interface GeneralConsiderations {
  title: string;
  items: GeneralConsiderationItem[];
}

export interface GeneralConsiderationItem {
  _id?: string;
  title: string;
  description: string[]; // Array of strings for quotation
  isActive?: boolean;
}

/* ---------------- COMMERCIAL TERMS & CONDITIONS (Quotation specific) ---------------- */
export interface CommercialTermsAndConditions {
  title: string;
  sections: CommercialSection[];
}

export interface CommercialSection {
  _id?: string;
  sectionTitle: string;
  items: CommercialItem[];
  isActive?: boolean;
}

export interface CommercialItem {
  _id?: string;
  text?: string;
  subheading?: string;
  bulletPoints?: string[];
}

