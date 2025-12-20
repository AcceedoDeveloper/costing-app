// src/app/master/master/pdfmaker/pdfmaker.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReportsService } from '../../../services/reports.service';
import { Pdfmaker } from './pdfmaker.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-pdfmaker',
  templateUrl: './pdfmaker.component.html',
  styleUrls: ['./pdfmaker.component.css']
})
export class PdfmakerComponent implements OnInit {

  today?: string;
  quoteData?: Pdfmaker;
  loading = true;
  error = '';

  constructor(
    private reportservice: ReportsService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');

    this.reportservice.getQuoteTemplate().subscribe({
      next: (data: Pdfmaker) => {
        console.log('Quote template loaded:', data);
        this.quoteData = data;
        // Ensure column headers are properly initialized
        this.initializeColumnHeaders();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load quote template:', err);
        this.error = 'Failed to load data. Please try again.';
        this.loading = false;
      }
    });
  }

  formatPartName(name: string): string {
    if (!name) return '-';
    return name.replace(/(.{30})/g, '$1<br>');
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

  boldBeforeColon(text: string): string {
    if (!text) return '';

    const escapeHtml = (str: string) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };

    let escaped = escapeHtml(text);
    let processed = escaped.replace(/\$([^$]+?)\$/g, '<strong>$1</strong>');

    if (!processed.includes('<strong>')) {
      processed = processed.replace(/^([^:]+):/g, '<strong>$1:</strong>');
    }

    return processed;
  }

  saveQuote() {
    if (!this.quoteData) return;

    this.reportservice.updateQuoteTemplate(this.quoteData).subscribe({
      next: () => alert('Quote saved successfully!'),
      error: (err) => {
        console.error('Save failed:', err);
        alert('Failed to save.');
      }
    });
  }


  private triggerAutoSave() {
    if (!this.quoteData) return;

    // Log current generalConsiderations items for debugging (types/values)
    try {
      const items = this.quoteData.generalConsiderations?.items || [];
      console.log('🟡 [PDF] Auto-save initiated. generalConsiderations items:', items.map((it: any, i: number) => ({ i, title: it.title, descriptionType: typeof it.description, descriptionValue: it.description })));
    } catch (e) {
      console.warn('🟡 [PDF] Auto-save: could not stringify items', e);
    }

    setTimeout(() => {
      this.reportservice.updateQuoteTemplate(this.quoteData!).subscribe({
        next: () => console.log('Auto-saved'),
        error: (err) => console.error('Auto-save failed:', err)
      });
    }, 300);
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
        this.openDeleteDialog('Delete this material and all its elements?', () => {
          this.quoteData!.rawMaterialComposition.materials.splice(matIdx, 1);
          this.triggerAutoSave();
        });
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
        this.openDeleteDialog('Delete this element column?', () => {
          material.elements.splice(elIdx, 1);
          this.triggerAutoSave();
        });
        return;
      }
    }

    // ==================================================================
    // 2. GENERAL CONSIDERATIONS
    // ==================================================================
    if (path.includes('generalConsiderations')) {
      if (type === 'add') {
        const newItem = { title: '', description: '' };

        if (path.includes('items[')) {
          const match = path.match(/items\[(\d+)\]/);
          if (match) {
            const idx = +match[1];
            this.quoteData!.generalConsiderations.items.splice(idx + 1, 0, newItem);
          } else {
            this.quoteData!.generalConsiderations.items.push(newItem);
          }
        } else {
          // From main title → add at end
          this.quoteData!.generalConsiderations.items.push(newItem);
        }
  
        console.log('🟢 [PDF] Adding new General Consideration item at index', this.quoteData!.generalConsiderations.items.length);
        console.log('🟢 [PDF] New item:', JSON.stringify(newItem));
        this.triggerAutoSave();
  
        // Auto-focus the new title
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
  
        return; // ← STOP HERE
      }
  
      if (type === 'delete' && path.includes('items[')) {
        const match = path.match(/items\[(\d+)\]/);
        if (match) {
          this.openDeleteDialog('Delete this consideration point?', () => {
            this.quoteData!.generalConsiderations.items.splice(+match[1], 1);
            this.triggerAutoSave();
          });
        }
        return; // ← STOP HERE
      }
    }
  
    // ==================================================================
    // 2. COMMERCIAL TERMS & CONDITIONS — NEW SECTION
    // ==================================================================
    if (path === 'commercialTermsAndConditions.title' && type === 'add') {
      const newSection = {
        sectionTitle: '',
        items: [{ text: '', bulletPoints: [], subheading: '' }]
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
  
    // ==================================================================
    // 3. COMMERCIAL TERMS — SECTION & ITEM LOGIC
    // ==================================================================
    const secMatch = path.match(/sections\[(\d+)\]/);
    if (secMatch) {
      const secIdx = +secMatch[1];
      const section = this.quoteData!.commercialTermsAndConditions.sections[secIdx];
  
      // Delete entire section
      if (path.includes('.sectionTitle') && type === 'delete') {
        this.openDeleteDialog('Delete entire section?', () => {
          this.quoteData!.commercialTermsAndConditions.sections.splice(secIdx, 1);
          this.triggerAutoSave();
        });
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
          this.openDeleteDialog('Delete this bullet?', () => {
            if (item.bulletPoints) {
              item.bulletPoints.splice(bulletIdx, 1);
              if (item.bulletPoints.length === 0) delete item.bulletPoints;
            }
            this.triggerAutoSave();
          });
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
          this.openDeleteDialog('Delete this line?', () => {
            section.items.splice(itemIdx, 1);
            this.triggerAutoSave();
          });
        } else if (type === 'add') {
          const newItem = { text: '', bulletPoints: [], subheading: '' };
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
        const newItem = { text: '', bulletPoints: [], subheading: '' };
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
  // ──────────────────────────────
  // Manual Add Methods (for buttons, if you ever want them back)
  // ──────────────────────────────
  addGeneralConsideration() {
    this.quoteData!.generalConsiderations.items.push({
      title: 'New Point',
      description: 'Enter description here'
    });
    this.triggerAutoSave();
  }

  addCommercialSection() {
    this.quoteData!.commercialTermsAndConditions.sections.push({
      sectionTitle: 'New Section Title',
      items: [{ text: 'New term description', bulletPoints: [], subheading: '' }]
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
  
  /**
   * Returns the HTML string to render inside description field.
   * Handles string or array types for backwards compatibility.
   */
  getDescriptionDisplay(item: any): string {
    const desc = item && item.description;
    let text = '';

    if (typeof desc === 'string') {
      text = desc.trim();
    } else if (Array.isArray(desc)) {
      // Join array elements with a single space (common case: saved as array of lines)
      text = desc.join(' ').trim();
    }

    if (text) {
      return this.boldBeforeColon(text);
    }

    return '<em style="color:#aaa;font-style:italic;">Click to add description...</em>';
  }
  getMainTitleDisplay(): string {
    const title = this.quoteData?.commercialTermsAndConditions?.title?.trim();
    if (title) {
      return this.boldBeforeColon(title);
    }
    return '<em style="color:#999;font-style:italic;">Commercial Terms & Conditions</em>';
  }

  // Helper method to check if columns is an array (new structure) or object (old structure)
  isColumnsArray(): boolean {
    return Array.isArray(this.quoteData?.quoteTable?.columns);
  }

  // Get column header - supports both old (string) and new (LabelValue) structure
  getColumnHeader(columnKey: string): string {
    if (!this.quoteData?.quoteTable?.columns) {
      return '';
    }

    const columns = this.quoteData.quoteTable.columns;

    if (this.isColumnsArray()) {
      // New structure: array with LabelValue format - get label from first row
      const columnsArray = columns as any[];
      if (columnsArray && columnsArray.length > 0) {
        const firstRow = columnsArray[0];
        if (firstRow[columnKey] && typeof firstRow[columnKey] === 'object' && 'label' in firstRow[columnKey]) {
          return firstRow[columnKey].label || '';
        }
      }
    } else {
      // Old structure: direct string value
      const colObj = columns as any;
      const header = colObj[columnKey];
      if (header && typeof header === 'string') {
        return header;
      } else if (header && typeof header === 'object' && 'label' in header) {
        return header.label || '';
      }
    }

    return '';
  }

  // Initialize column headers to ensure they exist
  private initializeColumnHeaders(): void {
    if (!this.quoteData?.quoteTable?.columns) {
      return;
    }

    const columns = this.quoteData.quoteTable.columns;
    const defaultHeaders: { [key: string]: string } = {
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
      // New structure: ensure first row has all column headers with LabelValue format
      const columnsArray = columns as any[];
      if (columnsArray && columnsArray.length > 0) {
        const firstRow = columnsArray[0];
        Object.keys(defaultHeaders).forEach(key => {
          if (!firstRow[key]) {
            firstRow[key] = { label: defaultHeaders[key], value: '' };
          } else if (typeof firstRow[key] === 'string') {
            // Convert string to LabelValue format
            firstRow[key] = { label: firstRow[key], value: '' };
          } else if (typeof firstRow[key] === 'object' && !('label' in firstRow[key])) {
            // Ensure it has label property
            firstRow[key] = { label: defaultHeaders[key], value: firstRow[key].value || '' };
          } else if (typeof firstRow[key] === 'object' && 'label' in firstRow[key] && !firstRow[key].label) {
            // If label is empty, set default
            firstRow[key].label = defaultHeaders[key];
          }
        });
      }
    } else {
      // Old structure: ensure all headers exist as strings
      const colObj = columns as any;
      Object.keys(defaultHeaders).forEach(key => {
        if (!colObj[key] || (typeof colObj[key] === 'string' && colObj[key].trim() === '')) {
          colObj[key] = defaultHeaders[key];
        } else if (typeof colObj[key] === 'object' && 'label' in colObj[key]) {
          // Convert LabelValue to string for old structure compatibility
          colObj[key] = colObj[key].label || defaultHeaders[key];
        }
      });
    }
  }

  /* ---------------------- DELETE CONFIRMATION DIALOG ---------------------- */
  private openDeleteDialog(message: string, onConfirm: () => void): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Delete Confirmation',
        message: message
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        onConfirm();
      }
    });
  }
}