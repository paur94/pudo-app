import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Badge, DataTable, Link, Button, Icon, ButtonGroup, Stack, TextContainer, SkeletonBodyText } from '@shopify/polaris';
import { toArrayOfProps } from "../../../utils/dataTableHelper"
import {
    ChevronLeftMinor,
    ChevronRightMinor
} from '@shopify/polaris-icons';
export default function SalesList({ salesGetter }) {
    const page_size = 10 //TODO config
    const [salesRows, setSalesRows] = useState([]);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading]= useState(true);

    const handleChangePage = (newPage = 0) => {
        setLoading(true)
        if (newPage >= 0 && count / page_size >= newPage) {
            setPage(newPage);
            salesGetter && salesGetter(newPage).then(res => {
                const rows = toArrayOfProps(res.data.sale_items, columns)
                setCount(res.count)
                setSalesRows(rows);
                setLoading(false)
            }).catch(err => { console.log(err) })
        }
    };

    const nextPage = useCallback(() => {
        handleChangePage(page + 1, count)
    }, [page, count])
    const previousPage = useCallback(() => {
        handleChangePage(page - 1, count)
    }, [page, count])

    const columns = [
        // { name: "product_name" },
        { name: "customer_name" },
        { name: "address" },
        { name: "type" },
        { name: "brand_family" },
        { name: "invoice_date" },
        { name: "invoice_number" },
        { name: "barcode" },
        { name: "quantity" },
        { name: "item_weight", renderer: data => <span>{(data.quantity * data.item_weight).toFixed(2)}</span> },
        { name: "item_retail_price", renderer: data => <span>${(data.quantity * data.item_retail_price).toFixed(2)}</span> },
        { name: "item_cost" , renderer: data => <span>${(data.quantity * data.item_cost).toFixed(2)}</span> },
    ]

    useEffect(() => {
        handleChangePage()
    }, [salesGetter])

    const tableFooter = <Stack on alignment="center">
        <ButtonGroup segmented>
            <Button onClick={previousPage} disabled={page == 0} icon={ChevronLeftMinor} />
            <Button onClick={nextPage} disabled={((page + 1) * page_size >= count)} icon={ChevronRightMinor} />
        </ButtonGroup>
        {/* <TextContainer>
            {`Showing ${page * page_size + 1} - ${page * page_size + salesRows.length}`}
        </TextContainer> */}
    </Stack>

    return <>
        {!loading?<DataTable
            columnContentTypes={[
                // 'text',
                'text',
                'text',
                'text',
                'text',
                'text',
                'text',
                'text',
                'text',
                'text',
                'text',
                'text',
            ]}
            headings={[
                // 'Product name',
                'Customer name',
                'Address',
                'Type',
                'Brand family',
                'Invoice date',
                'Invoice number',
                'Barcode',
                'Quantity',
                'Weight (oz)',
                'Retail sale price',
                "Manufacturer’s/ wholesale price",
            ]}
            rows={salesRows}
            footerContent={tableFooter}
        /> : <SkeletonBodyText />}
    </>
}