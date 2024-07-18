export interface Reservation {
    id?: string;
    name?: string;
    slug?: string;
    country?: string;
    city?: string;
    date?: string;
    userId?: string;
    resourceDomain?: string;
    status?: string;
    resourceId?: string;
    providerId?: string;
    totalPrice?: 0;
    recommended?: true;
    rentalBooking?: {
        start?: string;
        end?: string;
        adults?: number;
        children?: number;
        items?: Array<{
            itemId?: string;
            quantity?: number;
            changePolicies?: {
                nonRefundable?: boolean;
                freeCancellation?: {
                    freeCancellation?: boolean;
                    deadlineDays?: number;
                },
                modifiable?: boolean;
            }
        }>,
        loyaltyPoints?: boolean;
        specialRequest?: string;
    };
    serviceBookingTimeSlots?: Array<{
        name: string;
        price: 0;
        time: {
            start: string;
            end: string;
        }
    }>,
    serviceBookingTimePicker?: Array<{
        people: 0;
        time: {
            start: string;
            end: string;
        }

    }>,
    transportService?: {
        transportNumber: string;
        transportDuration: 0;
        departureDate: string;
        arrivalDate: string;
        price: 0;
        from: string;
        to: string;
        companyName: string;
        tickets?: Array<
        {
            ticketType: string;
            seatNumber: string;
            ticketNumber: string;
            passengerName: string;
            passengerGender: string;
            ticketClass: string;
            luggage: Array<
            {
                luggageType: string;
                quantity: 0
            }
            >
        }
        >;
    },
    culturalBooking?: Array<
        {
        roomNameId: string;
        tickets?: Array<
            {
            ticketNumber: string;
            seatNumber: string;
            ticketUsed: true;
            price: 0;
            date: string;
            weekend: true;
            }
        >;
        }
    >,
    carRent?: Array<{
        time: {
        start: string;
        end: string;
        };
        cars:
        {
            carId: string;
            quantity: 0;
            price: 0
        },
    }>,
    ticketBooking?: {
        tickets: Array<
        {
            itemId: string;
            quantity: 0
        }
        >;
        date: string,
        loyaltyPoints: boolean;
        specialRequest?: string,
    },
    productsList?:
        {
        products?:Array<string>;
        loyaltyPoints?: true;
        specialRequest?: string;
            attachment?: object;
        }
    ,
    additionalServices?: Array<
        {
        title: string;
        description: string;
        price: 0;
        oneTimeFee: true;
        multiplyByGuests: true;
        multiplyByDays: true;
        multiplyByGuestsAndDays: true;
        bookable: true;
        quantity: 0
        }
    >;
    reservationTimePicker?: {
            adults: 0;
            children: 0;
            time: string;
            specialRequest?: string;
            changePolicies?: {
                nonRefundable?: boolean;
                freeCancellation?: {
                    freeCancellation?: boolean;
                    deadlineDays?: number;
                },
                modifiable?: boolean;
            };
        seatPreferences?: string;
        };
    reservationTimeSlot?: Array<
        {
            bookingTimeSlotId: string;
            date: string;
            hour: string;
            itemsNumber: 0;
            specialRequest?: string,
        }>;
    invoice?: string;
    conversationId?: string;
    tripId?: string;
    itineraryId?: string;
    reservationNumber?: string;
    reservedClientName?:string;
    userName?: string;
    checkIn?: string;
    checkOut?: string;
    bookingType?: string;
    reservationLink?:string;
    currency?:string;
    validityStatus?:string;
    payed?:boolean;
    paymentStatus?:string;
    bill?:{
        series?: string,
        number?: string
    };
    valueLoyaltyPoints?: number;
    paidAmount?: number;
    markedAsRead?: boolean;
}
