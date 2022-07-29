import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdCardIdNumbersComponent } from './id-card-id-numbers.component';

describe('IdCardIdNumbersComponent', () => {
  let component: IdCardIdNumbersComponent;
  let fixture: ComponentFixture<IdCardIdNumbersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdCardIdNumbersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdCardIdNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
