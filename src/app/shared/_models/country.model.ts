export interface Country {
    id?: string;
    name?: string;
    description?: string;
    image?: {
        fileName: string;
        filePath: string
    };
    userId?: string;
    date?: string;
}