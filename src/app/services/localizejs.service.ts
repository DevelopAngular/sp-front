import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';
import {ReplaySubject, Observable, combineLatest, fromEvent} from 'rxjs';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocalizejsService {

  static isLocalizeAdded: boolean = false;

  private done$: ReplaySubject<boolean> = new ReplaySubject();

  private lang:string;

  from(fromlang:string) {
    this.lang = fromlang;
    return this;
  }

  to(tolang) {
    console.log(LocalizejsService.isLocalizeAdded );
      if (LocalizejsService.isLocalizeAdded === false) {
        this.load_localize_scripts();
        this.setLanguage(tolang);
        this.lang = tolang;
        return;
      } 
      this.setLanguage(tolang);
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

  public load_localize_scripts() {
    if (LocalizejsService.isLocalizeAdded) return;

    const head = document.getElementsByTagName('head')[0];

    const script = document.createElement('script');
    const firstscript = fromEvent(script, 'load').pipe(tap(evt => {
      console.log('f',evt);
      this.done$.next(true);
    })).subscribe();
    script.src = "https://global.localizecdn.com/localize.js";
    head.insertBefore(script, head.firstChild);

    this.load_inline_scripts();

    this.done$
      .subscribe(v => {
        console.log('done',v);
        LocalizejsService.isLocalizeAdded = true;
      });
  }

  private load_inline_scripts() {
    const head = document.getElementsByTagName('head')[0];
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
      Localize.setLanguage('${this.lang}');
      `
    ];
  
    const loads = [];
    for(let inner of inners) {
      const otherscript = document.createElement('script');
      fromEvent(otherscript, 'load').pipe(tap(evt => {
        console.log('o',evt);
        this.done$.next(true);
      })).subscribe();

      otherscript.innerHTML = inner;
      head.insertBefore(otherscript, head.firstChild);
    }
  }
} 
