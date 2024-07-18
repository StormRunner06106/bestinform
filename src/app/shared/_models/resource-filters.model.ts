export interface ResourceFilters {
    title?: string;
    domain?: string;
    categoryId?: string;
    resourceTypeId?: string;
    country?: string;
    city?: string;
    eventDate?: string;
    geographicalCoordinates?: {
        longitude?: number;
        latitude?: number;
    };
    approved?: boolean;
    sharedExperience?: boolean;
    bestForMe?: boolean;
    availableResource?: boolean;
    relatedResources?: string[];
    relatedResource?: string;
    userId?: string;
    status?: string;
    attributes?: Array<{
        attributeName?: string;
        attributeValue?: string;
    }>;
    culturalBookingSearchFilterDTO?: {
        roomNumber?: string;
    };
    rentalBookingSearchFilterDTO?: {
        roomNumber?: number;
        adults?: number;
        children?: number;
        startTime?: string;
        endTime?: string;
    };
    carBookingSearchFilterDTO?: {
        time?: {
            start?: string;
            end?: string;
        }
    };
    bookingTimeSlotDate?: string;
    timePickerSearch?: {
        timePickerDate?: string;
        timePickerHour?: string;
        adults?: number;
        child?: number;
    }
}