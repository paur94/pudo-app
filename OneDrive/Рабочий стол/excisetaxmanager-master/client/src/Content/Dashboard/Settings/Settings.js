import React, { useState, useEffect, useCallback } from "react";
import { Button, Card, Form, FormLayout, Page, Heading } from "@shopify/polaris";
import { PolarisFormBuilder } from "@additionapps/polaris-form-builder";
import { CustomField } from "./CustomFields";
import { details_fields, respFields, deliverySystemsFields } from "./fields";
import { saveDetails, getShopData } from '../../../services/shop'

const Settings = ({ initialData, onSubmit }) => {

    const [mainDetailsModel, setMainDetailsModel] = useState(initialData);
    const [respDetailsModel, setrespDetailsModel] = useState({
        resp_party_name: initialData.resp_party_name,
        resp_party_title: initialData.resp_party_title,
        resp_party_phone_number: initialData.resp_party_phone_number
    });

    const [deliverySystemsDetailsModel, setDeliverySystemsDetailsModel] = useState({
        delivery_services: initialData.delivery_services
    });

    const handleSubmit = useCallback(() => {
        const data = { ...mainDetailsModel, ...respDetailsModel, ...deliverySystemsDetailsModel }
        onSubmit(data)
    }, [mainDetailsModel, respDetailsModel, deliverySystemsDetailsModel])

    return <Form onSubmit={handleSubmit}>
        <FormLayout>
            <PolarisFormBuilder
                model={mainDetailsModel}
                fields={details_fields}
                onModelUpdate={setMainDetailsModel}
            />
            <Heading>Responsible party</Heading>
            <PolarisFormBuilder
                model={respDetailsModel}
                fields={respFields}
                onModelUpdate={setrespDetailsModel}
            />
            <Heading>Delivery services</Heading>
            <PolarisFormBuilder
                model={deliverySystemsDetailsModel}
                fields={deliverySystemsFields}
                onModelUpdate={setDeliverySystemsDetailsModel}
            />
            <Button submit primary>Save</Button>
        </FormLayout>
    </Form>
};

export default Settings;
