import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuChooseComponent } from './menu-choose.component';

describe('MenuChooseComponent', () => {
  let component: MenuChooseComponent;
  let fixture: ComponentFixture<MenuChooseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuChooseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuChooseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
