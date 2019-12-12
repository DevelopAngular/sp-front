import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpAppearanceComponent } from './sp-appearance.component';

describe('SpAppearanceComponent', () => {
  let component: SpAppearanceComponent;
  let fixture: ComponentFixture<SpAppearanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpAppearanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpAppearanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
