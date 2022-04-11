import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, TextStyle, DataTable, Link, Button, Icon, ButtonGroup, Stack, TextContainer, Tag } from '@shopify/polaris';
import { toArrayOfProps } from "../../../utils/dataTableHelper"
import { getLastMonthPDF } from '../../../services/reports'

import {
    ChevronLeftMinor,
    ChevronRightMinor
} from '@shopify/polaris-icons';

import { getLastMonth } from '../../../services/sales'

export default function TaxRatesList({ taxRateGetter }) {
    const [stateRates, setStateRates] = useState([]);
    const [taxRateRows, settaxRateRows] = useState([]);
    const [reportFileLoading, setReportFileLoading] = useState({});

    useEffect(() => {
        taxRateGetter && taxRateGetter().then(res => {
            const states_taxes = res.data.sort((a, b) => {
                if (a.state_name < b.state_name) { return -1; }
                if (a.state_name > b.state_name) { return 1; }
                return 0;
            })
            setStateRates(states_taxes)
        }).catch(err => { console.log(err) })
    }, [taxRateGetter])

    useEffect(() => {
        const rows = toArrayOfProps(stateRates, columns)
        settaxRateRows(rows);
    }, [stateRates, reportFileLoading])

    const tax_type_suffixes = {
        'cost_percent': '% of cost',
        'price_percent': '% of Retail price',
        'item_fixed': '/per item',
        'ml_fixed': '/ml',
        'per_pod_or_cartridge': '/per pod',
    }

    const columns = [
        { name: "state", renderer: (state_taxes) => <div>{state_taxes.state_name}</div> },
        { name: "E-Liquid", renderer: (state_taxes) => tax_value_renderer(state_taxes['PACT-eliquid']) },
        { name: "0% Nicotine", renderer: (state_taxes) => tax_value_renderer(state_taxes['PACT-eliquid_freebase']) },
        { name: "PRE-FILLED / POD", renderer: (state_taxes) => tax_value_renderer(state_taxes['PACT-prefilled-pods']) },
        { name: "DEVICES & KITS", renderer: (state_taxes) => tax_value_renderer(state_taxes['PACT-device']) },
        { name: "ACCESSORIES", renderer: (state_taxes) => tax_value_renderer(state_taxes['PACT-accessory']) },
    ]

    const tax_value_renderer = (tax_rate) => {
        if (!tax_rate || !tax_rate.value)
            return <TextStyle variation="subdued">No tax</TextStyle>
        return <div> {tax_rate.value}{tax_type_suffixes[tax_rate.taxType]}</div>
    }

    return <>
        <DataTable
            columnContentTypes={[
                'text',
                'text',
                'text',
                'text',
                'text',
                'text'
            ]}
            headings={[
                'State',
                'E-Liquid',
                '0% Nicotine',
                'Pre-filled / Pod',
                'Devices & Kits',
                'Accessories'
            ]}
            rows={taxRateRows}
        />

    </>
}