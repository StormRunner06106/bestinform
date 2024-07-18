export type TabAttribute = {
    attributeId?: string;
    attributeName?: string;
    attributeValue?: string;
    attributeIconPath?: string;
    attributeCategory?: string;
}

export type ResourceAttribute = {
    tabName?: string;
    tabAttributes?: TabAttribute[];
}

export interface Resource {
    _id?: any;
    location?: any;
    id?: string;
    title?: string;
    description?: string;
    domain?: string;
    categoryId?: string;
    resourceCategoryName?: string;
    resourceTypeId?: string;
    country?: string;
    city?: string;
    address?: string;
    currency?: string;
    status?: string;
    favorite?: boolean;
    reviewNumber?: number;
    reservationPolicy?: string;
    proReviewsPercentage?: number;
    estimatedPrice?: number;
    userId?: string;
    date?: string;
    rating?: number;
    latitude?: number;
    longitude?: number;
    name?: string;
    featuredImage?: {
        fileName: string;
        filePath: string;
    };
    files?: Array<{
        fileName: string;
        filePath: string;
    }>;
    images?: Array<{
        fileName: string;
        filePath: string;
    }>;
    sharedExperience?: boolean;
    availableResource?: boolean;
    geographicalCoordinates?: {
        latitude: number;
        longitude: number;
    };
    attributes?: ResourceAttribute[];
    timetable?: Array<{
        day: string;
        startTime: string;
        endTime: string;
        closed: boolean;
        timetable:{
            startHour: string;
            endHour: string;
        }[]
    }>;
    culturalBookingIds?: string[];
    bookingTimePickerId?: string;
    bookingTimeSlotIds?: string[];
    rentalBooking?: string[];
    ticketBooking?: string[];
    productsList?: string[];
    carBooking?: string[];
    culturalBooking?: Array<{
        slot: {
            start: string;
            end: string;
        };
        roomNumber: string;
        bookingTickets: Array<{
            name: string;
            regularPrice: number;
            weekendPrice: number;
            ticketsLimit: number;
            bookedTickets: Array<{
                ticketNumber: string;
                seatNumber: string;
                ticketUsed: boolean;
                price: number;
                weekend: boolean
            }>;
            ticketsForBooking: Array<{
                ticketNumber: string;
                seatNumber: string
            }>;
            changePolicies: {
                nonRefundable: boolean;
                changeableRoomType: boolean;
                freeCancellation: {
                    freeCancellation: boolean;
                    deadline: string;
                    extraTax: number;
                };
                changeableDate: boolean;
                changeableDateAndTime: boolean;
                peopleMaxNumber: number;
            };
            bookingPolicies: {
                requiresCardVerification: boolean;
                depositRequired: boolean;
                advancePartialPayment: boolean;
                advanceFullPayment: boolean
            }
        }>;
    }>;
    bookingType?: string;
    externalUrl?: string;
    additionalServices?: Array<{
        title: string;
        description: string;
        price: 0;
        oneTimeFee: boolean;
        multiplyByGuests: boolean;
        multiplyByDays: boolean;
        multiplyByGuestsAndDays: boolean;
        bookable: boolean;
        quantity: number;
    }>;
    benefits?: Array<{
        benefitName: string;
        benefitExists: boolean
    }>;
    relatedResources?: string[];
    slug?: string;
    authors?: Array<string>;
    tags?: Array<string>;
    startDate?: string;
    endDate?: string;
    bookingPolicies?: {
        requiresCardVerification?: boolean;
        depositRequiredPercentage?: number;
        depositRequiredAmount?: number;
        advancePartialPaymentPercentage?: number;
        advanceFullPayment?: boolean;
    }
}

