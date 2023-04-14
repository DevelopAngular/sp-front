import { Component, ElementRef, Inject, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Location } from '../models/Location';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { School } from '../models/School';
import { DarkThemeSwitch } from '../dark-theme-switch';
import { User } from '../models/User';
import { RepresentedUser } from '../navbar/navbar.component';
import { DeviceDetection } from '../device-detection.helper';
import { cloneDeep } from 'lodash';
import { COUNTRY_CODES } from '../services/localizejs.service';

@Component({
	selector: 'app-dropdown',
	templateUrl: './dropdown.component.html',
	styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent implements OnInit {
	options: HTMLElement;
	@ViewChild('optionsWrapper') set content(content: ElementRef<HTMLElement>) {
		if (content) {
			this.options = content.nativeElement;
			this.options.scrollTop = this.scrollPosition;
		}
	}

	@ViewChildren('schoolList') schoolList: QueryList<School>;
	@ViewChildren('langList') langList: QueryList<string>;
	@ViewChildren('_option') locationsList: QueryList<Location>;

	user: User;
	heading = '';
	locations: Location[];
	selectedLocation: Location;
	schools: School[];
	langs: string[];
	selectedLang: string;
	isDisabledLang: boolean;
	betaLanguage = '';
	countryCodes = COUNTRY_CODES;
	currentInitialObject;
	selectedSchool: School;
	teachers: User[];
	selectedTeacher: User;
	_matDialogRef: MatDialogRef<DropdownComponent>;
	triggerElementRef: HTMLElement;
	scrollPosition: number;
	findElement: ElementRef;
	sortData: any[];
	selectedSort: any;
	optionsMaxHeight: string;
	mainHeader: string;
	isSearchField: boolean;
	isHiddenSearchField: boolean;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any[],
		_matDialogRef: MatDialogRef<DropdownComponent>,
		public darkTheme: DarkThemeSwitch,
		private renderer: Renderer2
	) {
		this._matDialogRef = _matDialogRef;
		this.triggerElementRef = data['trigger'];
		this.heading = data['heading'];
		this.locations = data['locations'];
		this.schools = data['schools'];
		this.langs = data['langs'];
		this.teachers = data['teachers'];
		this.selectedLocation = data['selectedLocation'];
		this.selectedSchool = data['selectedSchool'];
		this.selectedLang = data['selectedLang'];
		this.isDisabledLang = data['isDisabledLang'];
		this.betaLanguage = data['betaLanguage'];
		this.selectedTeacher = data['selectedTeacher'];
		this.user = data['user'];
		this.scrollPosition = data['scrollPosition'];
		this.sortData = data['sortData'];
		this.selectedSort = data['selectedSort'] || '';
		this.optionsMaxHeight = data['maxHeight'] || '282px';
		this.mainHeader = this.data['mainHeader'];
		this.isSearchField = this.data['isSearchField'];
		this.isHiddenSearchField = this.data['isHiddenSearchField'];

		this.currentInitialObject = cloneDeep(this.schools || this.locations || this.teachers);
	}

	get isMobile() {
		return DeviceDetection.isMobile();
	}

	get searchPlaceholder(): string {
		if (this.schools) {
			return 'school';
		} else if (this.locations) {
			return 'location';
		} else if (this.teachers) {
			return 'teacher';
		}
		return '';
	}

	ngOnInit() {
		const matDialogConfig: MatDialogConfig = new MatDialogConfig();
		const rect = this.triggerElementRef.getBoundingClientRect();
		matDialogConfig.width = !!this.sortData ? '250px' : '300px';
		// matDialogConfig.height = this.teachers ? '180px' : '215px';
		matDialogConfig.position = {
			left: `${rect.left + (rect.width / 2 - parseInt(matDialogConfig.width, 10) / 2) - (this.isMobile && this.sortData ? 100 : 0)}px`,
			top: `${rect.bottom + Math.abs(document.scrollingElement.getClientRects()[0].top) + 15}px`,
		};
		this._matDialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
		this._matDialogRef.updatePosition(matDialogConfig.position);
		this._matDialogRef.backdropClick().subscribe(() => {
			this._matDialogRef.close(this.selectedTeacher);
		});
	}

	changeColor(hovered, elem, pressed?: boolean) {
		if (hovered) {
			if (pressed) {
				this.renderer.setStyle(elem, 'background-color', this.darkTheme.isEnabled$.value ? 'rgba(226, 231, 244, .2)' : '#E2E7F4');
			} else {
				this.renderer.setStyle(elem, 'background-color', this.darkTheme.isEnabled$.value ? 'rgba(226, 231, 244, .2)' : '#ECF1FF');
			}
		} else {
			this.renderer.setStyle(elem, 'background-color', this.darkTheme.isEnabled$.value ? '#0F171E' : 'white');
		}
	}

	get list() {
		if ((this.locationsList as any)._results.length) {
			return this.locationsList;
		} else if ((this.schoolList as any)._results.length) {
			return this.schoolList;
		} else if ((this.langList as any)._results.length) {
			return this.langList;
		}
	}

	search(value) {
		if (this.findElement) {
			this.renderer.setStyle(this.findElement.nativeElement, 'background-color', 'transparent');
		}
		if (value) {
			this.findElement = (this.list as any)._results.find((elem) => {
				return elem.nativeElement.innerText.toLowerCase().includes(value);
			});
			if (this.findElement) {
				this.findElement.nativeElement.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
				this.renderer.setStyle(this.findElement.nativeElement, 'background-color', '#ECF1FF');
			}
		}
	}

	searchObject(value) {
		if (this.schools && School.fromJSON(this.currentInitialObject[0]) instanceof School) {
			if (!!value) {
				this.schools = this.currentInitialObject.filter((school) => +school.id === +value || school.name.toLowerCase().includes(value.toLowerCase()));
			} else {
				this.schools = this.currentInitialObject;
			}
		} else if (this.teachers && User.fromJSON(this.currentInitialObject[0]) instanceof User) {
			if (!!value) {
				this.teachers = this.currentInitialObject.filter(
					(teacher) => +teacher.id === +value || teacher.display_name.toLowerCase().includes(value.toLowerCase())
				);
			} else {
				this.teachers = this.currentInitialObject;
			}
		}
	}

	closeDropdown(location) {
		this.scrollPosition = this.options.scrollTop;

		const dataAfterClosing = {
			selectedRoom: location,
			scrollPosition: this.scrollPosition,
		};
		this._matDialogRef.close(dataAfterClosing);
	}
}
