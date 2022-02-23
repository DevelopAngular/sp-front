import {ComponentFixture, TestBed} from '@angular/core/testing';

import {IconOnlyButtonComponent} from './icon-only-button.component';

describe('IconOnlyButtonComponent', () => {
  let component: IconOnlyButtonComponent;
  let fixture: ComponentFixture<IconOnlyButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconOnlyButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconOnlyButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
