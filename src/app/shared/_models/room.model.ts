export interface Room {
    id?: string;
    resourceId?: string;
    name?: string;
    description?: string;
    featuredImage?: {
        fileName?: string;
        filePath?: string;
    };
    roomSize?: number;
    bathrooms?: number;
    images?: Array<{
        fileName?: string;
        filePath?: string;
    }>;
    bedType?: Array<{
        type?: string;
        quantity?: number
    }>;
    itemsForBooking?: Array<{
        itemNumber?: string;
        bookedInterval?: Array<{
            start?: string;
            end?: string;
        }>
    }>;
    benefits?: Array<{
        attributeCategory?: string;
        attributeIconPath?: string;
        attributeId?: string;
        attributeName?: string;
        attributeValue?: string;
    }>;
    changePolicies?: {
        nonRefundable?: boolean;
        freeCancellation?: {
            freeCancellation?: boolean;
            deadlineDays?: number;
        };
        modifiable?: boolean;
    };
    totalPrice?: number;
    price?: {
        regularPrice: number;
        weekendPrice: number;
    };
    bookingPolicies?: {
        requiresCardVerification?: boolean;
        depositRequiredAmount?: number;
        depositRequiredPercentage?: number;
        advancePartialPaymentPercentage?: number;
        advanceFullPayment?: boolean
    };
    maximumAdultPeople?: number;
    maximumChildren?: number;
    minimumStay?: number;
    date?: string;
}
