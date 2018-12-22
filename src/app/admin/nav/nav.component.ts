import {Component, OnInit, NgZone, Output, EventEmitter} from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { LoadingService } from '../../loading.service';
import { DataService } from '../../data-service';
import { User } from '../../models/User';
import {ReplaySubject, Subject} from 'rxjs';
import { UserService } from '../../user.service';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  @Output('restrictAccess') restrictAccess: EventEmitter<boolean> = new EventEmitter();

  buttons = [
    {title: 'Dashboard', route : 'dashboard', imgUrl : './assets/Dashboard', requiredRoles: ['_profile_admin', 'admin_dashboard']},
    {title: 'Hall Monitor', route : 'hallmonitor', imgUrl : './assets/Hallway', requiredRoles: ['_profile_admin', 'admin_hall_monitor']},
    {title: 'Search', route : 'search', imgUrl : './assets/Search', requiredRoles: ['_profile_admin', 'admin_search']},
    {title: 'Pass Configuration', route : 'passconfig', imgUrl : './assets/Arrow', requiredRoles: ['_profile_admin', 'admin_pass_config']},
    {title: 'Accounts & Profiles', route : 'accounts', imgUrl : './assets/Accounts', requiredRoles: ['_profile_admin', 'admin_accounts']},
    {title: 'Feedback', route : 'feedback', imgUrl : './assets/Feedback', requiredRoles: ['_profile_admin']},
    {title: 'Support', route : 'support', imgUrl : './assets/Support', requiredRoles: ['_profile_admin']},
  ];
  fakeMenu = new BehaviorSubject<boolean>(false);
  tab: string[] = ['dashboard'];

  console = console;

  user: User;
  showButton: boolean;

  constructor(
      public router: Router,
      private activeRoute: ActivatedRoute,
      private dataService: DataService,
      private userService: UserService,
      public loadingService: LoadingService,
      private _zone: NgZone
  ) { }

  ngOnInit() {


    let urlSplit: string[] = location.pathname.split('/');
    this.tab = urlSplit.slice(1);

    this.router.events.subscribe(value => {
      if(value instanceof NavigationEnd){
        let urlSplit: string[] = value.url.split('/');
        this.tab = urlSplit.slice(1);
        console.log(this.tab);
        this.tab = ( (this.tab === [''] || this.tab === ['admin']) ? ['dashboard'] : this.tab );
      }
    });

    this.dataService.currentUser
      .pipe(this.loadingService.watchFirst)
      .subscribe(user => {

        this._zone.run(() => {
          this.user = user;
          this.showButton = user.roles.includes('_profile_admin') && user.roles.includes('_profile_teacher');
          this.dataService.updateInbox(!this.tab.includes('settings'));
        });
      });

    this.userService.userData.subscribe((user: any) => {
        // console.log('CurrentRoute ===> \n', (this.activeRoute.snapshot as any)._routerState.url, !this.hasRoles(this.buttons[0].requiredRoles));

        this.buttons.forEach((button) => {

          if (
            ((this.activeRoute.snapshot as any)._routerState.url === `/admin/${button.route}`)
              &&
            !this.hasRoles(button.requiredRoles)
          ) {
            this.restrictAccess.emit(true);
            this.fakeMenu.next(true);
          }
        });
    });
  }

  route( route: string) {
    this.tab = ['admin', route];
    this.router.navigate(this.tab);
  }
  isSelected(route: string) {
    return this.tab.includes(route);
  }
  hasRoles(roles: string[]): Observable<boolean> {
    // const mockRoles = [
    //  '_profile_admin',
    //  'admin_accounts',
    //  'admin_dashboard',
    //  'admin_hall_monitor',
    //  'admin_pass_config',
    //  'admin_search',
    //  'create_report',
    //  'edit_all_hallpass',
    //  'flag_hallpass',
    //  'manage_alerts',
    //  'manage_locations',
    //  'manage_pinnables',
    //  'manage_school',
    //  'view_reports',
    //  'view_traveling_users',
    // ]
    return this.userService.userData.map(u => roles.every((_role) => u.roles.includes(_role)));
  }
}
