export interface Editorial {
    id?: string;
    userId?: string;
    username?: string;
    title?: string;
    category?: string;
    subcategory?: string;
    shortDescription?: string;
    metaDescription?: string;
    metaTitle?: string;
    tags?: string[];
    content?: string;
    slug?: string;
    status?: string;
    authors?: string[];
    publishedDate?: string;
    date?: string;
    featuredImage?: {
        fileName: string;
        filePath: string;
    }
}