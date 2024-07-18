export const mockResponse = {
    "flightOffer": {
        "type": "flight-offer",
        "id": "53",
        "oneWay": false,
        "lastTicketingDate": "2024-06-23",
        "lastTicketingDateTime": "2024-06-23",
        "numberOfBookableSeats": 4,
        "itineraries": [
            {
                "duration": "PT3H20M",
                "segments": [
                    {
                        "id": "16",
                        "departure": {
                            "iataCode": "OTP",
                            "terminal": null,
                            "at": "2024-06-23T08:40:00",
                            "dateTime": "2024-06-23T11:00:00",
                            "carrierCode": null
                        },
                        "arrival": {
                            "iataCode": "CDG",
                            "terminal": "2E",
                            "at": "2024-06-23T11:00:00",
                            "dateTime": "2024-06-23T11:00:00",
                            "carrierCode": null
                        },
                        "carrierCode": "RO",
                        "number": "381",
                        "company": "TAROM",
                        "aircraft": {
                            "code": "73H"
                        },
                        "operating": {
                            "carrierCode": "RO"
                        },
                        "duration": "PT3H20M",
                        "numberOfStops": 0,
                        "blacklistedInEU": false,
                        "originLocation": null,
                        "destinationLocation": null,
                        "aircraftCode": null
                    }
                ],
                "direct": true
            },
            {
                "duration": "PT2H50M",
                "segments": [
                    {
                        "id": "83",
                        "departure": {
                            "iataCode": "CDG",
                            "terminal": "2F",
                            "at": "2024-06-30T12:00:00",
                            "dateTime": "2024-06-30T15:50:00",
                            "carrierCode": null
                        },
                        "arrival": {
                            "iataCode": "OTP",
                            "terminal": null,
                            "at": "2024-06-30T15:50:00",
                            "dateTime": "2024-06-30T15:50:00",
                            "carrierCode": null
                        },
                        "carrierCode": "RO",
                        "number": "382",
                        "company": "TAROM",
                        "aircraft": {
                            "code": "73H"
                        },
                        "operating": {
                            "carrierCode": "RO"
                        },
                        "duration": "PT2H50M",
                        "numberOfStops": 0,
                        "blacklistedInEU": false,
                        "originLocation": null,
                        "destinationLocation": null,
                        "aircraftCode": null
                    }
                ],
                "direct": true
            }
        ],
        "pricingOptions": {
            "includedCheckedBagsOnly": true,
            "fareType": [
                "PUBLISHED"
            ],
            "corporateCodes": null,
            "refundableFare": false,
            "noRestrictionFare": false,
            "noPenaltyFare": false
        },
        "validatingAirlineCodes": [
            "RO"
        ],
        "travelerPricings": [
            {
                "travelerId": "1",
                "fareOption": "STANDARD",
                "travelerType": "ADULT",
                "currency": null,
                "price": {
                    "currency": "EUR",
                    "total": "454.0",
                    "base": "350.00",
                    "fees": [],
                    "grandTotal": "null"
                },
                "ticketPrice": "454.0",
                "fareDetailsBySegment": [
                    {
                        "segmentId": "16",
                        "cabin": "ECONOMY",
                        "fareBasis": "RRTOPTFR",
                        "brandedFare": null,
                        "brandedFareLabel": null,
                        "includedCheckedBags": {
                            "quantity": 1,
                            "weight": 0,
                            "weightUnit": null
                        },
                        "amenities": null,
                        "class": "R"
                    },
                    {
                        "segmentId": "83",
                        "cabin": "ECONOMY",
                        "fareBasis": "ARTOPTFR",
                        "brandedFare": null,
                        "brandedFareLabel": null,
                        "includedCheckedBags": {
                            "quantity": 1,
                            "weight": 0,
                            "weightUnit": null
                        },
                        "amenities": null,
                        "class": "A"
                    }
                ]
            }
        ],
        "fareRules": {
            "rules": [
                {
                    "category": "EXCHANGE",
                    "maxPenaltyAmount": "60.00"
                },
                {
                    "category": "REFUND",
                    "maxPenaltyAmount": "140.00"
                },
                {
                    "category": "REVALIDATION",
                    "notApplicable": true
                }
            ]
        },
        "price": {
            "currency": "EUR",
            "total": "454.0",
            "base": "350.00",
            "fees": [
                {
                    "amount": 0,
                    "type": "SUPPLIER"
                },
                {
                    "amount": 0,
                    "type": "TICKETING"
                }
            ],
            "grandTotal": "453.93"
        },
        "amadeusFlightOffer": "{\"type\":\"flight-offer\",\"id\":\"53\",\"source\":\"GDS\",\"instantTicketingRequired\":false,\"nonHomogeneous\":false,\"oneWay\":false,\"lastTicketingDate\":\"2024-06-23\",\"lastTicketingDateTime\":\"2024-06-23\",\"numberOfBookableSeats\":4,\"itineraries\":[{\"duration\":\"PT3H20M\",\"segments\":[{\"departure\":{\"iataCode\":\"OTP\",\"at\":\"2024-06-23T08:40:00\"},\"arrival\":{\"iataCode\":\"CDG\",\"terminal\":\"2E\",\"at\":\"2024-06-23T11:00:00\"},\"carrierCode\":\"RO\",\"number\":\"381\",\"aircraft\":{\"code\":\"73H\"},\"operating\":{\"carrierCode\":\"RO\"},\"duration\":\"PT3H20M\",\"id\":\"16\",\"numberOfStops\":0,\"blacklistedInEU\":false}]},{\"duration\":\"PT2H50M\",\"segments\":[{\"departure\":{\"iataCode\":\"CDG\",\"terminal\":\"2F\",\"at\":\"2024-06-30T12:00:00\"},\"arrival\":{\"iataCode\":\"OTP\",\"at\":\"2024-06-30T15:50:00\"},\"carrierCode\":\"RO\",\"number\":\"382\",\"aircraft\":{\"code\":\"73H\"},\"operating\":{\"carrierCode\":\"RO\"},\"duration\":\"PT2H50M\",\"id\":\"83\",\"numberOfStops\":0,\"blacklistedInEU\":false}]}],\"price\":{\"currency\":\"EUR\",\"total\":\"453.93\",\"base\":\"350.00\",\"fees\":[{\"amount\":\"0.00\",\"type\":\"SUPPLIER\"},{\"amount\":\"0.00\",\"type\":\"TICKETING\"}],\"grandTotal\":\"453.93\"},\"pricingOptions\":{\"fareType\":[\"PUBLISHED\"],\"includedCheckedBagsOnly\":true},\"validatingAirlineCodes\":[\"RO\"],\"travelerPricings\":[{\"travelerId\":\"1\",\"fareOption\":\"STANDARD\",\"travelerType\":\"ADULT\",\"price\":{\"currency\":\"EUR\",\"total\":\"453.93\",\"base\":\"350.00\"},\"fareDetailsBySegment\":[{\"segmentId\":\"16\",\"cabin\":\"ECONOMY\",\"fareBasis\":\"RRTOPTFR\",\"class\":\"R\",\"includedCheckedBags\":{\"quantity\":1}},{\"segmentId\":\"83\",\"cabin\":\"ECONOMY\",\"fareBasis\":\"ARTOPTFR\",\"class\":\"A\",\"includedCheckedBags\":{\"quantity\":1}}]}],\"fareRules\":{\"rules\":[{\"category\":\"EXCHANGE\",\"maxPenaltyAmount\":\"60.00\"},{\"category\":\"REFUND\",\"maxPenaltyAmount\":\"140.00\"},{\"category\":\"REVALIDATION\",\"notApplicable\":true}]}}",
        "paymentCardRequired": false,
        "totalPrice": 454,
        "serviceTax": 20,
        "travelersServiceTax": 20,
        "totalDuration": 370,
        "currency": null,
        "priceConfirmed": false,
        "source": "GDS",
        "instantTicketingRequired": false,
        "nonHomogeneous": false,
        "extraOffer": {
            "type": "Silver",
            "class": "bst-grey",
            "price": 0
        }
    },
    "baggageAllowance": [
        {
            "quantity": 1,
            "weight": null,
            "weightUnit": null,
            "name": "CHECKED_BAG",
            "price": {
                "amount": "55.00",
                "currencyCode": "EUR"
            },
            "bookableByItinerary": true,
            "segmentIds": [
                "16",
                "83"
            ],
            "travelerIds": []
        },
        {
            "quantity": 2,
            "weight": null,
            "weightUnit": null,
            "name": "CHECKED_BAG",
            "price": {
                "amount": "150.00",
                "currencyCode": "EUR"
            },
            "bookableByItinerary": true,
            "segmentIds": [
                "16",
                "83"
            ],
            "travelerIds": []
        }
    ]
}
