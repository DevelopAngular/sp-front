import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportOptionsComponent } from './support-options.component';

describe('SupportOptionsComponent', () => {
  let component: SupportOptionsComponent;
  let fixture: ComponentFixture<SupportOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupportOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
