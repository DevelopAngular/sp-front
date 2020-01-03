import {Component, Input, OnInit} from '@angular/core';
import {School} from '../../../models/School';

declare const window;

@Component({
  selector: 'app-accounts-sync',
  templateUrl: './accounts-sync.component.html',
  styleUrls: ['./accounts-sync.component.scss']
})
export class AccountsSyncComponent implements OnInit {

  @Input() currentSchool: School;

  constructor() { }

  ngOnInit() {
  }

  openMail() {
    window.location.href = `mailto:support@smartpass.app?subject=${this.currentSchool.name} G Suite Authorization Link`;
  }

}
