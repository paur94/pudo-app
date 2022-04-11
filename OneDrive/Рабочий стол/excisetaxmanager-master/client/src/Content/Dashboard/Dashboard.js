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

import CategoryTaxNotice from "./Products/CategoryTaxNotice"

import {
    ViewMajor,
    CircleAlertMajor,
    BarcodeMajor,
    ChevronRightMinor
} from '@shopify/polaris-icons';

import TaxRatesList from "./TaxRates/Index"

import { getSyncProgress, getPendingCount, getShopifyTotal as getShopifyTotalProducts } from '../../services/products'
import { getShopifyTotal as getShopifyTotalOrders } from '../../services/orders'
import { getShopData, getTagsSet, startSync } from '../../services/shop'
import { getByStateAndMonth } from "../../services/sales"
import { getByStateAndMonth as getTaxesByStateAndMonth } from "../../services/taxes"
import { getMarginsByMonth } from "../../services/sales"
import { exportPdfTable } from "../../utils/pdfGenerator"
import { getMissingDataStats } from "../../services/products"
import { getNoCostCount, getNoBarcodeCount } from '../../services/variants'
import exportFromJSON from 'export-from-json'

const Dashboard = () => {

    const [syncLoading, setSyncLoading] = useState(true)
    const [syncProgress, setSyncProgress] = useState({})
    const [shopDetails, setShopDetails] = useState()
    const [selectedState, setSelectedState] = useState()
    const [selectedMonth, setSelectedMonth] = useState()
    const [selectedYear, setSelectedYear] = useState()
    const [salesData, setSalesData] = useState()
    const [intervalTimer, setIntervalTimer] = useState()
    const [initialSyncProgress, setInitialSyncProgress] = useState()
    const [shopifyTotalProducts, setShopifyTotalProducts] = useState(-1);
    const [shopifyTotalOrders, setShopifyTotalOrders] = useState(-1);
    const [tagtsSetLoading, setTagsSetLoading] = useState(false);
    const [stateTax, setStateTax] = useState();
    const [stateTaxLoading, setStateTaxLoading] = useState(false);
    const [tagsOpen, setTagsOpen] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [missingDataStats, setMissingDataStats] = useState();


    const handleTagsToggle = useCallback(() => setTagsOpen((tagsOpen) => !tagsOpen), []);

    const getInitialSyncProgress = (shopifyTotalProducts, shopifyTotalOrders, intervalTimer) => {
        getSyncProgress().then(data => {
            const { products_synced, total_variants, variants_synced, message, synced_orders_count } = data;
            const products_progress = !shopifyTotalProducts ? 0 : products_synced / shopifyTotalProducts * 100;
            const orders_progress = !shopifyTotalOrders ? 0 : synced_orders_count / shopifyTotalOrders * 100;
            if (!message) {
                setSyncProgress({ status: 'not_started' })
            }
            else if (message.status === 'finished') {
                setSyncProgress({ status: 'finished', products_progress, orders_progress })
                setInitialSyncProgress("synced")
            }
            else {
                setSyncProgress({ status: "in_progress", products_progress, orders_progress })
                !intervalTimer && shopifyTotalProducts !== -1 && shopifyTotalOrders !== -1 && setIntervalTimer(startProgressInterval(shopifyTotalProducts, shopifyTotalOrders))
            }
            if (syncLoading)
                setSyncLoading(false)
        })
    }

    const startProgressInterval = (shopifyTotalProducts, shopifyTotalOrders) => {

        const timer = setInterval(() => {
            getSyncProgress().then(data => {

                const { products_synced, total_variants, variants_synced, message, synced_orders_count } = data;

                const products_progress = !shopifyTotalProducts ? 0 : products_synced / shopifyTotalProducts * 100;
                const orders_progress = !shopifyTotalOrders ? 0 : synced_orders_count / shopifyTotalOrders * 100;

                if (!message) {
                    setSyncProgress({ status: 'not_started' })
                    clearInterval(timer)
                }
                else if (message.status === 'finished') {
                    setSyncProgress({ status: 'finished', products_progress, orders_progress })
                    clearInterval(timer)
                }
                else {
                    setSyncProgress({ status: "in_progress", products_progress, orders_progress })
                }
            }).catch(e => { })

        }, 5000);
        return timer;
    }

    useEffect(() => {
        if (syncProgress.status == 'finished') {
            getMissingDataStats().then(res => {
                setMissingDataStats(res);
            })
        }

    }, [syncProgress])


    useEffect(() => {
        getShopifyTotalProducts().then(res => {
            setShopifyTotalProducts(res.count)
        })
        getShopifyTotalOrders().then(res => {
            setShopifyTotalOrders(res.count)
        })
        getShopData().then(res => {
            setShopDetails(res.data)
        })
    }, [])

    useEffect(() => {
        getInitialSyncProgress(shopifyTotalProducts, shopifyTotalOrders, intervalTimer)
        return () => {
            intervalTimer && clearInterval(intervalTimer)
        };
    }, [shopifyTotalProducts, shopifyTotalOrders, intervalTimer])

    const markTagsSet = useCallback(() => {
        setTagsSetLoading(true)
        setSyncProgress({ status: "not_started" })
        getTagsSet().then(data => {
            getShopData().then(res => {
                setShopDetails(res.data)
            })
        })
    }, [shopDetails])

    const downloadReport = useCallback(() => {
        setDownloadLoading(true)
        getByStateAndMonth(selectedState, selectedMonth, selectedYear).then(res => {
            const month_index = months.findIndex(month => month.value === selectedMonth)
            const now = new Date()
            const from = new Date(selectedYear, month_index, 1).formatMMDDYYYY()
            const to = new Date(selectedYear, month_index + 1, 0).formatMMDDYYYY()
            setSalesData(res.data.sale_items)
            const state_full_name = states.find(s => s.value === selectedState).label
            exportPdfTable(res.data.sale_items, state_full_name, shopDetails, from, to)
            setDownloadLoading(false)
        })
    }, [selectedState, selectedMonth, selectedYear])

    const downloadExcelReport = useCallback(() => {
        setDownloadLoading(true)
        getByStateAndMonth(selectedState, selectedMonth, selectedYear).then(res => {
            const month_index = months.findIndex(month => month.value === selectedMonth)
            const now = new Date()
            const from = new Date(now.getFullYear(), month_index, 1).formatMMDDYYYY()
            const to = new Date(now.getFullYear(), month_index + 1, 0).formatMMDDYYYY()
            setSalesData(res.data.sale_items)
            const state_full_name = states.find(s => s.value === selectedState).label
            exportFromJSON({ data: res.data.sale_items, fileName: `${state_full_name}_${selectedMonth}`, exportType: 'csv' })
            setDownloadLoading(false)
        })
    }, [selectedState, selectedMonth, selectedYear])


    const downloadMarginsReport = useCallback(() => {
        setDownloadLoading(true)
        getMarginsByMonth(selectedMonth, selectedYear).then(res => {
            setSalesData(res.data.sales_data)
            exportFromJSON({ data: res.data.sales_data, fileName: `Margins_${selectedMonth}_${selectedYear}`, exportType: 'csv' })
            setDownloadLoading(false)
        })
    }, [selectedMonth, selectedYear])

    const calculateTaxes = useCallback(() => {
        setStateTaxLoading(true)
        getTaxesByStateAndMonth(selectedState, selectedMonth, selectedYear).then(res => {
            const month = months.find(m => m.value === selectedMonth)
            const state_full_name = states.find(s => s.value === selectedState).label
            setStateTax(`${state_full_name} tax for ${month.label} is ${res.tax.toFixed(2)}$`)
            setStateTaxLoading(false)
        })
    }, [selectedState, selectedMonth, selectedYear])



    const handleStartSync = useCallback(() => {
        startSync().then(res => {
            getInitialSyncProgress(shopifyTotalProducts, shopifyTotalOrders, intervalTimer)
        })
    }, [shopifyTotalProducts, shopifyTotalOrders, intervalTimer])

    const { products_progress, orders_progress, status } = syncProgress

    const {
        nocategory_count,
        pending_count,
        approved_count,
        excluded_count,
        nocost_count,
        nobarcode_count,
        lowquantity_count
    } = missingDataStats || {};

    return <div>
        <Page>
            {
                shopDetails && !shopDetails.tags_set &&
                <Card sectioned title="Before starting synchronization of products, please set tags accordingly">
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
                            Show tags
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
                                action={{ content: 'All done', onAction: markTagsSet, loading: tagtsSetLoading }}
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
            {
                (shopDetails && shopDetails.tags_set && initialSyncProgress != "synced" && !syncLoading &&
                    (
                        <Card title="Shop data synchronization"
                            primaryFooterAction={{
                                content: 'Start analyzing',
                                loading: syncProgress.status == 'in_progress',
                                disabled: syncProgress.status == 'finished',
                                onAction: handleStartSync
                            }}>
                            <Card.Section>
                                The excise tax manager will go through products from your store, categorize and try to understand some missing data of the products.
                            </Card.Section>
                            {
                                syncProgress.status === 'in_progress' &&
                                (<>
                                    <Card.Section>
                                        Products
                                        <ProgressBar progress={Math.floor(products_progress) || 0} color="success" />
                                        <br />
                                        Orders
                                        <ProgressBar progress={Math.floor(orders_progress) || 0} color="success" />
                                    </Card.Section>
                                </>)
                            }
                        </Card>
                    ))
            }
            {
                syncLoading && (<Card sectioned>
                    <SkeletonBodyText />
                </Card>)
            }
            {
                (syncProgress.status == 'finished' && !syncLoading &&
                    <Card>

                        {
                            nocategory_count > 0 &&
                            <Card.Section>
                                <Link removeUnderline monochrome url="/dashboard/Products/nocategory-products">
                                    <Stack>
                                        <Stack.Item><Icon color="critical" source={CircleAlertMajor} /> </Stack.Item>
                                        <Stack.Item fill>
                                            <TextContainer spacing="tight">
                                                <Heading size="small">{nocategory_count} Products are not categorized</Heading>
                                                <p>For tax calculations, you need to categorize all products.</p>
                                            </TextContainer>
                                        </Stack.Item>
                                        <Stack.Item><Icon color="subdued" source={ChevronRightMinor} /></Stack.Item>
                                    </Stack>
                                </Link>
                            </Card.Section>
                        }
                        {
                            lowquantity_count > 0 &&
                            <Card.Section>
                                <Link removeUnderline monochrome url="/dashboard/Products/nocost-variants">
                                    <Stack><Stack.Item><Icon color="critical" source={CircleAlertMajor} /> </Stack.Item> <Stack.Item fill><Heading size="small">{lowquantity_count} variants are running low in inventory</Heading></Stack.Item><Stack.Item><Icon color="subdued" source={ChevronRightMinor} /></Stack.Item></Stack>
                                </Link>
                            </Card.Section>
                        }
                        {
                            nocost_count > 0 &&
                            <Card.Section>
                                <Link removeUnderline monochrome url="/dashboard/Products/nocost-variants">
                                    <Stack><Stack.Item><Icon color="critical" source={CircleAlertMajor} /> </Stack.Item> <Stack.Item fill><Heading size="small">{nocost_count} variants do not have cost</Heading></Stack.Item><Stack.Item><Icon color="subdued" source={ChevronRightMinor} /></Stack.Item></Stack>
                                </Link>
                            </Card.Section>
                        }

                        {
                            nobarcode_count > 0 &&
                            <Card.Section>
                                <Link removeUnderline monochrome url="/dashboard/Products/nobarcode-variants">
                                    <Stack><Stack.Item><Icon color="warning" source={BarcodeMajor} /> </Stack.Item> <Stack.Item fill><Heading size="small">{nobarcode_count} variants are missing barcode</Heading></Stack.Item><Stack.Item><Icon color="subdued" source={ChevronRightMinor} /></Stack.Item></Stack>
                                </Link>
                            </Card.Section>
                        }

                        {
                            pending_count > 0 &&
                            <Card.Section>
                                <Link removeUnderline monochrome url="/dashboard/Products/pending-products">
                                    <Stack> <Stack.Item><Icon color="warning" source={ViewMajor} /></Stack.Item> <Stack.Item fill><Heading size="small">{pending_count} products to validate</Heading></Stack.Item><Stack.Item><Icon color="subdued" source={ChevronRightMinor} /></Stack.Item></Stack>
                                </Link>
                            </Card.Section>
                        }
                    </Card>)
            }

            {
                !syncLoading ?
                    (shopDetails && <Card title="Shop information">
                        <Card.Section>
                            <DisplayText size="small">{shopDetails.full_name}</DisplayText>
                            <TextContainer>
                                <p>{`${shopDetails.full_address || ""} ${shopDetails.city || ""} ${shopDetails.province_code || ""} ${shopDetails.zip || ""}`}</p>
                                <p>Email {shopDetails.email}</p>
                            </TextContainer>
                        </Card.Section>
                        <Card.Section title="Responsible Party">
                            {shopDetails.shop_owner}
                        </Card.Section>
                    </Card>)
                    :
                    (<Card sectioned>
                        <SkeletonBodyText />
                    </Card>)
            }
            {!syncLoading ?
                (syncProgress.status == 'finished' && <Card title="Generate PACT act report"
                    // primaryFooterAction={{
                    //     content: 'Download PACT act',
                    //     disabled: !(selectedState && selectedMonth),
                    //     onAction: downloadReport,
                    //     loading: downloadLoading
                    // }}
                    // secondaryFooterActions={[
                    //     {
                    //         content: 'Download excel',
                    //         disabled: !(selectedState && selectedMonth),
                    //         onAction: downloadExcelReport,
                    //         loading: downloadLoading
                    //     },
                    //     {
                    //         content: 'Calculate taxes',
                    //         disabled: !(selectedState && selectedMonth),
                    //         onAction: calculateTaxes,
                    //         loading: stateTaxLoading
                    //     }
                    // ]}
                >
                    <Card.Section>
                        <FormLayout>
                            <FormLayout.Group>
                                <Select
                                    placeholder="Select state"
                                    label="State"
                                    options={states}
                                    onChange={setSelectedState}
                                    value={selectedState}
                                />
                                <Select
                                    placeholder="Select month"
                                    label="Month"
                                    options={months}
                                    onChange={setSelectedMonth}
                                    value={selectedMonth}
                                />
                                <Select
                                    placeholder="Select year"
                                    label="Year"
                                    options={years}
                                    onChange={setSelectedYear}
                                    value={selectedYear}
                                />
                            </FormLayout.Group>
                            <FormLayout.Group>
                                {stateTaxLoading ? "Calculating..." : stateTax}
                            </FormLayout.Group>
                        </FormLayout>
                        <div style={{ marginTop: '20px' }}>
                            <Stack distribution="trailing">
                                <ButtonGroup>
                                    {/* <Button onClick={downloadMarginsReport} loading={downloadLoading} disabled={!(selectedMonth && selectedYear)}>Download margins report</Button> */}
                                    <Button onClick={calculateTaxes} loading={downloadLoading} disabled={!(selectedState && selectedMonth && selectedYear)}>Calculate taxes</Button>
                                    <Button onClick={downloadExcelReport} loading={downloadLoading} disabled={!(selectedState && selectedMonth && selectedYear)}>Download PACT excel</Button>
                                    <Button primary onClick={downloadReport} loading={downloadLoading} disabled={!(selectedState && selectedMonth && selectedYear)}>Download PACT act</Button>
                                </ButtonGroup>
                            </Stack>
                        </div>

                    </Card.Section>
                </Card>)
                : (<Card sectioned>
                    <SkeletonBodyText />
                </Card>)
            }


        </Page>
    </div>
}

Date.prototype.formatMMDDYYYY = function () {
    return (this.getMonth() + 1) +
        "/" + this.getDate() +
        "/" + this.getFullYear();
}
const months = [
    { value: "Jan", label: "January" },
    { value: "Feb", label: "February" },
    { value: "Mar", label: "March" },
    { value: "Apr", label: "April" },
    { value: "May", label: "May" },
    { value: "Jun", label: "June" },
    { value: "Jul", label: "July" },
    { value: "Aug", label: "August" },
    { value: "Sep", label: "September" },
    { value: "Oct", label: "October" },
    { value: "Nov", label: "November" },
    { value: "Dec", label: "December" },
]

const states = [
    { label: "Alabama", value: "AL" },
    { label: "Alaska", value: "AK" },
    { label: "American Samoa", value: "AS" },
    { label: "Arizona", value: "AZ" },
    { label: "Arkansas", value: "AR" },
    { label: "California", value: "CA" },
    { label: "Colorado", value: "CO" },
    { label: "Connecticut", value: "CT" },
    { label: "Delaware", value: "DE" },
    { label: "District Of Columbia", value: "DC" },
    { label: "Federated States Of Micronesia", value: "FM" },
    { label: "Florida", value: "FL" },
    { label: "Georgia", value: "GA" },
    { label: "Guam", value: "GU" },
    { label: "Hawaii", value: "HI" },
    { label: "Idaho", value: "ID" },
    { label: "Illinois", value: "IL" },
    { label: "Indiana", value: "IN" },
    { label: "Iowa", value: "IA" },
    { label: "Kansas", value: "KS" },
    { label: "Kentucky", value: "KY" },
    { label: "Louisiana", value: "LA" },
    { label: "Maine", value: "ME" },
    { label: "Marshall Islands", value: "MH" },
    { label: "Maryland", value: "MD" },
    { label: "Massachusetts", value: "MA" },
    { label: "Michigan", value: "MI" },
    { label: "Minnesota", value: "MN" },
    { label: "Mississippi", value: "MS" },
    { label: "Missouri", value: "MO" },
    { label: "Montana", value: "MT" },
    { label: "Nebraska", value: "NE" },
    { label: "Nevada", value: "NV" },
    { label: "New Hampshire", value: "NH" },
    { label: "New Jersey", value: "NJ" },
    { label: "New Mexico", value: "NM" },
    { label: "New York", value: "NY" },
    { label: "North Carolina", value: "NC" },
    { label: "North Dakota", value: "ND" },
    { label: "Northern Mariana Islands", value: "MP" },
    { label: "Ohio", value: "OH" },
    { label: "Oklahoma", value: "OK" },
    { label: "Oregon", value: "OR" },
    { label: "Palau", value: "PW" },
    { label: "Pennsylvania", value: "PA" },
    { label: "Puerto Rico", value: "PR" },
    { label: "Rhode Island", value: "RI" },
    { label: "South Carolina", value: "SC" },
    { label: "South Dakota", value: "SD" },
    { label: "Tennessee", value: "TN" },
    { label: "Texas", value: "TX" },
    { label: "Utah", value: "UT" },
    { label: "Vermont", value: "VT" },
    { label: "Virgin Islands", value: "VI" },
    { label: "Virginia", value: "VA" },
    { label: "Washington", value: "WA" },
    { label: "West Virginia", value: "WV" },
    { label: "Wisconsin", value: "WI" },
    { label: "Wyoming", value: "WY" },
];

const years = [
    { label: "2021", value: "2021" },
    { label: "2022", value: "2022" }
]

export default Dashboard