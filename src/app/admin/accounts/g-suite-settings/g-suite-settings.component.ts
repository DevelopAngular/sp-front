import { Component, OnInit } from '@angular/core';
import {AdminService} from '../../../services/admin.service';
import {GSuiteOrgs} from '../../../models/GSuiteOrgs';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-g-suite-settings',
  templateUrl: './g-suite-settings.component.html',
  styleUrls: ['./g-suite-settings.component.scss']
})
export class GSuiteSettingsComponent implements OnInit {

  gSuiteInfo$: Observable<GSuiteOrgs>;
  isEditMode: boolean;

  constructor(
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.gSuiteInfo$ = this.adminService.gSuiteInfoData$;
  }

}
