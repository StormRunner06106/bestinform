export class RestaurantWithLocation {
    address: string;
    city: string;
    cityId: number;
    country: string;
    location: any;
    geographicalCoordinates: GeographicalCoordinates;
}

export class GeographicalCoordinates {
    longitude: number;
    latitude: number;
}
