import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';
import {merge, fromEvent, of} from 'rxjs';
import {take, catchError, retry} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocalizejsService {

  static isLocalizeAdded: boolean = false;

  private lang:string;

  from(fromlang:string) {
    this.lang = fromlang;
    return this;
  }

  to(tolang:string) {
    console.log(LocalizejsService.isLocalizeAdded );
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
    console.log(lang, this.lang);
    if (lang === this.lang) return; 
    this.lang = lang?? this.lang;
    (window as any).Localize?.hideWidget();
    (window as any).Localize?.setLanguage(this.lang);
  }

  public load_localize_scripts(fn: Function|null) {
    if (LocalizejsService.isLocalizeAdded) return;

    const head = document.getElementsByTagName('head')[0];

    const firstscript = document.createElement('script');
    const first$ = fromEvent(firstscript, 'load');

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

    const secondscript = document.createElement('script');
    const second$ = fromEvent(secondscript, 'inline-script-inserted').pipe(take(1));

    const thirdscript = document.createElement('script');
    const third$ = fromEvent(thirdscript, 'inline-script-inserted').pipe(take(1));

    const done$ = merge(second$, third$).pipe(retry(2), catchError(err => {
        console.log(err);
        return of('en');
    }));
    done$.subscribe(() => {
      LocalizejsService.isLocalizeAdded = true;
      if(fn !== null) fn();
    });

    // first must be loaded in the DOM before any other
    // in order for Localizejs to work 
    first$.subscribe(() => {
      const event = new CustomEvent("inline-script-inserted", { "detail": "inserted" });

      //TODO try catch here
      secondscript.innerHTML = inners[0];
      head.insertBefore(secondscript, head.firstChild);
      secondscript.dispatchEvent(event);

      thirdscript.innerHTML = inners[1];
      head.insertBefore(thirdscript, head.firstChild);
      thirdscript.dispatchEvent(event);
    
    });
    firstscript.src = "https://global.localizecdn.com/localize.js";
    head.insertBefore(firstscript, head.firstChild);
  } 

}
