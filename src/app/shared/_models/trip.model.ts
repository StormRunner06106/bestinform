export interface Trip {
    id?: string;
    countryId?: string;
    locationId?: string;
    name?: string;
    offerPackage?: string;
    startDate?: string;
    endDate?: string;
    numberOfNights?: number;
    transportType?: string;
    transporter?: string;
    departure?: {
        location?: string;
        start?: string;
        end?: string;
    };
    arrival?: {
        location?: string;
        start?: string;
        end?: string;
    };
    accommodationType?: string;
    hotelList?: Array<{
        hotelName?: string;
        starRating?: number;
        rooms?: TripRoom[]
    }>;
    images?: Array<{
        fileName?: string;
        filePath?: string;
    }>;
    description?: string;
    featuredImage?: {
        fileName?: string;
        filePath?: string;
    };
    currency?: string;
    bookingPolicies?: {
        requiresCardVerification?: boolean;
        depositRequired?: number;
        advancePartialPayment?: boolean;
        advanceFullPayment?: boolean;
    };
    changePolicies?: {
        nonRefundable?: boolean;
        changeableRoomType?: boolean;
        freeCancellation?: {
            freeCancellation?: boolean;
            deadlineDays?: number;
            extraTax?: number;
        };
        changeableDate?: boolean;
        changeableDateAndTime?: boolean;
        peopleMaxNumber?: number;
    };
    recommendation?: string;
    status?: string;
    estimatedPrice?: number;
    slug?: string
}

export interface TripRoom {
    name?: string;
    image?: {
        fileName?: string;
        filePath?: string
    };
    people?: number;
    bedType?: {
        type?: string;
        quantity?: number;
    };
    available?: number;
    price?: number;
}
