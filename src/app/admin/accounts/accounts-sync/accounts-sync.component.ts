import {Component, Input, OnInit} from '@angular/core';
import {School} from '../../../models/School';
import {GettingStartedProgressService} from '../../getting-started-progress.service';

declare const window;

@Component({
  selector: 'app-accounts-sync',
  templateUrl: './accounts-sync.component.html',
  styleUrls: ['./accounts-sync.component.scss']
})
export class AccountsSyncComponent implements OnInit {

  @Input() currentSchool: School;

  constructor(private process: GettingStartedProgressService) { }

  ngOnInit() {
    // this.process.updateProgress('setup_accounts:end').subscribe();
  }

  openMail() {
    window.location.href = `mailto:support@smartpass.app?subject=${this.currentSchool.name} G Suite Authorization Link`;
  }

}
