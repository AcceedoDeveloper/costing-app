
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pdfmaker } from '../pdfmaker/pdfmaker.model';
import { ReportsService } from '../../../services/reports.service';
import { Quotation } from '../../../models/Quotation.model';


@Component({
  selector: 'app-pdf-view',
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.css']
})
export class PdfViewComponent implements OnInit, AfterViewInit {
  @ViewChild('documentPage', { static: false }) documentPageRef?: ElementRef;
  
  quoteData?: Pdfmaker;
  loading = true;
  error = '';
  selectedPartsData: any[] = []; // Store selected parts data (drawingNo, partName)

  rowsPerItem = 7; // Number of rows each item should span
  
  // Page numbering properties
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportsService: ReportsService
  ) { }

  ngOnInit(): void {
    // Get route parameters (customerName and IDs)
    this.route.queryParams.subscribe(params => {
      const customerName = params['customerName'];
      const idsParam = params['id']; // IDs joined with % separator
      
      if (!customerName) {
        this.error = 'Customer name is required';
        this.loading = false;
        return;
      }

      // Parse IDs from the parameter (split by %)
      const ids = idsParam ? idsParam.split('%').filter(id => id && id.trim() !== '') : [];
      
      // First, fetch the selected parts data to get drawingNo and partName
      this.reportsService.getCustomerDetails({
        customerName: customerName
      }).subscribe({
        next: (response) => {
          // Filter parts by IDs to get the selected parts data
          const allParts = response.data || [];
          this.selectedPartsData = allParts.filter((part: any) => {
            const partId = String(part.ID || part._id || '');
            return ids.includes(partId);
          }).map((part: any, index: number) => ({
            sno: index + 1,
            drawingNo: part.drawingNo || '-',
            partName: part.partName || '-',
            ID: part.ID || part._id
          }));
          
          console.log('✅ Selected parts data loaded:', this.selectedPartsData);
          
          // Now fetch quotation data
          this.reportsService.getQuotationByCustomerAndId(customerName, ids).subscribe({
            next: (quotations: Quotation[]) => {
              if (quotations && quotations.length > 0) {
                // Use the first quotation if multiple are returned
                this.quoteData = this.convertQuotationToPdfmaker(quotations[0]);
                this.loading = false;
                // Calculate pages after data is loaded
                setTimeout(() => this.calculateTotalPages(), 100);
              } else {
                this.error = 'No quotation found for the specified customer and parts';
                this.loading = false;
              }
            },
            error: (err) => {
              console.error('Error fetching quotation:', err);
              this.error = 'Failed to load quotation data. Please try again.';
              this.loading = false;
            }
          });
        },
        error: (err) => {
          console.error('Error fetching customer details:', err);
          // Still try to load quotation even if parts fetch fails
          this.reportsService.getQuotationByCustomerAndId(customerName, ids).subscribe({
            next: (quotations: Quotation[]) => {
              if (quotations && quotations.length > 0) {
                this.quoteData = this.convertQuotationToPdfmaker(quotations[0]);
                this.loading = false;
                // Calculate pages after data is loaded
                setTimeout(() => this.calculateTotalPages(), 100);
              } else {
                this.error = 'No quotation found for the specified customer and parts';
                this.loading = false;
              }
            },
            error: (err) => {
              console.error('Error fetching quotation:', err);
              this.error = 'Failed to load quotation data. Please try again.';
              this.loading = false;
            }
          });
        }
      });
    });
  }

  ngAfterViewInit(): void {
    // Calculate pages after view is initialized
    setTimeout(() => this.calculateTotalPages(), 200);
  }

  calculateTotalPages(): void {
    try {
      // A4 landscape page dimensions in pixels (at 96 DPI)
      // A4 landscape: 297mm x 210mm = 1123px x 794px (at 96 DPI)
      // With margins: 10mm top/bottom, 12mm left/right
      // Available height: 297mm - 20mm (top+bottom margins) = 277mm = 1047px
      const pageHeight = 1047; // Available height in pixels for A4 landscape
      const pageMargin = 38; // 10mm in pixels (top + bottom)
      
      if (this.documentPageRef?.nativeElement) {
        const contentHeight = this.documentPageRef.nativeElement.scrollHeight;
        const calculatedPages = Math.ceil(contentHeight / pageHeight) || 1;
        
        this.totalPages = calculatedPages;
        this.currentPage = 1;
        
        console.log('📄 Page Calculation:', {
          contentHeight: contentHeight,
          pageHeight: pageHeight,
          totalPages: this.totalPages,
          currentPage: this.currentPage,
          pageInfo: `${this.currentPage} of ${this.totalPages}`
        });
      } else {
        // Fallback calculation based on content sections
        this.totalPages = this.estimatePagesFromContent();
        this.currentPage = 1;
        
        console.log('📄 Estimated Pages (fallback):', {
          totalPages: this.totalPages,
          currentPage: this.currentPage,
          pageInfo: `${this.currentPage} of ${this.totalPages}`
        });
      }
    } catch (error) {
      console.error('❌ Error calculating pages:', error);
      this.totalPages = 1;
      this.currentPage = 1;
    }
  }

  estimatePagesFromContent(): number {
    // Estimate pages based on content sections
    let estimatedHeight = 0;
    
    // Header section: ~100px
    estimatedHeight += 100;
    
    // Quote table: ~50px per row
    const tableRows = this.getTableRows().length;
    estimatedHeight += Math.max(200, tableRows * 50);
    
    // Chemical composition: ~150px per material
    const materials = this.quoteData?.rawMaterialComposition?.materials?.length || 0;
    estimatedHeight += materials * 150;
    
    // General considerations: ~30px per item
    const considerations = this.quoteData?.generalConsiderations?.items?.filter((item: any) => item.isActive !== false).length || 0;
    estimatedHeight += considerations * 30;
    
    // Commercial terms: ~40px per section
    const commercialSections = this.quoteData?.commercialTermsAndConditions?.sections?.filter((section: any) => section.isActive !== false).length || 0;
    estimatedHeight += commercialSections * 40;
    
    // Signature and footer: ~100px
    estimatedHeight += 100;
    
    // A4 landscape available height: ~1047px
    const pageHeight = 1047;
    return Math.max(1, Math.ceil(estimatedHeight / pageHeight));
  }

  getPageNumberDisplay(): string {
    const display = `${this.currentPage} of ${this.totalPages}`;
    console.log('📄 Page Display:', display);
    return display;
  }

  getRowSpan(index: number): number {
    return this.rowsPerItem;
  }

  getEmptyRows(index: number): number[] {
    // Return array for empty rows (rowsPerItem - 1 because first row has data)
    return Array(this.rowsPerItem - 1).fill(0).map((x, i) => i);
  }

  formatPartName(partName: string): string {
    if (!partName) return '';
    // Split by space and create multi-line format
    // "STATOR SEGMENT" becomes "STATOR\nSEGMENT"
    const words = partName.split(' ');
    if (words.length > 1) {
      return words[0] + '\n' + words.slice(1).join(' ');
    }
    return partName;
  }

  formatCastingMaterial(material: string): string {
    if (!material) return '';
    // Format "ET (Stainless Steel)" to "ET\n(Stainless Steel)"
    if (material.includes('(') && material.includes(')')) {
      const parts = material.split('(');
      if (parts.length === 2) {
        return parts[0].trim() + '\n(' + parts[1];
      }
    }
    return material;
  }

  // Get drawing number from selected parts data
  getDrawingNumber(index: number): string {
    if (this.selectedPartsData && this.selectedPartsData[index]) {
      return this.selectedPartsData[index].drawingNo || '-';
    }
    return '-';
  }

  // Get part name from selected parts data
  getPartName(index: number): string {
    if (this.selectedPartsData && this.selectedPartsData[index]) {
      return this.selectedPartsData[index].partName || '-';
    }
    return '-';
  }

  // Get S.No from selected parts data
  getSno(index: number): number {
    if (this.selectedPartsData && this.selectedPartsData[index]) {
      return this.selectedPartsData[index].sno || (index + 1);
    }
    return index + 1;
  }

  // Check if columns is an array (new structure) or object (old structure)
  isColumnsArray(): boolean {
    return Array.isArray(this.quoteData?.quoteTable?.columns);
  }

  // Get column header - extract labels from LabelValue format or use defaults
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
        // New structure: extract label from first row's LabelValue format
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
        // Old structure: columns is an object with header strings
        const columns = this.quoteData.quoteTable.columns as any;
        if (columns[columnKey]) {
          const header = String(columns[columnKey]);
          // Return header if it exists and is not empty, otherwise use default
          if (header && header.trim() !== '') {
            return header;
          }
        }
      }
    }
    
    // Fallback: Always return default label if not found in database
    return defaultLabels[columnKey] || '';
  }

  // Get table rows - handle both array structure (columns) and parts structure
  getTableRows(): any[] {
    if (!this.quoteData?.quoteTable) return [];
    
    // If columns is an array, use it as data rows
    if (this.isColumnsArray()) {
      return this.quoteData.quoteTable.columns as any[];
    }
    
    // Otherwise, use parts array
    return this.quoteData.quoteTable.parts || [];
  }

  // Get value from row - handle LabelValue format
  getRowValue(row: any, key: string): string {
    if (!row) return '-';
    
    // Check if it's LabelValue format (object with value property)
    if (row[key] && typeof row[key] === 'object' && 'value' in row[key]) {
      return row[key].value || '-';
    }
    
    // Direct property access
    return row[key] || '-';
  }

  boldBeforeColon(text: string): string {
    if (!text) return '';
    const escapeHtml = (str: string) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };
    let escaped = escapeHtml(text);
    let processed = escaped.replace(/\$+([^$]+?)\$+/g, '<strong>$1</strong>');
    if (!processed.includes('<strong>')) {
      processed = processed.replace(/^([^:]+):/g, '<strong>$1:</strong>');
    }
    return processed;
  }

  generatePDF(): void {
    // TODO: Implement PDF generation logic
    console.log('Generating PDF with data:', this.quoteData);
    // You can integrate a PDF library like jsPDF or pdfmake here
    alert('PDF generation functionality will be implemented here');
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
          isActive: item.isActive !== false
        }))
      },
      commercialTermsAndConditions: {
        title: quotation.commercialTermsAndConditions?.title || '',
        sections: (quotation.commercialTermsAndConditions?.sections || []).map(section => ({
          sectionTitle: section.sectionTitle || '',
          isActive: section.isActive !== false,
          items: (section.items || []).map((item: any) => ({
            text: item.text,
            subheading: item.subheading,
            bulletPoints: item.bulletPoints || [],
            isActive: item.isActive !== false
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

}
