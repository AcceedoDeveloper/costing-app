import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddgradeComponent } from './addgrade.component';

describe('AddgradeComponent', () => {
  let component: AddgradeComponent;
  let fixture: ComponentFixture<AddgradeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddgradeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddgradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
