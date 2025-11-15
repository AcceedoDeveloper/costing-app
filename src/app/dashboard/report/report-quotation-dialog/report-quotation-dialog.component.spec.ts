import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportQuotationDialogComponent } from './report-quotation-dialog.component';

describe('ReportQuotationDialogComponent', () => {
  let component: ReportQuotationDialogComponent;
  let fixture: ComponentFixture<ReportQuotationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportQuotationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportQuotationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
