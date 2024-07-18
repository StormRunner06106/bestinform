import {Trip} from "./trip.model";

export interface TripsPagination {
    totalPages?: number;
    totalElements?: number;
    number?: number;
    sort?: {
        sorted?: boolean;
        unsorted?: boolean;
        empty?: boolean
    };
    size?: number;
    content?: Trip[];
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