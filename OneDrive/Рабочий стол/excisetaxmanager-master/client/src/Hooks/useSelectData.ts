import { useState, useEffect } from 'react';
import {
    SelectOption
} from '@shopify/polaris';
import { GenerateSelectOptions } from "../utils/optionsHelper"
import BaseModel from '../Models/BaseModel';

export function useSelectData<T extends BaseModel>(getData: () => Promise<T[]>, labelFieldName: keyof T): [SelectOption[],string,(id: string) => void] {
    const [selectOptions, setSelectOptions] = useState([] as SelectOption[]);
    const [selectedValue, setSelectedValue] = useState("");

    useEffect(() => {
        getOptionsData()
    }, [0]);


    const handleSelectChange = (id: string) => {
        setSelectedValue(id);
    }
    const getOptionsData = () => {
        getData().then((data: T[]) => {
            const options: SelectOption[] = GenerateSelectOptions<T>(data, labelFieldName)
            setSelectOptions(options)
        });
    }

    return [selectOptions, selectedValue, handleSelectChange];
}
