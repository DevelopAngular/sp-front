import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {fromEvent, Observable, Subject} from 'rxjs';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

declare const window;


@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent implements OnInit, OnDestroy {
  // @ViewChild('doc') doc: ElementRef;
  // private pdfSrc$: Observable<string>;
  //
  // private destroy$: Subject<any> = new Subject();
  //
  // public source: any;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {
    // this.pdfSrc$ = new Observable<string>((observer) => {
    //
    //   const timerId = setInterval(() => {
    //     console.log(window.localStorage.getItem('pdf_src'));
    //     if (window.localStorage.getItem('pdf_src')) {
    //       observer.next(window.localStorage.getItem('pdf_src'));
    //       observer.complete();
    //       // window.localStorage.removeItem('pdf_src');
    //     }
    //   }, 100);
    //   return {
    //     unsubscribe() {
    //       clearInterval(timerId);
    //     }
    //   };
    // });
  }

  ngOnInit() {
    // const fileType = 'data:application/pdf';
    // this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params: any) => {
    //   console.log(params);
    //   this.source = this.sanitizer.bypassSecurityTrustResourceUrl(decodeURIComponent(params.source));
    // });

    // this.pdfSrc$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
    //   if (value) {
    //     this.source = {
    //       safeSource: this.sanitizer.bypassSecurityTrustResourceUrl(decodeURIComponent(localStorage.getItem('pdf_src'))),
    //       unsafeSource: decodeURIComponent(localStorage.getItem('pdf_src'))
    //     }
    //     // window.location = this.source.unsafeSource;
    //   const doc = this.doc.nativeElement;
    //     doc.setAttribute('src', this.source.unsafeSource);
    //     fromEvent(doc, 'load')
    //       .subscribe((res: any) => {
    //         console.dir(res.target.contentWindow);
    //         // res.target.contentWindow.window.frames.print();
    //         res.target.focus();
    //         res.target.contentWindow.print();
    //         // window.frames.print();
    //         console.dir(window.frames);
            // console.log(res.target.contentDocument.getElementById('print'));
          // });
        // console.dir(window.frames);

        // setTimeout(() => {
        //   this.HandleEvents();
        //
        // }, 1000);
    //   }
    // });
  }
  // HandleEvents() {
  //   const myIframe = document.getElementById('ifrm');
  //   myIframe.onload = function() {
  //
  //     console.log(myIframe);
  //   };
  //   // myIframe.src = 'show_events.html';
  //
  // }
  ngOnDestroy() {
    // this.destroy$.complete();
  }

}
