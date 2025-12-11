import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalQuotationComponent } from './final-quotation.component';

describe('FinalQuotationComponent', () => {
  let component: FinalQuotationComponent;
  let fixture: ComponentFixture<FinalQuotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalQuotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
