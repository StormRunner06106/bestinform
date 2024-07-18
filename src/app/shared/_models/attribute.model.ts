export interface Attribute {
    id?: string;
    categoryName?: string;
    categoryZone?: string;
    date?: string;
    name?: string;
    alias?: string;
    categoryId?: string;
    description?: string;
    valueType?: string;
    order?: number;
    offset?: string;
    size?: string;
    valuePlaceholder?: string;
    visibleInList?: boolean;
    visibleInForm?: boolean;
    propertyRequired?: boolean;
    uniqueValue?: boolean;
    enrollment?: boolean;
    roadTrip?: boolean;
    icon?: {
        fileName?: string;
        filePath?: string;
    };
    resourceTypeIds?: string[]
    usedInFiltering?: boolean;
    featured?: boolean;
    valueOptions?: string[] | number[];
}