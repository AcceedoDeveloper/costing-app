import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[autoFontSize]'
})
export class AutoFontSizeDirective implements OnChanges {

  @Input() autoFontSize: string = '';

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    this.adjustFontSize();
  }

  private adjustFontSize() {
    const textLength = this.autoFontSize?.length || 0;

    let fontSize = 14;

    if (textLength > 10 && textLength <= 20) {
      fontSize = 12;
    } else if (textLength > 20 && textLength <= 30) {
      fontSize = 10;
    } else if (textLength > 30) {
      fontSize = 8;
    }

    this.el.nativeElement.style.fontSize = fontSize + 'px';
  }
}
