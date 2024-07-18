export interface EventData {
    cardText?: EventDataDescription;
    imageUrl?: string;
    type?: string;
    access?: string;
    disabled?: boolean;
}
export interface EventDataDescription {
    title?: string;
    address?: string;
    date?: string;
    specifity?: string;
    price?: string;
}
export enum EventType  {
    Teatru = 'Teatru',
    Petrecere = 'Petrecere',
    Concert = 'Concert',
    Expozitie = 'Expozitie'
}
export enum EventColor {
    Teatru = '#FFCC04',
    Petrecere = '#4257EE',
    Concert = '#E01E5A',
    Expozitie = '#30D18D'
}

export enum EventAccess {
    Teatru = 'BILET',
    Petrecere = 'ACCES',
    Concert = 'BILET',
    Expozitie = 'ACCES'
}