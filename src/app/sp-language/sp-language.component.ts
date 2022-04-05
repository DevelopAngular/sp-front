import {environment} from '../../environments/environment';
import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DropdownComponent} from '../dropdown/dropdown.component';
import {HttpService} from '../services/http-service';
import {filter, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {UNANIMATED_CONTAINER} from '../consent-menu-overlay';
import {NavbarDataService} from '../main/navbar-data.service';
import {NavbarElementsRefsService} from '../services/navbar-elements-refs.service';

@Component({
  selector: 'app-sp-language',
  templateUrl: './sp-language.component.html',
  styleUrls: ['./sp-language.component.scss']
})
export class SpLanguageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('langToggle', { static: true }) langToggle: ElementRef;

  public langs: string[];

  public currentLang:string;

  public sourceLang:string = 'en';

  private subscriber$ = new Subject();

  constructor(
    private dialog: MatDialog,
    private http: HttpService,
    private navbarService: NavbarDataService,
    private navbarElementsService: NavbarElementsRefsService,
  ) { }

  ngOnInit() {
    this.http.langs$.pipe(takeUntil(this.subscriber$)).subscribe(langs => {
      this.langs = langs;
      this.langs = this.langs.sort( (lang, other) => {
          return lang.localeCompare(other);
      });
    });

    this.http.currentLang$.pipe(takeUntil(this.subscriber$), filter(res => !!res)).subscribe(lang => {
      this.currentLang = lang;
      if (this.isLocalizeAdded === false && (this.currentLang !== this.sourceLang)) {
        this.addLocalize();
      } else {
        window.Localize?.hideWidget();
        window.Localize?.setLanguage(this.currentLang);
      }
    });
  }

  ngOnDestroy() {
    this.subscriber$.next(null);
    this.subscriber$.complete();
  }

  ngAfterViewInit(): void {
    this.navbarElementsService.langToggle$.next(this.langToggle);
  }

  showOptions(target: HTMLElement) {
    UNANIMATED_CONTAINER.next(true);
    const optionDialog = this.dialog.open(DropdownComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {
          'alignSelf': true,
          'langs': this.langs,
          'selectedLang': this.currentLang,
          'heading': 'SELECT LANGUAGE',
          'trigger': target,
          'isSearchField': false,
        }
      });
      optionDialog.afterClosed().subscribe(data => {
        UNANIMATED_CONTAINER.next(false);
        if (data) {
          this.http.langToggle$.next(data);
          this.http.setLang(data);
        }
      });
    }

  isLocalizeAdded: bool = false;

  addLocalize() {
    if (this.isLocalizeAdded) return;

    const head = document.getElementsByTagName('head')[0];

    const script = document.createElement('script');
    script.onload = () => this.load_inline_scripts(head);
    script.src = "https://global.localizecdn.com/localize.js";
    head.insertBefore(script, head.firstChild);
  }

  private load_inline_scripts(head) {
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
      Localize.setLanguage('${this.currentLang}');
      `
    ];// because of insertBefore
  
    let otherscript;
    for(let inner of inners) {
      otherscript = document.createElement('script');
      otherscript.innerHTML = inner;
      head.insertBefore(otherscript, head.firstChild);
    }
    this.isLocalizeAdded = true;
  }

}
