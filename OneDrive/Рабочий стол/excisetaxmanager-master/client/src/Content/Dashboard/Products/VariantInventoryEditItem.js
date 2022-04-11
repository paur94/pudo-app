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
            <FormLayout.Group>
                <Thumbnail source={variantData.image_src || ImageMajor} />
                <TextField
                    label="Current inventory quantity"
                    type="number"
                    //only string WTF shopify polaris!!!
                    value={variantData?.inventory_quantity ? variantData?.inventory_quantity + "" : '0'}
                    disabled
                />

            
                <TextField
                    label="Minimum qunatity"
                    type="number"
                    //only string WTF shopify polaris!!!
                    value={variantData?.min_inventory_quantity ? variantData?.min_inventory_quantity + "" : ''}
                    onChange={(value) => { onFieldChange(variantData._id, "min_inventory_quantity", value) }}
                />
            </FormLayout.Group>
        </FormLayout>

    </Card.Section>)
}