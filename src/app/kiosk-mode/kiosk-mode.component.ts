import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CreateHallpassFormsComponent } from '../create-hallpass-forms/create-hallpass-forms.component';
import { KioskModeService } from '../services/kiosk-mode.service';
import { MatDialog } from '@angular/material';
import {WrappedProvider} from '../models/providers';
import {LiveDataService} from '../live-data/live-data.service';
import {combineLatest, Observable, of} from 'rxjs';
import {UserService} from '../services/user.service';
import {User} from '../models/User';
import {HallPassesService} from '../services/hall-passes.service';
import {HallPass} from '../models/HallPass';
import {filter, switchMap} from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import {StorageService} from '../services/storage.service';
import {DataService} from '../services/data-service';
import {LocationsService} from '../services/locations.service';
import {TimeService} from '../services/time.service';
import {ActivePassProvider} from '../my-room/my-room.component';

@Component({
  selector: 'app-kiosk-mode',
  templateUrl: './kiosk-mode.component.html',
  styleUrls: ['./kiosk-mode.component.scss']
})
export class KioskModeComponent implements OnInit, AfterViewInit, OnDestroy {

  activePassesKiosk: WrappedProvider;

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

  @ViewChild('input', { read: ElementRef }) input: ElementRef;

  @HostListener('window:keyup', ['$event'])
    setFocus() {
      setTimeout(() => {
          this.input.nativeElement.focus();
      }, 50);
  }

  constructor(
      private dialog: MatDialog,
      private kioskMode: KioskModeService,
      private dataService: DataService,
      private locationService: LocationsService,
      private liveDataService: LiveDataService,
      private userService: UserService,
      private passesService: HallPassesService,
      private storage: StorageService,
      private timeService: TimeService
  ) { }

  ngOnInit() {
      this.dataService.currentUser.pipe(
          switchMap(user => {
              return this.locationService.getLocationsWithTeacherRequest(user);
          }),
        filter((res: any[]) => !!res.length)
      )
          .subscribe(locations => {
          const kioskJwtToken = this.storage.getItem('kioskToken');
          const jwtHelper = new JwtHelperService();
          this.userData = jwtHelper.decodeToken(kioskJwtToken);
          const kioskLocation = locations.find(loc => +loc.id === this.userData.kiosk_location_id);
            this.activePassesKiosk = new WrappedProvider(
              new ActivePassProvider(
                this.liveDataService,
                of([kioskLocation]),
                of(this.timeService.nowDate()),
                of('')
              )
            );
            this.kioskMode.currentRoom$.next(kioskLocation);
      });

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 50);
  }

  ngOnDestroy() {
  }

  cardReader(event: KeyboardEvent) {
      if (event.keyCode === 13 && this.cardReaderValue && (this.cardReaderValue[0] === ';' || this.cardReaderValue[0] === '%')) {
          combineLatest(
              this.userService.searchUserByCardId(this.cardReaderValue),
              this.passesService.getActivePassesKioskMode(this.kioskMode.currentRoom$.value.id)
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
              })
          ).subscribe();
      }
  }

  onCardReaderBlur() {
    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 1);
  }

  showMainForm(forLater: boolean, student?): void {
      const mainFormRef = this.dialog.open(CreateHallpassFormsComponent, {
          panelClass: 'main-form-dialog-container',
          maxWidth: '100vw',
          backdropClass: 'custom-backdrop',
          data: {
              'forLater': forLater,
              'forStaff': true,
              'forInput': true,
              'kioskMode': true,
              'kioskModeRoom': this.kioskMode.currentRoom$.value,
              'kioskModeSelectedUser': student
          }
      });

      mainFormRef.afterOpened().subscribe(() => this.hideInput = true);
      mainFormRef.afterClosed().subscribe(() => {
          this.hideInput = false;
          setTimeout(() => {
              this.input.nativeElement.focus();
          }, 50);
      });
  }

}
