import {Component, EventEmitter, HostListener, Input, OnInit, Output, QueryList, Renderer2, ViewChildren} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {FormsService} from '../../../services/forms.service';

declare const window;

@Component({
  selector: 'app-list-schools',
  templateUrl: './list-schools.component.html',
  styleUrls: ['./list-schools.component.scss']
})
export class ListSchoolsComponent implements OnInit {

  @ViewChildren('searchAutocomplete') searchAutocompletes: QueryList<any>;

  @Input() form: FormGroup;
  @Input() startTabIndex: number = -1;
  @Input() autoFocus: boolean = false;
  @Input() showErrors: boolean = false;
  @Input() useLargeFormWhenNotFound: boolean;

  @Output() schoolCount = new EventEmitter<number>();

  inputCount: number = 1;
  innerWidth: number;
  mobile: boolean;

  constructor(
    private fb: FormBuilder,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private formService: FormsService,
    private renderer2: Renderer2
  ) {
    this.matIconRegistry.addSvgIcon(
      'minus',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/minus-icon.svg')
    );
  }

  ngOnInit(): void {
    this.addSchool();
    this.innerWidth = window.innerWidth;
    this.mobile = this.innerWidth < 560;
  }

  ngAfterViewInit() {
    if (this.mobile) {
      this.renderer2.setStyle(document.body, 'background', '#f5f8ff');
      this.renderer2.setStyle(document.body, '-webkit-overflow-scrolling', 'auto');
      this.renderer2.setStyle(document.documentElement, '-webkit-overflow-scrolling', 'auto');
    }
  }

  get schools(): FormArray {
    return this.form.controls.schools as FormArray;
  }

  addSchool(): void {
    this.schools.push(
      this.fb.group({
        name: ['', Validators.required],
        population: ['', Validators.required],
        school_digger_id: [null]
      })
    );
    this.schoolCount.emit(this.schools.length);
  }

  showRemove(): boolean {
    if (this.schools.length == 1) {
      return false;
    }
    return true;
  }

  removeSchool(index): void {
    this.schools.removeAt(index);
    this.schoolCount.emit(this.schools.length);
  }

  getSchoolInputWidth() {
    if (!this.mobile) {
      return '300px';
    } else {
      return '245px';
    }
  }

  getApproxInputWidth() {
    if (!this.mobile) {
      return this.showRemove() ? '150px' : '190px';
    } else {
      return this.showRemove() ? '195px' : '245px';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }
}
