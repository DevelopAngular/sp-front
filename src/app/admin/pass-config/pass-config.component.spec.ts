import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassConfigComponent } from './pass-config.component';

describe('PassCongifComponent', () => {
  let component: PassConfigComponent;
  let fixture: ComponentFixture<PassConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
