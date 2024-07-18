export interface ResourceTemplate {
    id?: string;
    name?: string;
    resourceTypeIds?: string[];
    attributes?: Array<{
        tabName?: string;
        tabAttributes?: Array<{
            categoryId?: string;
            categoryAttributes?: string[];
        }>
    }>
    slug?: string;
    menuItems?: boolean;
    geographicalCoordinates?: boolean;
    timetable?: boolean;
    serviceBookingTimeSlots?: boolean;
    additionalServices?: boolean;
    rentalBooking?: boolean;
    ticketBooking?: boolean;
    productsList?: boolean;
    culturalBooking?: boolean;
    carBooking?: boolean;
    relatedResources?: boolean;
    externalUrl?: boolean;
    applyToJob?: boolean;
    userId?: string;
    date?: string;
    bookingType?: string;
    voucher?: {
        qr?: boolean;
        title?: string;
        description?: string;
    };
    listingSetting?: {
        cardType?: string;
        attributes?: string[]
        reviews?: boolean;
        location?: boolean
    }
}