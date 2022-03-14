import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CreateHallpassFormsComponent} from '../create-hallpass-forms/create-hallpass-forms.component';
import {KioskModeService} from '../services/kiosk-mode.service';
import {MatDialog} from '@angular/material/dialog';
import {LiveDataService} from '../live-data/live-data.service';
import {combineLatest, Observable, of, Subject} from 'rxjs';
import {UserService} from '../services/user.service';
import {User} from '../models/User';
import {HallPassesService} from '../services/hall-passes.service';
import {HallPass} from '../models/HallPass';
import {filter, switchMap, takeUntil, startWith} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';
import {StorageService} from '../services/storage.service';
import {LocationsService} from '../services/locations.service';
import {TimeService} from '../services/time.service';

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
      private timeService: TimeService
  ) { }

  get showProfilePicture() {
    return this.userService.getUserSchool()?.profile_pictures_enabled
  }

  ngOnInit() {
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
      if (event.keyCode === 13 && this.cardReaderValue && (this.cardReaderValue[0] === ';' || this.cardReaderValue[0] === '%')) {
          combineLatest(
              this.userService.searchUserByCardId(this.cardReaderValue),
              this.passesService.getActivePassesKioskMode(this.kioskMode.getCurrentRoom().value.id)
          ).pipe(
              switchMap(([user, passes]: [User[], HallPass[]]) => {
                  this.cardReaderValue = '';
                  if (user.length) {
                      const myPass = (passes as HallPass[]).find(pass => pass.issuer.id === user[0].id);
                      if (myPass) {
                          return this.passesService.endPass(myPass.id);
                      } else {
                          this.showMainForm(false, user);
                          return of(null);
                      }
                  }
              }),
            takeUntil(this.destroy$)
          ).subscribe();
      }
  }

  onCardReaderBlur() {
    this.inputFocus();
  }

  showMainForm(forLater: boolean, student?): void {
    this.hideInput = true;
      const mainFormRef = this.dialog.open(CreateHallpassFormsComponent, {
          panelClass: 'main-form-dialog-container',
          maxWidth: '100vw',
          backdropClass: 'custom-backdrop',
          data: {
              'forLater': forLater,
              'forStaff': true,
              'forInput': true,
              'kioskMode': true,
              'kioskModeRoom': this.kioskMode.getCurrentRoom().value,
              'kioskModeSelectedUser': student
          }
      });

      mainFormRef.afterClosed().subscribe(() => {
          this.hideInput = false;
          this.inputFocus();
      });
  }

}
