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
import { toArrayOfProps, Column } from "../../../utils/dataTableHelper";
import { PlusMinor } from "@shopify/polaris-icons";
import {
    getMissingDataStats,
    syncAllProducts,
    getAll,
    getNoCategory,
    getPending,
    getApproved,
    getSyncProgress,
    getExcluded,
    getAllCount,
    getNoMinQuantity,
    getNoMinQuantityCount
} from "../../../services/products";
import {
    getNoCost,
    getNoBarcode,
    getLowQuantity
} from "../../../services/variants";
import { getShopData } from "../../../services/shop";

import ProductsListForValidation from "./List";
import ProductsListForInventory from "./ListForInventory";
import VariantsList from "../Variants/List";
import InventoryVariantsList from "../Variants/InventoryList";
import { RefreshMajor } from '@shopify/polaris-icons';
import '../../../App.css'
import CategoryTaxNotice from "./CategoryTaxNotice"


const Products = (props) => {

    const [syncInProgress, setSyncInProgress] = useState(false);
    const [selected, setSelected] = useState(0);
    const [syncProgress, setSyncProgress] = useState({});
    const [shopDetails, setShopDetails] = useState();

    const [allCount, setAllCount] = useState();
    const [noMinQuantity, setNoMinQuantity] = useState();

    const [missingDataStats, setMissingDataStats] = useState();


    const history = useHistory();
    useEffect(() => {

        getShopData().then((res) => {
            setShopDetails(res.data);
        })

        handleGetMissingDataStats()

        getAllCount().then((res) => {
            setAllCount(res.count);
        })

    }, [])


    useEffect(() => {
        const { tab } = props.match.params;
        const tab_index = tabs.findIndex((tab_item) => tab_item.id === tab);
        setSelected(tab_index === -1 ? 0 : tab_index);
    }, [])

    const handleGetMissingDataStats = () => {
        getMissingDataStats().then(res => {
            setMissingDataStats(res);
        })
    }

    const onSyncProducts = () => {
        setSyncInProgress(true);
        syncAllProducts()
            .then((data) => {
                setSyncInProgress(false);
            })
            .catch((e) => { });
    };

    const actions = (
        <ButtonGroup>
            <Button loading={syncInProgress} onClick={onSyncProducts}>
                Sync products
            </Button>
        </ButtonGroup>
    );


    const handleRefresh = () => {
        handleGetMissingDataStats()

        getAllCount().then((res) => {
            setAllCount(res.count);
        });
    }

    const {
        nocategory_count,
        pending_count,
        approved_count,
        excluded_count,
        nocost_count,
        nobarcode_count,
        nominquantity_count,
        lowquantity_count
    } = missingDataStats || {};

    const tabs = [
        {
            id: "all-products",
            content: (
                <span>All {allCount > 0 && <Badge>{allCount}</Badge>}</span>
            ),
            panelID: "all-products",
            type: "product",
            renderer: () => <ProductsListForValidation
                producstGetter={getAll}
                shopDetails={shopDetails}
                redirectToShopify={false}
            />,
            getter: getAll,
        },
        {
            id: "no-inventory-min-quantity",
            content: (
                <span>Set min quantity {nominquantity_count > 0 && <Badge>{nominquantity_count}</Badge>}</span>
            ),
            panelID: "no-inventory-min-quantity",
            type: "product",
            renderer: () => <ProductsListForInventory
                producstGetter={getNoMinQuantity}
                shopDetails={shopDetails}
            />,
            getter: getNoMinQuantity,
        },
        {
            id: "low-quantity",
            content: (
                <span>Low quantity {lowquantity_count > 0 && <Badge status="critical">{lowquantity_count}</Badge>}</span>
            ),
            panelID: "no-inventory-min-quantity",
            type: "variant",
            renderer: () => <InventoryVariantsList
                shopDetails={shopDetails}
                variantGetter={getLowQuantity}
            />,
            getter: getLowQuantity,
        },
        {
            id: "nocategory-products",
            content: (
                <span>No category tag {nocategory_count > 0 && <Badge status="critical">{nocategory_count}</Badge>}</span>
            ),
            panelID: "nocategory-products",
            type: "product",
            redirectToShopify: true,
            renderer: () => <ProductsListForValidation
                producstGetter={getNoCategory}
                shopDetails={shopDetails}
                redirectToShopify={true}
            />,
            getter: getNoCategory,
        },
        {
            id: "pending-products",
            content: (
                <span>
                    Pending {pending_count > 0 && <Badge>{pending_count}</Badge>}
                </span>
            ),
            panelID: "pending-products",
            type: "product",
            renderer: () => <ProductsListForValidation
                producstGetter={getPending}
                shopDetails={shopDetails}
                redirectToShopify={false}
            />,
            getter: getPending,
        },
        {
            id: "approved-products",
            content: (
                <span>
                    Approved{" "}
                    {approved_count > 0 && <Badge>{approved_count}</Badge>}
                </span>
            ),
            panelID: "approved-products",
            type: "product",
            renderer: () => <ProductsListForValidation
                producstGetter={getApproved}
                shopDetails={shopDetails}
                redirectToShopify={false}
            />,
            getter: getApproved,
        },
        {
            id: "excluded-products",
            content: (
                <span>
                    Excluded
                    {excluded_count > 0 && <Badge>{excluded_count}</Badge>}
                </span>
            ),
            panelID: "excluded-products",
            type: "product",
            renderer: () => <ProductsListForValidation
                producstGetter={getExcluded}
                shopDetails={shopDetails}
                redirectToShopify={false}
            />,
            getter: getExcluded,
        },
        {
            id: "nocost-variants",
            content: (
                <span>
                    No cost{" "}
                    {nocost_count > 0 && (
                        <Badge status="warning">{nocost_count} variants</Badge>
                    )}
                </span>
            ),
            panelID: "nocost-variants",
            type: "variant",
            renderer: () => <VariantsList
                shopDetails={shopDetails}
                variantGetter={getNoCost}
            />,
            getter: getNoCost,
        },
        {
            id: "nobarcode-variants",
            content: (
                <span>
                    No barcode{" "}
                    {nobarcode_count > 0 && (
                        <Badge status="warning">
                            {nobarcode_count} variants
                        </Badge>
                    )}
                </span>
            ),
            panelID: "nobarcode-variants",
            type: "variant",
            renderer: () => <VariantsList
                shopDetails={shopDetails}
                variantGetter={getNoBarcode}
            />,
            getter: getNoBarcode,
        },
    ];

    const handleTabChange = (useCallback((selectedTabIndex) => {
        const selectedTab = tabs[selectedTabIndex]
        history.push(`/dashboard/Products/${selectedTab?.id}`);
        setSelected(selectedTabIndex)
    }, [tabs]))

    const slected_tab = tabs[selected];

    return (
        <>
            <Page fullWidth title="Products" secondaryActions={[{
                icon: RefreshMajor,
                content: 'Refresh',
                onAction: handleRefresh
            }]} >
                {shopDetails && nocategory_count > 0 && (slected_tab.id === 'nocategory-products' || slected_tab.id === 'all-products') && <CategoryTaxNotice shopDetails={shopDetails} />}
                <Card>
                    <Tabs
                        tabs={tabs}
                        selected={selected}
                        onSelect={handleTabChange}
                    >
                        <Card.Section>
                            {shopDetails && slected_tab.renderer()}
                        </Card.Section>
                    </Tabs>
                </Card>
            </Page>
        </>
    );
};

export default Products;
