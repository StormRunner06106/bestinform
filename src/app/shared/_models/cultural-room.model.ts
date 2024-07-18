export type CulturalRoom = {
    id?: string;
    name?: string;
    resourceId?: string;
    userId?: string;
    date?: string;
    zones?: Zone[];
};

export type Zone = {
    rows?: number;
    columns?: number;
    price?: number;
    rowsForBooking?: Row[];
};

export type Row = {
    rowLabel?: string;
    seats?: Seat[];
};

export type Seat = {
    seatColumnLabel?: number;
    // selected este doar pt frontend, atunci cand clientul isi alege locul inainte de a face rezervarea
    seatStatus?: 'available' | 'booked' | 'empty' | 'bookedWithReservation' | 'selected';
};