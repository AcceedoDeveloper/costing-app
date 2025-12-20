import { Directive, Input, ElementRef, HostListener, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Pdfmaker } from './pdfmaker.model';
import { ReportsService } from '../../../services/reports.service';

@Directive({
  selector: '[appPdfEdit]'
})
export class PdfEditDirective implements OnInit, OnDestroy {
  @Input() quoteData?: Pdfmaker;
  @Input() propertyPath?: string;

  private isEditing = false;
  /** Value from the model in $bold$ format (not HTML) */
  private originalValue = '';

  // Toolbar / selection helpers (borrowed pattern from QuotationEditDirective)
  private toolbarEl: HTMLElement | null = null;
  private isToolbarClick = false;
  private savedRange: Range | null = null;
  private skipSave = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private reportservice: ReportsService
  ) { }

  ngOnInit(): void {
    // Set propertypath attribute (lowercase) for querySelector purposes
    if (this.propertyPath) {
      this.renderer.setAttribute(this.el.nativeElement, 'propertypath', this.propertyPath);
    }

    // Make non-editing state slightly interactive (cursor etc. handled by CSS)
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('dblclick', ['$event'])
  onDoubleClick(event: MouseEvent): void {
    event.preventDefault();

    if (!this.quoteData || !this.propertyPath) {
      console.warn('[PdfEdit] Cannot edit: quoteData or propertyPath is missing');
      return;
    }

    const cleanedPath = this.propertyPath.trim();
    const rawValue = this.getNestedProperty(this.quoteData, cleanedPath);
    this.originalValue = rawValue ? String(rawValue).trim() : '';

    // Render current content: $bold$ → <strong>
    this.el.nativeElement.innerHTML = this.convertDollarToHtml(this.originalValue);

    this.startEditing(cleanedPath);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isEditing) return;

    // Ctrl+Enter or Ctrl+N: Add new item
    if ((event.ctrlKey || event.metaKey) && (event.key === 'Enter' || event.key === 'n' || event.key === 'N')) {
      event.preventDefault();
      this.dispatchAction('add');
      return;
    }

    // Delete key: Delete current item (only if content is empty or Ctrl+Delete)
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const content = this.getTextContent();
      if (event.ctrlKey || event.metaKey || !content || content.trim() === '') {
        event.preventDefault();
        this.dispatchAction('delete');
        return;
      }
    }

    // Escape: Cancel editing
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEditing();
      return;
    }

    // Enter (without Ctrl): Save and exit (for single-line fields)
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      const tagName = this.el.nativeElement.tagName.toLowerCase();
      if (tagName === 'td' || tagName === 'th' || tagName === 'span') {
        event.preventDefault();
        this.saveAndExit();
        return;
      }
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent): void {
    if (this.isEditing) {
      // If blur caused by toolbar click, immediately refocus
      if (this.isToolbarClick) {
        this.isToolbarClick = false;
        setTimeout(() => this.el.nativeElement.focus(), 0);
        return;
      }

      if (!this.skipSave) {
        this.saveAndExit();
      } else {
        // e.g. Add/Delete via toolbar or Escape → do not save current text
        this.skipSave = false;
        this.reset();
      }
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    if (!this.isEditing) return;
    
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') || '';
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  private startEditing(cleanedPath: string): void {
    if (this.isEditing) return;

    this.isEditing = true;
    
    // Make contenteditable
    this.renderer.setAttribute(this.el.nativeElement, 'contenteditable', 'true');
    this.addEditingStyle(true);
    
    // Focus and select all text
    setTimeout(() => {
      this.el.nativeElement.focus();
      const range = document.createRange();
      range.selectNodeContents(this.el.nativeElement);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }, 0);

    // Decide which toolbar buttons to show (Add/Delete)
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
      if (lowerPath === 'rawmaterialcomposition.title') {
        actionButtons = 'add';        // Main title → only Add (new material)
      } else {
        actionButtons = 'both';       // Material names, elements, ranges → Add + Delete
      }
    }
    // 4. Everything else (header, table, etc.) → no Add/Delete buttons
    else {
      actionButtons = undefined;
    }

    this.showToolbar(actionButtons);
  }

  private saveAndExit(): void {
    if (!this.isEditing || !this.quoteData || !this.propertyPath) return;

    const htmlContent = this.el.nativeElement.innerHTML.trim();
    const dollarFormat = this.convertHtmlToDollar(htmlContent);

    if (dollarFormat !== this.originalValue) {
      const propertyPath = this.propertyPath.trim();
      this.updateDataModel(dollarFormat, propertyPath);
      this.originalValue = dollarFormat;

      // Save to backend using ReportsService
      this.saveToBackend();
    }

    this.reset();
  }

  private saveToBackend(): void {
    if (!this.quoteData) {
      console.warn('[PdfEdit] Cannot save: quoteData is missing');
      return;
    }

    // Deep-clone to strip any Angular metadata / prototypes before sending
    const payload = JSON.parse(JSON.stringify(this.quoteData));
    
    this.reportservice.updateQuoteTemplate(payload).subscribe({
      next: (saved: Pdfmaker) => {
        // Update quoteData with saved data
        Object.assign(this.quoteData!, saved);
        console.log('[PdfEdit] Saved successfully', saved);
        // Helpful debug: log types of general considerations descriptions after save
        try {
          const items = saved.generalConsiderations?.items || [];
          console.log('[PdfEdit] After save - generalConsiderations.items types:', items.map((it: any, idx: number) => ({ idx, type: typeof it.description, value: it.description })));
        } catch (e) {
          console.warn('[PdfEdit] Could not log saved items details', e);
        }
      },
      error: (err) => {
        console.error('[PdfEdit] Save failed:', err);
      }
    });
  }

  private cancelEditing(): void {
    if (!this.isEditing) return;

    // Restore original content from model value
    this.skipSave = true;
    this.el.nativeElement.innerHTML = this.convertDollarToHtml(this.originalValue);
    this.el.nativeElement.blur();
  }

  private getTextContent(): string {
    // Get plain text content, stripping HTML tags
    // When contenteditable, textContent gives us the current edited text
    // When not contenteditable, we extract from innerHTML to get plain text
    if (this.el.nativeElement.contentEditable === 'true') {
      return this.el.nativeElement.textContent || this.el.nativeElement.innerText || '';
    } else {
      const div = document.createElement('div');
      div.innerHTML = this.el.nativeElement.innerHTML;
      return div.textContent || div.innerText || '';
    }
  }

  private updateDataModel(value: string, explicitPath?: string): void {
    if (!this.quoteData) return;

    const pathToUse = (explicitPath || this.propertyPath || '').trim();
    if (!pathToUse) return;

    try {
      // Parse the property path (e.g., "rawMaterialComposition.materials[0].materialName")
      const pathParts = this.parsePropertyPath(pathToUse);
      
      // Navigate to the parent object
      let target: any = this.quoteData;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (target[part] === undefined || target[part] === null) {
          // Create missing path if needed
          const nextPart = pathParts[i + 1];
          const isArrayIndex = /^\d+$/.test(nextPart);
          target[part] = isArrayIndex ? [] : {};
        }
        target = target[part];
      }

      // Set the final value
      const finalKey = pathParts[pathParts.length - 1];
      target[finalKey] = value;

      // Trigger auto-save (component will handle this via change detection)
    } catch (error) {
      console.error('Error updating data model:', error);
    }
  }

  private parsePropertyPath(path: string): string[] {
    // Parse paths like "rawMaterialComposition.materials[0].materialName"
    // into ["rawMaterialComposition", "materials", "0", "materialName"]
    const parts: string[] = [];
    const regex = /(\w+)|\[(\d+)\]/g;
    let match;

    while ((match = regex.exec(path)) !== null) {
      if (match[1]) {
        // Property name
        parts.push(match[1]);
      } else if (match[2]) {
        // Array index
        parts.push(match[2]);
      }
    }

    return parts;
  }

  private dispatchAction(type: 'add' | 'delete'): void {
    if (!this.propertyPath) return;

    // Create and dispatch custom event that will bubble up to parent elements
    // The parent divs with (pdf-edit-action) will catch it
    const event = new CustomEvent('pdf-edit-action', {
      detail: {
        type,
        path: this.propertyPath
      },
      bubbles: true,
      cancelable: true
    });

    this.el.nativeElement.dispatchEvent(event);
  }

  /** Remove editing chrome + toolbar, keep current innerHTML as rendered value */
  private reset(): void {
    this.renderer.removeAttribute(this.el.nativeElement, 'contenteditable');
    this.addEditingStyle(false);
    this.hideToolbar();
    this.savedRange = null;
    this.isToolbarClick = false;
    this.isEditing = false;
  }

  private addEditingStyle(editing: boolean): void {
    if (editing) {
      // Light highlight; base visual is in CSS ([appPdfEdit][contenteditable])
      this.renderer.setStyle(this.el.nativeElement, 'background', '#fffbe6');
      this.renderer.setStyle(this.el.nativeElement, 'outline', '2px dashed #ffb300');
      this.renderer.setStyle(this.el.nativeElement, 'padding', '4px 6px');
      this.renderer.setStyle(this.el.nativeElement, 'border-radius', '4px');
      this.renderer.setStyle(this.el.nativeElement, 'min-height', '20px');
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

    // Bold Button
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

    // Add / Delete Buttons
    if (actionButtons) {
      const sep = this.renderer.createElement('span');
      this.renderer.setStyle(sep, 'opacity', '0.5');
      this.renderer.appendChild(sep, this.renderer.createText('│'));
      this.renderer.appendChild(toolbar, sep);

      if (actionButtons === 'add' || actionButtons === 'both') {
        const addBtn = this.createIconButton('+', '#27ae60', () => {
          this.skipSave = true;
          this.dispatchAction('add');
          this.hideToolbar();
          this.el.nativeElement.blur();
        });
        this.renderer.appendChild(toolbar, addBtn);
      }

      if (actionButtons === 'delete' || actionButtons === 'both') {
        const delBtn = this.createIconButton('×', '#e74c3c', () => {
          // Dispatch delete action - component will handle confirmation dialog
          this.skipSave = true;
          this.dispatchAction('delete');
          this.hideToolbar();
          this.el.nativeElement.blur();
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
    this.renderer.setStyle(btn, 'width', '32px');
    this.renderer.setStyle(btn, 'height', '32px');
    this.renderer.setStyle(btn, 'border', 'none');
    this.renderer.setStyle(btn, 'border-radius', '50%');
    this.renderer.setStyle(btn, 'background', bg);
    this.renderer.setStyle(btn, 'color', 'white');
    this.renderer.setStyle(btn, 'cursor', 'pointer');
    this.renderer.setStyle(btn, 'font-size', '16px');
    this.renderer.setStyle(btn, 'display', 'flex');
    this.renderer.setStyle(btn, 'align-items', 'center');
    this.renderer.setStyle(btn, 'justify-content', 'center');
    this.renderer.appendChild(btn, this.renderer.createText(icon));

    this.renderer.listen(btn, 'mousedown', e => { e.preventDefault(); e.stopPropagation(); });
    this.renderer.listen(btn, 'click', callback);
    return btn;
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
    return div.innerHTML.replace(/\$([^$]+?)\$/g, '<strong>$1</strong>');
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

  /* ---------------------- NESTED PROPERTY GET ---------------------- */
  private getNestedProperty(obj: any, path: string): any {
    if (!obj || !path) return null;
    return path
      .replace(/\[(\d+)\]/g, '.$1')
      .split('.')
      .filter(p => p)
      .reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, obj);
  }

}
