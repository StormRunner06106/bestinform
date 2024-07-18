export interface SystemSetting {
    id?: string;
    fitnessForum?: {
        image?: {
            fileName: string;
            filePath: string;
        },
        enable?: boolean;
        nameRo?: string;
        nameEn?: string;
    },
    medicalForum?: {
        image?: {
            fileName: string;
            filePath: string;
        },
        enable?: boolean;
        nameRo?: string;
        nameEn?: string;
    },
    nutritionForum?: {
        image?: {
            fileName: string;
            filePath: string;
        },
        enable?: boolean;
        nameRo?: string;
        nameEn?: string;
    },
    fitnessForumCategory?: string;
    nutritionForumCategory?: string;
    medicalForumDomainId?: string;
    trip?: {
        image?: {
            fileName: string;
            filePath: string;
        },
        enable?: boolean;
        nameRo?: string;
        nameEn?: string;
    },
    tripOptions?: {
        configuratorItinerary?: {
            image?: {
                fileName: string;
                filePath: string;
            },
            enable?: boolean;
            nameRo?: string;
            nameEn?: string;
        },
        itinerary?: {
            image?: {
                fileName: string;
                filePath: string;
            },
            enable?: boolean;
            nameRo?: string;
            nameEn?: string;
        },
        holidayOffer?: {
            image?: {
                fileName: string;
                filePath: string;
            },
            enable?: boolean;
            nameRo?: string;
            nameEn?: string;
        }
    },
    job?: {
        image?: {
            fileName: string;
            filePath: string;
        },
        enable?: boolean;
        nameRo?: string;
        nameEn?: string;
    },
    jobOptions?: {
        myCv?: {
            image?: {
                fileName: string;
                filePath: string;
            },
            enable?: boolean;
            nameRo?: string;
            nameEn?: string;
        },
        jobOffers?: {
            image?: {
                fileName: string;
                filePath: string;
            },
            enable?: boolean;
            nameRo?: string;
            nameEn?: string;
        },
        candidates?: {
            image?: {
                fileName: string;
                filePath: string;
            },
            enable?: boolean;
            nameRo?: string;
            nameEn?: string;
        },
        myJobOffers?: {
            image?: {
                fileName: string;
                filePath: string;
            },
            enable?: boolean;
            nameRo?: string;
            nameEn?: string;
        }
    }
    sharedExperience?: {
        image?: {
            fileName: string;
            filePath: string;
        },
        enable?: boolean;
        nameRo?: string;
        nameEn?: string;
    };
    culinaryPreferencesId?: string;
    transportCategoryId?: string;
    journeyThemeCategoryId?: string;
    typeOfDestinationCategoryId?: string;
    typeOfJourneyCategoryId?: string;
    percentageLoyaltyPointsSpend?: number;
    percentageLoyaltyPointsGain?: number;
    percentageCommission?: number;
    tripDomainId?: string;
    itineraryDomainId?: string;
    sharedExperienceDomainId?: string;
    eventCategoryId?: string;
}
