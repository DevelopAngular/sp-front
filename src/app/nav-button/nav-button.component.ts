import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnChanges
} from '@angular/core';
import {DarkThemeSwitch} from '../dark-theme-switch';

@Component({
  selector: 'app-nav-button',
  templateUrl: './nav-button.component.html',
  styleUrls: ['./nav-button.component.scss']
})
export class NavButtonComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() icon: string;
  @Input() content: string;
  @Input() selected: boolean = false;

  @Output() onClick: EventEmitter<any> = new EventEmitter();

  iconId: string;

  constructor(
    private darkTheme: DarkThemeSwitch
  ) { }


  get textColor() {
      return this.selected ? '#00B476' : this.darkTheme.isEnabled$.value ? '#FFFFFF' : ' #7E879D';
  }

  ngAfterViewInit() {
      // if (this.selected) {
      //     this.doClick();
      // }
  }
  ngOnChanges() {

      // setTimeout(() => {
      //   this.doClick();
      // }, 1000);

  }


  ngOnInit() {
      this.iconId = `#${this.icon}`;
  }

  doClick() {
    this.onClick.emit(this.selected);
  }

}
