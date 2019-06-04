import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import { CreateHallpassFormsComponent } from '../create-hallpass-forms/create-hallpass-forms.component';
import { KioskModeService } from '../services/kiosk-mode.service';
import { MatDialog } from '@angular/material';
import {ActivePassProvider as activeKioskPasses} from '../hall-monitor/hall-monitor.component';
import {WrappedProvider} from '../models/providers';
import {LiveDataService} from '../live-data/live-data.service';
import {of} from 'rxjs';

@Component({
  selector: 'app-kiosk-mode',
  templateUrl: './kiosk-mode.component.html',
  styleUrls: ['./kiosk-mode.component.scss']
})
export class KioskModeComponent implements OnInit, OnDestroy {

  activePassesKiosk;

  constructor(
      private dialog: MatDialog,
      private kioskMode: KioskModeService,
      private liveDataService: LiveDataService
  ) { }

  ngOnInit() {
      this.activePassesKiosk = new WrappedProvider(new activeKioskPasses(this.liveDataService, of('')));
  }

  ngOnDestroy() {
  }

  canDeactivate() {
    return of(false);
  }

  showMainForm(forLater: boolean): void {
      const mainFormRef = this.dialog.open(CreateHallpassFormsComponent, {
          panelClass: 'main-form-dialog-container',
          backdropClass: 'custom-backdrop',
          data: {
              'forLater': forLater,
              'forStaff': true,
              'forInput': true,
              'kioskMode': true,
              'kioskModeRoom': this.kioskMode.currentRoom$.value
          }
      });
  }

}
