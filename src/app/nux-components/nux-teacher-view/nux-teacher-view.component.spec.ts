import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NuxTeacherViewComponent} from './nux-teacher-view.component';

describe('NuxTeacherViewComponent', () => {
  let component: NuxTeacherViewComponent;
  let fixture: ComponentFixture<NuxTeacherViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NuxTeacherViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NuxTeacherViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
