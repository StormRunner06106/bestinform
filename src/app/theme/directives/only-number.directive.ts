import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: 'input[appOnlyNumber]'
})
export class OnlyNumberDirective {
  @HostListener('keypress', ['$event']) onInputChange(e) {

    if (e.target.value.length == 0 && e.which == 48 ){
      return false;
    }

    const verified = String.fromCharCode(e.which).match(/[^0-9]/g);
    if (verified) {
      e.preventDefault();
      return false;
    }

    // var regex = new RegExp("[^0-9]");
    // var key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    // if (regex.test(key)) {
    //     event.preventDefault();
    //     return false;
    // }

  }
}
