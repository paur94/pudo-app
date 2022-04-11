const main_template = (data) => `<style>
    table,
    th,
    td {
        border: 1px solid black;
        border-collapse: collapse;
        min-height:30px;
    }

    th {
        font-weight: 500;
    }

    .header-notice {
        font-size: 0.58em;
        text-align: left;
    }

    .table-name {
        font-weight: bold;
    }

    td div {
        text-align: center;
    }

    table {
        margin-bottom: 15px;
    }
    .sales_table tr{
        height:30px;
    }
    .sales_table th {
        font-weight: bold;
    }
    table.no-borders, .no-borders th, .no-borders td {
        border: none !important;
    }
</style>

<body style="font-family: 'Arial';padding: 20px;">
    <div>
    <table style="width:100%;">
        <tbody style="font-size: 0.8em;" class="no-borders">
            <tr>
                <th style="width:60%;text-align:left;">
                    <div style="font-size:0.65em">CDTFA-5204-PA-3 (FRONT) (3-21)</div>
                    <div style="font-weight:bold;">CALIFORNIA ELECTRONIC NICOTINE DELIVERY SYSTEMS (ENDS) PACT ACT REPORT</div>
                </th>
                <th style="text-align:right;">
                    <div style="font-size:0.65em">STATE OF CALIFORNIA</div>
                    <div>CALIFORNIA DEPARTMENT OF TAX AND FEE ADMINISTRATION</div>
                </th>
            </tr>
        </tbody>
    </table>
        <div style="float: left;">
        </div>        
        <div style="float: right;">
            
        </div>

    </div>

    <div style="float: right;">
        <div class="table-name">Part 1 - Identify Your Business</div>
        <table style="width:100%; font-size:0.8em">
            <tbody>
                <tr>
                    <th colspan="4">
                        <div class="header-notice">Name - please print</div>
                        <div>${data.shop.full_name}</div>
                    </th>
                    <th>
                        <div class="header-notice">Reporting Period - MM/DD/YYYY</div>
                        <div>${(new Date(data.period.from)).toLocaleDateString()} - ${(new Date(data.period.to)).toLocaleDateString()}</div>
                    </th>
                    <th>
                        <div class="header-notice">State Identification Number</div>
                        <div>${data.shop.state}</div>
                    </th>
                </tr>
                <tr>
                    <td width: 30%;>
                        <div class="header-notice">Location Address - number and street</div>
                        <div>${data.shop.address}</div>
                    </td>
                    <td>
                        <div class="header-notice">City</div>
                        <div>${data.shop.city}</div>
                    </td>
                    <td>
                        <div class="header-notice">State - province</div>
                        <div>${data.shop.state}</div>
                    </td>
                    <td>
                        <div class="header-notice">Zip Code - Postal Code</div>
                        <div>${data.shop.zip}</div>
                    </td>
                    <td>
                        <div class="header-notice">Country - Territory</div>
                        <div>${data.shop.territory}</div>
                    </td>
                    <td>
                        <div class="header-notice">Federal Employee Identification Number</div>
                        <div>${data.shop.emp_number}</div>
                    </td>
                </tr>

                <tr>
                    <td width: 30%;>
                        <div class="header-notice">Mailing Address</div>
                        <div>${data.shop.mailing_address}</div>
                    </td>
                    <td>
                        <div class="header-notice">City</div>
                        <div>${data.shop.mailing_city}</div>
                    </td>
                    <td>
                        <div class="header-notice">State - province</div>
                        <div>${data.shop.mailing_state}</div>
                    </td>
                    <td>
                        <div class="header-notice">Zip Code - Postal Code</div>
                        <div>${data.shop.mailing_zip}</div>
                    </td>
                    <td>
                        <div class="header-notice">Country - Territory</div>
                        <div>${data.shop.mailing_territory}</div>
                    </td>
                    <td>
                        <div class="header-notice">Email Address</div>
                        <div>${data.shop.email}</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="table-name">Part 2 - Identify Your Sales</div>
        <table style="width:100%;word-wrap:break-word;table-layout: fixed;" class="sales_table">
            <tbody style=" font-size: 0.58em;">
                <tr>
                    <th style="  width: 13%;">
                        <div>PURCHASER NAME</div>
                    </th>
                    <th style=" width: 27%;">
                        <div>ADDRESS</div>
                    </th>
                    <th>
                        <div>TYPE</div>
                    </th>
                    <th style=" width: 15%;">
                        <div > BRAND FAMILY </div>
                    </th>
                    <th>
                        <div>INVOICE DATE</div>
                    </th>
                    <th>
                        <div>INVOICE NUMBER</div>
                    </th>
                    <th style=" width: 10%;">
                        <div>UPC</div>
                    </th>
                    <th style=" width: 4%;">
                        <div>QUANTITY</div>
                    </th>
                    <th>
                        <div>RETAIL SALES PRICE</div>
                    </th>
                    <th style=" width: 7%;">
                        <div>MANUFACTURER'S/WHOLESALE LIST PRICE</div>
                    </th>
                </tr>
                ${data.sale_items.map((item, index) => sale_item_template(item, index)).join("")}
                ${totals_template(data.totals)}
            </tbody>
        </table>

        <div class="table-name">Part 3 - Identify Your Delivery Service - Required for Delivery Sellers ONLY</div>
        <table style="width:100%;" class="sales_table">
            <tbody style=" font-size: 0.65em;">
                <tr>
                    <th>
                        <div>Delivery Service Name</div>
                    </th>
                    <th>
                        <div>Address</div>
                    </th>
                    <th>
                        <div>Phone number</div>
                    </th>
                </tr>
                ${data.delivery_services.map((item, index) => delivery_service_template(item)).join("")}
            </tbody>
        </table>

        <div class="table-name">Part 4 - Sign Below</div>
        <div style="font-size:0.65em;font-style: italic;">DECLARATION: I declare under penalties of perjury that I have examined this report and all attachments and to the best of my knowledge and belief it is true, correct and complete.</div>
        <table style="width:100%;">
            <tbody style=" font-size: 0.65em;">
                <tr>
                    <th>
                        <div class="header-notice">Signature of Responsible Party</div>
                        <div style="visibility:hidden">-</div>
                    </th>
                    <th>
                        <div class="header-notice">Responsible Party’s Name – please print</div>
                        <div>${data.shop.resp.name}</div>
                    </th>
                    <th>
                        <div class="header-notice">Title</div>
                        <div>${data.shop.resp.title}</div>
                    </th>
                    <th>
                        <div class="header-notice">Phone number</div>
                        <div>${data.shop.resp.phone_number}</div>
                    </th>
                    <th>
                        <div class="header-notice">Date</div>
                        <div>6/10/21</div>
                    </th>
                </tr>
            </tbody>
        </table>
    </div>
</body>`


const sale_item_template = (data, index) => ` <tr>
        <td><div>${data.customer_name}</div></td>
        <td><div>${data.address}</div></td>
        <td><div>${data.type}</div></td>
        <td><div>${data.brand_family}</div></td>
        <td><div>${data.invoice_date}</div></td>
        <td><div>${data.invoice_number}</div></td>
        <td><div>${data.barcode}</div></td>
        <td><div>${data.quantity}</div></td>
        <td><div>$${Math.round(data.sales_price * 100) / 100}</div></td>
        <td><div>$${Math.round(data.cost * 100) / 100}</div></td>
    </tr>`

const totals_template = (totals) => `<tr>
        <td style="visibility:collapse"></td>
        <td style="visibility:collapse"></td>
        <td style="visibility:collapse"></td>
        <td style="visibility:collapse"></td>
        <td style="visibility:collapse"></td>
        <td style="visibility:collapse;border: none;"></td>
        <td style="border-bottom: 1px solid white;border-left: 1px solid white;font-size:1em;text-align: center;"><strong>Total</strong></td>
        <td><div>${totals.quantity}</div></td>
        <td><div>$${Math.round(totals.price * 100) / 100}</div></td>
        <td><div>$${Math.round(totals.cost * 100) / 100}</div></td>
    </tr>`

const delivery_service_template = (data) => ` <tr>
    <td><div>${data.name}</div></td>
    <td><div>${data.address}</div></td>
    <td><div>${data.pone_number}</div></td>
</tr>`

module.exports = { main_template, sale_item_template, totals_template }