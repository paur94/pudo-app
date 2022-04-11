import React, { Component, useState, useEffect, useCallback } from 'react';


import { useHistory, useRouteMatch } from "react-router-dom";
import { Tabs, Card, DataTable, Page, Icon, Button, ButtonGroup, Link } from '@shopify/polaris';
import { toArrayOfProps, Column } from "../../../utils/dataTableHelper"
import { PlusMinor } from '@shopify/polaris-icons';
import { getAll, syncOrders } from '../../../services/sales'
import SalesList from './List'

const Sales = () => {
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );

  
  const onSyncOrders = () => {
    setSyncInProgress(true)
    syncOrders().then(data => { 
      setSyncInProgress(false) 
    }).catch(e => {
     })
  }

  const tabs = [
    {
      id: 'all-sales',
      content: 'All',
      panelID: 'all-sales',
      getter: getAll
    }
  ];

  const actions = <ButtonGroup>
    <Button loading={syncInProgress} onClick={onSyncOrders}>Sync orders</Button>
  </ButtonGroup>

  return (
    <Page title="Sales"
      fullWidth
    >
      <Card>
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
          <Card.Section>
            <SalesList salesGetter={tabs[selected].getter} />
          </Card.Section>
        </Tabs>
      </Card>
    </Page>
  );
}

export default Sales;
