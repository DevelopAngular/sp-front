import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {DarkThemeSwitch} from '../../dark-theme-switch';
import {GettingStartedProgressService, ProgressInterface} from '../getting-started-progress.service';
import {fromEvent, of} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';

declare const window;

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
          (evt.currentTarget as HTMLDivElement).style.display = 'none';
        });
    }
  }

  public banner: ElementRef<HTMLDivElement>;
  private bannerVissible: boolean;

  constructor(
    public router: Router,
    public darkTheme: DarkThemeSwitch,
    private gsProgress: GettingStartedProgressService
  ) { }
  public OnboardProgres: any = {};

  get bannerVisibility() {
    return this.bannerVissible;
  }

  ngOnInit() {
    this.gsProgress.onboardProgress$
      .pipe(
        switchMap((op: any) => {
          if (op.create_school && !op.create_school.start.value) {
            return this.gsProgress.updateProgress('create_school:start').pipe(take(1));
          }
          if (op.create_school && !op.create_school.end.value) {
            return this.gsProgress.updateProgress('create_school:end').pipe(take(1));
          }
          return of(op);
        })
      )
      .subscribe((op: any) => {
        if (op.create_school && (!op.create_school.start.value || !op.create_school.end.value)) {
          this.bannerVissible = true;
        }
        this.OnboardProgres = op;
      });

  }

  goMeetting(event) {
    event.stopPropagation();
    window.open('https://www.smartpass.app/meeting');
  }

  markItem(route: string[], ticket: keyof ProgressInterface) {
    this.gsProgress.updateProgress(ticket).subscribe();
    this.router.navigate(route);
  }
}
