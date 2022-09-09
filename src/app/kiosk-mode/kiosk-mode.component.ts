import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MatDialogState} from '@angular/material/dialog';
import {KioskModeService, KioskSettings} from '../services/kiosk-mode.service';
import {LiveDataService} from '../live-data/live-data.service';
import {BehaviorSubject, combineLatest, EMPTY, Observable, of, Subject} from 'rxjs';
import {UserService} from '../services/user.service';
import {HallPassesService} from '../services/hall-passes.service';
import {HallPass} from '../models/HallPass';
import {filter, startWith, switchMap, takeUntil, map, mergeMap} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';
import {StorageService} from '../services/storage.service';
import {LocationsService} from '../services/locations.service';
import {TimeService} from '../services/time.service';
import {KioskSettingsDialogComponent} from '../kiosk-settings-dialog/kiosk-settings-dialog.component';
import {ActivatedRoute} from '@angular/router';
import {MainHallPassFormComponent} from '../create-hallpass-forms/main-hallpass--form/main-hall-pass-form.component';

declare const window;

@Component({
  selector: 'app-kiosk-mode',
  templateUrl: './kiosk-mode.component.html',
  styleUrls: ['./kiosk-mode.component.scss']
})
export class KioskModeComponent implements OnInit, AfterViewInit, OnDestroy {

  activePassesKiosk: Observable<HallPass[]>;

  cardReaderValue: string;

  hideInput: boolean;

  userData: {
    email: string
    exp: number
    kiosk_location_id: number
    kiosk_mode: boolean
    school_ids: number[]
    secret_id: string
    user_id: number
  };

  destroy$: Subject<any> = new Subject<any>();
  showButtons = new BehaviorSubject(true);
  showScanner = new BehaviorSubject(false);

  mainFormRef: MatDialogRef<MainHallPassFormComponent>;

  @ViewChild('input', { read: ElementRef, static: true }) input: ElementRef;

  @HostListener('window:keyup', ['$event'])
  setFocus() {
    this.inputFocus();
  }

  constructor(
    private dialog: MatDialog,
    private kioskMode: KioskModeService,
    private locationService: LocationsService,
    private liveDataService: LiveDataService,
    private userService: UserService,
    private passesService: HallPassesService,
    private storage: StorageService,
    private timeService: TimeService,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  get showProfilePicture() {
    return this.userService.getUserSchool()?.profile_pictures_enabled;
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe(state => {
      console.log(state);
      if ('openDialog' in state && state.openDialog) {
        this.dialog.open(KioskSettingsDialogComponent, {
          panelClass: 'sp-form-dialog',
          width: '425px',
          height: '500px'
        });
      }
    });

    this.locationService.getPassLimitRequest();
    combineLatest(
      this.userService.user$.pipe(startWith(null)),
      this.userService.effectiveUser.pipe(filter(r => !!r)).pipe(startWith(null))
    ).pipe(
      switchMap(([user, effectiveUser]) => {
        if (effectiveUser) {
          return this.locationService.getLocationsWithTeacherRequest(effectiveUser.user);
        }
        if (user) {
          return this.locationService.getLocationsWithTeacherRequest(user);
        }
        return of([]);
      }),
      filter((res: any[]) => !!res.length),
      takeUntil(this.destroy$)
    )
      .subscribe(locations => {
        const kioskJwtToken = this.storage.getItem('kioskToken');
        const jwtHelper = new JwtHelperService();
        this.userData = jwtHelper.decodeToken(kioskJwtToken);
        const kioskLocation = locations.find(loc => +loc.id === this.userData.kiosk_location_id);
        this.liveDataService.getMyRoomActivePassesRequest(
          of({sort: '-created', search_query: ''}),
          {type: 'location', value: [kioskLocation]},
          this.timeService.nowDate()
        );
        this.kioskMode.setCurrentRoom(kioskLocation);
      });

    this.activePassesKiosk = this.liveDataService.myRoomActivePasses$;

    /**
     * The following listener is responsible for checking if incoming hall passes are the result
     * of an accepted pass requests.
     *
     * If there are more than one hall pass, and the dialog is currently opened, the pinnable key
     * inside MainHallPassFormComponent.FORM_STATE will represent a pass request.
     * If the origin id, destination id and student id are the same then the incoming hall pass was
     * created from the pass request in the dialog, and therefore we can close the dialog
     */
    this.liveDataService.myRoomActivePasses$
      .pipe(filter(passes => passes.length > 0 && this.mainFormRef?.getState() === MatDialogState.OPEN))
      .subscribe({
        next: passes => {
          const formState = this.mainFormRef?.componentInstance?.FORM_STATE;
          if (formState?.data.direction?.pinnable && formState?.data.kioskModeStudent) {
            const requestMatch = passes.filter(p =>
              p.origin.id == formState.data.direction.from.id &&
              p.destination.id == formState.data.direction.to.id &&
              p.student.id == formState.data.kioskModeStudent.id
            );
            if (requestMatch.length > 0) {
              this.mainFormRef.close();
            }
          }
        }
      });

    this.kioskMode.getKioskModeSettingsSubject().subscribe((settings: KioskSettings) => {
      this.showButtons.next(settings.findById || settings.findByName);
      this.showScanner.next(settings.findByScan);
    });
  }

  ngAfterViewInit() {
    this.inputFocus();
    if (window && window.appLoaded) {
      window.appLoaded(1000);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  inputFocus() {
    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 50);
  }

  cardReader(event: KeyboardEvent) {
    if (event.key !== 'Enter') {
      return;
    }
    console.log(event);
    let id = this.cardReaderValue;
    if (this.cardReaderValue && (this.cardReaderValue[0] === ';' || this.cardReaderValue[0] === '%')) {
      id = id.substring(1);
    }

    this.userService.possibleProfileById(id)
      .pipe(switchMap(user => {
        if (user == null) {
          return this.userService.possibleProfileByCustomId(id);
        } else {
          return of(user);
        }
      }), switchMap(user => {
        if (user == null) {
          return EMPTY;
        } else {
          return of(user);
        }
      }), mergeMap(user => {
        return combineLatest(of(user), this.passesService.getActivePassesKioskMode(this.kioskMode.getCurrentRoom().value.id));
      }), map(([user, passes]) => {
        const myPass = (passes as HallPass[]).find(pass => pass.issuer.id === user.id);
        if (myPass) {
          return this.passesService.endPass(myPass.id);
        } else {
          this.showMainForm(false, user);
          return of(null);
        }
      })).subscribe();
    this.cardReaderValue = '';
  }

  onCardReaderBlur() {
    this.inputFocus();
  }

  showMainForm(forLater: boolean, student?): void {
    this.hideInput = true;
    this.mainFormRef = this.dialog.open(MainHallPassFormComponent, {
        panelClass: 'main-form-dialog-container',
        maxWidth: '100vw',
        backdropClass: 'custom-backdrop',
        data: {
          'forLater': forLater,
          'forStaff': true,
          'forInput': true,
          'kioskMode': true,
          'kioskModeRoom': this.kioskMode.getCurrentRoom().value,
          'kioskModeSelectedUser': [student]
        }
    });

    this.mainFormRef.afterClosed().subscribe(() => {
        this.hideInput = false;
        this.inputFocus();
    });
  }

}
