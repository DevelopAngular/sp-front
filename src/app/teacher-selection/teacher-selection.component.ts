import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { uniqBy } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { CreateFormService } from '../create-hallpass-forms/create-form.service';
import { Navigation } from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';
import { HallPass } from '../models/HallPass';

@Component({
  selector: 'app-teacher-selection',
  templateUrl: './teacher-selection.component.html',
  styleUrls: ['./teacher-selection.component.scss']
})
export class TeacherSelectionComponent implements OnInit {

  @Input() pass: HallPass;

  fromLocation;

  toLocation;

  formState: Navigation;

  frameMotion$: BehaviorSubject<any>;

  shadow: boolean = true;

  headerTransition = {
    'rest-tar-header': true,
    'rest-tar-header_animation-back': false
  };

  @Output() requestTarget: EventEmitter<any> = new EventEmitter<any>();

  @HostListener('scroll', ['$event'])
    tableScroll(event) {
        const tracker = event.target;
        const limit = tracker.scrollHeight - tracker.clientHeight;
        if (event.target.scrollTop < limit) {
            this.shadow = true;
        }
        if (event.target.scrollTop === limit) {
            this.shadow = false;
        }
    }

  constructor(
    private formService: CreateFormService,
    public sanitizer: DomSanitizer
  ) { }

  get quickSelectedTeachers() {
    const to = this.formState.data.direction.to;
    if (!this.formState.forLater && to.request_mode === 'specific_teachers') {
      return to.request_teachers;
    } else if (!this.formState.forLater && to.request_mode === 'teacher_in_room') {
      if (to.request_send_destination_teachers && to.request_send_origin_teachers) {
        return [...to.teachers, ...this.formState.data.direction.from.teachers];
      } else if (to.request_send_destination_teachers) {
        return to.teachers;
      } else if (to.request_send_origin_teachers) {
        return this.formState.data.direction.from.teachers;
      }
    } else if (this.formState.forLater && to.scheduling_request_mode === 'specific_teachers') {
      return to.scheduling_request_teachers;
    } else if (this.formState.forLater && to.scheduling_request_mode === 'teacher_in_room') {
        if (to.scheduling_request_send_destination_teachers && to.scheduling_request_send_origin_teachers) {
          return [...to.teachers, ...this.formState.data.direction.from.teachers];
        } else if (to.scheduling_request_send_destination_teachers) {
          return to.teachers;
        } else if (to.scheduling_request_send_origin_teachers) {
          return this.formState.data.direction.from.teachers;
        }
    } else {
      return [...to.teachers, ...this.formState.data.direction.from.teachers];
    }
  }

  get filteredTeachers() {
    return uniqBy(this.quickSelectedTeachers, 'id');
  }

  ngOnInit(): void {
    this.frameMotion$ = this.formService.getFrameMotionDirection();

    this.formState = {
      step: null,
      previousStep: 0,
      state: 1,
      fromState: null,
      formMode: {
        role: null,
        formFactor: null,
      },
      data: {
        selectedGroup: null,
        selectedStudents: [],
        direction: {
          from: this.pass.origin,
          to: this.pass.destination
        },
        roomStudents: null,
      },
      forInput: false,
      forLater: false,
      kioskMode: false
    };
  }

  updateTarget(target) {
    // this.formService.setFrameMotionDirection('forward');
    // this.formState.previousState = States.restrictedTarget;

    setTimeout(() => {
      this.requestTarget.emit(target);
    }, 100);

  }

}
