import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Thumbnail, TextField, Badge, DataTable, Link, Button, Icon, ButtonGroup, Stack, TextContainer, SkeletonBodyText } from '@shopify/polaris';
import { toArrayOfProps } from "../../../utils/dataTableHelper"
import {
    ChevronLeftMinor,
    ChevronRightMinor,
    ImageMajor,
    SearchMinor
} from '@shopify/polaris-icons';
import {doNotTrack} from '../../../services/products'


export default function ProductsList({ producstGetter, shopDetails, redirectToShopify, productType }) {
    const page_size = 10 //TODO config
    const [productRows, setProductRows] = useState([]);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchterm] = useState("");

    const handleChangePage = (newPage = 0, searchTerm = "") => {
        setLoading(true)
        if (newPage >= 0 && count / page_size >= newPage) {
            setPage(newPage);
            producstGetter && producstGetter(productType, newPage, undefined, undefined, searchTerm).then(res => {
                const rows = toArrayOfProps(res.data, columns)
                setCount(res.count)
                setProductRows(rows);
                setLoading(false)
            }).catch(err => { console.log(err) })
        }
    };

    const handeleDoNotTrack = useCallback(async (id)=>{
        await doNotTrack(id)
        handleChangePage(page)
    },[page])

    const nextPage = useCallback(() => {
        handleChangePage(page + 1, searchTerm)
    }, [page, count, searchTerm])

    const previousPage = useCallback(() => {
        handleChangePage(page - 1, searchTerm)
    }, [page, count, searchTerm])


    const columns = [
        {
            name: "image", renderer: (product) => {
                const sorted_images = product.images && product.images.length > 0 && product.images.sort((img1, img2) => img1.position - img2.position)
                const featured_image = sorted_images && sorted_images[0] && sorted_images[0].src
                return <Thumbnail size="small" source={featured_image || ImageMajor} />
            }
        },
        { name: "title", renderer: (product) => <Link external={redirectToShopify} removeUnderline url={`/dashboard/Products/UpdateInventoryWarnings/${product['_id']}`}>{product["title"]}</Link> },
        { name: "status", renderer: (product) => product.approved ? <Badge status="success">Approved</Badge> : <Badge status="attention">Pending</Badge> },
        { name: "vendor" },
        { name: "product_type" },
        { name: "actions", renderer: (product) => <Button onClick={()=>handeleDoNotTrack(product['_id'])} plain destructive>Do not track</Button> } 
    ]

    useEffect(() => {
        console.log("product effect")
        handleChangePage()
    }, [producstGetter])

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
            {`Showing ${page * page_size + 1} - ${page * page_size + productRows.length} of ${count} results`}
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
            {!loading ? (count > 0 ?

                <DataTable
                    verticalAlign="middle"
                    columnContentTypes={[
                        'text',
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
                        '',
                    ]}
                    rows={productRows}
                    footerContent={tableFooter}
                /> : <div style={{padding:'5px'}}>No products</div>) :<span style={{padding:'5px'}}><SkeletonBodyText /></span> }
        </span>
    </>
}