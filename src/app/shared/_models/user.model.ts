export interface User {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    county?: string;
    registrationDate?: string;
    description?: string;
    passwordExpirationDate?: string;
    nickname?: string;
    birthdate?: string;
    avatar?: {
        fileName: string;
        filePath: string;
    },
    gender?: string;
    city?: string;
    country?: string;
    telephone?: string;
    billingAddress?: {
        address: string;
        city: string;
        country: string;
        postcode: string;
        iban: string;
        county: string;
        bankName: string;
        name: string;
    };
    currentGeographicalCoordinates?: {
        latitude: string;
        longitude: string;
    };
    cv?: {
        filePath: string,
        fileName: string
    };
    activeStatus?: boolean;
    approvedStatus?: string;
    earnedMoney?: {
        allMoney: number;
        moneyToReceive: number;
        pendingMoney: number;
        commission: number;
        transactionHistory: [
            {
                money: number;
                type: string;
                reservationId: string;
                date: string;
            }
        ]
    };
    loyaltyPoints?: number;
    roles?: UserRole[];
    friendList?: [
        {
            userId: string;
            type: string;
            accepted: boolean;
            blocked: boolean;
        }
    ];
    favoriteResources?: string[];
    preferredCulinary?: string[];
    preferredTransport?: string[];
    preferredAccommodationConditions?: string[];
    preferredActivities?: string[];
    preferredFun?: string[];
    purchasedSubscriptions?: string[];
    oldPasswords?: string[];
    addedBy?: string;
    contract?: {
        fileName: string;
        filePath: string;
    }
    companyName?: string;
    cui?: string;
    providerStatus?: string;
    agentName?: string;
    domain?: string;
    coverImage?: {
        fileName: string;
        filePath: string;
    },
    enrollment?: boolean,
    percentageCommission?: number,
    userSetting?: {
        colorMode?: string,
        language?: string
    }

}

export type UserRole =
    'ROLE_SUPER_ADMIN'
    | 'ROLE_STAFF'
    | 'ROLE_CLIENT'
    | 'ROLE_PROVIDER'
    | 'ROLE_EVENTS_VIEW'
    | 'ROLE_EVENTS_EDIT'
    | 'ROLE_EDITORIALS_VIEW'
    | 'ROLE_EDITORIALS_EDIT'
    | 'ROLE_PROVIDERS_VIEW'
    | 'ROLE_PROVIDERS_EDIT';
