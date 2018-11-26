import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsitutesComponent } from './subsitutes.component';

describe('SubsitutesComponent', () => {
  let component: SubsitutesComponent;
  let fixture: ComponentFixture<SubsitutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubsitutesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubsitutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
