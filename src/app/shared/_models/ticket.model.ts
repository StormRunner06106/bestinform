export interface Ticket {
    id?: string;
    resourceId?: string;
    name?: string;
    price?: number;
    ticketsLimit?: number;
    limit?: boolean;
    bookedTickets?: Array<{
        ticketNumber?: string;
        seatNumber?: string;
        ticketUsed?: boolean;
        price?: number;
        date?: number;
        weekend?: boolean;
    }>;
    ticketsForBooking?: Array<{
        ticketNumber?: string;
        seatNumber?: string;
        date?: string;
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
        depositRequired?: boolean;
        advancePartialPaymentPercentage?: number;
        advanceFullPayment?: boolean;
        depositRequiredAmount?: number;
        depositRequiredPercentage?: number;
    }
}
