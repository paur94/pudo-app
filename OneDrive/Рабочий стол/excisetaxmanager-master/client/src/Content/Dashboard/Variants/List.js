import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Badge, DataTable, Link, Button, Icon, ButtonGroup, Stack, TextContainer, SkeletonBodyText, Thumbnail, DisplayText } from '@shopify/polaris';
import { toArrayOfProps } from "../../../utils/dataTableHelper"
import {
    ChevronLeftMinor,
    ChevronRightMinor,
    ImageMajor
} from '@shopify/polaris-icons';
export default function VariantsList({ variantGetter, shopDetails }) {
    const page_size = 10 //TODO config
    const [variantRows, setVariantRows] = useState([]);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const handleChangePage = (newPage = 0) => {
        setLoading(true)
        if (newPage >= 0 && count / page_size >= newPage) {
            setPage(newPage);
            variantGetter && variantGetter(newPage).then(res => {
                const rows = toArrayOfProps(res.data, columns)
                setCount(res.count)
                setVariantRows(rows);
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
        { name: "vendor", renderer: (variant) => <span>{variant.product["vendor"]}</span> },
        { name: "product_type", renderer: (variant) => <span>{variant.product["product_type"]}</span> },
    ]

    useEffect(() => {
        console.log("variant effect")
        handleChangePage()
    }, [variantGetter])

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
        {!loading ? (count > 0 ? <span className="table-with-thumbs"><DataTable
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
                'Vendor',
                'Type',
            ]}
            rows={variantRows}
            footerContent={tableFooter}
        /></span> : <span style={{padding:'5px'}}>No products</span>) : <span style={{padding:'5px'}}><SkeletonBodyText /></span>}
    </>
}