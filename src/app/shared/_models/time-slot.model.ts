export interface TimeSlot {
    id?: string;
    name?: string;
    description?: string;
    price?: number;
    categoryName?: string;
    categoryValue?: string;
    resourceId?: string;
    totalItemsNumber?: number;
    slots?: Array<{
        day?: string;
        slots?: Array<{
            startHour?: string;
            endHour?: string;
        }>
    }>;
    bookedItems?: Array<{
        bookedItemsNumber?: number;
        bookedTime?: string;
    }>;
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
    bookingPolicies?: {
        requiresCardVerification?: boolean;
        depositRequiredAmount?: number;
        depositRequiredPercentage?: number;
        advancePartialPaymentPercentage?: number;
        advanceFullPayment?: boolean;
    };
    userId?: string;
    date?: string;
}

export type AvailableTimeSlot = {
    startHour?: string;
    endHour?: string;
    availableItems?: number;
}
