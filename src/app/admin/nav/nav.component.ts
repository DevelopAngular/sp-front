import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  buttons = [
            {title: 'Dashboard', route:'dashboard', imgUrl:'./assets/Dashboard'},
            {title: 'Hall Monitor', route:'hallmonitor', imgUrl:'./assets/Hallway'},
            {title: 'Search', route:'search', imgUrl:'./assets/Search'},
            {title: 'Accounts & Profiles', route:'accounts', imgUrl:'./assets/Accounts'},
            {title: 'Pass Configuration', route:'passconfig', imgUrl:'./assets/Arrow'},
            {title: 'Feedback', route:'feedback', imgUrl:'./assets/Arrow'},
            {title: 'Support', route:'support', imgUrl:'./assets/Support'},
            ]

  tab:string = "dashboard"

  constructor(private router:Router) { }

  ngOnInit() {
    let urlSplit: string[] = location.pathname.split('/');
    this.tab = urlSplit[urlSplit.length-1];

    this.router.events.subscribe(value => {
      if(value instanceof NavigationEnd){
        let urlSplit: string[] = value.url.split('/');
        this.tab = urlSplit[urlSplit.length-1];
        this.tab = ((this.tab==='' || this.tab==='admin')?'dashboard':this.tab);
      }
    });
  }

  route(route:string){
    if(route === 'feedback'){
      window.open('https://smartpass.app/feedback');
    } else if(route === 'support'){
      window.open('https://smartpass.app/support');
    } else{
      this.tab = route;
      this.router.navigateByUrl('/admin/' + this.tab);
    }
    this.tab = this.tab;
  }
}