export interface ResourceType {
    id?: string;
    nameRo?: string;
    nameEn?: string;
    description?: string;
    categoryId?: string;
    date?: string;
    icon?: {
        fileName: string;
        filePath: string;
    };
    image?: {
        fileName: string;
        filePath: string;
    };
    userId?: string;
    order?: number;
    filterOption?: {
        location?: boolean;
        adultNumber?: boolean;
        adultChildrenNumber?: boolean;
        adultChildrenAndRoomNumber?: boolean;
        dateAsDay?: boolean;
        dateInterval?: boolean;
        dateAsHour?: boolean;
        hoursInterval?: boolean;
    };
    filterAttributes?: string[];
    transportOption?: 'plane-tickets' | 'train-tickets' | 'car-rentals';
    routeOption?: string;
    notificationHours?: number;
}
