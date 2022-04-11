import React, { Component, useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useRouteMatch, useHistory } from "react-router-dom";
import MainRoutes from "./MainRoutes"
import { AppProvider, TopBar, Frame, Layout, ContextualSaveBar, Navigation, Thumbnail, Link as PolarisLink } from '@shopify/polaris';
import { ArrowLeftMinor, SettingsMajor, ProductsMajor, HomeMajor, TaxMajor, ConversationMinor, OrdersMajor } from '@shopify/polaris-icons';
import { getShopData } from '../../services/shop'

import '@shopify/polaris/dist/styles.css';
import LeftMenu from "./LeftMenu"
import Link from "../Helpers/Link"
export default function Dashboard() {
  let match = useRouteMatch();
  const [searchFieldValue, setSearchFieldValue] = useState('');
  const [selectedNav, setSelectedNav] = useState("dashboard")
  const [shopData, setShopData] = useState({})

  const history = useHistory();

  useEffect(() => {
    getShopData().then(res => {
      setShopData(res.data)
    })
  }, [])

  const handleSearchChange = useCallback(
    (searchFieldValue) => setSearchFieldValue(searchFieldValue),
    [],
  );

  const theme = {
    colors: {
      topBar: {
        background: '#fff',
        margin: '10px 10px'
      },
    },
    logo: {
      width: 55,
      topBarSource: '/logo.svg',
      url: '#',
      accessibilityLabel: 'Excise tax manager',
      contextualSaveBarSource: '/logo.svg',
    },
  };

  const searchFieldMarkup = (
    <TopBar.SearchField
      placeholder="Search"
      value={searchFieldValue}
      onChange={handleSearchChange}
    />
  );
  const topBarMarkup = <TopBar userMenu={<span style={{ marginRight: '20px' }}><Link url={`https://${shopData.myshopify_domain}/admin`} >
    {shopData.name}
  </Link></span>} />;

  return (<div style={{ height: '250px' }}>
    <AppProvider
      theme={theme}
      linkComponent={Link}
      i18n={{
        Polaris: {
          Frame: { skipToContent: 'Skip to content' },
          ContextualSaveBar: {
            save: 'Save',
            discard: 'Discard',
          },
          DropZone: {
            FileUpload: {
              actionTitleImage: "Add media",
              actionHintImage: "or drop files to upload"
            }
          }
        },
      }}
    >
      <Frame topBar={topBarMarkup} navigation={<LeftMenu shopData={shopData} />}>
        <Layout.Section>
          <MainRoutes />
        </Layout.Section>
      </Frame>
    </AppProvider>
  </div>)
}