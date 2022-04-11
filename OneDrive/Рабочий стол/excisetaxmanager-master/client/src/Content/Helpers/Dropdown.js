import React, { useCallback, useState, useEffect } from 'react';
import { Avatar, Popover, Button, Card, ResourceList, TextField, ActionList } from '@shopify/polaris';
import {
    CirclePlusMinor, SelectMinor
} from '@shopify/polaris-icons';

export default function Dropdown({ value, getData, data, labelFieldName, onSelect, label, placeholder, showConnectedRight }) {
    showConnectedRight ?? (showConnectedRight = true);
    const [popoverActive, setPopoverActive] = useState(false);

    const [options, setOptions] = useState(data || []);
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        getOptionsData()
    }, [0])

    useEffect(() => {
        setInputValue(value)
    }, [value])

    const getOptionsData = () => {
        typeof getData == 'function' && getData().then((data) => {
            setOptions(data)
        })
    }
    const visibleOptions = inputValue ? options.filter(i => i[labelFieldName].toLowerCase().indexOf(inputValue.toLowerCase()) != -1) : options;

    const togglePopoverActive = useCallback(
        () => setPopoverActive((popoverActive) => !popoverActive),
        [],
    );

    const handleResourceListItemClick = (id) => {
        const option = options.find(option => option._id == id)
        setInputValue(option && option[labelFieldName])
        onSelect(option)
        setPopoverActive(false)
    };

    const updateText = useCallback(
        (value) => {
            setInputValue(value);
        },
        [],
    );

    const handleClearButtonClick = useCallback(() => setInputValue(''), []);

    const activator = (
        <TextField
            label={label}
            placeholder={placeholder}
            type="text"
            value={inputValue}
            autoComplete={false}
            onChange={updateText}
            clearButton
            onClearButtonClick={handleClearButtonClick}
            connectedRight={
                showConnectedRight && <Button onClick={() => { setPopoverActive(true) }} icon={SelectMinor}></Button>
            }
            onFocus={() => { setPopoverActive(true) }}
        />
    );

    const popoverContent = (
        visibleOptions.length > 0 ?
            <ResourceList items={visibleOptions} renderItem={renderItem} />
            : inputValue && <ActionList items={[{ content: `Add ${inputValue}`, icon: CirclePlusMinor, onAction: () => { onSelect({ [labelFieldName]: inputValue }); setPopoverActive(false) } }]} />
    )

    return (
        <div>
            <Popover
                fullWidth
                active={popoverActive}
                activator={activator}
                onClose={togglePopoverActive}
                ariaHaspopup={false}
            >
                <Popover.Pane>
                    {popoverContent}
                </Popover.Pane>
            </Popover>
        </div>
    );

    function renderItem(data) {
        return (
            <ResourceList.Item
                id={data._id}
                onClick={handleResourceListItemClick}
            >
                {data[labelFieldName]}
            </ResourceList.Item>
        );
    }

}
