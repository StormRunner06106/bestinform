export interface GenericPagination<T> {
    totalPages?: number;
    totalElements?: number;
    number?: number;
    sort?: {
        sorted?: boolean;
        unsorted?: boolean;
        empty?: boolean;
    };
    size?: number;
    content?: T[];
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