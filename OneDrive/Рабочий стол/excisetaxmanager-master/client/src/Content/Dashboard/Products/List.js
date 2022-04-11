import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Thumbnail, Badge, DataTable, Link, Button, Icon, ButtonGroup, Stack, TextContainer, SkeletonBodyText } from '@shopify/polaris';
import { toArrayOfProps } from "../../../utils/dataTableHelper"
import {
    ChevronLeftMinor,
    ChevronRightMinor,
    ImageMajor
} from '@shopify/polaris-icons';
export default function ProductsList({ producstGetter, shopDetails, redirectToShopify }) {
    const page_size = 10 //TODO config
    const [productRows, setProductRows] = useState([]);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const handleChangePage = (newPage = 0) => {
        setLoading(true)
        if (newPage >= 0 && count / page_size >= newPage) {
            setPage(newPage);
            producstGetter && producstGetter(newPage).then(res => {
                const rows = toArrayOfProps(res.data, columns)
                setCount(res.count)
                setProductRows(rows);
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
        {
            name: "image", renderer: (product) => {
                const sorted_images = product.images && product.images.length > 0 && product.images.sort((img1, img2) => img1.position - img2.position)
                const featured_image = sorted_images && sorted_images[0] && sorted_images[0].src
                return <Thumbnail size="small" source={featured_image || ImageMajor} />
            }
        },
        { name: "title", renderer: (product) => <Link external={redirectToShopify} removeUnderline url={redirectToShopify ? `https://${shopDetails.myshopify_domain}/admin/products/${product['shopify_product_id']}` : `/dashboard/Products/Validate/${product['_id']}`}>{product["title"]}</Link> },
        { name: "status", renderer: (product) => product.approved ? <Badge status="success">Approved</Badge> : <Badge status="attention">Pending</Badge> },
        { name: "vendor" },
        { name: "product_type" },
    ]

    useEffect(() => {
        console.log("product effect")
        handleChangePage()
    }, [producstGetter])

    const tableFooter = <Stack on alignment="center">
        <ButtonGroup segmented>
            <Button onClick={previousPage} disabled={page == 0} icon={ChevronLeftMinor} />
            <Button onClick={nextPage} disabled={((page + 1) * page_size >= count)} icon={ChevronRightMinor} />
        </ButtonGroup>
        <TextContainer>
            {`Showing ${page * page_size + 1} - ${page * page_size + productRows.length} of ${count} results`}
        </TextContainer>
    </Stack>
    console.log("bsd")
    return <>
        {!loading ? (count > 0 ? <span className="table-with-thumbs"><DataTable
            verticalAlign="middle"
            columnContentTypes={[
                'text',
                'text',
                'text',
                'text',
                'text'
            ]}
            headings={[
                '',
                'Name',
                'Status',
                'Vendor',
                'Type',
            ]}
            rows={productRows}
            footerContent={tableFooter}
        /></span> : <span style={{ padding: '5px' }}>No products</span>) : <span style={{ padding: '5px' }}><SkeletonBodyText /></span>}
    </>
}