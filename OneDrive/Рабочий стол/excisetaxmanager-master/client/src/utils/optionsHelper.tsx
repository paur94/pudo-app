import BaseModel from "../Models/BaseModel";

import {
    SelectOption,
    AutocompleteProps
} from '@shopify/polaris';
export const GenerateSelectOptions = <T extends BaseModel>(data: T[], labelFieldName: keyof T): SelectOption[] => {
    const options: SelectOption[] = data.map(item => {
        let labelValue = "---";
        const labelFieldValue = item[labelFieldName]
        if (isString(labelFieldValue)) {
            labelValue = labelFieldValue as string
        }
        return {
            label: labelValue,
            value: labelValue,
        }
    })

    return options;
}

export const GenerateOptionDescriptors = <T extends BaseModel>(data: T[], labelFieldName: keyof T): AutocompleteProps["options"] => {
    const options: AutocompleteProps["options"] = data.map(item => {
        let labelValue = "---";
        const labelFieldValue = item[labelFieldName]
        if (isString(labelFieldValue)) {
            labelValue = labelFieldValue as string
        }
        return {
            label: labelValue,
            value: labelValue
        }
    })

    return options;
}

function isString(value: unknown): value is string {
    return typeof value == 'string'
}