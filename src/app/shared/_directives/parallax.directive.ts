import {AfterViewInit, Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
    selector: '[appParallax]',
    standalone: true
})
export class ParallaxDirective implements AfterViewInit {

    @Input() parallaxRatio = 1
    initialTop: number;

    static windowHeight = window.innerHeight;

    private ngAfterViewInitCompleted = false;
    private isTestDivScrolledIntoView = true;

    constructor(private eleRef: ElementRef) {

    }

    ngAfterViewInit(): void {
        // this.initialTop = this.eleRef.nativeElement.getBoundingClientRect().top;
        this.initialTop = this.eleRef.nativeElement.getBoundingClientRect().top - this.eleRef.nativeElement.parentElement.getBoundingClientRect().top;
        this.ngAfterViewInitCompleted = true;

        console.log(ParallaxDirective.windowHeight);
        /*console.log(this.eleRef.nativeElement.parentElement.getBoundingClientRect());
        console.log(this.eleRef.nativeElement.getBoundingClientRect());
        console.log(this.initialTop);*/
    }

    @HostListener("window:scroll")
    onWindowScroll() {
        // this.isScrolledIntoView();
        if (this.ngAfterViewInitCompleted && this.isTestDivScrolledIntoView) {
            // cand dam scroll, elementul se misca direct proportional cu valoarea parallaxRatio
            this.eleRef.nativeElement.style.top = (this.initialTop - (window.scrollY * this.parallaxRatio)) + 'px';
        }
    }

    isScrolledIntoView() {
        const rect = this.eleRef.nativeElement.getBoundingClientRect();
        const topShown = rect.top >= 0;
        const bottomShown = rect.bottom <= window.innerHeight;
        this.isTestDivScrolledIntoView = topShown && bottomShown;
    }

}
