import { Component, OnInit } from '@angular/core';
import {AdminService} from '../../../services/admin.service';
import {Observable} from 'rxjs';
import {GG4LSync} from '../../../models/GG4LSync';
import {SchoolSyncInfo} from '../../../models/SchoolSyncInfo';

@Component({
  selector: 'app-ggl4-settings',
  templateUrl: './ggl4-settings.component.html',
  styleUrls: ['./ggl4-settings.component.scss']
})
export class Ggl4SettingsComponent implements OnInit {

  gg4lSyncInfo$: Observable<GG4LSync>;
  schoolSyncInfo$: Observable<SchoolSyncInfo>;

  page: number = 1;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.gg4lSyncInfo$ = this.adminService.gg4lInfo$;
    this.schoolSyncInfo$ = this.adminService.schoolSyncInfo$;
  }

}
