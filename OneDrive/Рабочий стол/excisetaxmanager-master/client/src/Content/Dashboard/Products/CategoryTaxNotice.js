import React, { useCallback, useState, useEffect } from 'react';

import {
    TextStyle,
    List,
    Heading,
    SkeletonBodyText,
    ProgressBar,
    ButtonGroup,
    Select,
    Layout,
    FormLayout,
    TextField,
    Banner,
    Card,
    Stack,
    Button,
    Collapsible,
    TextContainer,
    Checkbox,
    Icon,
    Autocomplete,
    Scrollable,
    Tag,
    SelectOption,
    ContextualSaveBar,
    Link,
    ResourceList,
    DisplayText,
    Page,
    Spinner
} from '@shopify/polaris';

import {
    ViewMajor,
    CircleAlertMajor,
    BarcodeMajor,
    ChevronRightMinor
} from '@shopify/polaris-icons';

const Component = ({ shopDetails }) => {

    const [tagsOpen, setTagsOpen] = useState(false);

    const handleTagsToggle = useCallback(() => setTagsOpen((tagsOpen) => !tagsOpen), []);

    return <Card sectioned title="You have products that are not categorized">
        <Stack vertical>
            <TextContainer>
                <p>
                    Tags are important for excise tax manager to distingush products
                    categories such as e-liquid products, disposable e-Cigs or non ENDS products
                    for correct tax calculations
                </p>
                {/* <Link url="#">Products categories examples</Link> */}
            </TextContainer>
            <Button
                onClick={handleTagsToggle}
                ariaExpanded={tagsOpen}
                ariaControls="basic-collapsible"
            >
                {tagsOpen ? 'Hide' : 'Show'} tags
            </Button>

            <Collapsible
                open={tagsOpen}
                id="basic-collapsible"
                transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                expandOnPrint
            >
                <Banner
                    title=""
                    status="warning"
                // action={{ content: 'All done', onAction: onTagsSet, loading: loading }}
                >
                    <List>
                        <List.Item>
                            <TextStyle variation="code">PACT-exclude</TextStyle> on all none ENDS products
                        </List.Item>
                        <List.Item>
                            <TextStyle variation="code">PACT-eliquid</TextStyle> on e-liquid products
                        </List.Item>
                        <List.Item>
                            <TextStyle variation="code">PACT-disposable</TextStyle> on Disposable e-Cigs
                        </List.Item>
                        <List.Item>
                            <TextStyle variation="code">PACT-prefilled-pod</TextStyle> on Prefilled Pods
                        </List.Item>
                        <List.Item>
                            <TextStyle variation="code">PACT-device</TextStyle> on Vape Mod Devices and Starter Kits
                        </List.Item>
                        <List.Item>
                            <TextStyle variation="code">PACT-accessory</TextStyle> on vape device parts/accessories such as Tanks, Empty Pods, Coils, Glasses, etc.
                        </List.Item>
                        <List.Item>
                            <TextStyle variation="code">PACT-no-tax</TextStyle> on non-taxable accessories such as Batteries, chargers & cases
                        </List.Item>
                    </List>
                </Banner>

            </Collapsible>
        </Stack>

    </Card>

}


export default Component