import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-textarea',
  templateUrl: './app-textarea.component.html',
  styleUrls: ['./app-textarea.component.scss']
})
export class AppTextareaComponent implements OnInit {

  @Input() width: string = '200px';
  @Input() height: string = '70px';
  @Input() placeholder: string = '';
  @Input() focused: boolean;
  @Input() control: FormControl;
  @Input() label: string = '';

  @ViewChild('textArea') textArea: ElementRef;

  hovered: boolean;

  constructor() { }

  ngOnInit(): void {
    if (this.focused) {
      this.textArea.nativeElement.focus();
    }
  }

}
