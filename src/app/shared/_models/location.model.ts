export interface Location {
    id?: string;
    countryId?: string;
    name?: string;
    description?: string;
    image?: {
        fileName?: string;
        filePath?: string
    };
    userId?: string;
    date?: string;
}