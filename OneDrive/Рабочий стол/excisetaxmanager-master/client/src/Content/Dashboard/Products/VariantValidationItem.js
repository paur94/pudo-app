import React, { useState, useCallback } from "react"
import {
    useParams
} from "react-router-dom";
import { syncAndGet } from '../../../services/products'
import { DisplayText, Caption, Icon, Thumbnail, FormLayout, TextField, PageActions, Page, Popover, ActionList, Button, Stack, Card, TextContainer, List, ResourceList } from '@shopify/polaris';
import ToggleSwitch from "../../Helpers/ToggleSwitch"
import { ImageMajor, CircleInformationMajor } from '@shopify/polaris-icons';


export default function VariantValidationItem({ variantData, onFieldChange }) {
    const [active, setActive] = useState(false);

    const toggleActive = useCallback(() => setActive((active) => !active), []);

    //TODO add link for shopify admin and store
    const section_title = <DisplayText size="small"> {`${variantData ? variantData.title : ''}`} </DisplayText>

    const capacity_info_activator = (
        <>Capacity <span className="info_icon_wrapper"><Button plain onClick={toggleActive}><Icon backdrop={false} source={CircleInformationMajor} /></Button></span></>
    );

    return (<Card.Section title={section_title}>
        <FormLayout>
            <FormLayout.Group condensed>

                <Thumbnail source={variantData.image_src || ImageMajor} />
                <div>
                    <div className="Polaris-Labelled__LabelWrapper">
                        <div className="Polaris-Label">
                            <label htmlFor={variantData._id}>Contains nicotine</label>
                        </div>
                    </div>
                    <ToggleSwitch id={variantData._id} checked={!!variantData.contains_nicotine} onChange={(value) => { onFieldChange(variantData._id, "contains_nicotine", value) }} />
                </div>
                <TextField
                    label="Items in package"
                    type="number"
                    //only string WTF shopify polaris!!!
                    value={variantData.items_count + ""}
                    onChange={(value) => { onFieldChange(variantData._id, "items_count", value) }}
                />

                <TextField
                    label={<Popover active={active} activator={capacity_info_activator} onClose={toggleActive}>
                        <ActionList
                            sections={[
                                {
                                    items: [
                                        {
                                            helpText: 'Capacity for each item.',
                                        },
                                    ],
                                },
                            ]}
                        />
                    </Popover>}
                    type="number"
                    suffix="ml"
                    value={variantData.capacity + ""}
                    // helpText="Capacity for each item."
                    step={10}
                    onChange={(value) => { onFieldChange(variantData._id, "capacity", value) }}
                />

            </FormLayout.Group>
        </FormLayout>

    </Card.Section>)
}