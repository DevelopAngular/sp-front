import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HallpassFormComponent } from './hallpass-form.component';

describe('HallpassFormComponent', () => {
  let component: HallpassFormComponent;
  let fixture: ComponentFixture<HallpassFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HallpassFormComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HallpassFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
