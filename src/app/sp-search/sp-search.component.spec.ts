import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SPSearchComponent } from './sp-search.component';

describe('SPSearchComponent', () => {
  let component: SPSearchComponent;
  let fixture: ComponentFixture<SPSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SPSearchComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SPSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
