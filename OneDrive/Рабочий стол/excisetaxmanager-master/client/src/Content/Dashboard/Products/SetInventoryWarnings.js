import React, { useState, useEffect, useCallback } from "react"
import {
    useParams
} from "react-router-dom";
import { getProduct, setMinInventoryQuantity } from '../../../services/products'
import { Badge,SkeletonDisplayText, SkeletonBodyText, Link, Icon, Thumbnail, FormLayout, TextField, PageActions, Page, Popover, ActionList, Button, Stack, Card, TextContainer, List, ResourceList } from '@shopify/polaris';
import ToggleSwitch from "../../Helpers/ToggleSwitch"
import { ImageMajor, ViewMajor } from '@shopify/polaris-icons';
import VariantInventoryEditItem from "./VariantInventoryEditItem"
import { useHistory } from "react-router-dom";

export default function Component() {

    const [product, setProduct] = useState()
    const [pageination_data, setPagination_data] = useState({})
    const [loading, setLoading] = useState(false)
    const { id } = useParams();
    const history = useHistory();

    useEffect(() => {
        setLoading(true)
        getProduct(id).then(res => {
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
    const handleSave = useCallback(() => {
        const { next_id } = pageination_data;
        setMinInventoryQuantity(product._id, product).then(res => {
            history.push(`/dashboard/Products/no-inventory-min-quantity`);
        })
    }, [pageination_data])

    const title = product ? <><span className="info_icon_wrapper" style={{ marginRight: '5px' }}>{`${product.title} `}
        <Link external={true} removeUnderline url={`https://${product.shop}/admin/products/${product.shopify_product_id}`}><Icon source={ViewMajor} color="base" /></Link></span>
    </> : 'Product not found please try next'
    const { previous_id, next_id } = pageination_data

    return <Page
        breadcrumbs={[{content: 'UpdateInventoryWarnings', url: '/dashboard/Products/no-inventory-min-quantity'}]}
        title={title}
    >
        <>
            <Card title={`Variants`} primaryFooterAction={{ content: 'Save', onAction: handleSave, disabled: loading }}>
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
                        product && product.variants && product.variants.map(variantDetails =>
                            <VariantInventoryEditItem key={variantDetails._id} variantData={variantDetails} onFieldChange={handleFieldChange} />
                        )
                }
            </Card>
        </>

    </Page>



}