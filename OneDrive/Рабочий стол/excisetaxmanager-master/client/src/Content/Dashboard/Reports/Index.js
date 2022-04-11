import React, { Component, useState, useEffect, useCallback } from 'react';

import { useHistory, useRouteMatch } from "react-router-dom";
import { Tabs, Card, DataTable, Page, Icon, Button, ButtonGroup, Link } from '@shopify/polaris';
import { toArrayOfProps, Column } from "../../../utils/dataTableHelper"
import { PlusMinor } from '@shopify/polaris-icons';
import { syncAllProducts, getAll, getPending, getApproved } from '../../../services/products'
import ProductsList from './List'

const Products = () => {

  const [syncInProgress, setSyncInProgress] = useState(false);
  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );


  const onSyncProducts = () => {
    setSyncInProgress(true)
    syncAllProducts().then(data => { setSyncInProgress(false) }).catch(e => { })
  }

  const actions = <ButtonGroup>
    <Button loading={syncInProgress} onClick={onSyncProducts}>Sync products</Button>
  </ButtonGroup>

  const tabs = [
    {
      id: 'all-products',
      content: 'All',
      panelID: 'all-products',
      getter: getAll
    },
    {
      id: 'pending-products',
      content: 'Pending',
      panelID: 'pending-products',
      getter: getPending
    },
    {
      id: 'approved-products',
      content: 'Approved',
      panelID: 'approved-products',
      getter: getApproved
    },
  ];

  return (
    <Page title="Products"
      fullWidth
      primaryAction={actions}
    >
      <Card>
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
          <Card.Section>
            <ProductsList producstGetter={syncInProgress ? null : tabs[selected].getter} />
          </Card.Section>
        </Tabs>
      </Card>
    </Page>
  );
}

export default Products;
