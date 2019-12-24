import { Component, OnInit } from '@angular/core';

declare const window;

@Component({
  selector: 'app-sync-provider',
  templateUrl: './sync-provider.component.html',
  styleUrls: ['./sync-provider.component.scss']
})
export class SyncProviderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  redirect() {
    window.open('https://smartpass.app/gg4l-help');
  }

}
