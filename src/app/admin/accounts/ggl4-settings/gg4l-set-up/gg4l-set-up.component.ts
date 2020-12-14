import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {GG4LSync} from '../../../../models/GG4LSync';
import {SchoolSyncInfo} from '../../../../models/SchoolSyncInfo';
import {CreateFormService} from '../../../../create-hallpass-forms/create-form.service';
import {AdminService} from '../../../../services/admin.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Ggl4SettingsComponent} from '../ggl4-settings.component';
import {CleverInfo} from '../../../../models/CleverInfo';
import {Util} from '../../../../../Util';
import {ConsentMenuComponent} from '../../../../consent-menu/consent-menu.component';

declare const window;

@Component({
  selector: 'app-gg4l-set-up',
  templateUrl: './gg4l-set-up.component.html',
  styleUrls: ['./gg4l-set-up.component.scss']
})
export class Gg4lSetUpComponent implements OnInit {

  @Input() gg4lSyncInfo: GG4LSync;
  @Input() schoolSyncInfo: SchoolSyncInfo;
  @Input() cleverSyncInfo: CleverInfo;
  @Input() dialogAction: string;

  @Output() back: EventEmitter<any> = new EventEmitter<any>();

  frameMotion$: BehaviorSubject<any>;
  syncLoading$: Observable<boolean>;

  selectedProvider: string;

  constructor(
    private formService: CreateFormService,
    private adminService: AdminService,
    private dialogRef: MatDialogRef<Ggl4SettingsComponent>,
    private dialog: MatDialog
  ) { }

  get normalizeProvider(): string {
    if (this.schoolSyncInfo.is_gg4l_enabled) {
      if (this.schoolSyncInfo.login_provider === 'google-auth-token') {
        return 'Sign in with Google';
      } else if (this.schoolSyncInfo.login_provider === 'gg4l-sso') {
        return 'GG4L \n Passport';
      }
    }
  }

  get integrationName() {
    return this.dialogAction === 'gg4l' ? 'GG4L' : this.dialogAction === 'clever' ? 'Clever' : null;
  }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.syncLoading$ = this.adminService.cleverSyncLoading$;
  }

  formatDate(date) {
    return Util.formatDateTime(new Date(date));
  }

  selectProvider(provider) {
    if (provider === 'Sign in with Google') {
      this.selectedProvider = 'google-auth-token';
    } else if (provider === 'GG4L \n Passport') {
      this.selectedProvider = 'gg4l-sso';
    }
  }

  close() {
    this.back.emit();
  }

  openLink(link) {
    window.open(link, '_blank');
  }

  setProvider() {
    this.adminService.updateSpSyncingRequest({ login_provider: this.selectedProvider })
      .subscribe(res => {
      this.dialogRef.close();
    });
  }

  openConsentMenu(event) {
    const menu = this.dialog.open(ConsentMenuComponent, {
      panelClass: 'consent-dialog-container',
      backdropClass: 'invis-backdrop',
      data: { trigger: new ElementRef(event.currentTarget),
        options: [
          this.genOption(
            `Open ${this.dialogAction === 'gg4l' ? this.integrationName + ' connect' : this.integrationName}`,
            '#4274F6',
            this.dialogAction,
            this.dialogAction === 'clever' ? './assets/Clever (Blue).svg' : null
          )
        ]
      }
    });

    menu.afterClosed().subscribe(action => {
      if (action === 'clever') {
        this.openLink('https://www.smartpass.app/clever-open');
      }
    });
  }

  genOption(display, color, action, icon?) {
    return { display, color, action, icon };
  }

  syncing() {
    this.adminService.syncNow().subscribe(res => {
    });
  }

}
