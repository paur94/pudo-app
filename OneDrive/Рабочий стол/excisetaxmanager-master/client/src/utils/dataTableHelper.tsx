

export class Column {
    name: string = "";
    renderer?: (data: any) => JSX.Element;
}

export const toArrayOfProps = <T extends KeyValue>(data: [T], props: Column[]): JSX.Element[][] => {
    const result: JSX.Element[][] = [];
    data.forEach((item: T) => {
        const item_props_values: JSX.Element[] = [];
        props.forEach((prop: Column) => {
            const value: JSX.Element = typeof prop.renderer == "function" ? prop.renderer(item) : (item[prop.name] as JSX.Element);
            item_props_values.push(value)
        })
        result.push(item_props_values)
    })
    return result
}

interface KeyValue {
    [key: string]: any;
}