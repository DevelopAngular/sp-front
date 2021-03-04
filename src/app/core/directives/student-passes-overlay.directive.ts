import {ComponentRef, Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';
import {ConnectedPosition, Overlay, OverlayPositionBuilder, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {StudentPassesComponent} from '../../student-passes/student-passes.component';
import {User} from '../../models/User';

@Directive({
  selector: '[appStudentPassesOverlay]'
})
export class StudentPassesOverlayDirective implements OnInit {

  @Input('positionStrategy') positionStrategy: ConnectedPosition;
  @Input('profile') profile: User;
  @Input('height') height: number;

  private overlayRef: OverlayRef;

  constructor(private overlay: Overlay,
              private overlayPositionBuilder: OverlayPositionBuilder,
              private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions([this.positionStrategy]);

    this.overlayRef = this.overlay.create({ positionStrategy });
  }

  @HostListener('mouseenter')
  show() {
    const tooltipRef: ComponentRef<StudentPassesComponent>
      = this.overlayRef.attach(new ComponentPortal(StudentPassesComponent));
    tooltipRef.instance.profile = this.profile;
    tooltipRef.instance.isResize = false;
    tooltipRef.instance.height = this.height;
  }

  @HostListener('mouseout')
  hide() {
    this.overlayRef.detach();
  }
}
