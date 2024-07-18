import {ResourceTemplate} from "./resource-template.model";

export interface TemplatePagination {
    totalPages?: number;
    totalElements?: number;
    number?: number;
    sort?: {
        sorted?: boolean;
        unsorted?: boolean;
        empty?: boolean
    };
    size?: number;
    content?: ResourceTemplate[];
    pageable?: {
        sort?: {
            sorted?: boolean;
            unsorted?: boolean;
            empty?: boolean
        };
        offset?: number;
        pageNumber?: number;
        pageSize?: number;
        paged?: boolean;
        unpaged?: boolean
    };
    first?: boolean;
    last?: boolean;
    numberOfElements?: number;
    empty?: boolean;
}