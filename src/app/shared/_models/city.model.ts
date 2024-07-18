export interface City {
    id?: string;
    slug?: string;
    name?: string;
    image?: {
        fileName?: string;
        filePath?: string;
    };
    video?: {
        fileName?: string;
        filePath?: string;
    };
    description?: string;
    userId?: string;
    country?: string;
    geographicalCoordinates?: {
        longitude?: number;
        latitude?: number;
    };
    date?: string;
}