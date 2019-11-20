import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Navigation} from '../../main-hall-pass-form.component';
import {StudentList} from '../../../../models/StudentList';
import {User} from '../../../../models/User';
import {UserService} from '../../../../services/user.service';
import {BehaviorSubject, Observable, of, Subject, timer} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';
import {LocationsService} from '../../../../services/locations.service';
import {DeviceDetection} from '../../../../device-detection.helper';
import { cloneDeep } from 'lodash';
import {CreateFormService} from '../../../create-form.service';
import {ScreenService} from '../../../../services/screen.service';
import {KeyboardShortcutsService} from '../../../../services/keyboard-shortcuts.service';
import {pluck, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-groups-step1',
  templateUrl: './groups-step1.component.html',
  styleUrls: ['./groups-step1.component.scss']
})
export class GroupsStep1Component implements OnInit, OnDestroy {

  @Input() selectedGroup: StudentList = null;
  @Input() selectedStudents: User[] = [];
  @Input() groups: StudentList[];
  @Input() formState: Navigation;
  @Input() hasBackArrow: boolean = false;

  @Output() stateChangeEvent: EventEmitter<Navigation | string> = new EventEmitter<Navigation | string>();
  @Output() createGroupEmit: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  @ViewChild('_item') currentGroupElement: ElementRef;

  isEmptyGroups: boolean = false;

  isSelectedStudent: boolean = true;
  isOpenedSearchOptions: boolean;

  isLoadingGroups$: Observable<boolean> = this.userService.isLoadingStudentGroups$;
  isLoadedGroups$: Observable<boolean> = this.userService.isLoadedStudentGroups$;

  frameMotion$: BehaviorSubject<any>;
  destroy$: Subject<any> = new Subject<any>();

  constructor(
    public userService: UserService,
    private locationService: LocationsService,
    public sanitizer: DomSanitizer,
    private formService: CreateFormService,
    private screenService: ScreenService,
    private shortcutsService: KeyboardShortcutsService
  ) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();

    of(!this.groups || (this.groups && !this.groups.length))
      .subscribe((v) => {
      this.isEmptyGroups = v;
    });
    if (this.selectedGroup) {
      this.selectedStudents = this.formState.data.selectedStudents;
    }

    this.shortcutsService.onPressKeyEvent$
      .pipe(
        pluck('key'),
        takeUntil(this.destroy$)
      )
      .subscribe(key => {
        if (key[0] === 'enter' && !this.isOpenedSearchOptions && this.selectedStudents.length) {
          this.nextStep();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  textColor(item) {
    if (item.hovered) {
      return this.sanitizer.bypassSecurityTrustStyle('#1F195E');
    } else {
      return this.sanitizer.bypassSecurityTrustStyle('#555558');
    }
  }

  getBackground(item, group) {
    if (item.hovered ||  (this.selectedGroup && (this.selectedGroup.id === group.id))) {
      if (item.pressed) {
        return '#E2E7F4';
      } else {
        return '#ECF1FF';
      }
    } else {
      return '#FFFFFF';
    }
  }

  nextStep() {
    if (this.screenService.isDeviceLargeExtra) {
      this.formService.setFrameMotionDirection('forward');
      this.formService.compressableBoxController.next(false);
    } else {
      this.formService.setFrameMotionDirection('disable');
    }
    setTimeout(() => {
      if (this.formState.forLater) {
          this.formState.step = 1;
          this.formState.fromState = 1;
      } else {
          this.formState.step = 3;
          this.formState.state = 1;
          this.formState.fromState = 1;
      }

      if ( this.selectedGroup) {
        this.formState.data.selectedGroup = this.selectedGroup;
        this.formState.data.selectedStudents = this.selectedGroup.users;

      } else {
        this.formState.data.selectedGroup = null;
        this.formState.data.selectedStudents = this.selectedStudents;
      }

      this.stateChangeEvent.emit(this.formState);
    }, 100);
  }

  createGroup() {

    this.formService.setFrameMotionDirection('disable');

    setTimeout(() => {
      this.formState.state = 2;
      this.formState.step = 2;
      this.formState.fromState = 1;
      this.formState.data.selectedStudents = this.selectedStudents;
      this.createGroupEmit.emit(this.formState);
    }, 100);
  }

  selectGroup(group, evt: Event) {
    if (!group) {
      this.selectedGroup = null;
    } else if ( !this.selectedGroup || (this.selectedGroup && (this.selectedGroup.id !== group.id)) ) {
      this.selectedGroup = cloneDeep(group);
      this.selectedStudents = this.selectedGroup.users;
    } else {
      this.selectedGroup = null;
      this.selectedStudents = [];
    }
      evt.stopPropagation();

  }

  editGroup(group) {
    this.createGroupEmit.emit({
      step: 2,
      state: 3,
      fromState: 1,
      data: {
        selectedGroup: group,
      }
    });
  }

  updateInternalData(evt) {
    this.formState.data.selectedGroup = null;
    this.selectedGroup = null;
    this.formState.data.selectedStudents = evt;
    this.formState.state = 1;
  }

  back() {
    if (this.selectedGroup) {
      this.selectedGroup = null;
      this.selectedStudents = [];
      return;
    } else {
      this.stateChangeEvent.emit('exit');
    }
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }
}
