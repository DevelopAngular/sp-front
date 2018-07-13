import { Component, OnInit } from '@angular/core';

import 'rxjs/add/operator/map';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  constructor(loadingService: LoadingService) {
  
  }

  ngOnInit() { }
}