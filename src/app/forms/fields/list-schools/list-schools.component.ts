import {Component, Input, OnInit, QueryList, ViewChildren, HostListener} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

declare const window;

@Component({
  selector: 'app-list-schools',
  templateUrl: './list-schools.component.html',
  styleUrls: ['./list-schools.component.scss']
})
export class ListSchoolsComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() startTabIndex: number = -1;
  @Input() autoFocus: boolean = false;
  @ViewChildren('locationInput') locationInputs: QueryList<any>;

  inputCount: number = 1;
  innerWidth: number;

  constructor(private fb: FormBuilder,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      "minus",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/icons/minus-icon.svg")
    );
  }

  ngOnInit(): void {
    this.addSchool();
    this.innerWidth = window.innerWidth;
  }

  get schools(): FormArray {
    return this.form.controls.schools as FormArray;
  }

  addSchool(): void {
    this.schools.push(
      this.fb.group({
        name: ['', Validators.required],
        population: ['', Validators.required],
      })
    );
  }

  showRemove(): boolean {
    if (this.schools.length == 1) {
      return false;
    }
    return true;
  }

  removeSchool(index): void {
    let data = this.schools.removeAt(index);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }
}
