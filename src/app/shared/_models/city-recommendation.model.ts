export interface CityRecommendation {
    country?: string;
    city?: string;
    geographicalCoordinates?: {
        longitude?: number;
        latitude?: number;
    }
}