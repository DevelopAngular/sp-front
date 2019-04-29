import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpChipsComponent } from './sp-chips.component';

describe('SpChipsComponent', () => {
  let component: SpChipsComponent;
  let fixture: ComponentFixture<SpChipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpChipsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
