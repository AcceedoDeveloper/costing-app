import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterialtypeComponent } from './meterialtype.component';

describe('MeterialtypeComponent', () => {
  let component: MeterialtypeComponent;
  let fixture: ComponentFixture<MeterialtypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeterialtypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeterialtypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
