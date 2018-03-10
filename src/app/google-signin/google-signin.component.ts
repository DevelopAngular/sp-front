import {Component, ElementRef, AfterViewInit, OnInit, Input} from '@angular/core';
import gapi from 'gapi-client';
import { Router } from '@angular/router';
import { NgZone, ViewChild } from '@angular/core';

import { DataService } from '../data-service';
import { HttpService } from '../http-service';

declare const gapi: any;

@Component({
  selector: 'google-signin',
  templateUrl: './google-signin.component.html',
  styleUrls: ['./google-signin.component.css']
})

export class GoogleSigninComponent implements AfterViewInit, OnInit {
  
  @Input()
  page:string;

  public name = "Not Logged in!";

  private clientId:string = '625620388494-6buq49df4o5r1slgah33kgm3a7gbin23.apps.googleusercontent.com';
  
  private scope = [
    'profile',
    'email',
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/contacts.readonly',
    'https://www.googleapis.com/auth/admin.directory.user.readonly'
  ].join(' ');

  public content: any = "";
  public barer: string = "";
  public auth2: any;
  public user: any = "";
  public profile: any = "";
  public signedIn: boolean = false;

  @ViewChild('signInButton') signInButton;
  @ViewChild('signOutButton') signOutButton;

  constructor(private element: ElementRef, private http: HttpService, private router: Router, private _ngZone: NgZone, private dataService: DataService) {
    //console.log('ElementRef: ', this.element);
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    let that = this;
    this.googleInit(() => {
      this.auth2.currentUser.listen(function(googleUser){
        that.setUpUser(googleUser);
      });
    });
  }

  public googleInit(callback) {
    let that = this;
    gapi.load('auth2', function () {
      that.auth2 = gapi.auth2.init({
        client_id: that.clientId,
        cookiepolicy: 'single_host_origin',
        scope: that.scope
      });
      
      that.attachSignin(that.signInButton.nativeElement);
      
      if(callback){
        callback();
      }

      //that.attachSignout(that.element.nativeElement.children[1]);
    });
  }

  public attachSignin(element) {
    let that = this;
    that.auth2.attachClickHandler(element, {},
      function (googleUser) {
        that._ngZone.run(() => { 
          //console.log('Outside Done!'); // console.log('Token || ' + googleUser.getAuthResponse().id_token); // console.log('ID: ' + that.profile.getId());
          // console.log('Name: ' + that.profile.getName()); // console.log('Image URL: ' + that.profile.getImageUrl()); // console.log('Email: ' + that.profile.getEmail());

          if(that.profile.getEmail().endsWith("@student.methacton.org") || that.profile.getEmail().endsWith("@methacton.org")){
            that.setUpUser(googleUser);
          } else{
            gapi.auth2.getAuthInstance().disconnect(); 
          }
        });
        
      }, function (error) {
        console.log(JSON.stringify(error, undefined, 2));
      });
  }

  public attachSignout(element){
    let that = this;
    that.auth2.attachClickHandler(element, {},
      function (googleUser) {
        that._ngZone.run(() => { 
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
          that.name = "Not Logged in!";
          that.user = "";
          that.profile = "";
          gapi.auth2.getAuthInstance().disconnect(); 
        });
      }, function (error) {
        console.log(JSON.stringify(error, undefined, 2));
      });
    });
  }
  
  setUpUser(googleUser){
    console.log("Setting up gUser");
    this.user = googleUser;
    this.profile = googleUser.getBasicProfile();

    var gUser = {};
    
    gUser['token'] = googleUser.getAuthResponse().id_token;
    gUser['id'] = this.profile.getId();
    gUser['name'] = this.profile.getName();
    gUser['imgUrl'] = this.profile.getImageUrl();
    gUser['email'] = this.profile.getEmail();

    this.dataService.updateGUser(gUser);

    this.name = this.profile.getName()

    var config = new FormData();

    config.set("client_id", "OBHAOsPqcRsHd6fxd5TlVj9AtDnbg9hdDDOpbHl5");
    config.set("provider", "google-auth-token");
    config.set("token", this.user.getAuthResponse().id_token);

    this.http.post('auth/by-token', "", config).subscribe((data:any) => {
      this.barer = data["access_token"];
      //console.log(this.barer);
      this.dataService.updateBarer(this.barer);

      var newConfig = {headers:{'Authorization' : 'Bearer ' +this.barer}}
      //console.log(newConfig);
      this.http.get('api/methacton/v1/users/@me', newConfig).subscribe((data:any[]) => {
        //console.log(data);
        var user = {};
        user['id'] = data['id'];
        user['first_name'] = data['first_name'];
        user['last_name'] = data['last_name'];
        user['display_name'] = data['display_name'];
        user['email'] = data['primary_email'];
        user['is_staff'] = data['is_staff'];
        this.dataService.updateUser(user);
        console.log("Done setting up user.");
      });

      this.router.navigate(['/main']);
      console.log("Done setting up gUser.");  
    }, (data:any[]) => {
      console.log(data);
    });
    //console.log("Setting up user.");

    
    //gapi.auth2.getAuthInstance().disconnect();
    //console.log("Done setting up gUser.");
    
  }
}