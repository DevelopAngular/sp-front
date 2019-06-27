import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentMenuMobileComponent } from './consent-menu-mobile.component';

describe('ConsentMenuMobileComponent', () => {
  let component: ConsentMenuMobileComponent;
  let fixture: ComponentFixture<ConsentMenuMobileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsentMenuMobileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsentMenuMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
