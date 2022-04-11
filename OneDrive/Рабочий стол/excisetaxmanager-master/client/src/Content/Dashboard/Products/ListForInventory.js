import React, { Component, useState, useEffect, useCallback } from "react";

import { useHistory, useRouteMatch } from "react-router-dom";
import {
    Tabs,
    Card,
    SkeletonBodyText,
    DataTable,
    Page,
    Icon,
    Button,
    ButtonGroup,
    Link,
    Badge,
    Thumbnail
} from "@shopify/polaris";

import {
    getNoMinQuantityProductTypes,
    getNoMinQuantity
} from "../../../services/products";

import ListForInventoryBYProductType from "./ListForInventoryBYProductType";

const List = ({ shopDetails }) => {

    const [productTypes, setProductTypes] = useState();
    const [selected, setSelected] = useState(0);

    useEffect(() => {
        getNoMinQuantityProductTypes().then((res) => {
            setProductTypes(res.data);
        })
    }, [])

    const tabs = productTypes?.map(pt => {
        return {
            id: pt._id,
            content: (
                <span>{pt._id} <Badge status="critical">{pt.count}</Badge></span>
            ),
            panelID: pt._id,
            renderer: () => <ListForInventoryBYProductType
                producstGetter={getNoMinQuantity}
                shopDetails={shopDetails}
                productType={pt._id}
            />
        }
    })

    const handleTabChange = (useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex)
    }, [tabs]))

    const slected_tab = tabs && tabs[selected];

    return (
        <>
            {slected_tab && <Tabs
                tabs={tabs}
                selected={selected}
                onSelect={handleTabChange}
            >
                <Card.Section>
                    {slected_tab?.renderer()}
                </Card.Section>
            </Tabs>}
        </>
    );
};

export default List;
