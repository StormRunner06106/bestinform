export interface PlaceData {
    cardText?: PlaceDataDescription;
    imageUrl?: string;
    type?: string;
    url?: string;
    disabled?: boolean;
}
export interface PlaceDataDescription {
    title?: string;
    action?: string
}