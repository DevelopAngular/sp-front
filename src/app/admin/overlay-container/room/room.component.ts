import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

import {merge, Subject} from 'rxjs';
import {debounceTime, filter, pluck, takeUntil, tap} from 'rxjs/operators';

import {OverlayDataService, Pages, RoomData} from '../overlay-data.service';
import {ValidButtons} from '../advanced-options/advanced-options.component';

import {Location} from '../../../models/Location';
import {HallPassesService} from '../../../services/hall-passes.service';
import {LocationsService} from '../../../services/locations.service';
import {OverlayContainerComponent} from '../overlay-container.component';

import {cloneDeep, isEqual, isNull, omit} from 'lodash';
import {KeyboardShortcutsService} from '../../../services/keyboard-shortcuts.service';
import {ConsentMenuComponent} from '../../../consent-menu/consent-menu.component';
import {UNANIMATED_CONTAINER} from '../../../consent-menu-overlay';
import {ToastService} from '../../../services/toast.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {

  @Input() form: FormGroup;

  @Input() showErrors: boolean;

  @Input() passLimitForm: FormGroup;

  @Output() back = new EventEmitter();

  @Output()
  roomDataResult: EventEmitter<{data: RoomData, buttonState: ValidButtons, advOptButtons: ValidButtons}> = new EventEmitter<{data: RoomData, buttonState: ValidButtons, advOptButtons: ValidButtons}>();

  data: RoomData = {
      id: `Fake ${Math.floor(Math.random() * (1 - 1000)) + 1000}`,
      roomName: 'New Room',
      roomNumber: '',
      timeLimit: 0,
      selectedTeachers: [],
      travelType: [],
      restricted: null,
      scheduling_restricted: null,
      advOptState: {
          now: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
          future: { state: '', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } }
      }
  };

  initialData: RoomData;

  currentPage: number;
  tooltipText;
  inputFocusNumber: number = 1;
  forceFocus$: Subject<any> = new Subject<any>();

  advOptionsValidButtons: ValidButtons;

  roomValidButtons: ValidButtons;

  change$: Subject<any> = new Subject();

  resetadvOpt$ = new Subject();

  destroy$ = new Subject();

  constructor(
      private dialog: MatDialog,
      private dialogRef: MatDialogRef<OverlayContainerComponent>,
      public overlayService: OverlayDataService,
      private hallPassService: HallPassesService,
      private locationService: LocationsService,
      private shortcuts: KeyboardShortcutsService,
      private toast: ToastService
  ) {
  }

  get travelTypes() {
          if (this.data.travelType.includes('round_trip') &&
              this.data.travelType.includes('one_way')) {
              return 'Both';
          } else if (this.data.travelType.includes('round_trip')) {
              return 'Round-trip';
          } else if (this.data.travelType.includes('one_way')) {
              return 'One-way';
          }
  }

  get restricted() {
      if (!isNull(this.data.restricted)) {
          if (this.data.restricted) {
              return 'Restricted';
          } else {
              return 'Unrestricted';
          }
      }
  }

  get schedulingRestricted() {
      if (!isNull(this.data.scheduling_restricted)) {
          if (this.data.scheduling_restricted) {
              return 'Restricted';
          } else {
              return 'Unrestricted';
          }
      }
  }

  get advDisabledOptions() {
   const page = this.currentPage;
   if (!this.data.selectedTeachers.length &&
     (
       page === Pages.NewRoom ||
       page === Pages.EditRoom ||
       page === Pages.NewRoomInFolder ||
       page === Pages.EditRoomInFolder)
   ) {
     return ['This Room', 'Both'];
   }
  }

  get validForm() {
      return this.form.get('roomName').valid && this.form.get('roomNumber').valid && this.form.get('timeLimit').valid;
  }

  get isValidRestrictions() {
      return !isNull(this.data.restricted) && !isNull(this.data.scheduling_restricted);
  }

  ngOnInit() {
      this.tooltipText = this.overlayService.tooltipText;
      this.currentPage = this.overlayService.pageState.getValue().currentPage;

    if (this.overlayService.pageState.getValue().data) {
          if (this.currentPage === Pages.EditRoom) {
              const pinnable = this.overlayService.pageState.getValue().data.pinnable;
              this.data = {
                  roomName: pinnable.location.title,
                  roomNumber: pinnable.location.room,
                  travelType: pinnable.location.travel_types,
                  selectedTeachers: pinnable.location.teachers,
                  restricted: !!pinnable.location.restricted,
                  scheduling_restricted: !!pinnable.location.scheduling_restricted,
                  timeLimit: pinnable.location.max_allowed_time,
                  advOptState: this.overlayService.pageState.getValue().data.advancedOptions
              };
          } else if (this.currentPage === Pages.EditRoomInFolder) {
              const data: Location = this.overlayService.pageState.getValue().data.selectedRoomsInFolder[0];
              this.passLimitForm.patchValue({
                to: data.max_passes_to,
                toEnabled: data.max_passes_to_active,
                from: data.max_passes_from,
                fromEnabled: data.max_passes_from_active
              });
              this.data = {
                  id: data.id,
                  roomName: data.title,
                  roomNumber: data.room,
                  timeLimit: data.max_allowed_time,
                  selectedTeachers: data.teachers,
                  travelType: data.travel_types,
                  restricted: !!data.restricted,
                  scheduling_restricted: !!data.scheduling_restricted,
                  advOptState: this.overlayService.pageState.getValue().data.advancedOptions
              };
          }
      }

      this.shortcuts.onPressKeyEvent$
        .pipe(
          takeUntil(this.destroy$),
          pluck('key')
        )
        .subscribe(key => {
          if (key[0] === 'tab') {
            if (this.inputFocusNumber < 3) {
              this.inputFocusNumber += 1;
            } else if (this.inputFocusNumber === 3) {
              this.inputFocusNumber = 1;
            }
            this.forceFocus$.next();
          }
        });

      this.initialData = cloneDeep(this.data);

      merge(this.form.valueChanges, this.change$).pipe(
        debounceTime(450)
      ).subscribe(() => {
          this.checkValidRoomOptions();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkValidRoomOptions() {
      if (isEqual(omit(this.initialData, 'advOptState'), omit(this.data, 'advOptState'))) {
          if (this.validForm) {
              this.roomValidButtons = {
                  publish: false,
                  incomplete: false,
                  cancel: false
              };
          } else {
              this.roomValidButtons = {
                  publish: false,
                  incomplete: false,
                  cancel: false
              };
          }
      } else {
        if (this.validForm && this.data.travelType.length) {
            this.roomValidButtons = {
                publish: true,
                incomplete: false,
                cancel: true
            };
        } else {
            this.roomValidButtons = {
                publish: false,
                incomplete: true,
                cancel: true
            };
        }
      }
      let buttonsResult: ValidButtons = {
          publish: false,
          incomplete: false,
          cancel: false
      };

      if (!this.advOptionsValidButtons) {
          buttonsResult = this.roomValidButtons;
      } else {
          if (
            (this.validForm && this.isValidRestrictions && this.data.travelType.length) &&
            this.advOptionsValidButtons.publish || (this.roomValidButtons.publish && !this.advOptionsValidButtons.incomplete)
          ) {
              buttonsResult.publish = true;
          }
          if (this.roomValidButtons.cancel || this.advOptionsValidButtons.cancel) {
              buttonsResult.cancel = true;
          }
          if (this.roomValidButtons.incomplete || this.advOptionsValidButtons.incomplete) {
              buttonsResult.incomplete = true;
          }
      }
      this.roomDataResult.emit({data: this.data, buttonState: buttonsResult, advOptButtons: this.advOptionsValidButtons});
  }

  selectTeacherEvent(teachers) {
    this.data.selectedTeachers = teachers;
    if (!this.data.selectedTeachers.length) {
      this.data.advOptState = {
        now: { state: 'Any teacher', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } },
        future: { state: 'Any teacher', data: { all_teach_assign: null, any_teach_assign: null, selectedTeachers: [] } }
      };
      this.resetadvOpt$.next(this.data.advOptState);
    }
    this.change$.next();
  }

  travelUpdate(type) {
    let travelType: string[];
    if (type === 'Round-trip') {
        travelType = ['round_trip'];
    } else if (type === 'One-way') {
        travelType = ['one_way'];
    } else if (type === 'Both') {
        travelType = ['round_trip', 'one_way'];
    }
    this.data.travelType = travelType;
    this.change$.next();
  }

  restrictedEvent(isRestricted) {
      this.data.restricted = isRestricted;
      this.change$.next();
  }

  schedulingRestrictedEvent(isRestricted) {
      this.data.scheduling_restricted = isRestricted;
      this.change$.next();
  }

  advancedOptions({options, validButtons}) {
      this.data.advOptState = options;
      this.advOptionsValidButtons = validButtons;
      this.change$.next();
  }

  deleteRoom(target: HTMLElement) {
    const header = `Are you sure you want to permanently delete this room? All associated passes associated with this room <b>will not</b> be deleted.`;
    const options = [{display: 'Confirm Delete', color: '#DA2370', buttonColor: '#DA2370, #FB434A', action: 'delete'}];
    UNANIMATED_CONTAINER.next(true);
    const confirmDialog = this.dialog.open(ConsentMenuComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: { trigger: new ElementRef(target), header, options }
    });

    confirmDialog.afterClosed().pipe(tap(res => UNANIMATED_CONTAINER.next(false)), filter(action => !!action)).subscribe(action => {
      const pinnable = this.overlayService.pageState.getValue().data.pinnable;
      if (this.currentPage === Pages.EditRoom) {
        this.hallPassService.deletePinnableRequest(pinnable.id).subscribe(res => {
          this.toast.openToast({title: 'Room deleted', type: 'error'});
          this.dialogRef.close();
        });
      } else if (this.currentPage === Pages.EditRoomInFolder) {
        this.locationService.deleteLocationRequest(this.data.id).subscribe(res => {
          this.back.emit();
        });
      }
    });
  }
}
