import BaseModel from "./BaseModel"

export class ProductType extends BaseModel{
    name: string;
    shopify_id: number;
    template: string;
    description: string;
}