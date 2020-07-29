import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss']
})
export class InfoDialogComponent implements OnInit {

  integrations: string[] = [
    './assets/integrations/Power School.svg',
    './assets/integrations/Skyward_Logo.svg',
    './assets/integrations/aeries.svg',
    './assets/integrations/gradelink.svg',
    './assets/integrations/+100s more.svg'
  ];

  constructor() { }

  ngOnInit() {
  }

}
