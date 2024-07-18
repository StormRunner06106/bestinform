import {Component, HostListener, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

enum LangOptions {
    RO,
    EN
}


@Component({
    selector: 'app-landing-partner',
    templateUrl: './landing-partner.component.html',
    styleUrls: ['./landing-partner.component.scss']
})
export class LandingPartnerComponent implements OnInit {

    pageLang: LangOptions;

    heroSection = {
        notificationSection: {
            locationsIcons: [
                {
                    iconPath: 'assets/images/others/partner-landing/social-proof1.png'
                },
                {
                    iconPath: 'assets/images/others/partner-landing/social-proof2.png'
                },
                {
                    iconPath: 'assets/images/others/partner-landing/social-proof3.png'
                }
            ],
            locationsNr: [
                'și alte 34,078 locații s-au înscris în Bestinform',
                'and 34,078 other locations have signed up to Bestinform'
            ],
            title: [
                'Transformă Locația Ta în Destinația Nr.1 pentru Clienții Perfecți!',
                'Turn Your Location into the No.1 Destination for Perfect Customers!'
            ],
            paragraph: [
                'Conectăm locația ta la milioane de călători cu ajutorul AI. Transformăm turismul cu fiecare rezervare realizată.',
                'We connect your location to millions of travelers using AI. We transform tourism with every booking made.'
            ],
            bigImg: {
                imgPath: 'assets/images/others/partner-landing/hero-new.jpg'
            },
            heartImg: {
                imgPath: 'assets/images/others/partner-landing/heart.png'
            },
            starImg: {
                imgPath: 'assets/images/others/partner-landing/Star.png'
            },
            confettiImg: {
                imgPath: 'assets/images/others/partner-landing/confetti.png'
            },
            confettiTxtTop: [
                'Marian S. a rezervat o camera',
                'Marian S. booked a room'
            ],
            confettiTxtBottom: [
                'Alina C. a rezervat o masa de 6 persoane',
                'Alina C. reserved a table for 6 people'
            ]
        },
        imagesSection: {
            title: [
                'Umple-ți Calendarul de Rezervări cu Clienți Ideali:',
                'Fill your Booking Calendar with Ideal Clients:'
            ],
            paragraph: [
                'Imaginează-ți zilele în care te trezești dimineața, verifici calendarul și vezi că e plin de rezervări de la clienții pe care ți-i dorești cu adevărat, clienții care apreciază și valorizează ceea ce oferi. Aceasta nu este doar o viziune îndepărtată - este realitatea pe care ți-o oferă aplicatia noastră.',
                'Imagine the days when you wake up in the morning, check your calendar and see that it\'s full of bookings from the clients you really want, the clients who appreciate and value what you offer. This is not just a distant vision - it is the reality that our app gives you.'
            ],
            imageLeft: {
                imgPath: 'assets/images/others/partner-landing/hero-left.png'
            },
            imageCenter: {
                imgPath: 'assets/images/others/partner-landing/hero-center.png'
            },
            imageRight: {
                imgPath: 'assets/images/others/partner-landing/hero-right.png'
            },
            vectorLeft: {
                imgPath: 'assets/images/others/partner-landing/Vector 1.png'
            },
            vectorRight: {
                imgPath: 'assets/images/others/partner-landing/Vector 2.png'
            }
        }
    }

    menu = {
        home: ['Acasă', 'Home'],
        char: ['Caracteristici', 'Characteristics'],
        offer: ['Ce oferim', 'What we offer'],
        benefits: ['Beneficii', 'Benefits'],
        join: ['Devino partener', 'Become a partner'],
        start: ['Începe acum', 'Start now']
    };

    featuresSection = {
        titleSection: {
            title: [
                'Ce oferim',
                'Features'
            ],
            paragraph: [
                'Descoperă avantajele unice ale aplicației Bestinform.',
                'Discover the unique advantages of the Bestinform application.'
            ]
        },

        tiles: [
            {
                icon: 'assets/images/others/partner-landing/Approval.svg',
                title: [
                    'Listare Gratuită',
                    'Free Listing'
                ],
                paragraph: [
                    'Cu Bestinform, adăugarea și listarea locației tale este GRATUITĂ. Extinde-ți vizibilitatea și ajungi la milioane de călători dornici să descopere experiența ta unică.',
                    'With Bestinform, adding and listing your location is FREE. Expand your visibility and reach millions of travelers eager to discover your unique experience.'
                ]
            },
            {
                icon: 'assets/images/others/partner-landing/Pair.svg',
                title: [
                    'Potrivire inteligentă',
                    'Smart Matching'
                ],
                paragraph: [
                    'Bestinform nu doar că găsește clienți, ci face potrivirea perfectă. Datorită inteligenței artificiale avansate, te conectăm cu exact clienții ideali pe care îi cauți.',
                    'Bestinform doesn\'t just find customers, it makes the perfect match. Thanks to advanced artificial intelligence, we connect you with exactly the ideal customers you are looking for.'
                ]
            },
            {
                icon: 'assets/images/others/partner-landing/Online Booking.svg',
                title: [
                    'Rezervări Online Ușoare',
                    'Easy Online Bookings'
                ],
                paragraph: [
                    'Cu opțiunea noastră de rezervări online, clienții pot face rezervări fără efort, iar tu vei primi notificări în timp real. Simplu, rapid și eficient!',
                    'With our online booking option, customers can book effortlessly and you will receive real-time notifications. Simple, fast and effective!'
                ]
            },
            {
                icon: 'assets/images/others/partner-landing/User Friendly.svg',
                title: [
                    'Ușor de utilizat',
                    'User Friendly'
                ],
                paragraph: [
                    'Nicio complicație. Nicio bătaie de cap. Cu sistemul nostru intuitiv, gestionarea profilului și a  rezervărilor venite din Bestinform este extraordinar de simplă.',
                    'No complications. No hassle. With our intuitive system, managing your profile and bookings from Bestinform is incredibly simple.'
                ]
            },
            {
                icon: 'assets/images/others/partner-landing/Real Time.svg',
                title: [
                    'Actualizări în Timp Real',
                    'Real Time Updates'
                ],
                paragraph: [
                    'Rămâi la curent cu tot ce se întâmplă. Modificări? Anulări? Vezi totul imediat, fără întârzieri.',
                    'Stay up to date with everything that\'s happening. Changes? Cancellations? See everything immediately, without delays.'
                ]
            },
            {
                icon: 'assets/images/others/partner-landing/Statistics.svg',
                title: [
                    'Statistici Ultra Valoroase',
                    'Ultra Valuable Stats'
                ],
                paragraph: [
                    'Înțelege mai bine preferințele clienților și optimizează-ți serviciile. Accesează date și statistici relevante pentru a lua decizii înțelepte și a crește afacerea ta.',
                    'Better understand customer preferences and optimize your services. Access relevant data and statistics to make smart decisions and grow your business.'
                ]
            }]
    };

    benefitsSection = {
        titleSection: {
            title: [
                'Beneficii',
                'Benefits'
            ],
            paragraph: [
                'Iată de ce Bestinform este cea mai bună opțiune pentru promovarea proprietății tale.',
                'This is why Bestinform is the best option for promoting your property.']
        },
        benefits: [
            {
                title: [
                    'Vizibilitate maximă',
                    'Maximum visibility'
                ],
                iconPath: 'assets/images/others/partner-landing/clients.png',
                imgPath: 'assets/images/others/partner-landing/benefits-img-1.png',
                description: [
                    'Într-o lume digitală unde vizibilitatea determină succesul, vă oferim cheia către o poartă de aur. Prin accesul la o bază extinsă de utilizatori în continuă creștere, locația dvs. nu va fi doar observată - va fi căutată, apreciată și vizitată. Lasă clienții noi să vină la tine ca albinele la miere.',
                    'In a digital world where visibility determines success, we give you the key to a golden gate. With access to an extensive and ever-growing user base, your location will not only be noticed - it will be searched for, liked and visited. Let new customers come to you like bees to honey.'
                ],
                isActive: false
            }, {
                title: [
                    'Clienți ideali, puține anulări',
                    'Ideal customers, few cancellations'
                ],
                iconPath: 'assets/images/others/partner-landing/Happy Client.png',
                imgPath: ' assets/images/others/partner-landing/benefits-img-2.png',
                description: [
                    'Cu o rată impresionantă de doar 10% anulări, tehnologia noastră unică bestinform redefinește standardul în materie de rezervări online. Prin profilarea virtuală eficientă a clienților, asigurăm nu doar o potrivire optimă între serviciul oferit și necesitățile clienților, dar și o încredere sporită în deciziile lor. Alege să te alături comunității noastre și să beneficiezi de un flflux de clienți constant și fidel.',
                    'With an impressive cancellation rate of just 10%, our unique bestinform technology redefines the standard in online booking. Through effective virtual customer profiling, we ensure not only an optimal match between the service offered and customer needs, but also increased confidence in their decisions. Choose to join our community and benefit from a constant and loyal flow of customers.'
                ],
                isActive: false
            }, {
                title: [
                    'Feedback Valoros',
                    'Valuable Feedback'
                ],
                iconPath: 'assets/images/others/partner-landing/feedback.png',
                imgPath: 'assets/images/others/partner-landing/benefits-img-3.png',
                description: [
                    'Feedback-ul nu este doar un cuvânt la modă. Este esența îmbunătățirii continue. Prin intermediul aplicației noastre, veți avea acces instant la părerile clienților. Înțelegând ce doresc ei cu adevărat, veți fi mereu cu un pas înainte, adaptându-vă și crescând într-un mod care îi va surprinde și impresiona.',
                    'Feedback is not just a buzzword. It is the essence of continuous improvement. Through our app, you will have instant access to customer reviews. By understanding what they really want, you\'ll always be one step ahead, adapting and growing in a way that will surprise and impress them.'
                ],
                isActive: false
            }, {
                title: [
                    'Expunere Maximă',
                    'Maximum Exposure'
                ],
                iconPath: ' assets/images/others/partner-landing/World.png',
                imgPath: ' assets/images/others/partner-landing/benefits-img-4.png',
                description: [
                    'Imaginează-ți locația ta strălucind în aplicație ca o stea pe cerul nopții. Cu avantajele noastre promoționale exclusive, nu veți fi doar un alt punct pe hartă, ci destinația principală. Oferim spotul luminii asupra dvs., asigurându-ne că strălucește la potențialul maxim.',
                    'Imagine your location shining in the app like a star in the night sky. With our exclusive promotional benefits, you will not be just another dot on the map, but the main destination. We shine the spotlight on you, making sure it shines to its fullest potential.'
                ],
                isActive: false
            }],
        clientSection: {
            title: [
                'Ce spun clientii nostri',
                'What our customers say'
            ],
            clients: [
                {
                    iconPath: 'assets/images/others/partner-landing/client-1.png',
                    name: ' Adrian M.',
                    job: 'Proprietar Hotel',
                    review: [
                        '"Conform previziunilor noastre, Bestinform, ne va aduce o crestere de 150% a rezervarilor in doar 3 luni! Aceasta nu este doar o aplicație, este o revoluție a modului în care oamenii călătoresc."',
                        '"According to our forecasts, Bestinform will bring us a 150% increase in bookings in just 3 months! This is not just an app, it is revolutionizing the way people travel."'
                    ]
                },
                {
                    iconPath: 'assets/images/others/partner-landing/client-2.png',
                    name: 'Elena V.',
                    job: 'Manager Restaurant',
                    review: [
                        'Am fost sceptică la început, dar feedback-ul în timp real și recomandările bazate pe AI sunt de neegalat. Bestinform m-a convins!',
                        'I was skeptical at first, but the real-time feedback and AI-based recommendations are second to none. Bestinform convinced me!'
                    ]
                },
                {
                    iconPath: 'assets/images/others/partner-landing/client-3.png',
                    name: 'Marius V.',
                    job: 'Proprietar Hotel',
                    review: [
                        '"Nu m-aș mai întoarce vreodată la a nu folosi Bestinform!"',
                        'I would never go back to not using Bestinform!'
                    ]
                }
            ]
        }
    };

    faqSection = {
        title: [
            'FAQ',
            'FAQ'
        ],
        sections: [
            {
                question: [
                    'Cât de greu este să integrez locația mea cu Bestinform?',
                    'How hard is it to integrate my location with Bestinform?'
                ],
                answer: [
                    'Integrarea cu Bestinform se face cât ai spune “pește”. Tot ce îți trebuie este un cont și un telefon mobil în proprietate cu care să scanezi codurile QR.',
                    'The integration with Bestinform is made in no time. All you need is an account and a mobile phone you own to scan QR codes with.'
                ]
            },
            {
                question: [
                    'Ce costuri sunt implicate?',
                    'What costs are involved?'
                ],
                answer: [
                    'Pentru parteneri nu există niciun cost de setup. Singurele costuri sunt extraordinar de mici și sunt percepute în diferite moduri în funcție de tipul proprietății tale. <br> <br> Ia legătura cu echipa Bestinform pentru detalii.',
                    'There is no setup cost for partners. The only costs are extraordinarily low and are charged in different ways depending on the type of your property. <br> <br> Get in touch with the Bestinform team for details.'
                ]
            },
            {
                question: [
                    'Cum protejați datele mele și ale clienților?',
                    'How do you protect my and customer data?'
                ],
                answer: [
                    'Datele tale și ale clienților sunt tratate cu maximă importanță de Bestinform și nu sunt distribuite. ',
                    'Your and customer data are treated with utmost importance by Bestinform and are not shared.'
                ]
            },
            {
                question: [
                    'În cât timp pot vedea rezultate?',
                    'How soon can I see results?'
                ],
                answer: [
                    'Bestinform îți va prezenta proprietatea clienților ideali din prima secundă în care aceasta este listată, iar rezervările vor apărea încă din prima zi de utilizare Bestinform.',
                    'Bestinform will present your property to ideal clients from the first second it is listed, and bookings will appear from the first day of using Bestinform.'
                ]
            },
            {
                question: [
                    'Care sunt cerințele tehnice?',
                    'What are the technical requirements?'
                ],
                answer: [
                    'Singura cerință pentru procesarea rezervărilor venite din Bestinform este deținerea unui device mobil care poate scana codurile QR ale clienților.',
                    'The only requirement for processing reservations from Bestinform is to have a mobile device that can scan customers\' QR codes.'
                ]
            },
            {
                question: [
                    'Cum mă asigur că proprietatea mea este vizibilă?',
                    'How do I make sure my property is visible?'
                ],
                answer: [
                    'Proprietățile partenere sunt vizibile permanent pentru utilizatorii care au profilul virtual compatibil cu proprietatea. <br> <br> Din momentul înscrierii, vizibilitatea proprietății este garantată.',
                    'Partner properties are permanently visible to users who have the virtual profile compatible with the property. <br> <br> From the moment of registration, the visibility of the property is guaranteed.']
            },
            {
                question: [
                    'Ce fel de suport oferiți?',
                    'What kind of support do you offer?'
                ],
                answer: [
                    'Echipa noastră de suport tehnic este aici pentru tine zilnic, 7 zile pe săptămână, 12 ore pe zi, fie că preferi să ne suni sau să discuți direct prin live chat.',
                    'Our technical support team is here for you every day, 7 days a week, 12 hours a day, whether you prefer to call us or chat directly via live chat.']
            }
        ]
    };

    footer = {
        text: ['Orice mare poveste are un început. A ta începe cu Bestinform!',
            'Every great story has a beginning. Yours starts with Bestinform!']
    }

    parallaxRatioNotifications = 0.3;
    parallaxRatioImages = 0.3;

    activeImageIndex = 0;
    activeBenefit: {
        imgPath: string;
        description: string;
    } = null;

    lastScroll = 500;
    isSticky = true;

    constructor(private router: Router,
                private route: ActivatedRoute) {
    }

    @HostListener('window:scroll', ['$event']) onScroll() {
        // console.log('scroll', window.scrollY)
        if (window.scrollY < 0) {
            this.isSticky = true;
            this.lastScroll = window.scrollY;
        } else if (window.scrollY < this.lastScroll) {
            this.isSticky = true;
            this.lastScroll = window.scrollY;
            // console.log('scroll in sus', this.lastScroll, window.scrollY)

        } else if (window.scrollY > this.lastScroll && window.scrollY > 0) {
            this.isSticky = false;
            this.lastScroll = window.scrollY;
            // console.log('scroll in jos', this.lastScroll, window.scrollY)
        }
    }

    ngOnInit() {
        const currentRoute = this.route.snapshot.url.join('/');
        if (currentRoute.includes('ro')) {
            this.pageLang = LangOptions.RO;
        } else if (currentRoute.includes('en')) {
            this.pageLang = LangOptions.EN;
        } else {
            void this.router.navigate(['/parteneri/ro']);
        }

        this.startBenefitsLoading();
        this.intersection();

    }

    intersection() {

        let observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.changeBenefitActive(0);
                }
            })
        });
        observer.observe(document.getElementById('benefit-slides'))
    }

    changeBenefitActive(index: number) {
        for (let i = 0; i < this.benefitsSection.benefits?.length; i++) {
            if (i === index) {
                this.activeImageIndex = index;
                this.benefitsSection.benefits[i].isActive = true;
                this.activeBenefit = {
                    imgPath: this.benefitsSection.benefits[i].imgPath,
                    description: this.benefitsSection.benefits[i].description[this.pageLang]
                };

            } else {
                this.benefitsSection.benefits[i].isActive = false;
            }
        }
    }

    startBenefitsLoading() {
        this.activeImageIndex = 0;

        this.benefitsSection.benefits[this.activeImageIndex].isActive = true;

        this.activeBenefit = {
            imgPath: this.benefitsSection.benefits[this.activeImageIndex].imgPath,
            description: this.benefitsSection.benefits[this.activeImageIndex].description[this.pageLang]
        };

        setInterval(() => {
            this.benefitsSection.benefits[this.activeImageIndex].isActive = false;
            if (this.activeImageIndex === this.benefitsSection.benefits.length - 1) {
                this.activeImageIndex = 0;
            } else {
                this.activeImageIndex++;
            }
            this.activeBenefit = {
                imgPath: this.benefitsSection.benefits[this.activeImageIndex].imgPath,
                description: this.benefitsSection.benefits[this.activeImageIndex].description[this.pageLang]
            };

            this.benefitsSection.benefits[this.activeImageIndex].isActive = true;
        }, 15000);
    }

    changeRoute() {
        void this.router.navigate(['/parteneri/' + (this.pageLang == LangOptions.RO ? 'ro' : 'en')]);
    }

    get LangOptions() {
        return LangOptions;
    }

    scroll(el: HTMLElement) {
        el.scrollIntoView();
    }
}
