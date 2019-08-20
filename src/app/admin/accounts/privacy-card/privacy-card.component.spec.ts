import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyCardComponent } from './privacy-card.component';

describe('PrivacyCardComponent', () => {
  let component: PrivacyCardComponent;
  let fixture: ComponentFixture<PrivacyCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivacyCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
