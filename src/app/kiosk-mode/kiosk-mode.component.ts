import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CreateHallpassFormsComponent } from '../create-hallpass-forms/create-hallpass-forms.component';
import { KioskModeService } from '../services/kiosk-mode.service';
import { MatDialog } from '@angular/material';
import {ActivePassProvider} from '../hall-monitor/hall-monitor.component';
import {WrappedProvider} from '../models/providers';
import {LiveDataService} from '../live-data/live-data.service';
import {combineLatest, of} from 'rxjs';
import {UserService} from '../services/user.service';
import {User} from '../models/User';
import {HallPassesService} from '../services/hall-passes.service';
import {HallPass} from '../models/HallPass';
import {map, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-kiosk-mode',
  templateUrl: './kiosk-mode.component.html',
  styleUrls: ['./kiosk-mode.component.scss']
})
export class KioskModeComponent implements OnInit, OnDestroy {

  activePassesKiosk: WrappedProvider;

  cardReaderValue: string;

  hideInput: boolean;

  @ViewChild('input', { read: ElementRef }) input: ElementRef;

  constructor(
      private dialog: MatDialog,
      private kioskMode: KioskModeService,
      private liveDataService: LiveDataService,
      private userService: UserService,
      private passesService: HallPassesService
  ) { }

  ngOnInit() {
      this.activePassesKiosk = new WrappedProvider(new ActivePassProvider(this.liveDataService, of('')));
  }

  ngOnDestroy() {
  }

  cardReader(event: KeyboardEvent) {
      // this.cardReaderValue = ';236=7';
      if (event.keyCode === 13 && this.cardReaderValue && (this.cardReaderValue[0] === ';' || this.cardReaderValue[0] === '%')) {
          combineLatest(
              this.userService.searchUserByCardId(this.cardReaderValue),
              this.passesService.getActivePassesKioskMode(this.kioskMode.currentRoom$.value.id)
          ).pipe(
              switchMap(([user, passes]: [User[], HallPass[]]) => {
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


  showMainForm(forLater: boolean, student?): void {
      const mainFormRef = this.dialog.open(CreateHallpassFormsComponent, {
          panelClass: 'main-form-dialog-container',
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
