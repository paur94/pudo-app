import React from 'react';
import { Link as RouterLink, useLocation, useRouteMatch } from 'react-router-dom';
import { Navigation } from '@shopify/polaris';
import { ArrowLeftMinor,InventoryMajor, SettingsMajor, ProductsMajor, HomeMajor, TaxMajor, ConversationMinor, OrdersMajor } from '@shopify/polaris-icons';

export default function LeftMenu({shopData}) {
  let match = useRouteMatch();
  let location = useLocation();
  return (
    <Navigation location="/">
    <Navigation.Section
      items={[
        {
          url: shopData ? `https://${shopData.myshopify_domain}/admin` : '#',
          label: 'Back to Shopify',
          icon: ArrowLeftMinor,
        },
      ]}
    />
    <Navigation.Section
      separator
      title="Excise tax manager"
      items={[
        {
          url: `${match.url}`,
          label: 'Dashboard',
          icon: HomeMajor,
          selected: location.pathname == "/dashboard" || location.pathname == "/dashboard/"
        },
        {
          url: `${match.url}/Sales`,
          label: 'Sales',
          icon: OrdersMajor,
          selected: location.pathname == "/dashboard/Sales" || location.pathname == "/dashboard/Sales/"
        },
        {
          url: `${match.url}/TaxRates`,
          label: 'TaxRates',
          icon: TaxMajor,
          selected: location.pathname == "/dashboard/TaxRates"|| location.pathname == "/dashboard/TaxRates/"
        },
        {
          url: `${match.url}/Products`,
          label: 'Products',
          icon: ProductsMajor,
          selected: location.pathname == "/dashboard/Products"|| location.pathname == "/dashboard/Products/"
        },
        // {
        //   url: `${match.url}/Inventory`,
        //   label: 'Inventory',
        //   icon: InventoryMajor,
        //   selected: location.pathname == "/dashboard/Inventory"
        // },
        {
          url: `${match.url}/Settings`,
          label: 'Settings',
          icon: SettingsMajor,
          selected: location.pathname == "/dashboard/Settings"|| location.pathname == "/dashboard/Settings/"
        },
      ]}
      action={{
        icon: ConversationMinor,
        accessibilityLabel: 'Contact support',
        //   onClick: toggleModalActive,
      }}
    />
  </Navigation>
  );
}