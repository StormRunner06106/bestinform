export interface Product {
    id?: string;
    resourceId?: string;
    name?: string;
    price?: number;
    date?: string;
    userId?: string;
    description?: string;
    images?: Array<{
        fileName?: string;
        filePath?: string;
    }>
}