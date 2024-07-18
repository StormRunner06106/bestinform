export interface Category {
    id?: string;
    nameRo?: string;
    nameEn?: string;
    enableForList?: string;
    description?: string;
    domainId?: string;
    icon?: {
        fileName?: string;
        filePath?: string;
    },
    image?: {
        fileName?: string;
        filePath?: string;
    },
    order?: number;
    resourceTypes?: string[];

    // used only for static categories inside domain-listing
    nextRoute?: string;
    enable?: boolean;
    hasFitnessForum?: boolean;
    hasNutritionForum?: boolean;
}
