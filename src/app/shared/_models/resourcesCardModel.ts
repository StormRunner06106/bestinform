export interface ResourcesCardModel {
    id: string;
    title:string;
    icon:{
        fileName:string,
        filePath:string
    };
    price: string;
    sales:string;
}