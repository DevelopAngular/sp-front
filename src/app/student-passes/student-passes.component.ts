import {AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {User} from '../models/User';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HallPass} from '../models/HallPass';

import {
  ResizeProfileImage,
  resizeStudentPasses,
  scaleStudentPasses,
  showHideProfileEmail,
  studentPassFadeInOut,
  topBottomProfileName
} from '../animations';
import {MatDialog} from '@angular/material/dialog';
import {PassCardComponent} from '../pass-card/pass-card.component';
import {DomCheckerService} from '../services/dom-checker.service';
import {PassLike} from '../models';
import {HallPassesService} from '../services/hall-passes.service';
import {QuickPreviewPasses} from '../models/QuickPreviewPasses';
import {filter, map} from 'rxjs/operators';
import {DeviceDetection} from '../device-detection.helper';
import * as moment from 'moment';
import {EncounterPreventionService} from '../services/encounter-prevention.service';
import {ExclusionGroup} from '../models/ExclusionGroup';

@Component({
  selector: 'app-student-passes',
  templateUrl: './student-passes.component.html',
  styleUrls: ['./student-passes.component.scss'],
  animations: [
    ResizeProfileImage,
    showHideProfileEmail,
    topBottomProfileName,
    scaleStudentPasses,
    resizeStudentPasses,
    studentPassFadeInOut
  ]
})
export class StudentPassesComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() profile: User;
  @Input() height: number = 75;
  @Input() isResize: boolean = true;
  @Input() pass: PassLike;
  @Input() hasProfilePicture: boolean = true;

  @Output() close = new EventEmitter();
  @Output() destroyClose = new EventEmitter();

  @ViewChild('profileImage') profileImage: ElementRef;

  lastStudentPasses: Observable<HallPass[]>;

  isScrollable: boolean;
  animationTrigger = {value: 'open', params: {size: '75'}};
  scaleCardTrigger$: Observable<string>;
  resizeTrigger$: Subject<'open' | 'close'> = new Subject<'open' | 'close'>();
  fadeInOutTrigger$: Observable<string>;
  isOpenEvent$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean>;
  loaded$: Observable<boolean>;
  passesStats$: Observable<QuickPreviewPasses>;
  exclusionGroups$: Observable<ExclusionGroup[]>;

  destroy$: Subject<any> = new Subject<any>();

  @HostListener('document.scroll', ['$event'])
  scroll(event) {
    if (event.currentTarget.scrollTop >= 50) {
      this.isScrollable = true;
      this.animationTrigger = {value: 'close', params: {size: '42'}};
    } else {
      this.isScrollable = false;
      this.animationTrigger = {value: 'open', params: {size: '75'}};
    }
  }

  constructor(
    private dialog: MatDialog,
    private domCheckerService: DomCheckerService,
    private passesService: HallPassesService,
    private encounterPreventionService: EncounterPreventionService
  ) { }

  ngAfterViewInit() {
    if (!this.isResize) {
      this.domCheckerService.fadeInOutTrigger$.next('fadeIn');
    }
  }

  ngOnInit() {
    this.fadeInOutTrigger$ = this.domCheckerService.fadeInOutTrigger$;
    this.passesService.getQuickPreviewPassesRequest(this.profile.id, true);
    this.encounterPreventionService.getExclusionGroupsForStudentRequest(this.profile.id);
    this.scaleCardTrigger$ = this.domCheckerService.scalePassCard;
    this.lastStudentPasses = this.passesService.quickPreviewPasses$.pipe(map(passes => passes.map(pass => HallPass.fromJSON(pass))));
    this.loading$ = this.passesService.quickPreviewPassesLoading$;
    this.loaded$ = this.passesService.quickPreviewPassesLoaded$;
    this.passesStats$ = this.passesService.quickPreviewPassesStats$;
    this.exclusionGroups$ = this.encounterPreventionService.exclusionGroupsForStudents$
      .pipe(
        filter(g => !!g[this.profile.id]),
        map((groups ) => {
          return groups[this.profile.id].reduce((acc, group) => {
            return [...acc, {...group, users: group.users.filter(u => +u.id !== +this.profile.id)}];
          }, []);
        })
      );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isActivePass(pass: HallPass) {
    return moment().isBefore(moment(pass.end_time));
  }

  get isOpen() {
    return this.isOpenEvent$.getValue() || !this.isResize;
  }

  get isClose() {
    return !this.isOpenEvent$.getValue() && this.isResize;
  }

  get isMobile() {
    return DeviceDetection.isMobile();
  }

  openProfile() {
    if (this.isClose && this.isResize) {
      this.resizeTrigger$.next('open');
      this.domCheckerService.scalePassCardTrigger$.next('resize');
      this.isOpenEvent$.next(true);
    }
  }

  closeProfile(event) {
    if (this.isOpen && this.isResize) {
      event.stopPropagation();
      this.animationTrigger = {value: 'open', params: {size: '75'}};
      this.resizeTrigger$.next('close');
      this.isOpenEvent$.next(false);
      this.domCheckerService.scalePassCardTrigger$.next('unresize');
    }
  }

  notClose(value) {
    console.log('Close ==>>', value);
    this.destroyClose.emit(value);
  }

  openPass({pass}) {
    if (!this.isResize) {
      this.close.emit();
    }
    this.domCheckerService.scalePassCardTrigger$.next('open');
    const expiredPass = this.dialog.open(PassCardComponent, {
      panelClass: 'teacher-pass-card-dialog-container',
      backdropClass: this.isResize ? 'invis-backdrop' : 'custom-backdrop',
      data: {pass, forStaff: true, showStudentInfoBlock: !this.isResize, passForStudentsComponent: this.isResize, hasDeleteButton: true}
    });

    expiredPass.afterClosed().subscribe(() => {
      this.domCheckerService.scalePassCardTrigger$.next('close');
    });
  }

}
