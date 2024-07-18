import {Component, Input, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";

@Component({
  selector: 'app-newsletter-benefits',
  templateUrl: './newsletter-benefits.component.html',
  styleUrls: ['./newsletter-benefits.component.scss']
})
export class NewsletterBenefitsComponent implements OnInit {


  @Input() pageLang: string;

  boxes = [];

  boxesEn = [
    {
      icon: 'assets/images/others/newsletter/1.png',
      title: 'Save costs',
      text: '0 commission for reservations without a deposit'
    },
    {
      icon: 'assets/images/others/newsletter/2.png',
      title: 'Restaurant support',
      text: '3% commission for reservations with a deposit'
    },
    {
      icon: 'assets/images/others/newsletter/3.png',
      title: 'Beneficial lodging options',
      text: '5% commission for bookings with partial/full payment'
    },
    {
      icon: 'assets/images/others/newsletter/4.png',
      title: 'Round-the-clock support',
      text: 'Technical support 12/24 7/7'
    },
    {
      icon: 'assets/images/others/newsletter/5.png',
      title: 'Direct connection with customers',
      text: 'Direct communication through messaging'
    },
    {
      icon: 'assets/images/others/newsletter/6.png',
      title: 'Valuable expertise and advice',
      text: 'Free consultation for published content'
    },
    {
      icon: 'assets/images/others/newsletter/7.png',
      title: 'Efficient promotion',
      text: 'Personalized display based on AI, geolocation, and rating'
    },
    {
      icon: 'assets/images/others/newsletter/8.png',
      title: 'Access to an extended audience',
      text: 'Local and international visibility of the property'
    }
  ]

  boxesRo = [
    {
      icon: 'assets/images/others/newsletter/1.png',
      title: 'Economii',
      text: '0 comision pentru rezervări fără plata unui avans'
    },
    {
      icon: 'assets/images/others/newsletter/2.png',
      title: 'Asistență restaurant',
      text: '3% comision pentru rezervări cu plata unui avans'
    },
    {
      icon: 'assets/images/others/newsletter/3.png',
      title: 'Opțiuni de cazare favorabile',
      text: '5% comision pentru rezervările cu plata parțială/integrală'
    },
    {
      icon: 'assets/images/others/newsletter/4.png',
      title: 'Asistență 24h/7',
      text: 'Asistență tehnică 12/24 7/7'
    },
    {
      icon: 'assets/images/others/newsletter/5.png',
      title: 'Legătură directă cu clienții',
      text: 'Comunicare directă prin mesaje'
    },
    {
      icon: 'assets/images/others/newsletter/6.png',
      title: 'Expertiză și consultanță valoroase',
      text: 'Consultație gratuită pentru conținutul publicat'
    },
    {
      icon: 'assets/images/others/newsletter/7.png',
      title: 'Promovare eficientă',
      text: 'Display personalizat bazat pe AI, localizare geografică și rating'
    },
    {
      icon: 'assets/images/others/newsletter/8.png',
      title: 'Accesul la un public vast',
      text: 'Vizibilitatea locală și internațională a proprietății'
    }
  ]

  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    dotsEach: 4,
    nav: true,
    navSpeed: 700,
    navText: ['<', '>'],
    center: true,
    margin: 15,
    responsive: {
      0: {
        items: 1
      },
      500: {
        items: 2
      },
      576: {
        items: 2
      },
      768: {
        items: 3
      },
      992: {
        items: 4
      },
      1200: {
        items: 5
      }
    }
  }

  ngOnInit() {
    if (this.pageLang === 'ro') {
      this.boxes = this.boxesRo
    } else {
      this.boxes = this.boxesEn
    }
  }

}
