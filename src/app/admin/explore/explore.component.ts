import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface View {
  [view: string]: CurrentView;
}

export interface CurrentView {
  title: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  views: View = {
    'pass_search': {title: 'Pass Search', color: '#00B476', icon: './assets/Pass Search (White).svg'}
  };

  currentView$: BehaviorSubject<string> = new BehaviorSubject<string>('pass_search');

  constructor() { }

  ngOnInit() {}

}
