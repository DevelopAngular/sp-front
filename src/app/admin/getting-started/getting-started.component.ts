import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {GettingStartedProgressService} from '../getting-started-progress.service';
import {fromEvent} from 'rxjs';

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss']
})
export class GettingStartedComponent implements OnInit {


  @ViewChild('gsBanner') banner: ElementRef<HTMLDivElement>

  constructor(
    public router: Router,
    public darkTheme: DarkThemeSwitch,
    public gsProgress: GettingStartedProgressService
  ) { }

  ngOnInit() {
    fromEvent(this.banner.nativeElement, 'animationend')
      .subscribe((evt: AnimationEvent) => {
        (evt.currentTarget as HTMLDivElement).style.display = 'none';
      });
  }
}
