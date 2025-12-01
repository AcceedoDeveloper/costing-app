import { Component, OnInit } from '@angular/core';

interface Part {
  drawingNumber: string;
  partName: string;
  castingMaterial: string;
  castingWeight: number | string;
  annualVolume: string;
  partPrice: string;
  patternCost: string;
  moq: number | string;
}

interface Composition {
  c: string;
  si: string;
  mn: string;
  ni: string;
  cr: string;
  mo: string;
}

interface QuoteData {
  attention: string;
  quoteRefNumber: string;
  quoteDate: string;
  customer: string;
  address: string;
  phone: string;
  website: string;
  parts: Part[];
  composition: Composition;
}


@Component({
  selector: 'app-pdf-view',
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.css']
})
export class PdfViewComponent implements OnInit {
  quoteData: QuoteData = {
    attention: 'Mr. Parthiban',
    quoteRefNumber: 'RFQ-16',
    quoteDate: '03.11.2025/D',
    customer: 'M/S. Voith',
    address: 'A 14 SIDCO Industrial Estate, Coimbatore 641021',
    phone: '+91422 4541600',
    website: 'www.indoshellcast.com',
    parts: [
      {
        drawingNumber: '1445-014691/A',
        partName: 'STATOR SEGMENT',
        castingMaterial: 'ET (Stainless Steel)',
        castingWeight: 12.000,
        annualVolume: '',
        partPrice: 'Rs. 6,600/-',
        patternCost: 'Rs 7,50,000/-',
        moq: 200
      },
      {
        drawingNumber: '1445-014690/A',
        partName: 'ROTOR SEGMENT',
        castingMaterial: 'ET (Stainless Steel)',
        castingWeight: 13.000,
        annualVolume: '',
        partPrice: 'Rs. 7,150/-',
        patternCost: 'Rs 7,50,000/-',
        moq: 200
      }
    ],
    composition: {
      c: '1.0 - 1.25 %',
      si: '< 1.0 %',
      mn: '0.3 - 0.8 %',
      ni: '1.5 - 2.0 %',
      cr: '17.0 - 18.5 %',
      mo: '0.5 - 0.7 %'
    }
  };

  rowsPerItem = 7; // Number of rows each item should span

  constructor() { }

  ngOnInit(): void {
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

  updateAttention(event: any): void {
    this.quoteData.attention = event.target.textContent.trim();
  }

  updatePart(index: number, field: string, event: any): void {
    const value = event.target.textContent.trim();
    if (field === 'castingWeight' || field === 'moq') {
      this.quoteData.parts[index][field] = parseFloat(value) || 0;
    } else {
      this.quoteData.parts[index][field] = value;
    }
  }

  updateComposition(field: string, event: any): void {
    this.quoteData.composition[field] = event.target.textContent.trim();
  }

  addPart(): void {
    this.quoteData.parts.push({
      drawingNumber: '',
      partName: '',
      castingMaterial: '',
      castingWeight: 0,
      annualVolume: '',
      partPrice: '',
      patternCost: '',
      moq: 0
    });
  }

  removeLastPart(): void {
    if (this.quoteData.parts.length > 1) {
      this.quoteData.parts.pop();
    }
  }

  resetForm(): void {
    this.quoteData = {
      attention: 'Mr. Parthiban',
      quoteRefNumber: 'RFQ-16',
      quoteDate: '03.11.2025/D',
      customer: 'M/S. Voith',
      address: 'A 14 SIDCO Industrial Estate, Coimbatore 641021',
      phone: '+91422 4541600',
      website: 'www.indoshellcast.com',
      parts: [
        {
          drawingNumber: '1445-014691/A',
          partName: 'STATOR SEGMENT',
          castingMaterial: 'ET (Stainless Steel)',
          castingWeight: 12.000,
          annualVolume: '',
          partPrice: 'Rs. 6,600/-',
          patternCost: 'Rs 7,50,000/-',
          moq: 200
        },
        {
          drawingNumber: '1445-014690/A',
          partName: 'ROTOR SEGMENT',
          castingMaterial: 'ET (Stainless Steel)',
          castingWeight: 13.000,
          annualVolume: '',
          partPrice: 'Rs. 7,150/-',
          patternCost: 'Rs 7,50,000/-',
          moq: 200
        }
      ],
      composition: {
        c: '1.0 - 1.25 %',
        si: '< 1.0 %',
        mn: '0.3 - 0.8 %',
        ni: '1.5 - 2.0 %',
        cr: '17.0 - 18.5 %',
        mo: '0.5 - 0.7 %'
      }
    };
  }

  generatePDF(): void {
    // TODO: Implement PDF generation logic
    console.log('Generating PDF with data:', this.quoteData);
    // You can integrate a PDF library like jsPDF or pdfmake here
    alert('PDF generation functionality will be implemented here');
  }

}
