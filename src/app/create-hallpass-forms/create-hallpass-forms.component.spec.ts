import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHallpassFormsComponent } from './create-hallpass-forms.component';

describe('CreateHallpassFormsComponent', () => {
  let component: CreateHallpassFormsComponent;
  let fixture: ComponentFixture<CreateHallpassFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateHallpassFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateHallpassFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
