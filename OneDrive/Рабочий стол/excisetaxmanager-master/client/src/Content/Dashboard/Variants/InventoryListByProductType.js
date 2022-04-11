import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Badge, TextField, DataTable, Link, Button, Icon, ButtonGroup, Stack, TextContainer, SkeletonBodyText, Thumbnail, DisplayText } from '@shopify/polaris';
import { toArrayOfProps } from "../../../utils/dataTableHelper"
import {
    ChevronLeftMinor,
    ChevronRightMinor,
    ImageMajor,
    SearchMinor
} from '@shopify/polaris-icons';

export default function VariantsList({ variantGetter, shopDetails, productType }) {
    const page_size = 10 //TODO config
    const [variantRows, setVariantRows] = useState([]);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchterm] = useState("");

    const handleChangePage = (newPage = 0, searchTerm = "") => {
        setLoading(true)
        if (newPage >= 0 && count / page_size >= newPage) {
            setPage(newPage);
            variantGetter && variantGetter(productType, newPage, undefined, undefined, searchTerm).then(res => {
                const rows = toArrayOfProps(res.data, columns)
                setCount(res.count)
                setVariantRows(rows);
                setLoading(false)
            }).catch(err => { console.log(err) })
        }
    };

    const nextPage = useCallback(() => {
        handleChangePage(page + 1, searchTerm)
    }, [page, count, searchTerm])

    const previousPage = useCallback(() => {
        handleChangePage(page - 1, searchTerm)
    }, [page, count, searchTerm])

    const columns = [
        //TODO shopify link
        {
            name: "image", renderer: (variant) => {
                const sorted_images = variant.product.images && variant.product.images.length > 0 && variant.product.images.sort((img1, img2) => img1.position - img2.position)
                const featured_image = sorted_images && sorted_images[0] && sorted_images[0].src
                return <Thumbnail size="small" source={variant.image_src || featured_image || ImageMajor} />
            }
        },
        {
            name: "title", renderer: (variant) => <Link external={true} removeUnderline url={`https://${shopDetails.myshopify_domain}/admin/products/${variant.product.shopify_product_id}/variants/${variant.shopify_variant_id}`}>
                <TextContainer> {`${variant.product["title"]} ${variant["title"] == 'Default Title' ? '' : variant["title"]}`}</TextContainer>
            </Link>
        },
        { name: "min", renderer: (variant) => <span>{variant.min_inventory_quantity}</span> },
        { name: "inventory", renderer: (variant) => <span>{variant.inventory_quantity}</span> },
        { name: "vendor", renderer: (variant) => <span>{variant.product["vendor"]}</span> },
        { name: "product_type", renderer: (variant) => <span>{variant.product["product_type"]}</span> },
    ]

    useEffect(() => {
        console.log("variant effect")
        handleChangePage()
    }, [variantGetter])

    const handleSearch = useCallback((term) => {
        setSearchterm(term)
        handleChangePage(page, term)
    }, [page])

    const tableFooter = <Stack on alignment="center">
        <ButtonGroup segmented>
            <Button onClick={previousPage} disabled={page == 0} icon={ChevronLeftMinor} />
            <Button onClick={nextPage} disabled={((page + 1) * page_size >= count)} icon={ChevronRightMinor} />
        </ButtonGroup>
        <TextContainer>
            {`Showing ${page * page_size + 1} - ${page * page_size + variantRows.length} of ${count} results`}
        </TextContainer>
    </Stack>

    return <>
        <span className="table-with-thumbs">
            <TextField
                placeholder="Filter products"
                value={searchTerm}
                onChange={handleSearch}
                prefix={<Icon source={SearchMinor} color="base" />}
                autoComplete="off"
            />
            {!loading ? (count > 0 ? <DataTable
                verticalAlign="middle"
                columnContentTypes={[
                    'text',
                    'text',
                    'text',
                    'text'
                ]}
                headings={[
                    '',
                    'Name',
                    'Min',
                    'Inventory quantity',
                    'Vendor',
                    'Type',
                ]}
                rows={variantRows}
                footerContent={tableFooter}
            /> : <div style={{ padding: '5px' }}>No products</div>) : <span style={{ padding: '5px' }}><SkeletonBodyText /></span>}
        </span>
    </>
}