export interface Domain {
    id?: string;
    icon?: {
        fileName?: string;
        filePath?: string;
    },
    image?: {
        fileName?: string;
        filePath?: string;
    },
    video?:{
        fileName?: string;
        filePath?: string;
    },
    nameRo?: string;
    nameEn?: string;
    slug?: string;
    key?: string;
}