export interface Homepage  {
    id?: string;
    language?: string;
    app?: string;
    hero?: {
        backgroundImage: {
            fileName: string;
            filePath: string;
        },
        title: string;
        contentText: string;
        buttonText: string;
    },
    benefits?: Array<{
        title: string;
        content: string;
    }>,
    trialSection?: {
        mainTitle: string;
        subTitle: string;
        content: string;
        buttonText: string;
        image: {
            fileName: string;
            filePath: string;
        }
    },
    gallery?: {
        textContent: string;
        videos: Array<{
            fileName: string;
            filePath: string;
            featuredImagePath: string;
        }>;
    };
    callToAction?: {
        title: string;
        content: string;
        buttonText: string;
    }
}
