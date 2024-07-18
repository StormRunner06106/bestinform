import {Template} from "../../features/resource-templates/_models/template.model";

export interface TemplateFilterModel {
    totalPages?: number;
    totalElements?: number;
    number?: number;
    sort?: {
        sorted?: boolean;
        unsorted?: boolean;
        empty?: boolean;
    };
    size?: number;
    content?: Template[];
    pageable?: {
        sort?: {
            sorted?: boolean;
            unsorted?: boolean;
            empty?: boolean
        };
        offset?: number;
        pageNumber?: number;
        pageSize?: number;
        unpaged?: boolean;
        paged?: boolean
    };
    first?: boolean;
    last?: boolean;
    numberOfElements?: number;
    empty?: boolean
}