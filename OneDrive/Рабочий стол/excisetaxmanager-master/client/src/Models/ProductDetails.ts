import BaseModel from "./BaseModel"
export default class Product extends BaseModel {
    shopify_id?: number;
    title: string;
    created_at?: Date;
    handle?: string;
    description?: string;
    tags?: [string];
    template_suffix?: string;
    product_type?: string;
    vendor?: string;
}
