export interface SharedExperience{
        id?: string;
        city?: string;
        country?: string;
        conversationId?: string;
        date?: string;
        description?: string;
        endDate?: string;
        endHour?: string;
        startDate?: string;
        startHour?: string;
        name?: string;
        participantsMaxNumber?: number;
        participantsLimit?: boolean;
        participants?:[{
            userId?:string;
            type?: string;
            accepted?: boolean;
            blocked?: boolean;
        }];
        place?: string;
        resourceId?: string;
        slug?: string;
        status?: string;
        userId?: string;
        featuredImage?: {
                fileName?: string;
                filePath?: string;
        };
        resourceType?: string;
}