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


  @ViewChild('gsBanner') set bannerRef(v: ElementRef<HTMLDivElement>) {
    this.banner = v;
    if (this.banner) {
       fromEvent(this.banner.nativeElement, 'animationend')
        .subscribe((evt: AnimationEvent) => {
          console.log(evt);
          (evt.currentTarget as HTMLDivElement).style.display = 'none';
        });
    }
  }

  banner: ElementRef<HTMLDivElement>;

  constructor(
    public router: Router,
    public darkTheme: DarkThemeSwitch,
    public gsProgress: GettingStartedProgressService
  ) { }

  get bannerVisibility() {
    return this.gsProgress.onboardProgress.create_school && (!this.gsProgress.onboardProgress.create_school.start || !this.gsProgress.onboardProgress.create_school.end);
  }

  ngOnInit() {

  }
}
