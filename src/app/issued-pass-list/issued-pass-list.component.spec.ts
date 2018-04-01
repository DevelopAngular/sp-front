import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuedPassListComponent } from './issued-pass-list.component';

describe('IssuedPassListComponent', () => {
  let component: IssuedPassListComponent;
  let fixture: ComponentFixture<IssuedPassListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssuedPassListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuedPassListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
