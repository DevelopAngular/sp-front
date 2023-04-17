import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { HttpService } from '../services/http-service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UNANIMATED_CONTAINER } from '../consent-menu-overlay';
import { NavbarDataService } from '../main/navbar-data.service';
import { NavbarElementsRefsService } from '../services/navbar-elements-refs.service';
import { LocalizejsService, COUNTRY_CODES } from '../services/localizejs.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-sp-language',
	templateUrl: './sp-language.component.html',
	styleUrls: ['./sp-language.component.scss'],
})
export class SpLanguageComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('langToggle', { static: true }) langToggle: ElementRef;

	public langs: string[];

	public currentLang: string;
	private isDisabledLang: boolean = false;
	public countryCodes = COUNTRY_CODES;

	private subscriber$ = new Subject();

	constructor(
		private dialog: MatDialog,
		public dialogRef: MatDialogRef<SpLanguageComponent>,
		private http: HttpService,
		private navbarElementsService: NavbarElementsRefsService,
		private localize: LocalizejsService,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	ngOnInit() {
		this.currentLang = this.http.getLang();

		this.http.langs$.pipe(takeUntil(this.subscriber$)).subscribe((langs) => {
			this.langs = langs;
			this.langs = this.langs.sort((lang, other) => {
				return lang.localeCompare(other);
			});
		});

		this.http.currentLang$
			.pipe(
				takeUntil(this.subscriber$),
				filter((res) => !!res)
			)
			.subscribe((chosenLang) => {
				this.localize.from(this.currentLang).to(chosenLang);
				this.currentLang = chosenLang;
			});

		this.localize.disableLanguage$.pipe(takeUntil(this.subscriber$)).subscribe((disabledState) => {
			this.isDisabledLang = disabledState;
			this.localize.setLanguageUntranslated();
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
				alignSelf: true,
				langs: this.langs,
				selectedLang: this.currentLang,
				isDisabledLang: this.isDisabledLang,
				betaLanguage: this.localize.langThatIsBeta,
				heading: 'SELECT LANGUAGE',
				trigger: target,
				isSearchField: false,
				adjustForScroll: true
			},
		});
		optionDialog.afterClosed().subscribe((data) => {
			UNANIMATED_CONTAINER.next(false);
			if (data) {
				this.http.langToggle$.next(data);
				this.http.setLang(data);
			}
		});
	}
}
