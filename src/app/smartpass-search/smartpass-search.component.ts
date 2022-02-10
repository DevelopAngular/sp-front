import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Observable, Subject} from 'rxjs';
import {SmartpassSearchService} from '../services/smartpass-search.service';

@Component({
  selector: 'app-smartpass-search',
  templateUrl: './smartpass-search.component.html',
  styleUrls: ['./smartpass-search.component.scss'],
  animations: [
    trigger('inputAnimate', [
      state('open', style({
        width: '260px'
      })),
      state('close', style({
        width: '242px'
      })),
      transition('open <=> close', animate('.3s ease')),
    ]),
    trigger('logoAnimate', [
      state('open', style({
        'margin-right': '12px',
        display: 'block'
      })),
      state('close', style({
        'margin-right': '0',
        display: 'none'
      })),
      transition('open <=> close', animate('.3s ease')),
    ])
  ]
})
export class SmartpassSearchComponent implements OnInit, AfterViewInit {

  @Input() focused: boolean;
  @Input() height: string = '40px';
  @Input() width: string;

  public isFocus: boolean;
  public result: any[] = [];
  showTooltip$: Subject<boolean> = new Subject();
  searchLoading$: Observable<boolean>;
  searchLoaded$: Observable<boolean>;
  searchResult$: Observable<any>;

  constructor(
    private router: Router,
    private spSearchService: SmartpassSearchService
  ) { }

  ngOnInit(): void {
    this.searchResult$ = this.spSearchService.searchResult$;
    this.searchLoading$ = this.spSearchService.searchLoading$;
    this.searchLoaded$ = this.spSearchService.searchLoaded$;
  }

  ngAfterViewInit() {
    this.showTooltip$.next(false);
  }

  search(value) {
    if (!value) {
      this.spSearchService.clearResult();
      return;
    }
    this.spSearchService.searchRequest(value);
  }

  goToUserPage(value) {
    this.router.navigateByUrl(`/main/student/${value.id}`);
    this.isFocus = false;
    this.spSearchService.clearResult();
  }

  goToHomePage() {
    this.router.navigateByUrl(`/main/passes`);
    this.isFocus = false;
    this.spSearchService.clearResult();
  }

  focusEvent(value) {
    this.isFocus = value;
  }

}
