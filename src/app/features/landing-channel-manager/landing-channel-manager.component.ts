import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-landing-channel-manager',
  templateUrl: './landing-channel-manager.component.html',
  styleUrls: ['./landing-channel-manager.component.scss']
})
export class LandingChannelManagerComponent implements OnInit {

  pageLang: string;

  channelManager = {
    title: '',
    subtitle: '',
    contentOne: '',
    contentTwo: ''
  };
  channelManagerRo = {
    title: 'Optimizarea Parteneriatului Prin Channel Manager',
    subtitle: 'Administrare Simplă a Rezervărilor și Interacțiuni Eficiente',
    contentOne: 'Platforma Bestinform conține un sistem integrat, cu o interfață user-friendly, denumit „Channel Manager”. Prin intermediul acestuia, partenerul poate gestiona fluxul complet de rezervări și administra datele despre oferte și disponibilitatea acestora.',
    contentTwo: 'Totodată, prin Channel Manager, partenerul primește notificări despre interacțiunile utilizatorilor cu proprietatea listată, consultă Registrul de rezervări, comunică, prin mesageria platformei, cu utilizatorii, cotactează suportul tehnic, verifică balanța actualizată în timp real, generează și exportă rapoarte despre evoluția parteneriatului.'
  };
  channelManagerEn = {
    title: 'Partnership Optimization Through Channel Manager',
    subtitle: 'Simple Reservation Management and Efficient Interactions',
    contentOne: 'The Bestinform platform contains an integrated system with a user friendly interface called "Channel Manager. Through it, the partner can manage the complete booking flow and manage data about offers and availability.',
    contentTwo: 'At the same time, through Channel Manager, the partner receives notifications about user interactions\n with the listed property, consults the Booking Register, communicates with users via the platform messaging, quotes technical support, checks the real time updated balance, generates and exports reports about the partnership progress.'
  };

  bookings = {
    title: '',
    subtitle: '',
    content: ''
  }
    bookingsRo = {
        title: 'Garantăm Rezervări Fiabile',
        subtitle: 'Protecție pentru Parteneri prin Sistemul Bestinform',
        content: 'Bestinform asigură partenerul de integritatea rezervărilor și elimină potențialele rezervări frauduloase ce pot încurca disponibilitatea și activitatea proprietații.'
    }
    bookingsEn = {
        title: 'We guarantee Reliable Bookings',
        subtitle: 'Protection for Partners through the Bestinform System',
        content: 'Bestinform assures the partner of the integrity of the reservations and eliminates potential fraudulent reservations that can confuse the availability and activity of the property.'
    }

  users = {
    title: '',
    subtitle: '',
    content: ''
  }
  usersRo = {
    title: 'Înțelegerea Utilizatorilor Prin Evaluări Precise',
    subtitle: 'Sistemul de Rating Bestinform pentru Oferirea unor Experiențe Personalizate',
    content: 'Bestinform contribuie la identificarea corectă a tipului de consumator din rândul utilizatorilor. În Registrul de rezervări, este disponibil un rating (Standard/Premium/VIP) pentru fiecare utilizator care efectuează o rezervare. De asemenea, și partenerul are posibilitatea de a acorda un calificativ utilizatorilor cu rezervări confirmate.'
  }
  usersEn = {
    title: 'Understanding Users Through Accurate Ratings',
    subtitle: 'The Bestinform Rating System for Providing Personalized Experiences',
    content: 'Bestinform helps to correctly identify the type of consumer among your users. A rating (Standard/Premium/VIP) is available in the Booking Register for each user making a booking. The partner also has the possibility to give a rating to users with confirmed bookings.'
  }

  perfectPartnership = {
    title: '',
    subtitle: '',
    items: [
      {
        title: '',
        content: ''
      }
    ]
  }
  perfectPartnershipRo = {
    title: 'Parteneriatul Perfect',
    subtitle: 'Transformând Potențialul în Realitate Prin Platforma Bestinform',
    items: [
      {
        title: 'Promovare',
        content: 'Promovăm proprietatea dumneavoastră prin algoritmi de inteligență artificială, obținând un procent ridicat de potrivire a profilului și serviciilor dumneavoastră cu profilurile de consumator ale utilizatorilor platformei. (Pe scurt, aducem, în locația dumneavoastră, clienții potriviți.)'
      },
      {
        title: 'Suport tehnic',
        content: 'Suport tehnic dedicat pentru înregistrarea corectă în platformă, colectarea datelor relevante și a conținutului multimedia, tutorial video și manual pentru utilizarea sistemului Channel Manager, asistență tehnică 24/7 cu agent dedicat.'
      },
      {
        title: 'APIs',
        content: 'Dacă partenerul utilizează un sistem propriu de gestiune a rezervărilor, acesta poate fi conectat, prin API, la sistemul Channel Manager.'
      }
    ]
  }
  perfectPartnershipEn = {
    title: 'The Perfect Partnership',
    subtitle: 'Transforming Potential into Reality Through the Bestinform Platform',
    items: [
      {
        title: 'Promotion',
        content: 'We promote your property through artificial intelligence algorithms, achieving a high match rate of your profile and services with the consumer profiles of the platform users. (In short, we bring the right customers to your location).'
      },
      {
        title: 'Technical support',
        content: 'Dedicated technical support for correct registration in the platform, collection of relevant data and multimedia content, video tutorial and manual for using the Channel Manager system, 24/7 technical support with dedicated agent.'
      },
      {
        title: 'APIs',
        content: 'If the partner uses its own booking management system, it can be connected via API to the Channel Manager system.'
      }
    ]
  }

  businessImpact = {
    title: '',
    items: [
      {
        icon: '',
        title: '',
        content: ''
      }
    ]
  }
  businessImpactRo = {
    title:'Maximizează Impactul Afacerii Tale',
    items: [
      {
        icon: 'assets/images/others/landing-partners/optim-display-2x.png',
        title: 'Afișare optimă',
        content: 'Afișăm, într-un format optim și eficient, toate datele despre proprietate, facilități, meniu, servicii și produse reprezentative. Conținutul multimedia permite încărcarea de fișiere video'
      },
      {
        icon: 'assets/images/others/landing-partners/payment-2x.png',
        title: 'Plată în avans',
        content: 'Pentru garantarea rezervării, în Channel Manager este disponibilă și posibilitatea de facilitare a rezervărilor cu plata în avans, în funcție de opțiunile predefinite ale partenerului.'
      },
      {
        icon: 'assets/images/others/landing-partners/scan-2x.png',
        title: 'Generare',
        content: 'Toate rezervările efectuate pe bază de disponibilitate online sunt generate și transmise printr-un formular electronic (E-Voucher), care conține un cod QR și date despre utilizator și solicitările acestuia.'
      },
      {
        icon: 'assets/images/others/landing-partners/policy-2x.png',
        title: 'Propriile politici',
        content: 'Partenerul are libertatea de a-și stabili propriile politici de modificare sau anulare a rezervărilor.'
      }
    ]
  }
  businessImpactEn = {
    title:'Maximize Your Business Impact',
    items: [
      {
        icon: 'assets/images/others/landing-partners/optim-display-2x.png',
        title: 'Optimal display',
        content: 'We display, in an optimal and efficient format, all data about the property, facilities, menu, services and representative products. Multimedia content allows uploading of video files.'
      },
      {
        icon: 'assets/images/others/landing-partners/payment-2x.png',
        title: 'Prepaid bookings',
        content: 'To guarantee your booking, the Channel Manager also offers the possibility to facilitate prepaid bookings, depending on the partner s predefined options.'
      },
      {
        icon: 'assets/images/others/landing-partners/scan-2x.png',
        title: 'Generated codes',
        content: 'All bookings made on the basis of online availability are generated and transmitted via an electronic form (E Voucher), which contains a QR code and data about the user and his/her requests.'
      },
      {
        icon: 'assets/images/others/landing-partners/policy-2x.png',
        title: 'Own policies',
        content: 'The Partner is free to set its own policies for changing or cancelling reservations.'
      }
    ]
  }


  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    console.log('on init');

    const currentRoute = this.route.snapshot.url.join('/');

    if (currentRoute.includes('ro')) {
      this.pageLang = 'ro';
      this.channelManager = this.channelManagerRo;
      this.bookings = this.bookingsRo;
      this.users = this.usersRo;
      this.perfectPartnership = this.perfectPartnershipRo;
      this.businessImpact = this.businessImpactRo;
    } else if (currentRoute.includes('en')) {
      this.pageLang = 'en';
      this.channelManager = this.channelManagerEn;
      this.bookings = this.bookingsEn;
      this.users = this.usersEn;
      this.perfectPartnership = this.perfectPartnershipEn;
      this.businessImpact = this.businessImpactEn;
    } else {
      this.router.navigate(['/provideroffer/en']);
    }

  }

  changeRoute(pageLang: string) {
    console.log('route changed', pageLang);
    this.router.navigate(['/provideroffer/' + pageLang]);
  }

}
