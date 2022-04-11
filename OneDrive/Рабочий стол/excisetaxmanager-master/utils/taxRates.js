const INITIAL_RATES = [{
  "tax": {
    "name": "Non-taxable accessories such as Batteries, chargers & cases",
    "tag": "PACT-no-tax"
  },
  "state": {
    "name": "Massachusetts",
    "shortcode": "MA"
  },
  "taxType": "cost_percent",
  "value": 75
}, {

  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Nevada",
    "shortcode": "NV"
  },
  "taxType": "cost_percent",
  "value": 30
}, {

  "tax": {
    "name": "DEVICES & COMPLETE KITS",
    "tag": "PACT-device"
  },
  "state": {
    "name": "Nevada",
    "shortcode": "NV"
  },
  "taxType": "cost_percent",
  "value": 30
}, {

  "tax": {
    "name": "DEVICES & COMPLETE KITS",
    "tag": "PACT-device"
  },
  "state": {
    "name": "Pennsylvania",
    "shortcode": "PA"
  },
  "taxType": "cost_percent",
  "value": 40
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Colorado",
    "shortcode": "CO"
  },
  "taxType": "cost_percent",
  "value": 30,
  "bound": {
    "unit": "mg",
    "min": 0.001
  }
}, {
  "tax": {
    "name": "ACCESSORIES",
    "tag": "PACT-accessory"
  },
  "state": {
    "name": "Illinois",
    "shortcode": "IL"
  },
  "taxType": "cost_percent",
  "value": 15
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Kansas",
    "shortcode": "KS"
  },
  "taxType": "ml_fixed",
  "value": 0.05
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "New Hampshire",
    "shortcode": "NH"
  },
  "taxType": "ml_fixed",
  "value": 0.3
}, {
  "tax": {
    "name": "ACCESSORIES",
    "tag": "PACT-accessory"
  },
  "state": {
    "name": "New Hampshire",
    "shortcode": "NH"
  },
  "taxType": "cost_percent",
  "value": 8
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "New Jersey",
    "shortcode": "NJ"
  },
  "taxType": "ml_fixed",
  "value": 0.1
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Ohio",
    "shortcode": "OH"
  },
  "taxType": "ml_fixed",
  "value": 0.1
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Virginia",
    "shortcode": "VA"
  },
  "taxType": "ml_fixed",
  "value": 0.066
}, {
  "tax": {
    "name": "DEVICES & COMPLETE KITS",
    "tag": "PACT-device"
  },
  "state": {
    "name": "Wyoming",
    "shortcode": "WY"
  },
  "taxType": "cost_percent",
  "value": 15
}, {
  "tax": {
    "name": "ACCESSORIES",
    "tag": "PACT-accessory"
  },
  "state": {
    "name": "Massachusetts",
    "shortcode": "MA"
  },
  "taxType": "cost_percent",
  "value": 75
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Pennsylvania",
    "shortcode": "PA"
  },
  "taxType": "cost_percent",
  "value": 40
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Illinois",
    "shortcode": "IL"
  },
  "taxType": "cost_percent",
  "value": 15
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Minnesota",
    "shortcode": "MN"
  },
  "taxType": "price_percent",
  "value": 95
}, {

  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "District Of Columbia",
    "shortcode": "DC"
  },
  "taxType": "cost_percent",
  "value": 91
}, {
  "tax": {
    "name": "Non-taxable accessories such as Batteries, chargers & cases",
    "tag": "PACT-no-tax"
  },
  "state": {
    "name": "Nevada",
    "shortcode": "NV"
  },
  "taxType": "cost_percent",
  "value": 30
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "District Of Columbia",
    "shortcode": "DC"
  },
  "taxType": "cost_percent",
  "value": 91,
  "bound": {
    "unit": "mg",
    "min": 0.001
  }
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Louisiana",
    "shortcode": "LA"
  },
  "taxType": "ml_fixed",
  "value": 0.05
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Maryland",
    "shortcode": "MD"
  },
  "taxType": "price_percent",
  "value": 12,
  "bound": {
    "unit": "mg",
    "min": 0.001
  }
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Maryland",
    "shortcode": "MD"
  },
  "taxType": "price_percent",
  "value": 60
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "New Hampshire",
    "shortcode": "NH"
  },
  "taxType": "cost_percent",
  "value": 8,
  "bound": {
    "unit": "mg",
    "min": 0.001
  }
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "New Jersey",
    "shortcode": "NJ"
  },
  "taxType": "ml_fixed",
  "value": 0.1
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "New York",
    "shortcode": "NY"
  },
  "taxType": "price_percent",
  "value": 20
}, {
  "tax": {
    "name": "DEVICES & COMPLETE KITS",
    "tag": "PACT-device"
  },
  "state": {
    "name": "District Of Columbia",
    "shortcode": "DC"
  },
  "taxType": "cost_percent",
  "value": 91
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Kansas",
    "shortcode": "KS"
  },
  "taxType": "ml_fixed",
  "value": 0.05,
  "bound": {
    "unit": "mg",
    "min": 0.001
  }
}, {
  "tax": {
    "name": "Non-taxable accessories such as Batteries, chargers & cases",
    "tag": "PACT-no-tax"
  },
  "state": {
    "name": "New Hampshire",
    "shortcode": "NH"
  },
  "taxType": "cost_percent",
  "value": 8
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "North Carolina",
    "shortcode": "NC"
  },
  "taxType": "ml_fixed",
  "value": 0.05
}, {
  "tax": {
    "name": "DEVICES & COMPLETE KITS",
    "tag": "PACT-device"
  },
  "state": {
    "name": "Minnesota",
    "shortcode": "MN"
  },
  "taxType": "price_percent",
  "value": 95
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Colorado",
    "shortcode": "CO"
  },
  "taxType": "cost_percent",
  "value": 30
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "District Of Columbia",
    "shortcode": "DC"
  },
  "taxType": "cost_percent",
  "value": 91
}, {
  "tax": {
    "name": "ACCESSORIES",
    "tag": "PACT-accessory"
  },
  "state": {
    "name": "District Of Columbia",
    "shortcode": "DC"
  },
  "taxType": "cost_percent",
  "value": 91
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Maryland",
    "shortcode": "MD"
  },
  "taxType": "price_percent",
  "value": 60
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "New York",
    "shortcode": "NY"
  },
  "taxType": "price_percent",
  "value": 20
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Ohio",
    "shortcode": "OH"
  },
  "taxType": "ml_fixed",
  "value": 0.1
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Oregon",
    "shortcode": "OR"
  },
  "taxType": "cost_percent",
  "value": 65,
  "bound": {
    "unit": "mg",
    "min": 0.001
  }
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Oregon",
    "shortcode": "OR"
  },
  "taxType": "cost_percent",
  "value": 65
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "West Virginia",
    "shortcode": "WV"
  },
  "taxType": "ml_fixed",
  "value": 0.075
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Wyoming",
    "shortcode": "WY"
  },
  "taxType": "cost_percent",
  "value": 15
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Delaware",
    "shortcode": "DE"
  },
  "taxType": "ml_fixed",
  "value": 0.05
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Kansas",
    "shortcode": "KS"
  },
  "taxType": "ml_fixed",
  "value": 0.05
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Washington",
    "shortcode": "WA"
  },
  "taxType": "ml_fixed",
  "value": 0.27
}, {
  "tax": {
    "name": "ACCESSORIES",
    "tag": "PACT-accessory"
  },
  "state": {
    "name": "Minnesota",
    "shortcode": "MN"
  },
  "taxType": "price_percent",
  "value": 95
}, {
  "tax": {
    "name": "ACCESSORIES",
    "tag": "PACT-accessory"
  },
  "state": {
    "name": "Maryland",
    "shortcode": "MD"
  },
  "taxType": "price_percent",
  "value": 12
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "North Carolina",
    "shortcode": "NC"
  },
  "taxType": "ml_fixed",
  "value": 0.05,
  "bound": {
    "unit": "mg",
    "min": 0.001
  }
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "North Carolina",
    "shortcode": "NC"
  },
  "taxType": "ml_fixed",
  "value": 0.05
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Virginia",
    "shortcode": "VA"
  },
  "taxType": "ml_fixed",
  "value": 0.066
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Connecticut",
    "shortcode": "CT"
  },
  "taxType": "ml_fixed",
  "value": 0.4
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Georgia",
    "shortcode": "GA"
  },
  "taxType": "ml_fixed",
  "value": 0.05
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Illinois",
    "shortcode": "IL"
  },
  "taxType": "cost_percent",
  "value": 15
}, {
  "tax": {
    "name": "Non-taxable accessories such as Batteries, chargers & cases",
    "tag": "PACT-no-tax"
  },
  "state": {
    "name": "Kentucky",
    "shortcode": "KY"
  },
  "taxType": "cost_percent",
  "value": 15
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Louisiana",
    "shortcode": "LA"
  },
  "taxType": "ml_fixed",
  "value": 0.05,
  "bound": {
    "unit": "mg",
    "min": 0.001
  }
}, {
  "tax": {
    "name": "DEVICES & COMPLETE KITS",
    "tag": "PACT-device"
  },
  "state": {
    "name": "New York",
    "shortcode": "NY"
  },
  "taxType": "price_percent",
  "value": 20
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Washington",
    "shortcode": "WA"
  },
  "taxType": "ml_fixed",
  "value": 0.09
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Washington",
    "shortcode": "WA"
  },
  "taxType": "ml_fixed",
  "value": 0.27
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Wyoming",
    "shortcode": "WY"
  },
  "taxType": "cost_percent",
  "value": 15
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Nevada",
    "shortcode": "NV"
  },
  "taxType": "cost_percent",
  "value": 30
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Pennsylvania",
    "shortcode": "PA"
  },
  "taxType": "cost_percent",
  "value": 40
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Georgia",
    "shortcode": "GA"
  },
  "taxType": "cost_percent",
  "value": 7
}, {
  "tax": {
    "name": "DEVICES & COMPLETE KITS",
    "tag": "PACT-device"
  },
  "state": {
    "name": "Kentucky",
    "shortcode": "KY"
  },
  "taxType": "cost_percent",
  "value": 15
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Wyoming",
    "shortcode": "WY"
  },
  "taxType": "cost_percent",
  "value": 15,
  "bound": {
    "unit": "mg",
    "min": 0.001
  }
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Massachusetts",
    "shortcode": "MA"
  },
  "taxType": "cost_percent",
  "value": 75
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Connecticut",
    "shortcode": "CT"
  },
  "taxType": "cost_percent",
  "value": 10,
  "bound": {
    "unit": "mg",
    "min": 0.001
  }
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Illinois",
    "shortcode": "IL"
  },
  "taxType": "cost_percent",
  "value": 15
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Kentucky",
    "shortcode": "KY"
  },
  "taxType": "cost_percent",
  "value": 15
}, {
  "tax": {
    "name": "ACCESSORIES",
    "tag": "PACT-accessory"
  },
  "state": {
    "name": "Kentucky",
    "shortcode": "KY"
  },
  "taxType": "cost_percent",
  "value": 15
}, {
  "tax": {
    "name": "DEVICES & COMPLETE KITS",
    "tag": "PACT-device"
  },
  "state": {
    "name": "Maryland",
    "shortcode": "MD"
  },
  "taxType": "price_percent",
  "value": 12
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "New Mexico",
    "shortcode": "NM"
  },
  "taxType": "per_pod_or_cartridge",
  "value": 0.5
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "West Virginia",
    "shortcode": "WV"
  },
  "taxType": "ml_fixed",
  "value": 0.075
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Minnesota",
    "shortcode": "MN"
  },
  "taxType": "price_percent",
  "value": 95
}, {
  "tax": {
    "name": "ACCESSORIES",
    "tag": "PACT-accessory"
  },
  "state": {
    "name": "Nevada",
    "shortcode": "NV"
  },
  "taxType": "cost_percent",
  "value": 30
}, {
  "tax": {
    "name": "DEVICES & COMPLETE KITS",
    "tag": "PACT-device"
  },
  "state": {
    "name": "Connecticut",
    "shortcode": "CT"
  },
  "taxType": "cost_percent",
  "value": 10
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Delaware",
    "shortcode": "DE"
  },
  "taxType": "ml_fixed",
  "value": 0.05
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "New Jersey",
    "shortcode": "NJ"
  },
  "taxType": "price_percent",
  "value": 10,
  "bound": {
    "unit": "mg",
    "min": 0.001
  }
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Oregon",
    "shortcode": "OR"
  },
  "taxType": "cost_percent",
  "value": 65
}, {
  "tax": {
    "name": "DEVICES & COMPLETE KITS",
    "tag": "PACT-device"
  },
  "state": {
    "name": "Massachusetts",
    "shortcode": "MA"
  },
  "taxType": "cost_percent",
  "value": 75
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "New Hampshire",
    "shortcode": "NH"
  },
  "taxType": "ml_fixed",
  "value": 0.3
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "New York",
    "shortcode": "NY"
  },
  "taxType": "price_percent",
  "value": 20
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Ohio",
    "shortcode": "OH"
  },
  "taxType": "ml_fixed",
  "value": 0.1,
  "bound": {
    "unit": "mg",
    "min": 0.001
  }
}, {
  "tax": {
    "name": "ACCESSORIES",
    "tag": "PACT-accessory"
  },
  "state": {
    "name": "Oregon",
    "shortcode": "OR"
  },
  "taxType": "cost_percent",
  "value": 12
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "West Virginia",
    "shortcode": "WV"
  },
  "taxType": "ml_fixed",
  "value": 0.075
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Massachusetts",
    "shortcode": "MA"
  },
  "taxType": "cost_percent",
  "value": 75
}, {
  "tax": {
    "name": "Non-taxable accessories such as Batteries, chargers & cases",
    "tag": "PACT-no-tax"
  },
  "state": {
    "name": "Minnesota",
    "shortcode": "MN"
  },
  "taxType": "price_percent",
  "value": 95
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Connecticut",
    "shortcode": "CT"
  },
  "taxType": "ml_fixed",
  "value": 0.4
}, {
  "tax": {
    "name": "ACCESSORIES",
    "tag": "PACT-accessory"
  },
  "state": {
    "name": "Connecticut",
    "shortcode": "CT"
  },
  "taxType": "cost_percent",
  "value": 10
}, {
  "tax": {
    "name": "DEVICES & COMPLETE KITS",
    "tag": "PACT-device"
  },
  "state": {
    "name": "New Hampshire",
    "shortcode": "NH"
  },
  "taxType": "cost_percent",
  "value": 8
}, {
  "tax": {
    "name": "ACCESSORIES",
    "tag": "PACT-accessory"
  },
  "state": {
    "name": "New York",
    "shortcode": "NY"
  },
  "taxType": "price_percent",
  "value": 20
}, {
  "tax": {
    "name": "ACCESSORIES",
    "tag": "PACT-accessory"
  },
  "state": {
    "name": "Wyoming",
    "shortcode": "WY"
  },
  "taxType": "cost_percent",
  "value": 15
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Massachusetts",
    "shortcode": "MA"
  },
  "taxType": "cost_percent",
  "value": 75
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Minnesota",
    "shortcode": "MN"
  },
  "taxType": "price_percent",
  "value": 95
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Nevada",
    "shortcode": "NV"
  },
  "taxType": "cost_percent",
  "value": 30
}, {
  "tax": {
    "name": "DEVICES & COMPLETE KITS",
    "tag": "PACT-device"
  },
  "state": {
    "name": "Illinois",
    "shortcode": "IL"
  },
  "taxType": "cost_percent",
  "value": 15
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Kentucky",
    "shortcode": "KY"
  },
  "taxType": "per_pod_or_cartridge",
  "value": 1.5
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Kentucky",
    "shortcode": "KY"
  },
  "taxType": "per_pod_or_cartridge",
  "value": 1.5
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Wisconsin",
    "shortcode": "WI"
  },
  "taxType": "ml_fixed",
  "value": 0.05
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Wisconsin",
    "shortcode": "WI"
  },
  "taxType": "ml_fixed",
  "value": 0.05
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Delaware",
    "shortcode": "DE"
  },
  "taxType": "ml_fixed",
  "value": 0.05,
  "bound": {
    "unit": "mg",
    "min": 0.001
  }
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Georgia",
    "shortcode": "GA"
  },
  "taxType": "cost_percent",
  "value": 7
}, {
  "tax": {
    "name": "Non-taxable accessories such as Batteries, chargers & cases",
    "tag": "PACT-no-tax"
  },
  "state": {
    "name": "New York",
    "shortcode": "NY"
  },
  "taxType": "price_percent",
  "value": 20
}, {
  "tax": {
    "name": "DEVICES & COMPLETE KITS",
    "tag": "PACT-device"
  },
  "state": {
    "name": "Oregon",
    "shortcode": "OR"
  },
  "taxType": "cost_percent",
  "value": 65
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "Pennsylvania",
    "shortcode": "PA"
  },
  "taxType": "cost_percent",
  "value": 40
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Colorado",
    "shortcode": "CO"
  },
  "taxType": "cost_percent",
  "value": 30
}, {
  "tax": {
    "name": "Prefilled Pods",
    "tag": "PACT-prefilled-pods"
  },
  "state": {
    "name": "Louisiana",
    "shortcode": "LA"
  },
  "taxType": "ml_fixed",
  "value": 0.05
}, {
  "tax": {
    "name": "E-liquids",
    "tag": "PACT-eliquid"
  },
  "state": {
    "name": "New Mexico",
    "shortcode": "NM"
  },
  "taxType": "cost_percent",
  "value": 12.5
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "New Mexico",
    "shortcode": "NM"
  },
  "taxType": "per_pod_or_cartridge",
  "value": 0.5
}, {
  "tax": {
    "name": "Disposable",
    "tag": "PACT-disposable"
  },
  "state": {
    "name": "Virginia",
    "shortcode": "VA"
  },
  "taxType": "ml_fixed",
  "value": 0.066
}]

const CATEGORY_TAGS = ["PACT-exclude", "PACT-eliquid", "PACT-disposable", "PACT-prefilled-pod", "PACT-device", "PACT-accessory", "PACT-no-tax"]

module.exports = { INITIAL_RATES, CATEGORY_TAGS }