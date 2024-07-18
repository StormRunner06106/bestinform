export interface RoomModel {
    name?: string,
    description?: string,
    roomSize?: number,
    bathrooms?: number,
    maximumAdultPeople?: number,
    maximumChildren?: number,
    minimumStay?: number,
    itemsForBooking?: [
        {
            itemNumber?: string,
            bedType?: [
                {
                    type?: string,
                    quantity?: number
                }
            ],
            bookedInterval?: [
                {
                    start?: string,
                    end?: string
                }
            ]
        }
    ],
    bedType?: [
        {
            "type": string,
            "quantity": number
        },
        {
            "type": string,
            "quantity": number
        }
    ],
    benefits?: [
        {
            "attributeId": string,
            "attributeValue": string
        }
    ],
    changePolicies?: {
        nonRefundable?: boolean,
        changeableRoomType?: boolean,
        freeCancellation?: {
            freeCancellation?: boolean,
            deadlineDays?: number,
            extraTax?: number
        },
        changeableDate?: boolean,
        changeableDateAndTime?: boolean,
        peopleMaxNumber?: number
    },
    price?: {
        regularPrice?: number,
        weekendPrice?: number
    },
    bookingPolicies?: {
        depositRequired?: boolean,
        advancePartialPayment?: boolean,
        advanceFullPayment?: boolean
    }

}
