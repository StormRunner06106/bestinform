export interface AiData {
    cardText?: AiDataDescription;
    imageUrl?: string;
    disabled?: boolean;
}
export interface AiDataDescription {
    title?: string;
    text: string;
    action: string
}