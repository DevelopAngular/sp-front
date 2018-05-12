import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinnableSelectorComponent } from './pinnable-selector.component';

describe('PinnableSelectorComponent', () => {
  let component: PinnableSelectorComponent;
  let fixture: ComponentFixture<PinnableSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinnableSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinnableSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
