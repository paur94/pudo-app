import React, { Component, useState, useEffect, useRef, useCallback } from 'react';

import { useHistory, useRouteMatch } from "react-router-dom";
import { Select, Card, DataTable, Page, Icon, Button, ButtonGroup, Link, TextContainer, Modal, TextField, FormLayout, Checkbox } from '@shopify/polaris';
import { toArrayOfProps, Column } from "../../../utils/dataTableHelper"
import { PlusMinor } from '@shopify/polaris-icons';
import { getAll, create, getByState } from '../../../services/taxRates'
import TaxRates from './TaxRates'

const List = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState();
  const [page, setPage] = useState(1);

  const [newTaxRate, setNewtaxRate] = useState({})
  const [createError, setCreateError] = useState("")

  const history = useHistory();
  let grid = null;
  let match = useRouteMatch();

  const [syncInProgress, setSyncInProgress] = useState(false);
  const [active, setActive] = useState(false);
  const buttonRef = useRef(null);
  const handleOpen = useCallback(() => setActive(true), [])

  const handleClose = useCallback(() => {
    setActive(false);
  }, [])

  const createTaxRate = () => {
    setCreateError("")
    create(newTaxRate).then(data => {
      setNewtaxRate({})
      handleClose()
    }).catch(err => {
      setCreateError(err)
    })
  }

  const actions = <ButtonGroup>
    <Button ref={buttonRef} primary onClick={handleOpen}>Add tax rate</Button>
  </ButtonGroup>

  const product_types = [
    { name: '', tag: '' },
    { name: "E-liquids", tag: "PACT-eliquid" },
    { name: "Disposable", tag: "PACT-disposable" },
    { name: "Prefilled Pods", tag: "PACT-prefilled-pods" },
    { name: "DEVICES & COMPLETE KITS", tag: "PACT-device" },
    { name: "ACCESSORIES", tag: "PACT-accessory" },
    { name: "Non-taxable accessories such as Batteries, chargers & cases", tag: "PACT-no-tax" },
  ]

  const tax_type_options = [
    { label: '', value: '' },
    { label: 'Percent of cost %', value: 'cost_percent' },
    { label: 'Price percent %', value: 'price_percent' },
    { label: 'Fixed $', value: 'item_fixed' },
    { label: 'For each ML', value: 'ml_fixed' },
    { label: 'Per pod or cartridge', value: "per_pod_or_cartridge" }
  ]

  const unit_options = [
    { label: "", value: "" },
    { label: "ML", value: "ml" },
    { label: "MG", value: "mg" }
  ]

  const states = [{ "name": "", "abbreviation": "" }, { "name": "Alabama", "abbreviation": "AL" }, { "name": "Alaska", "abbreviation": "AK" }, { "name": "American Samoa", "abbreviation": "AS" }, { "name": "Arizona", "abbreviation": "AZ" }, { "name": "Arkansas", "abbreviation": "AR" }, { "name": "California", "abbreviation": "CA" }, { "name": "Colorado", "abbreviation": "CO" }, { "name": "Connecticut", "abbreviation": "CT" }, { "name": "Delaware", "abbreviation": "DE" }, { "name": "District Of Columbia", "abbreviation": "DC" }, { "name": "Federated States Of Micronesia", "abbreviation": "FM" }, { "name": "Florida", "abbreviation": "FL" }, { "name": "Georgia", "abbreviation": "GA" }, { "name": "Guam", "abbreviation": "GU" }, { "name": "Hawaii", "abbreviation": "HI" }, { "name": "Idaho", "abbreviation": "ID" }, { "name": "Illinois", "abbreviation": "IL" }, { "name": "Indiana", "abbreviation": "IN" }, { "name": "Iowa", "abbreviation": "IA" }, { "name": "Kansas", "abbreviation": "KS" }, { "name": "Kentucky", "abbreviation": "KY" }, { "name": "Louisiana", "abbreviation": "LA" }, { "name": "Maine", "abbreviation": "ME" }, { "name": "Marshall Islands", "abbreviation": "MH" }, { "name": "Maryland", "abbreviation": "MD" }, { "name": "Massachusetts", "abbreviation": "MA" }, { "name": "Michigan", "abbreviation": "MI" }, { "name": "Minnesota", "abbreviation": "MN" }, { "name": "Mississippi", "abbreviation": "MS" }, { "name": "Missouri", "abbreviation": "MO" }, { "name": "Montana", "abbreviation": "MT" }, { "name": "Nebraska", "abbreviation": "NE" }, { "name": "Nevada", "abbreviation": "NV" }, { "name": "New Hampshire", "abbreviation": "NH" }, { "name": "New Jersey", "abbreviation": "NJ" }, { "name": "New Mexico", "abbreviation": "NM" }, { "name": "New York", "abbreviation": "NY" }, { "name": "North Carolina", "abbreviation": "NC" }, { "name": "North Dakota", "abbreviation": "ND" }, { "name": "Northern Mariana Islands", "abbreviation": "MP" }, { "name": "Ohio", "abbreviation": "OH" }, { "name": "Oklahoma", "abbreviation": "OK" }, { "name": "Oregon", "abbreviation": "OR" }, { "name": "Palau", "abbreviation": "PW" }, { "name": "Pennsylvania", "abbreviation": "PA" }, { "name": "Puerto Rico", "abbreviation": "PR" }, { "name": "Rhode Island", "abbreviation": "RI" }, { "name": "South Carolina", "abbreviation": "SC" }, { "name": "South Dakota", "abbreviation": "SD" }, { "name": "Tennessee", "abbreviation": "TN" }, { "name": "Texas", "abbreviation": "TX" }, { "name": "Utah", "abbreviation": "UT" }, { "name": "Vermont", "abbreviation": "VT" }, { "name": "Virgin Islands", "abbreviation": "VI" }, { "name": "Virginia", "abbreviation": "VA" }, { "name": "Washington", "abbreviation": "WA" }, { "name": "West Virginia", "abbreviation": "WV" }, { "name": "Wisconsin", "abbreviation": "WI" }, { "name": "Wyoming", "abbreviation": "WY" }]

  const product_type_options = product_types.map(pt => {
    return { label: pt.name, value: pt.tag }
  })

  const state_options = states.map(state => {
    return { label: state.name, value: state.abbreviation }
  })

  return (
    <Page title="Tax Rates"
      fullWidth
    >

      <Card>
        <TaxRates taxRateGetter={getByState} />
      </Card>

      <Modal
        activator={buttonRef}
        open={active}
        onClose={handleClose}
        title="Add new tax rate"
        primaryAction={{
          content: 'Create',
          onAction: createTaxRate,
        }}
        secondaryActions={[
          {
            content: 'Cancle',
            onAction: handleClose,
          },
        ]}
      >
        <Modal.Section>
          {createError}
          <FormLayout>
            <FormLayout.Group>
              <Select
                label="State"
                options={state_options}
                onChange={(value, id) => {
                  setNewtaxRate({ ...newTaxRate, ["state_shortcode"]: value, ["state_name"]: states.find(state => state.abbreviation == value).name })
                }}
                value={newTaxRate.state_shortcode}
              />

              <Select
                label="Products"
                options={product_type_options}
                onChange={(value, id) => {
                  setNewtaxRate({ ...newTaxRate, ["tax_tag"]: value, ["tax_name"]: product_types.find(pt => pt.tag == value).name })
                }}
                value={newTaxRate.tax_tag}
              />

              <Select
                label="Tax type"
                options={tax_type_options}
                onChange={(value, id) => {
                  setNewtaxRate({ ...newTaxRate, ["taxType"]: value })
                }}
                value={newTaxRate.taxType}
              />
              <TextField label="Value" value={newTaxRate.value} onChange={(value) => setNewtaxRate({ ...newTaxRate, ["value"]: value })} />

            </FormLayout.Group>

            <Checkbox
              label="Has bounds"
              checked={newTaxRate["has_bounds"]}
              onChange={(value) => {
                setNewtaxRate({ ...newTaxRate, ["has_bounds"]: value })
              }}
            />
            {
              newTaxRate["has_bounds"] &&
              <FormLayout.Group condensed>
                <Select
                  label="Unit"
                  options={unit_options}
                  onChange={(value, id) => {
                    setNewtaxRate({ ...newTaxRate, ["bound_unit"]: value })
                  }}
                  value={newTaxRate.bound_unit}
                />
                <TextField
                  label="Minimum"
                  type="number"
                  value={newTaxRate.bound_min}
                  onChange={(value) => setNewtaxRate({ ...newTaxRate, ["bound_min"]: value })}
                />
                <TextField
                  label="Maximum"
                  type="number"
                  value={newTaxRate.bound_max}
                  onChange={(value) => setNewtaxRate({ ...newTaxRate, ["bound_max"]: value })}
                />
              </FormLayout.Group>
            }
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

export default List;
