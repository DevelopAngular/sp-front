import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Gg4lSetUpComponent} from './gg4l-set-up.component';

describe('Gg4lSetUpComponent', () => {
  let component: Gg4lSetUpComponent;
  let fixture: ComponentFixture<Gg4lSetUpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Gg4lSetUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Gg4lSetUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
