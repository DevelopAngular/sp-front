import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainAdminComponent } from './main-admin-page.component';

describe('MainAdminPageComponent', () => {
  let component: MainAdminComponent;
  let fixture: ComponentFixture<MainAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
