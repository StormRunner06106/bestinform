export interface CurrentSubscription {
    id?: string;
    subscriptionId?: string;
    purchasedDate?: string;
    purchasedPrice?: number;
    currency?: string;
    expirationDate?: string;
    date?: string;
    userId?: string;
    // statusul new e doar pt frontend; pun status new atunci cand obiectul de current subscription este null
    status?: 'trial' | 'paid' | 'canceled' | 'new';
    autoRenew?: boolean;
    stripeSubscriptionId?: string;
    bill?: {
        number?: string;
        series?: string;
    }
}