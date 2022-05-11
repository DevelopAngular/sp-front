import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { Subscription } from 'rxjs';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import { ComponentsService } from '../../services/components.service';

@Component({
  selector: 'app-nav-button',
  templateUrl: './nav-button.component.html',
  styleUrls: ['./nav-button.component.scss']
})
export class NavButtonComponent implements OnInit, OnChanges {

  @Input() icon: string;
  @Input() content: string;
  @Input() selected: boolean = false;
  @Input() isExpand: boolean = false;
  @Input() button:  any  = {};

  @Output() selectedButton: EventEmitter<any> = new EventEmitter();
  @Output() onClick: EventEmitter<any> = new EventEmitter();

  public iconId: string;
  clickEventSubscription:Subscription;

  get textColor() {
    return this.selected ? '#00B476' : this.darkTheme.isEnabled$.value ? '#FFFFFF' : ' #7E879D';
  }

  constructor(
    private darkTheme: DarkThemeSwitch,
    private componentService: ComponentsService
  ) { }

  ngOnInit() {
    this.iconId = `#${this.icon}`;
  }

  ngOnChanges() {
    if (this.selected) {
      this.selectedButton.emit(this.selected);
    }
  }

  doClick() {
    if (this.button.id == 'explore') {
      this.onClick.emit(this.selected);
      setTimeout(() => {
        this.componentService.sendClickEvent();
      }, 100);
      return;
    }
    this.onClick.emit(this.selected);
  }

}
