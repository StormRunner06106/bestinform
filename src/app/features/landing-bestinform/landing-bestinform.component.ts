import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, NgModel, Validators} from "@angular/forms";
import {OwlOptions} from "ngx-owl-carousel-o";
import {LandingService} from "./landing-service.service";
import {ToastService} from "../../shared/_services/toast.service";
import {ReCaptchaV3Service} from "ng-recaptcha";

@Component({
  selector: 'app-landing-bestinform',
  templateUrl: './landing-bestinform.component.html',
  styleUrls: ['./landing-bestinform.component.scss']
})
export class LandingBestinformComponent implements OnInit{

  constructor(private router: Router,
              private route: ActivatedRoute,
              private fb: FormBuilder,
              private landingService: LandingService,
              private toastService: ToastService) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern('^\\+?\\d{11}$')]],
      gdpr: [false, Validators.required]
    });
    this.token = undefined;

  }

  pageLang: string;

  contactForm: FormGroup;

  isFormLoading=false;

  hero = {
    title: '',
    subtitle: '',
    content: ''
  };
  heroEn = {
    title: 'increase YOUR BUSINESS revenue!',
    subtitle: 'DISCOVER THE ADVANTAGES OF BESTINFORM',
    content: 'Fill out the form and we will contact you to provide you with support for registering in the application'
  }
  heroRo = {
    title: 'crește-ȚI cifra de AFACERi acum!',
    subtitle: 'DESCOPERĂ AVANTAJELE BESTINFORM',
    content: 'Completează formularul și noi te contactăm ca să îți oferim sprijin pentru înscrierea în aplicație'
  }

  form = {
    title: '',
    subtitle: '',
    gdprInfo: '',
    gdprBtn: '',
    button: '',
    name: '',
    email: '',
    phone: ''
  };
  formEn = {
    title: 'Start',
    subtitle: 'Be among the first to discover new opportunities',
    gdprInfo: 'I have read and agree to the processing of this data, according to the ',
    gdprBtn: 'Privacy Policy',
    button: 'Send',
    name: 'Name and surname',
    email: 'Email address',
    phone: 'Phone Number'
  }
  formRo = {
    title: 'Start',
    subtitle: 'Fii printre primii care descoperă noi oportunități',
    gdprInfo: 'Am citit și sunt de acord cu prelucrarea acestor date, conform ',
    gdprBtn: 'Politicii de confidențialitate',
    button: 'Trimiteți',
    name: 'Nume și prenume',
    email: 'Adresă de email',
    phone: 'Număr de telefon'
  }

  whoWeAre = {
    title: '',
    subtitle: '',
    content: '',
    carouselItems: [
      {
        icon: '',
        text: ''
      }
    ]
  }
  whoWeAreEn = {
    title: 'Who we are?',
    subtitle: 'All-in-one platform powered by artificial intelligence that will revolutionize your business',
    content: 'Making it the go-to platform for planning and booking their next adventure, either if that is a holiday, bussiness travel or spending day by day their time in the city they live in.',
    carouselItems: [
      {
        icon: 'assets/images/others/landing/res-types-1.png',
        text: 'Attractions, cinemas, special experiences, events, sports'
      },
      {
        icon: 'assets/images/others/landing/res-types-2.png',
        text: 'Flights, transportation'
      },
      {
        icon: 'assets/images/others/landing/res-types-3.png',
        text: 'Hotels, restaurants, Caterings'
      }
    ]
  }
  whoWeAreRo = {
    title: 'Cine suntem?',
    subtitle: 'Platformă all-in-one alimentată de inteligență artificială care îți va revoluționa business-ul',
    content: 'Destinația favorită a clienților tăi pentru planificarea/rezervarea activităților zilnice și a călătoriilor.',
    carouselItems: [
      {
        icon: 'assets/images/others/landing/res-types-1.png',
        text: 'Atracții, cinematografe, experiențe speciale, evenimente, sport'
      },
      {
        icon: 'assets/images/others/landing/res-types-2.png',
        text: 'Zboruri, transport'
      },
      {
        icon: 'assets/images/others/landing/res-types-3.png',
        text: 'Hoteluri, restaurante, catering'
      }
    ]
  }

  benefits = {
    title: '',
    items: [
      {
        title: '',
        content: ''
      }
    ]
  }
  benefitsEn = {
    title: 'Your benefits after registering in the Bestinform App',
    items: [
      {
        title: 'Channel Manager',
        content: 'The Bestinform platform contains an integrated system with a user-friendly interface called "Channel Manager". Through it, the partner can manage the complete booking flow and manage data about offers and availability. At the same time, through Channel Manager, the partner receives notifications about user interactions with the listed property, consults the Booking Register, communicates with users via the platform messaging, quotes technical support, checks the real-time updated balance, generates and exports reports about the partnership progress.'
      },
      {
        title: 'Reliable Bookings',
        content: 'Bestinform assures the partner of the integrity of the reservations and eliminates potential fraudulent reservations that can confuse the availability and activity of the property.'
      },
      {
        title: 'Identify Consumers',
        content: 'Bestinform helps to correctly identify the type of consumer among your users. A rating (Standard/Premium/VIP) is available in the Booking Register for each user making a booking. The partner also has the possibility to give a rating to users with confirmed bookings.'
      },
      {
        title: 'Promotion',
        content: 'We promote your property through artificial intelligence algorithms, achieving a high match rate of your profile and services with the consumer profiles of the platform users. (In short, we bring the right customers to your location).'
      },
      {
        title: 'Technical Support',
        content: 'Dedicated technical support for correct registration in the platform, collection of relevant data and multimedia content, video tutorial and manual for using the Channel Manager system, 24/7 technical support with dedicated agent.'
      },
      {
        title: 'Optimal Display',
        content: 'We display, in an optimal and efficient format, all data about the property, facilities, menu, services and representative products. Multimedia content allows uploading of video files.'
      },
      {
        title: 'Prepaid bookings',
        content: 'To guarantee your booking, the Channel Manager also offers the possibility to facilitate prepaid bookings, depending on the partner\'s predefined options.'
      },
      {
        title: 'Generated codes',
        content: 'All bookings made on the basis of online availability are generated and transmitted via an electronic form (E-Voucher), which contains a QR code and data about the user and his/her requests.'
      },
      {
        title: 'APIs',
        content: 'If the partner uses its own booking management system, it can be connected via API to the Channel Manager system.'
      },
      {
        title: 'Own policies',
        content: 'The Partner is free to set its own policies for changing or cancelling reservations'
      }
    ]
  }
  benefitsRo = {
    title: 'Beneficiile tale după înscrierea în Bestinform App',
    items: [
      {
        title: 'Channel Manager',
        content: 'Platforma Bestinform conține un sistem integrat, cu o interfață user-friendly, denumit „Channel Manager”. Prin intermediul acestuia, partenerul poate gestiona  fluxul complet de rezervări și administra datele despre oferte și disponibilitatea acestora. Totodată, prin Channel Manager, partenerul primește notificări despre interacțiunile utilizatorilor cu proprietatea listată, consultă Registrul de rezervări, comunică, prin mesageria platformei, cu utilizatorii, cotactează suportul tehnic, verifică balanța actualizată în timp real, generează și exportă rapoarte despre evoluția parteneriatului.'
      },
      {
        title: 'Integritatea rezervărilor',
        content: 'Bestinform asigură partenerul de integritatea rezervărilor și elimină potențialele rezervări frauduloase ce pot încurca disponibilitatea și activitatea proprietații.'
      },
      {
        title: 'Identificare consumator',
        content: 'Bestinform contribuie la identificarea corectă a tipului de consumator din rândul utilizatorilor. În Registrul de rezervări, este disponibil un rating (Standard/Premium/VIP) pentru fiecare utilizator care efectuează o rezervare. De asemenea, și partenerul are posibilitatea de a acorda un calificativ utilizatorilor cu rezervări confirmate.'
      },
      {
        title: 'Promovare',
        content: 'Promovăm proprietatea dumneavoastră prin algoritmi de inteligență artificială, obținând un procent ridicat de potrivire a profilului și serviciilor dumneavoastră cu profilurile de consumator ale utilizatorilor platformei. (Pe scurt, aducem, în locația dumneavoastră, clienții potriviți.)'
      },
      {
        title: 'Suport tehnic',
        content: 'Suport tehnic dedicat pentru înregistrarea corectă în platformă, colectarea datelor relevante și a conținutului multimedia, tutorial video și manual pentru utilizarea sistemului Channel Manager, asistență tehnică 24/7 cu agent dedicat.'
      },
      {
        title: 'Afișare optimă',
        content: 'Afișăm, într-un format optim și eficient, toate datele despre proprietate, facilități, meniu, servicii și produse reprezentative. Conținutul multimedia permite încărcarea de fișiere video'
      },
      {
        title: 'Plată în avans',
        content: 'Pentru garantarea rezervării, în Channel Manager este disponibilă și posibilitatea de facilitare a rezervărilor cu plata în avans, în funcție de opțiunile predefinite ale partenerului.'
      },
      {
        title: 'Generare',
        content: 'Toate rezervările efectuate pe bază de disponibilitate online sunt generate și transmise printr-un formular electronic (E-Voucher), care conține un cod QR și date despre utilizator și solicitările acestuia.'
      },
      {
        title: 'API',
        content: 'Dacă partenerul utilizează un sistem propriu de gestiune a rezervărilor, acesta poate fi conectat, prin API, la sistemul Channel Manager.'
      },
      {
        title: 'Propriile politici',
        content: 'Partenerul are libertatea de a-și stabili propriile politici de modificare sau anulare a rezervărilor.'
      }
    ]
  }

  cta = {
    title: '',
    subtitle: ''
  }
  ctaEn = {
    title: 'Choose innovation with Bestinform!',
    subtitle: "Fill out the form and we'll call you to discuss how you can take advantage of our platform to grow your business."
  }
  ctaRo = {
    title: 'Alege inovația cu Bestinform!',
    subtitle: 'Completează formularul și te sunăm pentru o discuție despre cum poți beneficia de avantajele platformei noastre în creșterea afacerii tale.'
  }

  aboutUs = {
    title: '',
    subtitle: '',
    subSubtitle: '',
    items: [
      {
        title: '',
        content: '',
      }
    ]
  }
  aboutUsEn = {
    title: 'Do you want to know even more about us?',
    subtitle: 'All-in-One Platform for Travel and Leisure',
    subSubtitle: 'Personalized experience, complete travel planning, virtual concierge, and single platform convenience all in one.',
    items: [
      {
        title: 'Personalized Experience',
        content: 'Bestinform builds consumer profiles for each user, learning from their preferences and choices to generate optimized recommendations tailored to their needs.'
      },
      {
        title: 'Virtual Concierge',
        content: 'Users have access to a 24/7 virtual concierge through our natural language chatbot, providing personalized suggestions and assistance throughout their journey.'
      },
      {
        title: 'Complete Travel Planning',
        content: 'Our platform generates complete travel itineraries, correlating destinations and services offered by our partner network, ensuring a seamless and hassle-free experience.'
      },
      {
        title: 'Single Platform Convenience',
        content: 'Bestinform brings together easy discovery, booking, and planning in one convenient platform, eliminating the need for users to juggle multiple websites and applications.'
      }
    ]
  }
  aboutUsRo = {
    title: 'Vrei să știi și mai multe despre noi?',
    subtitle: 'Platforma All-in-One pentru călătorii și timp liber',
    subSubtitle: 'Experiență personalizată, planificare completă a călătoriilor, concierge virtual și comoditatea unei platforme unice, toate într-un singur loc.',
    items: [
      {
        title: 'Experiență personalizată',
        content: 'Bestinform construiește profiluri de consumator pentru fiecare utilizator, învățând din preferințele și alegerile acestora pentru a genera recomandări optimizate, adaptate la nevoile lor.'
      },
      {
        title: 'Concierge virtual',
        content: 'Utilizatorii au acces la un concierge virtual 24 de ore din 24, 7 zile din 7, prin intermediul chatbot-ului nostru în limbaj natural, care le oferă sugestii și asistență personalizată pe tot parcursul călătoriei lor.'
      },
      {
        title: 'Planificare completă a călătoriilor',
        content: 'Platforma noastră generează itinerarii de călătorie complete, corelând destinațiile și serviciile oferite de rețeaua noastră de parteneri, asigurând o experiență perfectă și fără probleme.'
      },
      {
        title: 'Conveniență pe o singură platformă',
        content: 'Bestinform reunește descoperirea, rezervarea și planificarea cu ușurință într-o singură platformă convenabilă, eliminând necesitatea ca utilizatorii să jongleze cu mai multe site-uri web și aplicații.'
      }
    ]
  }

  services = {
    title: '',
    subtitle: '',
    items: [
      {
        photo: '',
        title: '',
        content: ''
      }
    ]
  }
  servicesEn = {
    title: 'Catering to diverse user groups',
    subtitle: 'AI-powered travel platform for diverse user groups.',
    items: [
      {
        photo: 'assets/images/others/landing/time-pressed-travellers.png',
        title: 'Time-pressed travelers',
        content: 'Our platform provides comprehensive solutions to harmonize work and leisure time effortlessly, saving users valuable time and effort.'
      },
      {
        photo: 'assets/images/others/landing/tech-savy-travellers.png',
        title: 'Technology savvy travelers',
        content: 'Bestinform caters to tech-savvy travelers, utilizing AI-powered personalized recommendations to help them adapt quickly to new environments.'
      },
      {
        photo: 'assets/images/others/landing/family-coord.png',
        title: 'Family coordinators',
        content: 'Bestinform offers family-centric suggestions that prioritize safety and educational value, making travel planning and coordination stress-free for families.'
      },
      {
        photo: 'assets/images/others/landing/exp-seekers.png',
        title: 'Experience seekers',
        content: 'Bestinform provides unique and personalized suggestions for neighborhood exploration, romantic escapes, and social gatherings, catering to the desires of experience-seeking individuals.'
      }
    ]
  }
  servicesRo = {
    title: 'Servicii pentru diverse grupuri de utilizatori',
    subtitle: 'Platformă de agrement și călătorii alimentată de AI pentru diferite grupuri de utilizatori.',
    items: [
      {
        photo: 'assets/images/others/landing/time-pressed-travellers.png',
        title: 'Călători presați de timp',
        content: 'Platforma noastră oferă soluții cuprinzătoare pentru a armoniza fără efort timpul de lucru și timpul liber, economisind timp și efort prețios pentru utilizatori.'
      },
      {
        photo: 'assets/images/others/landing/tech-savy-travellers.png',
        title: 'Pasionații de tehnologie',
        content: 'Bestinform se adresează utilizatorilor competenți în utilizarea de tehnologii noi, utilizând recomandări personalizate bazate pe inteligența artificială pentru a-i ajuta să se adapteze rapid la medii noi.'
      },
      {
        photo: 'assets/images/others/landing/family-coord.png',
        title: 'Coordonatori de familie',
        content: 'Bestinform oferă sugestii centrate pe familie, care prioritizează siguranța și valoarea educațională, transformând planificarea și coordonarea călătoriilor în acțiuni lipsite de stres.'
      },
      {
        photo: 'assets/images/others/landing/exp-seekers.png',
        title: 'Căutători de experiențe',
        content: 'Bestinform oferă sugestii unice și personalizate pentru explorarea cartierelor, evadări romantice și întâlniri sociale, răspunzând dorințelor persoanelor în căutare de experiențe noi.'
      }
    ]
  }

  features = {
    smallTitle: '',
    title: '',
    content: '',
    image: '',
    items: [
      {
        icon: '',
        title: '',
        content: ''
      }
    ]
  }
  featuresEn = {
    smallTitle: 'Your All-in-One travel and leisure solution',
    title: 'Revolutionizing travel and leisure',
    content: 'Bestinform offers a revolutionary solution for travelers, providing comprehensive and up-to-date information along with personalized suggestions and seamless booking capabilities.',
    image: 'assets/images/others/landing/app-photo.png',
    items: [
      {
        icon: 'assets/images/others/landing/user.png',
        title: 'Enhanced user engagement',
        content: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.'
      },
      {
        icon: 'assets/images/others/landing/niche.png',
        title: 'Unique niche',
        content: 'With exclusive partnerships with European providers, Bestinform is positioned to differentiate itself and capture a unique position in the market. '
      },
      {
        icon: 'assets/images/others/landing/innovation.png',
        title: 'Innovative product',
        content: 'An one-stop solution for up-to-date information, effortless booking and tailored recommendations'
      }
    ]
  }
  featuresRo = {
    smallTitle: 'Soluția dvs. All-in-One pentru călătorii și timp liber',
    title: 'Revoluționând călătoriile și petrecerea timpului liber',
    image: 'assets/images/others/landing/app-photo.png',
    content: 'Produs inovator: Bestinform oferă o soluție revoluționară pentru călători, oferind informații complete și actualizate, împreună cu sugestii personalizate și posibilități de rezervare direct din aplicație.',
    items: [
      {
        icon: 'assets/images/others/landing/user.png',
        title: 'Implicare intensivă a utilizatorilor',
        content: 'Concierge-ul nostru virtual cu inteligență artificială maximizează implicarea utilizatorilor prin oferirea unor funcționalități solide, concepute pentru a optimiza experiența de călătorie și de petrecere a timpului liber.'
      },
      {
        icon: 'assets/images/others/landing/niche.png',
        title: 'Nișă unică',
        content: 'Având inclusiv parteneriate exclusive cu furnizori europeni ca parte a strategiei, Bestinform este poziționat pentru a se diferenția și a capta o poziție unică pe piață.'
      },
      {
        icon: 'assets/images/others/landing/innovation.png',
        title: 'Produs inovator',
        content: 'O soluție unică pentru informații actualizate, rezervări fără efort și recomandări personalizate.'
      }
    ]
  }

  experience = {
    title: '',
    mainContent: '',
    secondContent: '',
    items: [
      {
        title: '',
        content: ''
      }
    ]
  }
  experienceEn = {
    title: 'Enriching the Bestinform experience',
    mainContent: 'Bestinform goes beyond providing a comprehensive travel and leisure platform. We understand that our users seek not only practical information but also inspiration and valuable insights. That\'s why we have included an Editorial Section in our app, dedicated to delivering engaging articles and content related to various domains covered, including tourism, emergent destinations, culture, entertainment, food industry, travel and leisure innovations, and more.',
    secondContent: 'By incorporating an Editorial Section into Bestinform, we aim to create a holistic and enriching travel and leisure experience. We believe that valuable content adds depth to our platform, allowing users to immerse themselves in the world of travel and culture while planning their next adventure. Through our curated articles, news updates, insider tips, expert perspectives, and inspirational content, the Bestinform Editorial Section provides a valuable resource for users to discover, learn, and stay connected with the ever-evolving travel and leisure landscape.',
    items: [
      {
        title: 'Curated articles',
        content: 'Our editorial team carefully curates articles that cover a wide range of topics, ensuring that users stay informed about the latest trends, events, and destinations in the travel and leisure industry. '
      },
      {
        title: 'News and updates',
        content: 'Stay up-to-date with the latest news and updates from the world of travel, culture, and entertainment. From emerging destinations to new attractions, we bring you the most relevant information to enrich your travel experiences.'
      },
      {
        title: 'Insider tips and guides',
        content: 'Our editorial section provides insider tips and guides to help users discover hidden gems, local secrets, and off-the-beaten-path experiences. We aim to empower travelers to explore and immerse themselves in their destinations fully.'
      },
      {
        title: 'Expert perspectives',
        content: 'We collaborate with industry experts and influencers to provide expert perspectives and insights. Through interviews, opinion pieces, and feature articles, we offer unique and valuable perspectives on various aspects of travel, culture, and leisure.'
      },
      {
        title: 'Inspiration for adventure',
        content: 'Whether it\'s planning a weekend getaway, seeking cultural experiences, or embarking on an adrenaline-filled adventure, our editorial section offers inspiration and ideas to fuel your wanderlust and ignite your passion for exploration.'
      }
    ]
  }
  experienceRo = {
    title: 'Îmbogățirea experienței Bestinform',
    mainContent: 'Bestinform nu se limitează la a oferi o platformă completă de călătorie și agrement. Înțelegem că utilizatorii noștri caută nu doar informații practice, ci și inspirație și perspective valoroase. De aceea, am inclus în aplicația noastră o Secțiune editorială, dedicată furnizării de articole și conținut atractiv legat de diverse domenii acoperite, inclusiv turism, destinații emergente, cultură, divertisment, industria alimentară, inovații în domeniul călătoriilor și al petrecerii timpului liber și multe altele.',
    secondContent: 'Prin încorporarea unei secțiuni editoriale în Bestinform, ne propunem să creăm o experiență holistică legată de călătorie și agrement. Credem că un conținut valoros adaugă profunzime platformei noastre, permițând utilizatorilor să se cufunde în lumea călătoriilor și culturii agrementului în timp ce își planifică următoarea aventură. Prin articolele noastre, știrile actualizate, sfaturi, perspectivele experților și conținutul inspirațional, Secțiunea editorială Bestinform oferă o resursă valoroasă pentru ca utilizatorii să descopere, să învețe și să rămână conectați cu peisajul în continuă evoluție al călătoriilor și al timpului liber.',
    items: [
      {
        title: 'Articole selectate',
        content: 'Echipa noastră editorială alege cu atenție articole care acoperă o gamă largă de subiecte, asigurându-se că utilizatorii rămân informați cu privire la cele mai recente tendințe, evenimente și destinații din industria călătoriilor și a timpului liber.'
      },
      {
        title: 'Știri și actualizări',
        content: 'Rămâneți la curent cu cele mai recente știri și actualizări din lumea călătoriilor, a culturii și a divertismentului. De la destinații emergente la noi atracții, vă oferim cele mai relevante informații pentru a vă îmbogăți experiențele de călătorie.'
      },
      {
        title: 'Sfaturi',
        content: 'Secțiunea noastră editorială oferă sfaturi pentru a-i ajuta pe utilizatori să descopere locuri ascunse, mici experiențe secrete locale și experiențe în afara traseelor clasice. Ne propunem să le dăm călătorilor posibilitatea de a explora și de a se cufunda pe deplin într-o aventură, nu o simplă călătorie.'
      },
      {
        title: 'Perspective ale experților',
        content: 'Colaborăm cu experți din industrie și influenceri pentru a oferi perspective și perspective de specialitate. Prin interviuri, articole de opinie și articole de fond, oferim perspective valoroase asupra diferitelor aspecte ale călătoriilor, culturii și timpului liber.'
      },
      {
        title: 'Inspirație pentru aventură',
        content: 'Fie că planificați o escapadă de weekend, căutați experiențe culturale sau vă îmbarcați într-o aventură plină de adrenalină, secțiunea noastră editorială vă oferă inspirație și idei pentru a vă alimenta pofta de călătorii și a vă aprinde pasiunea pentru explorare.'
      }
    ]
  }

  dataBlocks = {
    icon: '',
    titleOne: '',
    contentOne: '',
    titleTwo: '',
    points: [
      {
        title: '',
        content: ''
      }
    ],
    titleThree: '',
    image: '',
    contentTwo: ''
  }
  dataBlocksEn = {
    icon: 'assets/images/others/landing/percent.png',
    titleOne: 'Growth of the travel industry post-pandemic',
    contentOne: 'According to some estimates, the industry\'s growth post-pandemic has ranged from 50% to 70% of pre-pandemic levels, depending on the region and specific sector.',
    titleTwo: 'Language and image recognition capabilities of AI systems have improved rapidly',
    points: [
      {
        title: 'Technological advancements',
        content: 'Bestinform leverages the latest advancements in artificial intelligence and data analytics to continuously improve user experience and offer personalized recommendations.'
      },
      {
        title: 'Market gap',
        content: 'Currently, there is no competitor offering a comprehensive solution that meets all the needs of our target audience in a single platform.'
      }
    ],
    titleThree: 'Growing Market and technological advancements',
    image: 'assets/images/others/landing/graph.png',
    contentTwo: 'The capability of each AI system is normalized to an initialperformance of -100'
  }
  dataBlocksRo = {
    icon: 'assets/images/others/landing/percent.png',
    titleOne: 'Creșterea industriei de călătorii după pandemie',
    contentOne: 'Potrivit unor estimări, creșterea industriei după pandemie a variat între 50% și 70% din nivelurile pre-pandemie, în funcție de regiune și sectorul specific.',
    titleTwo: 'Capacitățile de recunoaștere a limbajului și imaginilor ale sistemelor AI s-au îmbunătățit rapid.',
    points: [
      {
        title: 'Progrese tehnologice',
        content: 'Bestinform valorifică cele mai recente progrese în domeniul inteligenței artificiale și al analizei datelor pentru a îmbunătăți continuu experiența utilizatorilor și pentru a oferi recomandări personalizate.'
      },
      {
        title: 'Decalaj pe piață',
        content: 'În prezent, nu există niciun concurent care să ofere o soluție cuprinzătoare care să satisfacă toate nevoile publicului nostru țintă într-o singură platformă.'
      }
    ],
    titleThree: 'Piața în creștere și progrese tehnologice',
    image: 'assets/images/others/landing/graph.png',
    contentTwo: 'Capacitatea fiecărui sistem AI este normalizată la o performanță inițială de -100.'
  }

  ctaFooter = {
    title: ''
  }
  ctaFooterEn = {
    title: 'Join Bestinform App, the state-of-the-art all-in-one app designed to enrich your daily experiences.'
  }
  ctaFooterRo = {
    title: 'Alăturați-vă Bestinform App, aplicația all-in-one de ultimă generație, concepută pentru a îmbogăți experiențele zilnice.'
  }


  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    dotsEach: 4,
    nav: false,
    navSpeed: 700,
    navText: ['<', '>'],
    center: false,
    margin: 20,
    responsive: {
      0: {
        items: 1.5
      },
      500: {
        items: 1.5
      },
      576: {
        items: 1.5
      },
      768: {
        items: 3
      },
      992: {
        items: 3
      },
      1200: {
        items: 3
      }
    }
  }

  successMessage = "";
  successMessageEn = "The form has been submitted successfully!";
  successMessageRo = "Formularul a fost trimis cu succes!";

  errorMessage = "";
  errorMessageEn = "The form could NOT be submitted. Make sure you have filled in all the fields and try again.";
  errorMessageRo = "Formularul NU a putut fi trimis. Asigurați-vă că ați completat toate câmpurile și încercați din nou.";

  errorDuplicateMessage = "";
  errorDuplicateMessageEn = "The form could NOT be submitted. Your email or phone number already exists in our database.";
  errorDuplicateMessageRo = "Formularul NU a putut fi trimis. Email-ul sau numărul dvs. de telefon există deja în baza noastră de date.";

  ngOnInit() {

    console.log('on init');

    const currentRoute = this.route.snapshot.url.join('/');

    if (currentRoute.includes('ro')) {
      this.pageLang = 'ro';
      this.hero = this.heroRo;
      this.form = this.formRo;
      this.whoWeAre = this.whoWeAreRo;
      this.benefits = this.benefitsRo;
      this.cta = this.ctaRo;
      this.aboutUs = this.aboutUsRo;
      this.services = this.servicesRo;
      this.features = this.featuresRo;
      this.experience = this.experienceRo;
      this.dataBlocks = this.dataBlocksRo;
      this.successMessage = this.successMessageRo;
      this.errorMessage = this.errorMessageRo;
      this.ctaFooter = this.ctaFooterRo;
      this.errorDuplicateMessage = this.errorDuplicateMessageRo;
    } else if (currentRoute.includes('en')) {
      this.pageLang = 'en';
      this.hero = this.heroEn;
      this.form = this.formEn;
      this.whoWeAre = this.whoWeAreEn;
      this.benefits = this.benefitsEn;
      this.cta = this.ctaEn;
      this.aboutUs = this.aboutUsEn;
      this.services = this.servicesEn;
      this.features = this.featuresEn;
      this.experience = this.experienceEn;
      this.dataBlocks = this.dataBlocksEn;
      this.successMessage = this.successMessageEn;
      this.errorMessage = this.errorMessageEn;
      this.ctaFooter = this.ctaFooterEn;
      this.errorDuplicateMessage = this.errorDuplicateMessageEn;
    } else {
      this.router.navigate(['/newsletter/en']);
    }
  }

  changeRoute(pageLang: string) {
    console.log('route changed', pageLang);
    this.router.navigate(['/newsletter/' + pageLang]);
  }

  token: string|undefined;

  onSubmit() {
    this.isFormLoading = true;
    if (this.contactForm.valid) {
      console.debug(`Token [${this.token}] generated`);
      console.log('Form submitted:', this.contactForm.value);
      this.landingService.createLandingContact(this.contactForm.value).subscribe((resp: any) => {
        console.log('resp form', resp);
        this.toastService.showToast("Succes", this.successMessage, "success");
        this.contactForm.reset();
        this.isFormLoading = false;
        this.token = undefined;
          },
          error => {
            console.log(error.error.reason);
            if(error.error.reason === 'duplicate_parameter' || error.error.reason === 'telephoneExists' || error.error.reason === 'emailExists') {
              this.toastService.showToast("Eroare", this.errorDuplicateMessage, "error");
            } else {
              this.toastService.showToast("Eroare", this.errorMessage, "error");
            }
            this.isFormLoading = false;
            this.token = undefined;
          })
    } else {
      this.isFormLoading = false;
      this.token = undefined;
      console.log('Form is invalid.');
      this.toastService.showToast("Eroare", this.errorMessage, "error");
    }
  }

}
