export interface EventInstance {
    addressVisibility: any;
    dateEnd: any;
    dateStart: number;
    dateVisibility: any;
    description: any;
    event: {
        eventCategory: {id: number; name: string; description: string};
        id: number;
        instances: any;
        name: string;
        promoterName: string;
    };
    id: number;
    image: {
        id: number;
        url: string;
        width: any;
        height: any;
        alt: any;
    };
    images: any;
    manualSelection: any;
    saleDateEnd: number;
    saleDateStart: number;
    ticketsLeft: number;
    title: string;
    venue: {
        address: string;
        city: string;
        cityId: number;
        image: string;
        latitude: number;
        longitude: number;
        name: string;
    };
}
