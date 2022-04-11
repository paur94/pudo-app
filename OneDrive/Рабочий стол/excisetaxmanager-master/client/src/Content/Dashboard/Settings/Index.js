import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Page, Heading } from "@shopify/polaris";
import Settings from "./Settings"
import { getShopData, saveDetails } from '../../../services/shop'

const Index = () => {
    const [shopData, setShopData] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getShopData().then(res => {
            setShopData(res.data)
            setLoading(false)
        })
    }, [])

    const handleSubmit = (data) => {
        setLoading(true)
        saveDetails(data).then(() => {
            getShopData().then(res => {
                setShopData(res.data)
                setLoading(false)
            })
        })
    }

    return <Page narrowWidth>
        <Card title="Settings">
            <Card.Section>
                {
                    loading ?
                        <Spinner
                            accessibilityLabel="Loading form field"
                            hasFocusableParent={false}
                        />
                        :
                        <Settings initialData={shopData} onSubmit={handleSubmit} />
                }
            </Card.Section>
        </Card>
    </Page>;
}

export default Index;
