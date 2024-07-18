import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appScrolledTo]',
  exportAs: 'appScrolledTo',
})
export class ScrolledToDirective {
  reached = false;
  passed = false;

  constructor(public el: ElementRef) { }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const elementPosition = this.el.nativeElement.offsetTop;
    const elementHeight = this.el.nativeElement.clientHeight;
    const scrollPosition = window.pageYOffset;

    // set `true` when scrolling has reached current element
    this.reached = scrollPosition >= elementPosition;

    // set `true` when scrolling has passed current element height
    this.passed = scrollPosition >= (elementPosition + elementHeight);
  }
}