import React, { useState, useEffect, useCallback } from 'react';
import {
    Autocomplete,
    AutocompleteProps,
    Tag
} from '@shopify/polaris';
import { GenerateOptionDescriptors } from "../utils/optionsHelper"
import BaseModel from '../Models/BaseModel';

type ComboBoxProps = AutocompleteProps["options"]
export function useTags<T extends BaseModel>(getData: () => Promise<T[]>, labelFieldName: keyof T, inputLabel:string): [
    ComboBoxProps,
    JSX.Element[],
    string[],
    (selected: string[]) => void,
    JSX.Element
] {
    const [options, setOptions] = useState([] as ComboBoxProps);
    const [selectedOptions, setSelectedOptions] = useState([] as string[]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        getOptionsData()
    }, [0]);
    const handleSelectChange = (selected: string[]) => {
        setSelectedOptions(selected);
    }
    const getOptionsData = () => {
        getData().then((data: T[]) => {
            const options: ComboBoxProps = GenerateOptionDescriptors<T>(data, labelFieldName)
            setOptions(options)
        });
    }
    const updateText = useCallback(
        (value) => {
            setInputValue(value);

            if (value === '') {
                setOptions(options);
                return;
            }

            const filterRegex = new RegExp(value, 'i');
            const resultOptions = options.filter((option) =>
                option.value.match(filterRegex),
            );
            let endIndex = resultOptions.length - 1;
            if (resultOptions.length === 0) {
                endIndex = 0;
            }
            setOptions(resultOptions);
        },
        [options],
    );
    const removeTag = useCallback(
        (tag) => () => {
            const options = [...selectedOptions];
            options.splice(options.indexOf(tag), 1);
            setSelectedOptions(options);
        },
        [selectedOptions],
    );
    const textField = (
        <Autocomplete.TextField
            onChange={updateText}
            label={inputLabel}
            value={inputValue}
            placeholder="e-juice, e-liquids, On-Sale"
        />
    );
    const tagsMarkup = selectedOptions.map((option) => {
        return (
            <div key={`${option}`} className="tag-wrapper">
                <Tag onRemove={removeTag(option)}>
                    {option}
                </Tag>
            </div>
        );
    })
    return [ options, tagsMarkup, selectedOptions, handleSelectChange, textField ];
    /**TODO review this to change to return object instead */
    // return { options, tagsMarkup, selectedOptions, handleSelectChange, textField };
}

class AutocompleteData {
    options: ComboBoxProps;
    tagsMarkup: JSX.Element[];
    selectedOptions: string[];
    handleSelectChange: (selected: string[]) => void;
    textField: JSX.Element;
}

function titleCase(title: string) {
    return title
        .toLowerCase()
        .split(' ')
        .map((word) => word.replace(word[0], word[0].toUpperCase()))
        .join('');
}