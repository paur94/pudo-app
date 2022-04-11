import React, { useState, useEffect, useCallback } from "react"
import {
    useParams
} from "react-router-dom";
import { syncAndGet, approve } from '../../../services/products'
import { Badge, Link, Icon, SkeletonBodyText, SkeletonDisplayText, Thumbnail, FormLayout, TextField, PageActions, Page, Popover, ActionList, Button, Stack, Card, TextContainer, List, ResourceList } from '@shopify/polaris';
import ToggleSwitch from "../../Helpers/ToggleSwitch"
import { ImageMajor, ViewMajor } from '@shopify/polaris-icons';
import VariantValidationItem from "./VariantValidationItem"
import { useHistory } from "react-router-dom";

export default function Validate() {

    const [product, setProduct] = useState()
    const [loading, setLoading] = useState(false)
    const [pageination_data, setPagination_data] = useState({})
    const { id } = useParams();
    const history = useHistory();

    useEffect(() => {
        setLoading(true)
        syncAndGet(id).then(res => {
            const { next_id, previous_id, data } = res;
            setProduct(res.data)
            setPagination_data({ next_id, previous_id })
            setLoading(false)
        })
    }, [id])
    //TODO a better approach
    const handleFieldChange = (variant_id, field, value) => {
        const variants = product.variants.map(variant => {
            if (variant._id === variant_id) {
                variant[field] = value
            }
            return variant;
        })
        setProduct({ ...product, variants })
    }
    const handleApprove = useCallback(() => {
        const { next_id } = pageination_data;
        approve(product._id, product).then(res => {
            history.push(`/dashboard/Products/Validate/${next_id}`);
        })
    }, [pageination_data])


    const goNext = useCallback(() => {
        const { next_id } = pageination_data;
        history.push(`/dashboard/Products/Validate/${next_id}`);
    }, [pageination_data])

    const goPrevious = useCallback(() => {
        const { previous_id } = pageination_data;
        history.push(`/dashboard/Products/Validate/${previous_id}`);
    }, [pageination_data])


    const title = product ? <><span className="info_icon_wrapper" style={{marginRight:'5px'}}>{`${product.title} `}
        <Link external={true} removeUnderline url={`https://${product.shop}/admin/products/${product.shopify_product_id}`}><Icon source={ViewMajor} color="base" /></Link></span>
        {product.approved ? <Badge status="success"> Approved</Badge> : <Badge status="attention">Pending</Badge>}
    </> : 'Product not found please try next'

    const { previous_id, next_id } = pageination_data

    return <Page
        title={!loading && title}
        pagination={{
            hasPrevious: !!previous_id,
            hasNext: !!next_id,
            onNext: goNext,
            onPrevious: goPrevious,
        }}
    >
        <>
            <Card title={`Variants`} primaryFooterAction={{ content: 'All good', onAction: handleApprove, disabled: loading }}>
                {
                    loading ?
                        <>
                            <Card.Section >
                                <TextContainer>
                                    <SkeletonDisplayText size="small" />
                                    <SkeletonBodyText />
                                </TextContainer>
                            </Card.Section>

                        </>
                        :
                        <>
                            {
                                product && product.variants && product.variants.map(variantDetails =>
                                    <VariantValidationItem key={variantDetails._id} variantData={variantDetails} onFieldChange={handleFieldChange} />
                                )
                            }
                            <Card.Section title="Note">
                                <TextContainer>
                                    Taxes will be calculated based on these numbers. Please be sure that everything is correct!
                                </TextContainer>
                            </Card.Section>

                        </>
                }
            </Card>
        </>

    </Page>



}