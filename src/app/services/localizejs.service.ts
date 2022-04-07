import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';
import {concat, fromEvent, of, throwError} from 'rxjs';
import {tap, map, take, catchError, retry} from 'rxjs/operators';
import {HttpService} from './http-service';

@Injectable({
  providedIn: 'root'
})
export class LocalizejsService {

  static isLocalizeAdded: boolean = false;

  static readonly RETRY_NUM = 2;

  private lang:string;

  constructor(
    private http: HttpService,
  ){}

  from(fromlang:string) {
    this.lang = fromlang;
    return this;
  }

  to(tolang:string) {
    const fn = () => {
      this.setLanguage(tolang);
      this.lang = tolang;
    };  
    if (LocalizejsService.isLocalizeAdded === false) {
      this.load_localize_scripts(fn);
      return;
    } 
    fn();
  }

  getSourceLanguage() {
    return (window as any).Localize?.getSourceLanguage();
  }

  setLanguage(lang=null) {
    if (lang === this.lang) return; 
    this.lang = lang?? this.lang;
    (window as any).Localize?.hideWidget();
    (window as any).Localize?.setLanguage(this.lang);
  }

  public load_localize_scripts(fn: Function|null) {
    if (LocalizejsService.isLocalizeAdded) return;

    const PREFIX = 'smartpass-localizejs-';
    // add ids to clean orphan scripts that has been added to DOM
    const firstscript = document.createElement('script');
    firstscript.id = PREFIX+'1';
    const first$ = fromEvent(firstscript, 'load').pipe(take(1));

    const secondscript = document.createElement('script');
    secondscript.id = PREFIX+'2';
    const second$ = fromEvent(secondscript, 'inline-script-inserted').pipe(take(1));

    const thirdscript = document.createElement('script');
    thirdscript.id = PREFIX+'3';
    const third$ = fromEvent(thirdscript, 'inline-script-inserted').pipe(take(1));

    const head = document.getElementsByTagName('head')[0];

    const cleanScripts = () => ['1','2','3'].map(n => document.getElementById(PREFIX+n)?.remove());

    // first must be loaded in the DOM before any other
    // in order for Localizejs to work 
    const lang$ = this.http.currentLang$.pipe(
      take(1),
      map(lang => {
        const key = environment.localizejs.apiKey;
        const inners = [
          '!function(a){if(!a.Localize){a.Localize={};for(var e=["translate","untranslate","phrase","initialize","translatePage","setLanguage","getLanguage","getSourceLanguage","detectLanguage","getAvailableLanguages","untranslatePage","bootstrap","prefetch","on","off","hideWidget","showWidget"],t=0;t<e.length;t++)a.Localize[e[t]]=function(){}}}(window);',
          `Localize.initialize({
            key: '${key}',
            rememberLanguage: true,
            autoApprove: true,
            retranslateOnNewPhrases: true,
            translateTimeElement: true,
            hideWidget: true,
          });
          Localize.hideWidget();
          Localize.setLanguage('${lang}');
          `
        ];


        const event = new CustomEvent("inline-script-inserted", { "detail": "inserted" });

        secondscript.innerHTML = inners[0];
        head.insertBefore(secondscript, firstscript.nextElementSibling);
        secondscript.dispatchEvent(event);

        thirdscript.innerHTML = inners[1];
        head.insertBefore(thirdscript, secondscript.nextElementSibling);
        thirdscript.dispatchEvent(event);
      }),
      catchError(async err => {
        console.log('lang', err);
        cleanScripts();
      }),
    );
    
    concat(first$, lang$, second$, third$).pipe(
      retry(LocalizejsService.RETRY_NUM),
      catchError(async err => {
        cleanScripts();
      }),
    ).subscribe(
      res => {
        console.log('sub', res);
        //throw new Error('Boom');
        LocalizejsService.isLocalizeAdded = true;
        if(fn !== null) fn();
      },
    );

    // kick off scripts loading
    // it will be added to the DOM regardless of operation success
    firstscript.src = "https://global.localizecdn.com/localize.js";
    head.insertBefore(firstscript, head.firstChild);
  } 

}
