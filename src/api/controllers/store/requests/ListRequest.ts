import 'reflect-metadata';

export class ListRequest {

    public limit: number;

    public offset: number;

    public keyword: string;

    public categoryslug: string;

    public productSizeColor:string;

    public colorsValueFilter:string;

    public priceTo: string;

    public priceFrom: string;

    public manufacturerId: string;

    public price: string;

    public count: number;
    public catIds: string;
}
