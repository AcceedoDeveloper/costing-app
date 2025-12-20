import { Directive, ElementRef, Input, HostListener, Renderer2 } from '@angular/core';
import { Pdfmaker } from '../../../master/master/pdfmaker/pdfmaker.model';
import { Quotation } from '../../../models/Quotation.model';
import { ReportsService } from '../../../services/reports.service';

@Directive({
  selector: '[appQuotationEdit]'
})
export class QuotationEditDirective {

  @Input() quoteData!: Pdfmaker;
  @Input() propertyPath!: string;
  @Input() quotationData!: Quotation; // Required for conversion and saving

  private originalValue = '';
  private toolbarEl: HTMLElement | null = null;
  private isToolbarClick = false;
  private savedRange: Range | null = null;
  private skipSave = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private reportservice: ReportsService
  ) {}

  /* ---------------------- DOUBLE CLICK → EDIT + TOOLBAR ---------------------- */
  @HostListener('dblclick')
  onDoubleClick() {
    // Check if quoteData and quotationData are available
    if (!this.quoteData || !this.quotationData) {
      console.warn('⚠️ [EDIT] Cannot edit: quoteData or quotationData is missing');
      return;
    }
    
    const cleanedPath = this.propertyPath.trim();
    const rawValue = this.getNestedProperty(this.quoteData, cleanedPath);
    this.originalValue = rawValue ? String(rawValue).trim() : '';

    // Set current content with $bold$ → <strong>
    this.el.nativeElement.innerHTML = this.convertDollarToHtml(this.originalValue);

    this.renderer.setAttribute(this.el.nativeElement, 'contenteditable', 'true');
    this.el.nativeElement.focus();
    this.addEditingStyle(true);

    // ────────────────────── DECIDE TOOLBAR BUTTONS ──────────────────────
    let actionButtons: 'add' | 'delete' | 'both' | undefined;
    const lowerPath = cleanedPath.toLowerCase();

    // 1. GENERAL CONSIDERATIONS
    if (lowerPath.includes('generalconsiderations')) {
      if (lowerPath === 'generalconsiderations.title') {
        actionButtons = 'add';        // Main title → only Add
      } else {
        actionButtons = 'both';       // Every line inside → Add + Delete
      }
    }
    // 2. COMMERCIAL TERMS & CONDITIONS
    else if (lowerPath.includes('commercialtermsandconditions')) {
      if (lowerPath === 'commercialtermsandconditions.title') {
        actionButtons = 'add';        // Main title → only Add
      } else {
        actionButtons = 'both';       // Everything else → Add + Delete
      }
    }
    // 3. RAW MATERIAL COMPOSITION
    else if (lowerPath.includes('rawmaterialcomposition')) {
      // Hide Add/Delete for the main composition title and for per-material names
      if (lowerPath === 'rawmaterialcomposition.title' || lowerPath.endsWith('.materialname')) {
        actionButtons = undefined;   // No Add/Delete
      } else {
        actionButtons = 'both';       // Material elements and ranges → Add + Delete
      }
    }
    // 4. Everything else (header, table, etc.) → no buttons
    else {
      actionButtons = undefined;
    }

    this.showToolbar(actionButtons);
  }

  @HostListener('blur')
  onBlur() {
    if (this.isToolbarClick) {
      this.isToolbarClick = false;
      setTimeout(() => this.el.nativeElement.focus(), 0);
      return;
    }
    if (!this.skipSave) {
      this.saveChanges();
    } else {
      this.skipSave = false;
      this.reset();
    }
  }

  @HostListener('keydown.enter', ['$event'])
  onEnter(e: KeyboardEvent) {
    e.preventDefault();
    this.el.nativeElement.blur();
  }

  @HostListener('keydown.escape')
  onEscape() {
    this.el.nativeElement.innerHTML = this.convertDollarToHtml(this.originalValue);
    this.el.nativeElement.blur();
  }

  /* ---------------------- SAVE CHANGES - USES updateQuotation ---------------------- */
  private saveChanges() {
    if (!this.quoteData) {
      console.warn('⚠️ [EDIT] Cannot save: quoteData is missing');
      this.reset();
      return;
    }
    
    const htmlContent = this.el.nativeElement.innerHTML.trim();
    const dollarFormat = this.convertHtmlToDollar(htmlContent);

    if (dollarFormat !== this.originalValue) {
      const propertyPath = this.propertyPath.trim();
      this.setNestedProperty(this.quoteData, propertyPath, dollarFormat);
      console.log('📝 [EDIT] Changed:', propertyPath, '→', dollarFormat);
      console.log('📝 [EDIT] quoteData after change:', JSON.stringify(this.quoteData, null, 2));
      
      // Always use updateQuotation for final-quotation component
      if (this.quotationData && this.quotationData._id) {
        const quotationToSave = this.convertPdfmakerToQuotation(this.quoteData, this.quotationData);
        console.log('📝 [EDIT] Saving quotation:', JSON.stringify(quotationToSave, null, 2));
        
        this.reportservice.updateQuotation(this.quotationData._id, quotationToSave).subscribe({
          next: (saved: Quotation) => {
            // Update quotationData with saved data
            Object.assign(this.quotationData, saved);
            console.log('✅ [EDIT] Saved successfully - ID:', saved._id);
            console.log('✅ [EDIT] Saved quotation data:', JSON.stringify(saved, null, 2));
          },
          error: (err) => {
            console.error('❌ [EDIT] Save failed:', err);
            console.error('❌ [EDIT] Error details:', {
              status: err.status,
              statusText: err.statusText,
              url: err.url,
              message: err.message,
              error: err.error
            });
          }
        });
      } else {
        console.warn('⚠️ [EDIT] Cannot save: missing quotationData or _id', {
          hasQuotationData: !!this.quotationData,
          hasId: !!(this.quotationData && this.quotationData._id)
        });
      }
    }
    this.reset();
  }

  private reset() {
    this.renderer.removeAttribute(this.el.nativeElement, 'contenteditable');
    this.addEditingStyle(false);
    this.hideToolbar();
    this.savedRange = null;
    this.isToolbarClick = false;
    this.skipSave = false;
  }

  private addEditingStyle(editing: boolean) {
    if (editing) {
      this.renderer.setStyle(this.el.nativeElement, 'background', '#fffbe6');
      this.renderer.setStyle(this.el.nativeElement, 'outline', '2px dashed #ffb300');
      this.renderer.setStyle(this.el.nativeElement, 'padding', '6px 8px');
      this.renderer.setStyle(this.el.nativeElement, 'border-radius', '6px');
      this.renderer.setStyle(this.el.nativeElement, 'min-height', '24px');
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'background');
      this.renderer.removeStyle(this.el.nativeElement, 'outline');
      this.renderer.removeStyle(this.el.nativeElement, 'padding');
      this.renderer.removeStyle(this.el.nativeElement, 'border-radius');
    }
  }

  /* ---------------------- TOOLBAR (Bold + Add + Delete) ---------------------- */
  private showToolbar(actionButtons?: 'add' | 'delete' | 'both') {
    if (this.toolbarEl) this.hideToolbar();

    // Determine whether formatting or action buttons should be shown for this element.
    const lowerProp = (this.propertyPath || '').trim().toLowerCase();
    const classList = this.el?.nativeElement?.classList;
    const isCompClass = !!(classList && (classList.contains('composition-intro') || classList.contains('material-type-header')));
    const disableFormatting = isCompClass || lowerProp.includes('rawmaterialcomposition') || lowerProp.includes('quotetable');

    const willShowFormatting = !disableFormatting;
    const willShowActionButtons = !!actionButtons;

    // If nothing to show, don't render the toolbar at all (prevents empty background box)
    if (!willShowFormatting && !willShowActionButtons) return;

    const rect = this.el.nativeElement.getBoundingClientRect();
    const toolbar = this.renderer.createElement('div');
    this.renderer.addClass(toolbar, 'pdf-edit-toolbar');
    this.renderer.setStyle(toolbar, 'position', 'fixed');
    this.renderer.setStyle(toolbar, 'top', `${rect.top - 54}px`);
    this.renderer.setStyle(toolbar, 'left', `${rect.left}px`);
    this.renderer.setStyle(toolbar, 'background', '#2c3e50');
    this.renderer.setStyle(toolbar, 'color', 'white');
    this.renderer.setStyle(toolbar, 'padding', '10px 14px');
    this.renderer.setStyle(toolbar, 'border-radius', '10px');
    this.renderer.setStyle(toolbar, 'font-size', '13px');
    this.renderer.setStyle(toolbar, 'box-shadow', '0 8px 25px rgba(0,0,0,0.3)');
    this.renderer.setStyle(toolbar, 'z-index', '10000');
    this.renderer.setStyle(toolbar, 'display', 'flex');
    this.renderer.setStyle(toolbar, 'align-items', 'center');
    this.renderer.setStyle(toolbar, 'gap', '12px');
    this.renderer.setStyle(toolbar, 'user-select', 'none');

    // Prevent blur when clicking toolbar
    this.renderer.listen(toolbar, 'mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.isToolbarClick = true;
    });

    // Bold Button (skip when formatting is disabled)
    if (willShowFormatting) {
      const boldBtn = this.createToolButton('Bold', '#f39c12', () => {
        this.wrapSelectionWithDollar();
        setTimeout(() => this.el.nativeElement.blur(), 50);
      });
      this.renderer.appendChild(toolbar, boldBtn);

      // Unbold Button
      const unboldBtn = this.createToolButton('Unbold', '#95a5a6', () => {
        this.removeDollarMarkers();
        setTimeout(() => this.el.nativeElement.blur(), 50);
      });
      this.renderer.appendChild(toolbar, unboldBtn);
    }

    // Add / Delete Buttons
    if (actionButtons) {
      const sep = this.renderer.createElement('span');
      this.renderer.setStyle(sep, 'opacity', '0.5');
      this.renderer.appendChild(sep, this.renderer.createText('│'));
      this.renderer.appendChild(toolbar, sep);

      if (actionButtons === 'add' || actionButtons === 'both') {
        const addBtn = this.createIconButton('add', '#27ae60', () => {
          this.skipSave = true;
          this.dispatchAction('add');
          this.hideToolbar();
          this.el.nativeElement.blur();
        });
        this.renderer.appendChild(toolbar, addBtn);
      }

      if (actionButtons === 'delete' || actionButtons === 'both') {
        const delBtn = this.createIconButton('delete', '#e74c3c', () => {
          if (confirm('Delete this item?')) {
            this.skipSave = true;
            this.dispatchAction('delete');
            this.hideToolbar();
            this.el.nativeElement.blur();
          }
        });
        this.renderer.appendChild(toolbar, delBtn);
      }
    }

    this.renderer.appendChild(document.body, toolbar);
    this.toolbarEl = toolbar;

    // Track selection for bold/unbold
    this.renderer.listen(document, 'selectionchange', () => {
      const sel = window.getSelection();
      if (sel?.rangeCount && this.el.nativeElement.contains(sel.getRangeAt(0).commonAncestorContainer)) {
        this.saveSelection();
      }
    });
  }

  private createToolButton(text: string, bg: string, callback: () => void): HTMLElement {
    const btn = this.renderer.createElement('button');
    this.renderer.setStyle(btn, 'padding', '6px 12px');
    this.renderer.setStyle(btn, 'border', 'none');
    this.renderer.setStyle(btn, 'border-radius', '6px');
    this.renderer.setStyle(btn, 'background', bg);
    this.renderer.setStyle(btn, 'color', 'white');
    this.renderer.setStyle(btn, 'cursor', 'pointer');
    this.renderer.setStyle(btn, 'font-size', '12px');
    this.renderer.setStyle(btn, 'font-weight', '600');
    this.renderer.appendChild(btn, this.renderer.createText(text));

    this.renderer.listen(btn, 'mousedown', e => { e.preventDefault(); e.stopPropagation(); });
    this.renderer.listen(btn, 'click', callback);
    return btn;
  }

  private createIconButton(icon: string, bg: string, callback: () => void): HTMLElement {
    const btn = this.renderer.createElement('button');
    this.renderer.setStyle(btn, 'width', '36px');
    this.renderer.setStyle(btn, 'height', '36px');
    this.renderer.setStyle(btn, 'border', 'none');
    this.renderer.setStyle(btn, 'border-radius', '50%');
    this.renderer.setStyle(btn, 'background', bg);
    this.renderer.setStyle(btn, 'color', 'white');
    this.renderer.setStyle(btn, 'cursor', 'pointer');
    this.renderer.setStyle(btn, 'font-size', '10px');
    this.renderer.setStyle(btn, 'display', 'flex');
    this.renderer.setStyle(btn, 'align-items', 'center');
    this.renderer.setStyle(btn, 'justify-content', 'center');
    this.renderer.appendChild(btn, this.renderer.createText(icon));

    this.renderer.listen(btn, 'click', callback);
    return btn;
  }

  private dispatchAction(type: 'add' | 'delete') {
    const event = new CustomEvent('pdf-edit-action', {
      detail: { type, path: this.propertyPath },
      bubbles: true,
      cancelable: true
    });
    this.el.nativeElement.dispatchEvent(event);
  }

  private hideToolbar() {
    if (this.toolbarEl && this.toolbarEl.parentNode) {
      this.renderer.removeChild(document.body, this.toolbarEl);
      this.toolbarEl = null;
    }
  }

  private saveSelection() {
    const sel = window.getSelection();
    if (sel?.rangeCount) {
      this.savedRange = sel.getRangeAt(0).cloneRange();
    }
  }

  /* ---------------------- BOLD FORMAT ($text$) ↔ <strong>text</strong> ---------------------- */
  private convertDollarToHtml(text: string): string {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    // Support one-or-more $ markers (e.g. $text$, $$text$$, $$$text$$$)
    return div.innerHTML.replace(/\$+([^$]+?)\$+/g, '<strong>$1</strong>');
  }

  private convertHtmlToDollar(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    const walk = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
      if (node.nodeType !== Node.ELEMENT_NODE) return '';

      const el = node as HTMLElement;
      let result = '';
      node.childNodes.forEach(child => result += walk(child));
      if (el.tagName === 'STRONG' || el.tagName === 'B') {
        return '$' + result + '$';
      }
      return result;
    };

    let result = '';
    temp.childNodes.forEach(n => result += walk(n));
    return result.trim();
  }

  private wrapSelectionWithDollar() {
    let range = this.savedRange || window.getSelection()?.getRangeAt(0);
    if (!range || range.toString().trim() === '') return;

    const strong = document.createElement('strong');
    try {
      range.surroundContents(strong);
    } catch {
      const contents = range.extractContents();
      strong.appendChild(contents);
      range.insertNode(strong);
    }
    window.getSelection()?.removeAllRanges();
    this.savedRange = null;
  }

  private removeDollarMarkers() {
    const range = this.savedRange || window.getSelection()?.getRangeAt(0);
    if (!range) return;

    let container: Node | null = range.commonAncestorContainer;
    if (container.nodeType === Node.TEXT_NODE) container = container.parentNode;

    const strong = (container as HTMLElement)?.closest?.('strong, b');
    if (strong?.parentNode) {
      while (strong.firstChild) {
        strong.parentNode.insertBefore(strong.firstChild, strong);
      }
      strong.parentNode.removeChild(strong);
      strong.parentNode.normalize();
    }
    window.getSelection()?.removeAllRanges();
    this.savedRange = null;
  }

  /* ---------------------- NESTED PROPERTY GET/SET ---------------------- */
  private getNestedProperty(obj: any, path: string): any {
    return path
      .replace(/\[(\d+)\]/g, '.$1')
      .split('.')
      .filter(p => p)
      .reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, obj);
  }

  private setNestedProperty(obj: any, path: string, value: any) {
    const parts = path
      .replace(/\[(\d+)\]/g, '.$1')
      .split('.')
      .filter(p => p);

    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = isNaN(Number(parts[i])) ? parts[i] : Number(parts[i]);
      if (current[key] == null) {
        // If current key is a number (array index) and next part is not a number, create object
        // Otherwise, if next part is a number, create array
        const isCurrentKeyNumber = !isNaN(Number(parts[i]));
        const isNextPartNumber = i + 1 < parts.length && !isNaN(Number(parts[i + 1]));
        
        if (isCurrentKeyNumber && !isNextPartNumber) {
          // Array index pointing to an object (e.g., parts[0].drawingNumber)
          current[key] = {};
        } else if (isNextPartNumber) {
          // Next part is a number, so create array
          current[key] = [];
        } else {
          // Otherwise create object
          current[key] = {};
        }
      }
      current = current[key];
    }
    current[parts[parts.length - 1]] = value;
  }

  /* ---------------------- CONVERT PDFMAKER TO QUOTATION ---------------------- */
  private convertPdfmakerToQuotation(pdfmaker: Pdfmaker, originalQuotation: Quotation): Quotation {
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
}
