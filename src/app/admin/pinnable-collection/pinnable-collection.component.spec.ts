import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinnableCollectionComponent } from './pinnable-collection.component';

describe('PinnableCollectionComponent', () => {
  let component: PinnableCollectionComponent;
  let fixture: ComponentFixture<PinnableCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinnableCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinnableCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
