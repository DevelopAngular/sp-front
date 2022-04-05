import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';

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

  to(tolang) {
    //TODO: sync load_localize_scripts with setLangiage
      if (LocalizejsService.isLocalizeAdded === false) {
        this.lang = tolang;
        this.load_localize_scripts();
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

  //TODO: make sure the scripts has loaded
  public load_localize_scripts() {
    if (LocalizejsService.isLocalizeAdded) return;

    const head = document.getElementsByTagName('head')[0];

    const script = document.createElement('script');
    script.onload = () => {
      this.load_inline_scripts();
      LocalizejsService.isLocalizeAdded = true;
    }
    script.src = "https://global.localizecdn.com/localize.js";
    head.insertBefore(script, head.firstChild);
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
  
    let otherscript;
    for(let inner of inners) {
      otherscript = document.createElement('script');
      otherscript.innerHTML = inner;
      head.insertBefore(otherscript, head.firstChild);
    }
  }
} 
