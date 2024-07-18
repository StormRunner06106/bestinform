export type CategoryItems = {
    name?: string;
    price?: number;
    weight?:number;
    ingredients?:string;
    allergens?:string;
    nutritionalFacts?:string;
}

export type MenuItems = {
    categoryName?: string;
    subCategories?:  Array<{
        subCategoryName: string;
        subCategoryItems: Array<CategoryItems>
    }>
}

export interface MenuType {
    id?: string;
    resourceId?: string;
    userId?: string;
    items?: Array<{
        categoryName?: string;
        subCategories?: Array<{
            subCategoryName: string;
            subCategoryItems: Array<{
                name?: string;
                price?: number;
                weight?:number;
                ingredients?:string;
                allergens?:string;
                nutritionalFacts?:string;
            }>
        }>
    }>;

    date?: string;
}