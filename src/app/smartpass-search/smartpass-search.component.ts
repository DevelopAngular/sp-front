import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {UserService} from '../services/user.service';
import {Router} from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-smartpass-search',
  templateUrl: './smartpass-search.component.html',
  styleUrls: ['./smartpass-search.component.scss'],
  animations: [
    trigger('inputAnimate', [
      state('open', style({
        width: '255px'
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

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.showTooltip$.next(true)
  }

  search(value) {
    this.userService.searchProfile('_profile_student', 50, value).subscribe(res => {
      this.result = res.results;
    });
  }

  goToUserPage(value) {
    this.router.navigateByUrl(`/main/student/${value.id}`);
    this.isFocus = false;
  }

}
