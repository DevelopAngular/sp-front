import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassCollectionComponent } from './pass-collection.component';

describe('PassCollectionComponent', () => {
  let component: PassCollectionComponent;
  let fixture: ComponentFixture<PassCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
