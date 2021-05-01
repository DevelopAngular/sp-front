import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GeneratedTableDialogComponent} from './generated-table-dialog.component';

describe('GeneratedTableDialogComponent', () => {
  let component: GeneratedTableDialogComponent;
  let fixture: ComponentFixture<GeneratedTableDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneratedTableDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneratedTableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
