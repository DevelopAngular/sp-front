import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {GG4LSync} from '../../../../models/GG4LSync';
import {SchoolSyncInfo} from '../../../../models/SchoolSyncInfo';
import {CreateFormService} from '../../../../create-hallpass-forms/create-form.service';
import {AdminService} from '../../../../services/admin.service';
import {MatDialogRef} from '@angular/material/dialog';
import {Ggl4SettingsComponent} from '../ggl4-settings.component';

declare const window;

@Component({
  selector: 'app-gg4l-set-up',
  templateUrl: './gg4l-set-up.component.html',
  styleUrls: ['./gg4l-set-up.component.scss']
})
export class Gg4lSetUpComponent implements OnInit {

  @Input() gg4lSyncInfo: GG4LSync;
  @Input() schoolSyncInfo: SchoolSyncInfo;

  @Output() back: EventEmitter<any> = new EventEmitter<any>();

  frameMotion$: BehaviorSubject<any>;

  selectedProvider: string;

  constructor(
    private formService: CreateFormService,
    private adminService: AdminService,
    private dialogRef: MatDialogRef<Ggl4SettingsComponent>
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

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
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

}
