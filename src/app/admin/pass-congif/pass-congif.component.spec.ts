import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassCongifComponent } from './pass-congif.component';

describe('PassCongifComponent', () => {
  let component: PassCongifComponent;
  let fixture: ComponentFixture<PassCongifComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassCongifComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassCongifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
