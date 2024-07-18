export interface Template{
    id: string,
    name?: string,
    slug?: string,
    generalInformation?: string[],
    about?: string[],
    contact?: string[],
    menuItems?: boolean,
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
    relatedResources?: boolean,
    benefits?: string[],
    bookingType?: string,
    voucher?:{
        qr: true,
        title: string,
        description: string
    },
    resourceTypeIds?: string[],
    userId: string,
    attributes?: [
        {
            tabName: string,
            attributes: string[]
        }
    ]
}
