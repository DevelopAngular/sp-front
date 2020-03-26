import {Component, ElementRef, Inject, OnInit, Optional} from '@angular/core';
import { DarkThemeSwitch } from '../dark-theme-switch';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-support-options',
  templateUrl: './support-options.component.html',
  styleUrls: ['./support-options.component.scss']
})
export class SupportOptionsComponent implements OnInit {

  options: any[];
  targetElementRef: ElementRef;

  constructor(
    private darkTheme: DarkThemeSwitch,
    private dialogRef: MatDialogRef<SupportOptionsComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.targetElementRef = this.data['trigger'];
    this.options = [
      { name: 'Support guides', image: 'Tour', hasShow: true, hovered: false },
      { name: 'Chat with us', image: 'Chat', hasShow: true, hovered: false },
      { name: 'Report a bug', image: 'Bug', hasShow: true, hovered: false },
      { name: 'What’s new?', image: 'Balloons', hasShow: true, hovered: false },
      { name: 'Suggest a feature', image: 'Latter', hasShow: true, hovered: false }
    ];
    this.updateDialogPosition();
  }

  getIcon(iconName: string, setting: any,  hover?: boolean, hoveredColor?: string) {
    return this.darkTheme.getIcon({
      iconName: iconName,
      setting: setting,
      hover: hover,
      hoveredColor: hoveredColor
    });
  }

  updateDialogPosition() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    if (this.targetElementRef && this.dialogRef) {
      const rect = this.targetElementRef.nativeElement.getBoundingClientRect();
      matDialogConfig.position = { left: `${rect.left + (rect.width / 2) - 210 }px`, top: `${rect.bottom - 320}px` };
      this.dialogRef.updatePosition(matDialogConfig.position);
    }
  }

}
