import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassInfoComponent } from './pass-info.component';

describe('PassInfoComponent', () => {
  let component: PassInfoComponent;
  let fixture: ComponentFixture<PassInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
