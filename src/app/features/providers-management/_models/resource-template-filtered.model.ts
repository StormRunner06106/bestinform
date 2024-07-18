export interface ResourceTemplateFilteredModel {
    name?: string,
    domain?: string,
    categoryId?: string,
    resourceTypeId?: string,
    geographicalCoordinates?: boolean,
    timetable?: boolean,
    serviceBookingTimeSlots?: boolean,
    additionalServices?: boolean,
    rentalBooking?: boolean,
    serviceBookingTimePicker?: boolean,
    ticketBooking?: boolean,
    productsList?: boolean,
    culturalBooking?: boolean,
    carBooking?: boolean,
    relatedResources?: boolean
}
