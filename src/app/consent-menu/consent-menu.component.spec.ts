import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentMenuComponent } from './consent-menu.component';

describe('ConsentMenuComponent', () => {
  let component: ConsentMenuComponent;
  let fixture: ComponentFixture<ConsentMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsentMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsentMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
