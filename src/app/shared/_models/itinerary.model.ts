export interface Itinerary {
    id?: string;
    name?: string;
    description?: string;
    bill?: {
        number?: string;
        series?: string;
    };
    images?: Array<{
        fileName?: string;
        filePath?: string;
    }>;
    featuredImage?: {
        fileName?: string;
        filePath?: string;
    };
    journeyThemeId?: string;
    typeOfDestinationId?: string;
    typeOfJourneyId?: string;
    transportResourceTypes?: string[];
    accommodationResourceTypes?: string[];
    eatAndDrinksResourceTypes?: string[];
    dayActivityResourceTypes?: string[];
    eveningActivityResourceTypes?: string[];
    startDate?: string;
    endDate?: string;
    currency?: string;
    resources?: ItineraryResource[];
    startLocation?: string;
    endLocation?: string;
    slug?: string;
    status?: string;
    recommendation?: string;
    transportPrice?: number;
    eatAndDrinkPrice?: number;
    accommodationPrice?: number;
    dayActivityPrice?: number;
    eveningActivityPrice?: number;
    transportPaidAmount?: number;
    eatAndDrinkPaidAmount?: number;
    accommodationPaidAmount?: number;
    dayActivityPaidAmount?: number;
    eveningActivityPaidAmount?: number;
}

export type ItineraryResource = {
    location?: string;
    country?: string;
    city?: string;
    geographicalCoordinates?: {
        longitude?: number;
        latitude?: number;
    };
    startDate?: string;
    endDate?: string;
    transportResources?: TransportResources;
    accommodationResource?: AccommodationResource;
    eatAndDrinksResource?: EatAndDrinksResource;
    dayActivityResource?: ActivityResource<string>;
    eveningActivityResource?: ActivityResource<string>;
    accommodationResourceRecommended?: AccommodationResourceRecommended;
    eatAndDrinkResourcesRecommended?: EatAndDrinkResourceRecommended;
    dayActivityResourcesRecommended?: ActivityResourcesRecommended;
    eveningActivityResourcesRecommended?: ActivityResourcesRecommended;
};

export type TransportResources = Array<{
    resourceTypeId?: string;
    resources?: string[];
}>;

export type AccommodationResource = Array<{
    resourceTypeId?: string;
    resourceTypeName?: string;
    resources?: string[];
}>;

export type BookingPolicies = {
    requiresCardVerification?: boolean;
    depositRequiredPercentage?: number;
    depositRequiredAmount?: number;
    advancePartialPaymentPercentage?: number;
    advanceFullPayment?: boolean;
};

export type AccommodationItem = {
    itemId?: string;
    itemName?: string;
    pricePerItem?: number;
    quantity?: number;
    bedType?: Array<{
        type?: string;
        quantity?: number;
    }>;
    changePolicies?: {
        nonRefundable?: boolean;
        freeCancellation?: {
            freeCancellation?: boolean;
            deadlineDays?: number
        };
        modifiable?: boolean;
    };
    bookingPolicies?: BookingPolicies;
};

export type AccommodationResourceRecommended = {
    startDate?: string;
    endDate?: string;
    resourceId?: string;
    resourceName?: string;
    resourceTypeName?: string;
    items?: AccommodationItem[];
};

export type EatAndDrinksResource = Array<{
    day?: string;
    dayMoments?: Array<{
        dayMoment?: "Breakfast" | "Lunch" | "Dinner";
        resources?: string[];
    }>;
}>;

export type EatAndDrinkResourceRecommended = Array<{
    resourceId?: string;
    resourceName?: string;
    resourceTypeName?: string;
    depositAmount?: number;
    bookingPolicies?: BookingPolicies;
    dates?: Array<{
        date?: string;
        hour?: string;
    }>;
}>;

export type ActivityResourceGroup<T> = {
    resourceTypeId?: string;
    resourceTypeName?: string;
    resources?: T[];
};

export type ActivityResource<T> = Array<{
    date?: string;
    resources?: ActivityResourceGroup<T>[];
}>;

export type ActivityResourcesTicket = {
    itemId?: string;
    itemName?: string;
    price?: number;
    quantity?: number;
    seatNumber?: string;
    changePolicies?: {
        nonRefundable?: boolean;
        freeCancellation?: {
            freeCancellation?: boolean;
            deadlineDays?: number;
        };
        modifiable?: boolean;
    };
    bookingPolicies?: BookingPolicies;
};

export type ActivityResourcesRecommendedGroup = {
    resourceId?: string;
    resourceName?: string;
    resourceTypeName?: string;
    items?: Array<{
        date?: string;
        items?: ActivityResourcesTicket[];
    }>;
};

export type ActivityResourcesRecommended = ActivityResourcesRecommendedGroup[];
