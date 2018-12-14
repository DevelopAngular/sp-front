import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent implements OnInit {

  private destroy$: Subject<any> = new Subject();
  public source: SafeUrl;
  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    // const fileType = 'data:application/pdf';
    // this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params: any) => {
    //   console.log(params);
    //   this.source = this.sanitizer.bypassSecurityTrustResourceUrl(decodeURIComponent(params.source));
    // });
    console.log(decodeURIComponent(localStorage.getItem('pdf_src')));
    this.source = this.sanitizer.bypassSecurityTrustResourceUrl(decodeURIComponent(localStorage.getItem('pdf_src')));

  }

}
