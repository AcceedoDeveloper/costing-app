

import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ReportsService } from '../../../services/reports.service';
import { Pdfmaker } from '../../../master/master/pdfmaker/pdfmaker.model';
import { Quotation } from '../../../models/Quotation.model';
import { ConfigService } from 'src/app/shared/components/config.service';


@Component({
  selector: 'app-final-quotation',
  templateUrl: './final-quotation.component.html',
  styleUrls: ['./final-quotation.component.css']
})
export class FinalQuotationComponent implements OnInit {

  
  today?: string;
  quoteData?: Pdfmaker;
  quotationData?: Quotation; // Store original quotation data
  templateData?: Pdfmaker; // Store template data for General Considerations and Commercial Terms
  loading = true;
  error = '';
  downloadingPDF = false; // Loading state for PDF download
  tableUserInputs: any[] = [];
  materialComposition: any = { C: '', Si: '', Mn: '', Ni: '', Cr: '', Mo: '' };

  constructor(
    private reportservice: ReportsService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private config: ConfigService,
    public dialogRef: MatDialogRef<FinalQuotationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // Initialize data from dialog
    if (this.data) {
      this.tableUserInputs = this.data.tableUserInputs || [];
      this.materialComposition = this.data.materialComposition || { C: '', Si: '', Mn: '', Ni: '', Cr: '', Mo: '' };
      console.log('✅ tableUserInputs initialized from selected customer data:', this.tableUserInputs);
    }
    this.today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');

    // Always load template data for General Considerations and Commercial Terms sections
    this.loadTemplateData();

    // Check if quotation is already passed in data
    if (this.data?.quotation) {
      console.log('Quotation passed from dialog:', this.data.quotation);
      // Clone to break reference with any cached list entries
      const safeQuotation: Quotation = JSON.parse(JSON.stringify(this.data.quotation));
      this.quotationData = safeQuotation;
      this.quoteData = this.convertQuotationToPdfmaker(safeQuotation);
      // Merge template data for General Considerations and Commercial Terms
      this.mergeTemplateData();
      this.initializeQuoteData();
      // Initialize columns from selected parts if data comes from customerdetails
      this.initializeColumnsFromSelectedParts();
      return;
    }

    // If quotation not passed, show error
    console.log('No quotation data provided');
    this.error = 'No quotation data available. Please create a quotation first.';
    this.loading = false;
  }

  private loadTemplateData(): void {
    // Load template data for General Considerations and Commercial Terms sections
    this.reportservice.getQuoteTemplate().subscribe({
      next: (template: Pdfmaker) => {
        console.log('Template data loaded for General Considerations and Commercial Terms');
        this.templateData = template;
        // Merge template data if quoteData is already loaded
        if (this.quoteData) {
          this.mergeTemplateData();
        }
      },
      error: (err) => {
        console.error('Error loading template data:', err);
        // Continue without template data
      }
    });
  }

  private mergeTemplateData(): void {
    // Merge template data for General Considerations and Commercial Terms sections
    if (this.templateData && this.quoteData) {
      // Use template data for General Considerations
      if (this.templateData.generalConsiderations) {
        this.quoteData.generalConsiderations = {
          title: this.templateData.generalConsiderations.title,
          items: this.templateData.generalConsiderations.items.map((item: any) => ({
            title: item.title,
            description: item.description,
            isActive: item.isActive !== false
          }))
        };
      }
      
      // Use template data for Commercial Terms & Conditions
      if (this.templateData.commercialTermsAndConditions) {
        this.quoteData.commercialTermsAndConditions = {
          title: this.templateData.commercialTermsAndConditions.title,
          sections: this.templateData.commercialTermsAndConditions.sections.map((section: any) => ({
            sectionTitle: section.sectionTitle,
            isActive: section.isActive !== false,
            items: section.items.map((item: any) => ({
              text: item.text,
              subheading: item.subheading,
              bulletPoints: item.bulletPoints || [],
              isActive: item.isActive !== false
            }))
          }))
        };
      }
    }
  }

  private initializeQuoteData() {
    // Ensure arrays are initialized if they don't exist
    if (this.quoteData) {
      // Initialize quoteTable
      if (!this.quoteData.quoteTable) {
        this.quoteData.quoteTable = {
          title: '',
          columns: {
            sno: '', drawingNumber: '', partName: '', castingMaterial: '',
            castingWeightInKgs: '', annualVolume: '', partPriceInINR: '',
            patternCostINR: '', moqInNos: ''
          },
          parts: []
        };
      }
      if (!this.quoteData.quoteTable.parts) {
        this.quoteData.quoteTable.parts = [];
      }
      
      // Initialize rawMaterialComposition
      if (!this.quoteData.rawMaterialComposition) {
        this.quoteData.rawMaterialComposition = { title: '', materials: [] };
      }
      if (!this.quoteData.rawMaterialComposition.materials) {
        this.quoteData.rawMaterialComposition.materials = [];
      }
      
      if (!this.quoteData.generalConsiderations) {
        this.quoteData.generalConsiderations = { title: '', items: [] };
      }
      if (!this.quoteData.generalConsiderations.items) {
        this.quoteData.generalConsiderations.items = [];
      }
      
      if (!this.quoteData.commercialTermsAndConditions) {
        this.quoteData.commercialTermsAndConditions = { title: '', sections: [] };
      }
      if (!this.quoteData.commercialTermsAndConditions.sections) {
        this.quoteData.commercialTermsAndConditions.sections = [];
      }
    }
    
    this.loading = false;
    this.cdr.detectChanges();
  }

  // Initialize column headers from selected parts when data comes from customerdetails component
  private initializeColumnsFromSelectedParts() {
    // Ensure column headers are properly set when data comes from customerdetails buttons
    if (this.quoteData?.quoteTable) {
      const columns = this.quoteData.quoteTable.columns;
      
      // Default labels for all columns
      const defaultLabels: { [key: string]: string } = {
        'sno': 'S.No',
        'drawingNumber': 'Drawing No',
        'partName': 'Part Name',
        'castingMaterial': 'Casting Material',
        'castingWeightInKgs': 'Casting Weight (kg)',
        'annualVolume': 'Annual Volume',
        'partPriceInINR': 'Part Price (INR)',
        'patternCostINR': 'Pattern Cost (INR)',
        'moqInNos': 'MOQ (Nos)'
      };

      if (this.isColumnsArray()) {
        // New structure: array of LabelValue objects
        const columnsArray = columns as any[];
        if (columnsArray && columnsArray.length > 0) {
          // Update labels in all rows to ensure consistency
          columnsArray.forEach((row: any) => {
            Object.keys(defaultLabels).forEach(key => {
              // Initialize if missing or ensure label exists
              if (!row[key]) {
                row[key] = { label: defaultLabels[key], value: row[key]?.value || '' };
              } else if (typeof row[key] === 'object' && 'label' in row[key]) {
                // If label is missing or empty, set default
                if (!row[key].label || String(row[key].label).trim() === '') {
                  row[key].label = defaultLabels[key];
                }
              } else {
                // Convert to LabelValue format if it's a direct value
                row[key] = { label: defaultLabels[key], value: String(row[key] || '') };
              }
            });
          });
          console.log('✅ Column headers initialized for array structure:', columnsArray);
        }
      } else {
        // Old structure: object with string headers
        const colObj = columns as any;
        
        // ALWAYS set these three headers from selected customer parts data (tableUserInputs)
        // These come from customerdetails component when buttons are clicked
        if (this.tableUserInputs && this.tableUserInputs.length > 0) {
          // Force set these headers from selected parts data
          colObj.sno = 'S.No';
          colObj.drawingNumber = 'Drawing No';
          colObj.partName = 'Part Name';
          console.log('✅ Set headers from selected customer parts:', { sno: colObj.sno, drawingNumber: colObj.drawingNumber, partName: colObj.partName });
        }
        
        // Ensure all column headers have default values if they are empty, undefined, or missing
        Object.keys(defaultLabels).forEach(key => {
          const currentValue = colObj[key];
          // Set default if: value is undefined, null, empty string, or just whitespace
          if (!currentValue || (typeof currentValue === 'string' && currentValue.trim() === '')) {
            colObj[key] = defaultLabels[key];
          }
        });
        
        console.log('✅ Column headers initialized from customer data:', colObj);
      }
      
      this.cdr.detectChanges();
    }
  }

  private convertQuotationToPdfmaker(quotation: Quotation): Pdfmaker {
    // Convert Quotation model to Pdfmaker model for display
    // Add null checks to prevent errors
    return {
      _id: quotation._id || '',
      header: quotation.header || {
        quoteRefNumber: { label: '', value: '' },
        date: { label: '', value: '' },
        customer: { label: '', value: '' },
        attention: { label: '', value: '' }
      },
      salutation: quotation.salutation || '',
      introduction: quotation.introduction || '',
      quoteTable: (() => {
        const qt = quotation.quoteTable;
        if (!qt) {
          return {
            title: '',
            columns: {
              sno: '',
              drawingNumber: '',
              partName: '',
              castingMaterial: '',
              castingWeightInKgs: '',
              annualVolume: '',
              partPriceInINR: '',
              patternCostINR: '',
              moqInNos: ''
            },
            parts: []
          };
        }
        // If columns is already an array (new structure), use it as is
        if (Array.isArray(qt.columns)) {
          return qt;
        }
        // Otherwise, keep old structure
        return {
          title: qt.title || '',
          columns: qt.columns || {
            sno: '',
            drawingNumber: '',
            partName: '',
            castingMaterial: '',
            castingWeightInKgs: '',
            annualVolume: '',
            partPriceInINR: '',
            patternCostINR: '',
            moqInNos: ''
          },
          parts: qt.parts || []
        };
      })(),
      rawMaterialComposition: quotation.rawMaterialComposition || {
        title: '',
        materials: []
      },
      generalConsiderations: {
        title: quotation.generalConsiderations?.title || '',
        items: (quotation.generalConsiderations?.items || []).map(item => ({
          title: item.title || '',
          description: Array.isArray(item.description) 
            ? item.description.join(' ') 
            : (item.description || ''),
          isActive: item.isActive === undefined ? true : Boolean(item.isActive)
        }))
      },
      commercialTermsAndConditions: {
        title: quotation.commercialTermsAndConditions?.title || '',
        sections: (quotation.commercialTermsAndConditions?.sections || []).map(section => ({
          sectionTitle: section.sectionTitle || '',
          isActive: section.isActive === undefined ? true : Boolean(section.isActive),
          items: (section.items || []).map((item: any) => ({
            text: item.text,
            subheading: item.subheading,
            bulletPoints: item.bulletPoints || [],
            isActive: item.isActive === undefined ? true : Boolean(item.isActive)
          }))
        }))
      },
      contactInfo: quotation.contactInfo || {
        address: { label: '', value: '' },
        phone: { label: '', value: '' },
        website: { label: '', value: '' }
      },
      closingStatement: quotation.closingStatement || '',
      signature: quotation.signature || {
        thanks: '',
        name: '',
        designation: '',
        department: ''
      }
    };
  }

  formatPartName(name: string): string {
    if (!name) return '-';
    return name.replace(/(.{30})/g, '$1<br>');
  }

  // Check if columns is an array (new structure) or object (old structure)
  isColumnsArray(): boolean {
    return Array.isArray(this.quoteData?.quoteTable?.columns);
  }

  // Get column headers - support both old and new structure, fallback to defaults
  getColumnHeader(columnKey: string): string {
    // Default labels for all columns
    const defaultLabels: { [key: string]: string } = {
      'sno': 'S.No',
      'drawingNumber': 'Drawing No',
      'partName': 'Part Name',
      'castingMaterial': 'Casting Material',
      'castingWeightInKgs': 'Casting Weight (kg)',
      'annualVolume': 'Annual Volume',
      'partPriceInINR': 'Part Price (INR)',
      'patternCostINR': 'Pattern Cost (INR)',
      'moqInNos': 'MOQ (Nos)'
    };

    // Try to get from quoteData (database) - works for ALL columns including sno, drawingNumber, partName
    if (this.quoteData?.quoteTable?.columns) {
      if (this.isColumnsArray()) {
        // New structure: get label from first row's LabelValue format
        const columns = this.quoteData.quoteTable.columns as any[];
        if (columns && columns.length > 0) {
          const firstRow = columns[0];
          // Check if the property exists and has a label
          if (firstRow[columnKey] && typeof firstRow[columnKey] === 'object' && 'label' in firstRow[columnKey]) {
            const label = firstRow[columnKey].label;
            // Return label if it exists and is not empty, otherwise use default
            if (label && String(label).trim() !== '') {
              return String(label);
            }
          }
        }
      } else {
        // Old structure: direct property access
        const colObj = this.quoteData.quoteTable.columns as any;
        const header = colObj[columnKey];
        // Return header if it exists and is not empty, otherwise use default
        if (header && String(header).trim() !== '') {
          return String(header);
        }
      }
    }
    
    // Fallback: Always return default label if not found in database
    return defaultLabels[columnKey] || '';
  }

  // Get data rows - ALWAYS prioritize tableUserInputs (selected customer data) over everything else
  getTableRows(): any[] {
    // ALWAYS use tableUserInputs if available (data from selected customers)
    if (this.tableUserInputs && this.tableUserInputs.length > 0) {
      // console.log('✅ Using tableUserInputs (selected customer data):', this.tableUserInputs);
      return this.tableUserInputs;
    }
    
    if (!this.quoteData?.quoteTable) return [];
    
    if (this.isColumnsArray()) {
      // New structure: columns is the data array
      return this.quoteData.quoteTable.columns as any[];
    } else {
      // Old structure: use parts array
      return this.quoteData.quoteTable.parts || [];
    }
  }

  // Get value from row - support LabelValue format
  getRowValue(row: any, key: string, fallbackKey?: string): string {
    if (!row) return '-';
    
    // Check if it's LabelValue format
    if (row[key] && typeof row[key] === 'object' && 'value' in row[key]) {
      return row[key].value || '-';
    }
    
    // Check fallback key (for old structure compatibility)
    if (fallbackKey && row[fallbackKey]) {
      return row[fallbackKey];
    }
    
    // Direct property access
    return row[key] || '-';
  }

  // Get drawing number - ALWAYS prioritize tableUserInputs (drawingNo) from selected customer data
  getDrawingNumberValue(row: any, index: number): string {
    if (!row) return '-';
    
    // ALWAYS check tableUserInputs structure first (drawingNo from selected customer data)
    if (row.drawingNo !== undefined && row.drawingNo !== null && row.drawingNo !== '') {
      return String(row.drawingNo);
    }
    
    // If new array structure, use getRowValue
    if (this.isColumnsArray()) {
      return this.getRowValue(row, 'drawingNumber') || '-';
    }
    
    // Check parts structure (drawingNumber)
    if (row.drawingNumber) {
      return row.drawingNumber;
    }
    
    // Fallback to helper method
    return this.getDrawingNumber(index) || '-';
  }

  // Get part name - ALWAYS prioritize tableUserInputs (partName) from selected customer data
  getPartNameValue(row: any, index: number): string {
    if (!row) return '-';
    
    // ALWAYS check tableUserInputs or parts structure first (partName from selected customer data)
    if (row.partName !== undefined && row.partName !== null && row.partName !== '') {
      return String(row.partName);
    }
    
    // If new array structure, use getRowValue
    if (this.isColumnsArray()) {
      return this.getRowValue(row, 'partName') || '-';
    }
    
    // Fallback to helper method
    return this.getPartName(index) || '-';
  }

  // Get S.No value - ALWAYS prioritize tableUserInputs (sno) from selected customer data
  getSnoValue(row: any, index: number): string | number {
    if (!row) return index + 1;
    
    // ALWAYS check tableUserInputs structure first (sno from selected customer data)
    if (row.sno !== undefined && row.sno !== null) {
      return row.sno;
    }
    
    // If new array structure, use getRowValue
    if (this.isColumnsArray()) {
      const snoValue = this.getRowValue(row, 'sno');
      return snoValue !== '-' ? snoValue : (index + 1);
    }
    
    // Fallback to index
    return index + 1;
  }

  formatCastingMaterial(material: string): string {
    if (!material) return '-';
    return material.replace(/(.{25})/g, '$1<br>');
  }

  getRowSpan(index: number): number {
    return 3;
  }

  getEmptyRows(index: number): any[] {
    return Array(this.getRowSpan(index) - 1);
  }

  // Helper methods to safely access parts array
  getPartField(index: number, field: string): any {
    if (!this.quoteData?.quoteTable?.parts || !this.quoteData.quoteTable.parts[index]) {
      return null;
    }
    return this.quoteData.quoteTable.parts[index][field];
  }

  getDrawingNumber(index: number): string {
    return this.getPartField(index, 'drawingNumber') || null;
  }

  getPartName(index: number): string {
    return this.getPartField(index, 'partName') || null;
  }

  getCastingMaterial(index: number): string {
    return this.getPartField(index, 'castingMaterial') || null;
  }

  getCastingWeight(index: number): any {
    return this.getPartField(index, 'castingWeight') || null;
  }

  getAnnualVolume(index: number): any {
    return this.getPartField(index, 'annualVolume') || null;
  }

  getPartPrice(index: number): any {
    return this.getPartField(index, 'partPrice') || null;
  }

  getPatternCost(index: number): any {
    return this.getPartField(index, 'patternCost') || null;
  }

  getMoq(index: number): any {
    return this.getPartField(index, 'moq') || null;
  }

  // Get editable field value - handles both array and old structure, prioritizes row data
  getEditableValue(row: any, index: number, fieldKey: string, oldFieldKey?: string): string {
    if (!row) {
      // Fallback to quoteData if row is not available
      if (this.isColumnsArray()) {
        const columns = this.quoteData?.quoteTable?.columns as any[];
        if (columns && columns[index]) {
          return this.getRowValue(columns[index], fieldKey) || '-';
        }
      } else {
        const parts = this.quoteData?.quoteTable?.parts;
        if (parts && parts[index]) {
          return parts[index][oldFieldKey || fieldKey] || '-';
        }
      }
      return '-';
    }

    // First, try to get from current row
    if (this.isColumnsArray()) {
      // Array structure: extract from LabelValue format
      const value = this.getRowValue(row, fieldKey);
      if (value && value !== '-') {
        return value;
      }
    } else {
      // Old structure: direct property access
      const value = row[oldFieldKey || fieldKey];
      if (value !== undefined && value !== null && value !== '') {
        return String(value);
      }
    }

    // Fallback: try to get from quoteData directly
    if (this.isColumnsArray()) {
      const columns = this.quoteData?.quoteTable?.columns as any[];
      if (columns && columns[index]) {
        const value = this.getRowValue(columns[index], fieldKey);
        if (value && value !== '-') {
          return value;
        }
      }
    } else {
      const parts = this.quoteData?.quoteTable?.parts;
      if (parts && parts[index]) {
        const value = parts[index][oldFieldKey || fieldKey];
        if (value !== undefined && value !== null && value !== '') {
          return String(value);
        }
      }
    }

    return '-';
  }

  boldBeforeColon(text: string): string {
    if (!text) return '';

    const escapeHtml = (str: string) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };

    let escaped = escapeHtml(text);
    // Support one-or-more $ markers (e.g. $text$, $$text$$, $$$text$$$)
    let processed = escaped.replace(/\$+([^$]+?)\$+/g, '<strong>$1</strong>');

    if (!processed.includes('<strong>')) {
      processed = processed.replace(/^([^:]+):/g, '<strong>$1:</strong>');
    }

    return processed;
  }

  saveQuote() {
    if (!this.quotationData || !this.quoteData) return;

    // Convert Pdfmaker back to Quotation format for saving
    const quotationToSave = this.convertPdfmakerToQuotation(this.quoteData, this.quotationData);
    
    if (!quotationToSave._id) {
      alert('Cannot save: Quotation ID is missing. Please create quotation first.');
      return;
    }

    // Only update existing quotation using updateQuotation
    this.reportservice.updateQuotation(quotationToSave._id, quotationToSave).subscribe({
      next: (saved: Quotation) => {
        this.quotationData = saved;
        alert('Quotation updated successfully!');
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Failed to update quotation.');
      }
    });
  }

  triggerAutoSave() {
    if (!this.quotationData || !this.quoteData) {
      console.warn('⚠️ [EDIT] Cannot save: missing data');
      return;
    }

    setTimeout(() => {
      const quotationToSave = this.convertPdfmakerToQuotation(this.quoteData!, this.quotationData!);
      
      if (quotationToSave._id) {
        this.reportservice.updateQuotation(quotationToSave._id, quotationToSave).subscribe({
          next: (saved: Quotation) => {
            this.quotationData = saved;
            console.log('✅ [EDIT] Saved successfully - ID:', saved._id);
          },
          error: (err) => {
            console.error('❌ [EDIT] Save failed:', err.status, err.statusText, err.url);
          }
        });
      } else {
        console.warn('⚠️ [EDIT] Cannot save: missing quotation ID');
      }
    }, 300);
  }

  private convertPdfmakerToQuotation(pdfmaker: Pdfmaker, originalQuotation: Quotation): Quotation {
    // Convert Pdfmaker back to Quotation format for saving
    return {
      _id: originalQuotation._id,
      ID: originalQuotation.ID,
      header: pdfmaker.header,
      salutation: pdfmaker.salutation,
      introduction: pdfmaker.introduction,
      quoteTable: pdfmaker.quoteTable,
      rawMaterialComposition: pdfmaker.rawMaterialComposition,
      generalConsiderations: {
        title: pdfmaker.generalConsiderations.title,
        items: pdfmaker.generalConsiderations.items.map((item: any) => ({
          _id: originalQuotation.generalConsiderations?.items?.find((orig: any) => orig.title === item.title)?._id,
          title: item.title,
          description: typeof item.description === 'string' 
            ? [item.description] 
            : (Array.isArray(item.description) ? item.description : []),
          isActive: item.isActive === undefined ? true : Boolean(item.isActive)
        }))
      },
      commercialTermsAndConditions: {
        title: pdfmaker.commercialTermsAndConditions.title,
        sections: pdfmaker.commercialTermsAndConditions.sections.map((section: any, secIdx: number) => ({
          _id: originalQuotation.commercialTermsAndConditions?.sections?.[secIdx]?._id,
          sectionTitle: section.sectionTitle,
          isActive: section.isActive === undefined ? true : Boolean(section.isActive),
          items: section.items.map((item: any, itemIdx: number) => ({
            _id: originalQuotation.commercialTermsAndConditions?.sections?.[secIdx]?.items?.[itemIdx]?._id,
            text: item.text,
            subheading: item.subheading,
            bulletPoints: item.bulletPoints || [],
            isActive: item.isActive === undefined ? true : Boolean(item.isActive)
          }))
        }))
      },
      contactInfo: pdfmaker.contactInfo,
      closingStatement: pdfmaker.closingStatement,
      signature: pdfmaker.signature
    };
  }


  onPdfEditAction(event: CustomEvent) {
    const { type, path } = event.detail;
  

    // ==================================================================
    // 1. RAW MATERIAL COMPOSITION
    // ==================================================================
    if (path.includes('rawMaterialComposition')) {
      // Add new material from title
      if (path === 'rawMaterialComposition.title' && type === 'add') {
        const defaultElements = [
          { element: 'C', range: '-' },
          { element: 'Mn', range: '-' },
          { element: 'P', range: '-' },
          { element: 'S', range: '-' },
          { element: 'Si', range: '-' },
          { element: 'Cr', range: '-' },
          { element: 'Ni', range: '-' },
          { element: 'Mo', range: '-' }
        ];
        const newMaterial = {
          materialName: '',
          elements: defaultElements
        };
        this.quoteData!.rawMaterialComposition.materials.push(newMaterial);
        this.triggerAutoSave();

        setTimeout(() => {
          const lastIdx = this.quoteData!.rawMaterialComposition.materials.length - 1;
          const el = document.querySelector(
            `[propertypath*="rawMaterialComposition.materials[${lastIdx}].materialName"]`
          ) as HTMLElement;
          if (el) {
            el.dispatchEvent(new Event('dblclick'));
            setTimeout(() => el.focus(), 100);
          }
        }, 150);
        return;
      }

      // Delete material
      const materialMatch = path.match(/materials\[(\d+)\]\.materialName/);
      if (materialMatch && type === 'delete') {
        const matIdx = +materialMatch[1];
        if (confirm('Delete this material and all its elements?')) {
          this.quoteData!.rawMaterialComposition.materials.splice(matIdx, 1);
          this.triggerAutoSave();
        }
        return;
      }

      // Add new element
      const elementMatch = path.match(/materials\[(\d+)\]\.elements\[(\d+)\]\.(element|range)/);
      if (elementMatch && type === 'add') {
        const matIdx = +elementMatch[1];
        const elIdx = +elementMatch[2];
        const material = this.quoteData!.rawMaterialComposition.materials[matIdx];
        const newElement = { element: '', range: '-' };
        material.elements.splice(elIdx + 1, 0, newElement);
        this.triggerAutoSave();

        setTimeout(() => {
          const el = document.querySelector(
            `[propertypath*="rawMaterialComposition.materials[${matIdx}].elements[${elIdx + 1}].element"]`
          ) as HTMLElement;
          if (el) {
            el.dispatchEvent(new Event('dblclick'));
            setTimeout(() => el.focus(), 100);
          }
        }, 150);
        return;
      }

      // Delete element
      if (elementMatch && type === 'delete') {
        const matIdx = +elementMatch[1];
        const elIdx = +elementMatch[2];
        const material = this.quoteData!.rawMaterialComposition.materials[matIdx];
        if (confirm('Delete this element column?')) {
          material.elements.splice(elIdx, 1);
          this.triggerAutoSave();
        }
        return;
      }
    }

    // ==================================================================
    // 2. GENERAL CONSIDERATIONS
    // ==================================================================
    if (path.includes('generalConsiderations')) {
      if (type === 'add') {
        const newItem = { title: '', description: '', isActive: true };
  
       
        if (path.includes('items[')) {
          const match = path.match(/items\[(\d+)\]/);
          if (match) {
            const idx = +match[1];
            this.quoteData!.generalConsiderations.items.splice(idx + 1, 0, newItem);
          } else {
            this.quoteData!.generalConsiderations.items.push(newItem);
          }
        } else {
         
          this.quoteData!.generalConsiderations.items.push(newItem);
        }
  
        this.triggerAutoSave();
  
       
        setTimeout(() => {
          const lastIdx = this.quoteData!.generalConsiderations.items.length - 1;
          const el = document.querySelector(
            `[propertypath*="generalConsiderations.items[${lastIdx}].title"]`
          ) as HTMLElement;
          if (el) {
            el.dispatchEvent(new Event('dblclick'));
            setTimeout(() => el.focus(), 100);
          }
        }, 150);
  
        return; 
      }
  
      if (type === 'delete' && path.includes('items[')) {
        const match = path.match(/items\[(\d+)\]/);
        if (match && confirm('Delete this consideration point?')) {
          this.quoteData!.generalConsiderations.items.splice(+match[1], 1);
          this.triggerAutoSave();
        }
        return; 
      }
    }

    if (path === 'commercialTermsAndConditions.title' && type === 'add') {
      const newSection = {
        sectionTitle: '',
        isActive: true,
        items: [{ text: '', bulletPoints: [], subheading: '', isActive: true }]
      };
      this.quoteData!.commercialTermsAndConditions.sections.push(newSection);
      this.triggerAutoSave();
  
      setTimeout(() => {
        const lastIdx = this.quoteData!.commercialTermsAndConditions.sections.length - 1;
        const el = document.querySelector(
          `[propertypath*="commercialTermsAndConditions.sections[${lastIdx}].sectionTitle"]`
        ) as HTMLElement;
        if (el) {
          el.dispatchEvent(new Event('dblclick'));
          setTimeout(() => el.focus(), 100);
        }
      }, 150);
  
      return;
    }
  

    const secMatch = path.match(/sections\[(\d+)\]/);
    if (secMatch) {
      const secIdx = +secMatch[1];
      const section = this.quoteData!.commercialTermsAndConditions.sections[secIdx];
  
      // Delete entire section
      if (path.includes('.sectionTitle') && type === 'delete') {
        if (confirm('Delete entire section?')) {
          this.quoteData!.commercialTermsAndConditions.sections.splice(secIdx, 1);
          this.triggerAutoSave();
        }
        return;
      }
  
      // Bullet points
      const bulletMatch = path.match(/\.bulletPoints\[(\d+)\]$/);
      if (bulletMatch) {
        const itemMatch = path.match(/items\[(\d+)\]/);
        if (!itemMatch) return;
        const itemIdx = +itemMatch[1];
        const bulletIdx = +bulletMatch[1];
        const item = section.items[itemIdx];
        if (!item.bulletPoints) item.bulletPoints = [];
  
        if (type === 'delete') {
          if (confirm('Delete this bullet?')) {
            item.bulletPoints.splice(bulletIdx, 1);
            if (item.bulletPoints.length === 0) delete item.bulletPoints;
            this.triggerAutoSave();
          }
        } else if (type === 'add') {
          item.bulletPoints.splice(bulletIdx + 1, 0, '');
          this.triggerAutoSave();
          setTimeout(() => this.focusNewItem(item, bulletIdx + 1, 'bullet'), 100);
        }
        return;
      }
  
      // Normal text line or subheading
      const itemMatch = path.match(/items\[(\d+)\]/);
      if (itemMatch && (path.includes('.text') || path.includes('.subheading'))) {
        const itemIdx = +itemMatch[1];
  
        if (type === 'delete') {
          if (confirm('Delete this line?')) {
            section.items.splice(itemIdx, 1);
            this.triggerAutoSave();
          }
        } else if (type === 'add') {
          const newItem = { text: '', bulletPoints: [], subheading: '', isActive: true };
          section.items.splice(itemIdx + 1, 0, newItem);
          this.triggerAutoSave();
          setTimeout(() => this.focusNewItem(newItem, itemIdx + 1, 'text'), 100);
        }
        return;
      }
    }
  
    // Fallback: Add at end of section
    if (type === 'add' && path.includes('commercialTermsAndConditions')) {
      const secMatch = path.match(/sections\[(\d+)\]/);
      if (secMatch) {
        const secIdx = +secMatch[1];
        const section = this.quoteData!.commercialTermsAndConditions.sections[secIdx];
        const newItem = { text: '', bulletPoints: [], subheading: '', isActive: true };
        section.items.push(newItem);
        this.triggerAutoSave();
        setTimeout(() => this.focusNewItem(newItem, section.items.length - 1, 'text'), 100);
      }
    }
  }
  
  // NEW HELPER: Auto-focus the newly created line
  private focusNewItem(parentItem: any, index: number, mode: 'text' | 'bullet') {
    setTimeout(() => {
      const selector = mode === 'bullet'
        ? `[propertypath*="bulletPoints[${index}]"]`
        : `[propertypath*="items[${index}].text"]:not([propertypath*="bulletPoints"])`;
  
      const el = document.querySelector(selector) as HTMLElement;
      if (el) {
        el.dispatchEvent(new Event('dblclick')); // Trigger edit mode
        setTimeout(() => el.focus(), 50);
      }
    }, 150);
  }

  addGeneralConsideration() {
    (this.quoteData!.generalConsiderations.items as any[]).push({
      title: 'New Point',
      description: 'Enter description here',
      isActive: true
    });
    this.triggerAutoSave();
  }

  addCommercialSection() {
    (this.quoteData!.commercialTermsAndConditions.sections as any[]).push({
      sectionTitle: 'New Section Title',
      isActive: true,
      items: [{ text: 'New term description', bulletPoints: [], subheading: '', isActive: true }]
    });
    this.triggerAutoSave();
  }


  getSectionTitleDisplay(section: any): string {
    const title = (section.sectionTitle || '').trim();
    if (title) {
      return this.boldBeforeColon(title + ':');
    }
    return '<em style="color:#aaa; font-style:italic;">Click to add section title...</em>:';
  }
  getMainTitleDisplay(): string {
    const title = this.quoteData?.commercialTermsAndConditions?.title?.trim();
    if (title) {
      return this.boldBeforeColon(title);
    }
    return '<em style="color:#999;font-style:italic;">Commercial Terms & Conditions</em>';
  }

  toggleGeneralConsiderationItem(index: number, event: any): void {
    if (this.quoteData?.generalConsiderations?.items?.[index]) {
      // Explicitly set as boolean to ensure proper type
      (this.quoteData.generalConsiderations.items[index] as any).isActive = Boolean(event.target.checked);
      console.log('📝 [TOGGLE] General Consideration item', index, 'isActive set to:', (this.quoteData.generalConsiderations.items[index] as any).isActive);
      // Optionally save changes
      this.triggerAutoSave();
    }
  }

  toggleCommercialSection(sectionIndex: number, event: any): void {
    if (this.quoteData?.commercialTermsAndConditions?.sections?.[sectionIndex]) {
      // Explicitly set as boolean to ensure proper type
      (this.quoteData.commercialTermsAndConditions.sections[sectionIndex] as any).isActive = Boolean(event.target.checked);
      console.log('📝 [TOGGLE] Commercial Section', sectionIndex, 'isActive set to:', (this.quoteData.commercialTermsAndConditions.sections[sectionIndex] as any).isActive);
      // Optionally save changes
      this.triggerAutoSave();
    }
  }

  closePopup(): void {
    this.dialogRef.close();
  }

  downloadPDF(): void {
    if (!this.quotationData || !this.quoteData) {
      console.error('No quotation data available');
      this.error = 'No quotation data available';
      return;
    }

    // Get customer name from quotation
    const customerName = this.quotationData.header?.customer?.value || '';
    
    // Get IDs from quotation (ID is an array of strings)
    const ids = this.quotationData.ID || [];
    
    if (!customerName || ids.length === 0) {
      console.error('Missing customer name or IDs');
      this.error = 'Missing customer name or IDs';
      return;
    }

    // Convert current PDF view back to quotation model before printing
    const quotationToSave = this.convertPdfmakerToQuotation(this.quoteData, this.quotationData);
    if (!quotationToSave._id) {
      console.error('Quotation ID missing, cannot update before print');
      this.error = 'Quotation ID missing, cannot update before print';
      return;
    }

    // Set loading state
    this.downloadingPDF = true;
    this.error = '';

    // First update the quotation, then print
    this.reportservice.updateQuotation(quotationToSave._id, quotationToSave).subscribe({
      next: (saved: Quotation) => {
        this.quotationData = saved;
        const finalIds = saved?.ID && saved.ID.length ? saved.ID : ids;

        this.reportservice.printQuotation(customerName, finalIds).subscribe({
          next: (response) => {
            console.log('PDF generation response:', response);
            
            if (response.status === 'success' && response.fileName) {
              const pdfUrl = `${this.config.getCostingUrl('baseUrl')}get-report/${encodeURIComponent(response.fileName)}`;
              window.open(pdfUrl, '_blank');
              
              this.downloadingPDF = false;
              this.toastr.success('PDF opened in new tab!', 'Success');
              this.cdr.detectChanges();
            } else {
              this.error = response.message || 'Failed to generate PDF';
              this.downloadingPDF = false;
              this.toastr.error(response.message || 'Failed to generate PDF', 'Error');
              this.cdr.detectChanges();
            }
          },
          error: (err) => {
            console.error('Error generating PDF:', err);
            this.error = 'Failed to generate PDF. Please try again.';
            this.downloadingPDF = false;
            this.toastr.error('Failed to generate PDF. Please try again.', 'Error');
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Update before print failed:', err);
        this.error = 'Failed to update quotation before printing.';
        this.downloadingPDF = false;
        this.toastr.error('Failed to update quotation before printing.', 'Error');
        this.cdr.detectChanges();
      }
    });
  }
}
