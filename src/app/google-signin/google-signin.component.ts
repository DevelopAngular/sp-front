import {Component, ElementRef, AfterViewInit, OnInit} from '@angular/core';
import gapi from 'gapi-client';
import {Router} from '@angular/router';

import {HttpClient} from '@angular/common/http';
import { setTimeout } from 'timers';
import { NgZone } from '@angular/core';
import { DataService } from '../data-service';

declare const gapi: any;

@Component({
  selector: 'google-signin',
  templateUrl: './google-signin.component.html',
  styleUrls: ['./google-signin.component.css']
})

export class GoogleSigninComponent implements AfterViewInit, OnInit {
  
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

  public googleInit() {
    let that = this;
    gapi.load('auth2', function () {
      that.auth2 = gapi.auth2.init({
        client_id: that.clientId,
        cookiepolicy: 'single_host_origin',
        scope: that.scope
      });
      that.attachSignin(that.element.nativeElement.children[0]);
      that.attachSignout(that.element.nativeElement.children[1]);
    });
  }
  public attachSignin(element) {
    let that = this;
    that.auth2.attachClickHandler(element, {},
      function (googleUser) {
        that._ngZone.run(() => { 
          //console.log('Outside Done!');
          that.user = googleUser;
          that.profile = googleUser.getBasicProfile();

          // console.log('Token || ' + googleUser.getAuthResponse().id_token);
          // console.log('ID: ' + that.profile.getId());
          // console.log('Name: ' + that.profile.getName());
          // console.log('Image URL: ' + that.profile.getImageUrl());
          // console.log('Email: ' + that.profile.getEmail());

          var gUser = {};

          gUser['token'] = googleUser.getAuthResponse().id_token;
          gUser['id'] = that.profile.getId();
          gUser['name'] = that.profile.getName();
          gUser['imgUrl'] = that.profile.getImageUrl();
          gUser['email'] = that.profile.getEmail();

          that.dataService.updateGUser(gUser);

          if(that.profile.getEmail().endsWith("@student.methacton.org") || that.profile.getEmail().endsWith("@methacton.org")){
            that.name = that.profile.getName()

            var config = new FormData();

            config.set("client_id", "OBHAOsPqcRsHd6fxd5TlVj9AtDnbg9hdDDOpbHl5");
            config.set("provider", "google-auth-token");
            config.set("token", that.user.getAuthResponse().id_token);

            that.http.post('https://notify.letterday.info/auth/by-token/', config).subscribe((data:any[]) => {
              that.barer = data["access_token"];
              that.dataService.updateBarer(that.barer);
              that.router.navigate(['/choose']);     
            }, (data:any[]) => {
              console.log(data);
            });
            //gapi.auth2.getAuthInstance().disconnect();
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
  }

  constructor(private element: ElementRef, private http: HttpClient, private router: Router, private _ngZone: NgZone, private dataService: DataService) {
    //console.log('ElementRef: ', this.element);
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.googleInit();
  }

}