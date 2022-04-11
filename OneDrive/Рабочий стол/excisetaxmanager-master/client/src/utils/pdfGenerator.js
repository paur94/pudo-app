import pdfMake from "pdfmake/build/pdfmake";
import vfsFonts from 'pdfmake/build/vfs_fonts'
import { NONAME } from "dns";
import CourierPrimeFonts from "../utils/fonts/CourierPrime"
export const exportPdfTable = (line_items, state, shop_data, date_from, date_to) => {
    const { vfs } = vfsFonts.pdfMake;
    pdfMake.vfs = { ...CourierPrimeFonts, ...vfs };
    const parsed_lines = line_items.map(line => [
        { text: line.customer_name, style: 'secondTableCol' },
        { text: line.address, style: 'secondTableCol' },
        { text: '4', style: 'secondTableCol' },
        { text: line.brand_family, style: 'secondTableCol' },
        { text: line.invoice_date, style: 'secondTableCol' },
        { text: line.invoice_number, style: 'secondTableCol' },
        { text: line.quantity, style: 'secondTableCol' },
        { text: 'N/A', style: 'secondTableCol' },
        { text: (line.item_weight * line.quantity).toFixed(2), style: 'secondTableCol' },
        { text: (line.item_retail_price * line.quantity).toFixed(2), style: 'secondTableCol' },
        { text: (line.item_cost * line.quantity).toFixed(2), style: 'secondTableCol' }
    ])

    const total_weight = line_items.reduce((accumulator, line) => accumulator + ((isNaN(line.item_weight) ? 0 : line.item_weight) * line.quantity), 0)
    const total_sales_price = line_items.reduce((accumulator, line) => accumulator + ((isNaN(line.item_retail_price) ? 0 : line.item_retail_price) * line.quantity), 0)
    const total_cost = line_items.reduce((accumulator, line) => accumulator + ((isNaN(line.item_cost) ? 0 : line.item_cost) * line.quantity), 0)

    pdfMake.tableLayouts = {
        lightborders: {
            hLineWidth: function (i, node) {
                return 0.5;
            },
            vLineWidth: function (i) {
                return 0.5;
            },
        }
    };

    pdfMake.fonts = {
        CourierPrime: {
            normal: 'CourierPrime-Regular.ttf',
            bold: 'CourierPrime-Bold.ttf',
            italics: 'CourierPrime-Italic.ttf',
            bolditalics: 'CourierPrime-BoldItalic.ttf'
        },
        Roboto: {
            normal: 'Roboto-Italic.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-MediumItalic.ttf'
        }
    }


    const o_parsed_lines = line_items.map(line => {

        const day = new Date(line.invoice_date).getDate().toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        })

        const month = (new Date(line.invoice_date).getMonth() + 1).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        })

        const year = new Date(line.invoice_date).getFullYear().toString()

        const brand_line_spaces = '                         '
        const brand = `${line.brand_family}${brand_line_spaces.slice(line.brand_family?.length)}`

        const buyer_line_spaces = '                         '
        const buyer = `${line.customer_name}${buyer_line_spaces.slice(line.customer_name?.length)}`


        //TODO identify delivery for the order
        const delivery = shop_data.delivery_services[0]

        const delivery_name_line_spaces = '                     '
        const delivery_name = `${delivery?.name || ''}${delivery_name_line_spaces.slice(delivery?.name?.length)}`

        const delivery_address_line_spaces = '                     '
        const delivery_address = `${delivery?.address || ''}${delivery_address_line_spaces.slice(delivery?.address?.length)}`

        const delivery_phone_line_spaces = '                     '
        const delivery_phone = `${delivery?.phone_number || ''}${delivery_phone_line_spaces.slice(delivery?.phone_number?.length)}`

        const delivery_fein_line_spaces = '                 '
        const delivery_fein = `${delivery?.fein || ''}${delivery_fein_line_spaces.slice(delivery?.fein?.length)}`

        const delivery_licence_line_spaces = '            '
        const delivery_licence = `${delivery?.licence || ''}${delivery_licence_line_spaces.slice(delivery?.licence?.length)}`


        const invoice_line_spaces = '                    '
        const invoice = `${line.invoice_number || ''}${invoice_line_spaces.slice(line.invoice_number?.length)}`

        const upc_line_spaces = '                        '
        const upc = `${line.barcode || ''}${upc_line_spaces.slice(line.barcode?.length)}`

        const buyer_address_line_spaces = '                     '
        const buyer_address = `${line.address || ''}${buyer_address_line_spaces.slice(line.address?.length)}`

        const total_weight = (line.item_weight * line.quantity).toFixed(2)
        const { quantity, contains_nicotine } = line

        const list_price_line_spaces = '                          '
        const line_price_raw = `${line.item_retail_price?.toFixed(2) || ''}`
        const list_price = `${line_price_raw}${list_price_line_spaces.slice(line_price_raw.length)}`

        const cost_line_spaces = '                        '
        const cost_raw = `${line.item_cost?.toFixed(2) || ''}`
        const cost = `${cost_raw}${cost_line_spaces.slice(cost_raw.length)}`

        const res = {
            unbreakable: true,
            stack: [{
                columns: [
                    {
                        margin: [0, 10, 0, 0],
                        width: '30%',
                        stack: [
                            {
                                text: [
                                    { text: 'Date: ', style: "stepOneTitle" },
                                    { text: month[0], decoration: 'underline', style: "subheader" },
                                    { text: '' },
                                    { text: month[1], decoration: 'underline', style: "subheader" },
                                    { text: ' / ' },
                                    { text: day[0], decoration: 'underline', style: "subheader" },
                                    { text: '' },
                                    { text: day[1], decoration: 'underline', style: "subheader" },
                                    { text: ' / ' },
                                    { text: year[0], decoration: 'underline', style: "subheader" },
                                    { text: '' },
                                    { text: year[1], decoration: 'underline', style: "subheader" },
                                    { text: '' },
                                    { text: year[2], decoration: 'underline', style: "subheader" },
                                    { text: '' },
                                    { text: year[3], decoration: 'underline', style: "subheader" },
                                    { text: ' ' },
                                ]
                            },
                            {
                                margin: [0, 10, 0, 0],
                                text: [
                                    { text: 'Brand:', style: 'stepOneTitle' },
                                    { text: brand, decoration: 'underline', style: "subheader" }
                                ]
                            },
                            {
                                margin: [0, 10, 0, 0],
                                text: [
                                    { text: 'Buyer:', style: 'stepOneTitle' },
                                    { text: buyer, decoration: 'underline', style: "subheader" }
                                ]
                            },

                        ],
                    },
                    {
                        width: '28%',
                        stack: [
                            {
                                margin: [0, 10, 0, 0],
                                text: [
                                    { text: 'Invoice:', style: 'stepOneTitle' },
                                    { text: invoice, decoration: 'underline', style: "subheader" }
                                ]
                            },
                            {
                                margin: [0, 15, 0, 0],
                                text: [
                                    { text: 'UPC:', style: 'stepOneTitle' },
                                    { text: upc, decoration: 'underline', style: "subheader" }
                                ]
                            },
                            {
                                margin: [0, 10, 0, 0],
                                text: [
                                    { text: 'Address:', style: 'stepOneTitle' },
                                    { text: buyer_address, decoration: 'underline', style: "subheader" }
                                ]
                            },
                            {
                                stack: [{ text: 'Street Address City State ZIP', style: 'partFourSpan', margin: [40, 0, 0, 0], fontSize: 6 }]
                            },
                        ],

                    },
                    {
                        width: '40%',
                        stack: [
                            {
                                margin: [0, 10, 0, 4],
                                text: [
                                    { text: 'Type:', style: 'stepOneTitle' },
                                    { text: '4', decoration: 'underline', style: "subheader" },
                                    { text: ' Total Weight/Volume:', style: 'stepOneTitle' },
                                    { text: `${total_weight} `, decoration: 'underline', style: "subheader" },
                                    { text: ' Quantity:', style: 'stepOneTitle' },
                                    { text: `${quantity} `, decoration: 'underline', style: "subheader" }
                                ]
                            },
                            {
                                style: 'tableExample',
                                table: {
                                    headerRows: 1,
                                    widths: [179, 1, 12, 1, 12],
                                    body: [
                                        [
                                            {
                                                margin: [-4, 0, 0, 0],
                                                border: [false, false, false, false],
                                                text: [
                                                    { text: 'Contains Nicotine?(ENDS products only)', style: 'stepOneTitle', italics: true }
                                                ],

                                            },
                                            {
                                                margin: [-5, 0, 0, 0],
                                                image: contains_nicotine ? 'checked' : 'unchecked', width: 8,
                                                border: [false, false, false, false],

                                            },
                                            {
                                                margin: [-5, 0, 0, 0],
                                                text: 'YES', fontSize: 7,
                                                border: [false, false, false, false],
                                            },
                                            {
                                                margin: [-10, 0, 0, 0],
                                                image: !contains_nicotine ? 'checked' : 'unchecked', width: 8,
                                                border: [false, false, false, false],
                                            },
                                            {
                                                margin: [-10, 0, 0, 0],
                                                text: 'NO', fontSize: 7,
                                                border: [false, false, false, false],
                                            }
                                        ]
                                    ]
                                }
                            },
                            {
                                margin: [0, 0, 0, 4],
                                text: [
                                    { text: 'Wholesale List Price:', style: 'stepOneTitle' },
                                    { text: cost, decoration: 'underline', style: "subheader" }
                                ]
                            },
                            {
                                margin: [0, 0, 0, 4],
                                text: [
                                    { text: 'Retail Sales Price:', style: 'stepOneTitle' },
                                    { text: list_price, decoration: 'underline', style: "subheader" }
                                ]
                            },

                        ]
                    }
                ]
            },
            {
                columns: [
                    {
                        margin: [0, 10, 0, 0],
                        width: '30%',
                        stack: [{
                            text: [
                                { text: 'Deliverer:', style: 'stepOneTitle' },
                                { text: delivery_name, decoration: 'underline', style: "subheader" }
                            ]
                        }],
                    },
                    {
                        width: '28%',
                        stack: [
                            {
                                margin: [0, 10, 0, 0],
                                text: [
                                    { text: 'Address:', style: 'stepOneTitle' },
                                    { text: delivery_address, decoration: 'underline', style: "subheader" }
                                ]
                            },
                            {
                                stack: [{ text: 'Street Address City State ZIP', style: 'partFourSpan', margin: [40, 0, 0, 0], fontSize: 6 }]
                            },
                        ]
                    },
                    {
                        width: '40%',
                        stack: [
                            {
                                margin: [0, 10, 0, 0],
                                text: [
                                    { text: 'FEIN:', style: 'stepOneTitle' },
                                    { text: delivery_fein, decoration: 'underline', style: "subheader" },
                                    { text: 'License #:', style: 'stepOneTitle' },
                                    { text: delivery_licence, decoration: 'underline', style: "subheader" },
                                ]
                            },
                            {
                                margin: [0, 0, 0, 4],
                                text: [
                                    { text: 'Telephone:', style: "subheader" },
                                    { text: delivery_phone, decoration: 'underline', style: "subheader" }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                canvas: [
                    { type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 20, y2: 5, dash: { length: 2, space: 1 } }
                ],
                margin: [0, 0, 0, 5],
            }]
        }
        return res

    })

    const nevada_parsed_lines = line_items.filter(line=>line.item_cost).map(line => [
        { text: 'SP', alignment: 'center', fontSize: 7 },
        { text: line.invoice_date, alignment: 'center', fontSize: 7 },
        { text: line.invoice_number, alignment: 'center', fontSize: 7 },
        { text: line.customer_name, alignment: 'center', colSpan: 2, fontSize: 7 },
        { text: line.customer_name, alignment: 'center', fontSize: 7 },
        { text: (line.item_cost * line.quantity).toFixed(2), alignment: 'center', style: 'secondTableCol', fontSize: 7 }
    ])

    var docDefinition = {
        layout: 'lightHorizontalLines',
        content: [
            { text: "FTA", style: "header" },
            {
                text: "Tobacco Tax Section",
                style: "subheader",
                alignment: 'center'
            },
            {
                text: "PA-2: State TOBACCO PACT Act Report for",
                style: "subheader",
                alignment: 'center',
                bold: true
            },
            {
                columns: [
                    { width: '*', text: '' },
                    {
                        width: 'auto',
                        table: {
                            body: [
                                [{ text: state, alignment: 'center', style: 'noBorders', fontSize: 8 }],
                                [{ text: "(Identify the state)", alignment: 'center', style: 'lineTop', fontSize: 8 }]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ]
            },
            {
                text: "Part 1 - Identify Your Business",
                style: "subheader",
            },
            {
                layout: 'lightborders',
                style: 'tableExample',
                table: {
                    widths: [115, 50, 35, 60, 80, 145],
                    body: [
                        [{ stack: [{ text: 'Name - please print', style: 'partFourSpan' }, { text: shop_data.full_name, style: 'partFourHeader' },], colSpan: 4, }, {}, {}, {}, { stack: [{ text: 'Reporting Period - MM/DD/YYYY', style: 'partFourSpan' }, { text: `${date_from} - ${date_to}`, style: 'partFourHeader' },] }, { stack: [{ text: 'State Identification Number', style: 'partFourSpan' }, { text: shop_data.province_code, style: 'partFourHeader' },] }],
                        [{ stack: [{ text: 'Location Address - number and street', style: 'partFourSpan' }, { text: `${shop_data.full_address || ''}`, style: 'partFourHeader' },], alignment: 'center' }, { stack: [{ text: 'City', style: 'partFourSpan' }, { text: shop_data.city || '', style: 'partFourHeader' },] }, { stack: [{ text: 'State', style: 'partFourSpan' }, { text: shop_data.province, style: 'partFourHeader' },] }, { stack: [{ text: 'Zip Code - Postal Code', style: 'partFourSpan' }, { text: shop_data.zip || '', style: 'partFourHeader' },], }, { stack: [{ text: 'Country - Territory', style: 'partFourSpan' }, { text: shop_data.territory, style: 'partFourHeader' },], }, { stack: [{ text: 'Federal Employee Identification Number', style: 'partFourSpan' }, { text: shop_data.emp_number, style: 'partFourHeader' },], },],
                        [{ stack: [{ text: 'Location Address - number and street', style: 'partFourSpan' }, { text: `${shop_data.mailing_address || ''}`, style: 'partFourHeader' },], alignment: 'center' }, { stack: [{ text: 'City', style: 'partFourSpan' }, { text: shop_data.mailing_city || '', style: 'partFourHeader' },] }, { stack: [{ text: 'State', style: 'partFourSpan' }, { text: shop_data.mailing_state, style: 'partFourHeader' },] }, { stack: [{ text: 'Zip Code - Postal Code', style: 'partFourSpan' }, { text: shop_data.mailing_zip || '', style: 'partFourHeader' },], }, { stack: [{ text: 'Country - Territory', style: 'partFourSpan' }, { text: shop_data.territory, style: 'partFourHeader' },], }, { stack: [{ text: 'Email Address', style: 'partFourSpan' }, { text: shop_data.email, style: 'partFourHeader' },], },],
                    ]
                }
            },
            {
                text: "Part 2 - Identify Your Sales",
                style: "subheader",
            },
            {
                layout: 'lightborders',
                style: 'tableExample',
                table: {
                    widths: [55, 105, 15, 45, 30, 30, 25, 30, 30, 30, 45],
                    headerRows: 0,
                    body: [
                        [{ text: 'Customer name', style: 'secondTableHeader' }, { text: 'Address ', style: 'secondTableHeader' }, { text: 'Type', style: 'secondTableHeader' }, { text: 'Brand Family', style: 'secondTableHeader' }, { text: 'Invoice\nDate', style: 'secondTableHeader' }, { text: 'Invoice Number', style: 'secondTableHeader' }, { text: 'Quantity', style: 'secondTableHeader' }, { text: 'RYO Total Weight', style: 'secondTableHeader' }, { text: 'OTP Total Weight', style: 'secondTableHeader' }, { text: 'Retail Sale Price($)', style: 'secondTableHeader' }, { text: "Manufacturer's/Wholesale List Price", style: 'secondTableHeader' },],
                        ...parsed_lines,
                        // [{ text: 'Letasha Pair', style: 'secondTableCol' }, { text: '5509 Franklin Dr Cheyenne WY US',  style: 'secondTableCol' }, { text: '4',  style: 'secondTableCol' }, { text: 'Suorin',  style: 'secondTableCol' }, { text: '4/29/2021',  style: 'secondTableCol' }, { text: '#233984',  style: 'secondTableCol' }, { text: '1',  style: 'secondTableCol' }, { text: 'N/A',  style: 'secondTableCol' }, { text: '14',  style: 'secondTableCol' }, { text: '$8.52',  style: 'secondTableCol' }, { text: '$2.1', style: 'secondTableCol' }, ],
                        // [{ text: 'Letasha Pair', style: 'secondTableCol' }, { text: '5509 Franklin Dr Cheyenne WY US',  style: 'secondTableCol' }, { text: '4',  style: 'secondTableCol' }, { text: 'Suorin',  style: 'secondTableCol' }, { text: '4/29/2021',  style: 'secondTableCol' }, { text: '#233984',  style: 'secondTableCol' }, { text: '1',  style: 'secondTableCol' }, { text: 'N/A',  style: 'secondTableCol' }, { text: '14',  style: 'secondTableCol' }, { text: '$8.52',  style: 'secondTableCol' }, { text: '$2.1', style: 'secondTableCol' }, ],
                        // [{ text: 'Letasha Pair', style: 'secondTableCol' }, { text: '5509 Franklin Dr Cheyenne WY US',  style: 'secondTableCol' }, { text: '4',  style: 'secondTableCol' }, { text: 'Suorin',  style: 'secondTableCol' }, { text: '4/29/2021',  style: 'secondTableCol' }, { text: '#233984',  style: 'secondTableCol' }, { text: '1',  style: 'secondTableCol' }, { text: 'N/A',  style: 'secondTableCol' }, { text: '14',  style: 'secondTableCol' }, { text: '$8.52',  style: 'secondTableCol' }, { text: '$2.1', style: 'secondTableCol' }, ],
                        // [{ text: 'Letasha Pair', style: 'secondTableCol' }, { text: '5509 Franklin Dr Cheyenne WY US',  style: 'secondTableCol' }, { text: '4',  style: 'secondTableCol' }, { text: 'Suorin',  style: 'secondTableCol' }, { text: '4/29/2021',  style: 'secondTableCol' }, { text: '#233984',  style: 'secondTableCol' }, { text: '1',  style: 'secondTableCol' }, { text: 'N/A',  style: 'secondTableCol' }, { text: '14',  style: 'secondTableCol' }, { text: '$8.52',  style: 'secondTableCol' }, { text: '$2.1', style: 'secondTableCol' }, ],

                        [{ border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: 'Totals', style: 'secondTableHeader' }, { text: total_weight.toFixed(2), style: 'secondTableCol' }, { text: `$${total_sales_price.toFixed(2)}`, style: 'secondTableCol' }, { text: `$${total_cost.toFixed(2)}`, style: 'secondTableCol' },]
                    ]
                }
            },
            {
                text: "Part 3 - Identify Your Delivery Service - Required for Delivery Sellers ONLY",
                style: "subheader",
            },
            {
                layout: 'lightborders',
                style: 'tableExample',
                table: {
                    headerRows: 1,
                    widths: [172, 210, 130],
                    body: [
                        [{ text: 'Delivery Service Name *', style: 'secondTableHeader' }, { text: 'Address* ', style: 'secondTableHeader' }, { text: 'Phone number *', style: 'secondTableHeader' }],
                        ...shop_data.delivery_services.map(ds => {
                            return [{
                                text: ds.name,
                                style: 'secondTableCol'
                            },
                            {
                                text: ds.address,
                                style: 'secondTableCol'
                            },
                            {
                                text: ds.phone_number,
                                style: 'secondTableCol'
                            }]
                        })
                    ]
                }
            },
            {
                text: "Part 4 - Sign Below",
                style: "subheader",
            },
            {
                text: "DECLARATION: I declare under penalties of perjury that I have examined this report and all attachments and to the best of my knowledge and belief it is true, correct and complete.",
                style: "span",
            },
            {
                layout: 'lightborders',
                style: 'tableExample',
                table: {
                    widths: [130, 130, 60, 95, 78],
                    body: [
                        [{ stack: [{ text: 'Signature of Responsible Party', style: 'partFourSpan' }, { text: '', style: 'partFourHeader' },] }, { stack: [{ text: 'Responsible Party`s Name - please print', style: 'partFourSpan' }, { text: shop_data.resp_party_name, style: 'partFourHeader' },] }, { stack: [{ text: 'Title', style: 'partFourSpan' }, { text: shop_data.resp_party_title, style: 'partFourHeader' },] }, { stack: [{ text: 'Phone', style: 'partFourSpan' }, { text: shop_data.resp_party_phone_number, style: 'partFourHeader' },] }, { stack: [{ text: 'Date', style: 'partFourSpan' }, { text: new Date().formatMMDDYYYY(), style: 'partFourHeader' },] }],
                    ]
                }
            },
            {
                layout: 'lightborders',
                style: 'tableExample',
                table: {
                    widths: [250, 250],
                    body: [
                        [{ text: 'CG_PA-2 Rev. 1-16', style: 'leftSpan', border: [false, false, false, false], }, { text: 'Federation of Tax Administrators', style: 'rightSpan', border: [false, false, false, false], }],
                    ]
                }
            },
        ],
        pageSize: 'A4',
        pageMargins: [30, 30, 30, 30],
        styles: {
            leftSpan: {
                fontSize: 5,
                alignment: 'left'
            },
            rightSpan: {
                fontSize: 5,
                alignment: 'right'
            },
            partFourHeader: {
                alignment: 'center',
                fontSize: 6.5
            },
            partFourSpan: {
                fontSize: 4,
                alignment: 'left',
            },
            secondTableHeader: {
                fontSize: 5.5,
                alignment: 'center',
                verticalAlign: 'middle',
                bold: true
            },
            span: {
                fontSize: 4,
                italics: true
            },
            secondTableCol: {
                fontSize: 5,
                alignment: 'center',
            },
            lineTop: {
                decoration: "overline"
            },
            right: {
                alignment: 'right'
            },
            header: {
                fontSize: 10,
                bold: true,
                margin: [0, 0, 0, 10],
            },
            subheader: {
                fontSize: 8,
                margin: [0, 10, 0, 5],
            },
            tableExample: {
            },
            tableOpacityExample: {
                margin: [0, 5, 0, 15],
                fillColor: "blue",
                fillOpacity: 0.3,
            },
            tableHeader: {
                bold: true,
                fontSize: 10,
                color: "black",
            },
        },

    };

    // playground requires you to assign document definition to a variable called dd
    const name_line_space = '                                               '
    const o_name = `${shop_data.full_name}${name_line_space.slice(shop_data.full_name?.length)}`

    const o_period_month = (new Date(date_from).getMonth() + 1).toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    })

    const o_period_year = new Date(date_from).getFullYear().toString()

    const o_address_line_space = '                                             '
    const o_address = `${shop_data.full_address}${o_address_line_space.slice(shop_data.full_address?.length)}`

    const o_city_province_zip_line_space = '                                                    '
    const row_city_province_zip = `${shop_data.city || ''} ${shop_data.province || ''} ${shop_data.zip || ''}`
    const o_city_province_zip = `${row_city_province_zip}${o_city_province_zip_line_space.slice(row_city_province_zip?.length)}`

    const o_fein = shop_data.emp_number

    const o_territory_line_space = '                                    '
    const o_territory = `${shop_data.territory || ''}${o_territory_line_space.slice(shop_data.territory?.length)}`

    const o_telephone_line_spaces = '                         '
    const o_telephone = `${shop_data.resp_party_phone_number || ''}${o_telephone_line_spaces.slice(shop_data.resp_party_phone_number?.length)}`

    const o_phone_extention_line_spaces = '          '
    const o_phone_extention = `${shop_data.phone_extention || ''}${o_phone_extention_line_spaces.slice(shop_data.phone_extention?.length)}`

    const o_contact_name_line_spaces = '                                        '
    const o_contact_name = `${shop_data.resp_party_name || ''}${o_contact_name_line_spaces.slice(shop_data.resp_party_name?.length)}`

    const o_email_line_spaces = '                                   '
    const o_email = `${shop_data.email || ''}${o_email_line_spaces.slice(shop_data.email?.length)}`


    const o_state_line_spaces = '                      '
    const o_state = `${state}${o_state_line_spaces.slice(state.length)}`


    var ohio_definition = {
        laycsout: 'noBorders',
        content: [
            {
                table: {
                    body: [
                        [
                            {
                                text: [
                                    { text: "O", style: "subheader", fontSize: 32 },
                                    { text: 'hio', style: "header", fontSize: 30, bold: true },
                                ],
                                border: [false, false, true, false],
                            },
                            {
                                text: [
                                    { text: 'Department of \n Taxation \n', bold: true, fontSize: 10 },
                                    { text: 'P.O Box 530 \n Columbos, OH 43216-0530', fontSize: 7 },
                                ],
                                border: [false, false, false, false],
                            },
                            {
                                margin: [275, 0, 0, 0],
                                text: [
                                    { text: 'OPAT 1 \n', fontSize: 8 },
                                    { text: 'Revised 3/21', fontSize: 7 },
                                ],
                                border: [false, false, false, false],
                            },
                        ]
                    ]
                }
            },
            {
                text: "Ohio Tobacco/ ENDS PACT Act Report",
                style: "header",
                alignment: 'center',
                bold: true
            },
            {
                text: "Step 1: Identify your business",
                style: "subheader",
                bold: true
            },
            {
                alignment: 'justify',
                columns: [
                    {
                        width: '53%',
                        stack: [
                            {
                                text: [
                                    { text: 'Name:', style: "stepOneTitle" },
                                    { text: o_name, decoration: 'underline', style: "subheader" }
                                ],
                                style: "stepOneLeftSide"
                            },
                            {
                                text: [
                                    { text: 'Address:', style: "stepOneTitle" },
                                    { text: o_address, decoration: 'underline', style: "subheader" }
                                ],
                                style: "stepOneLeftSide"
                            },
                            {
                                stack: [{ text: 'Number and street', style: 'partFourSpan', margin: [44, 0] }]
                            },
                            {
                                text: [
                                    { text: ' ' },
                                    { text: o_city_province_zip, decoration: 'underline', style: "subheader" }
                                ],

                            },
                            {
                                stack: [{ text: 'City                         State/Province            ZIP', style: 'partFourSpan', margin: [0, 0, 0, 2] }],
                            },
                            {
                                text: [
                                    { text: 'Country/Territory:', style: "stepOneTitle" },
                                    { text: o_territory, decoration: 'underline', style: "subheader" }
                                ],
                                style: "stepOneLeftSide"
                            },
                            {
                                text: [
                                    { text: 'Contact Name:', style: "stepOneTitle" },
                                    { text: o_contact_name, decoration: 'underline', style: "subheader" }
                                ],
                                style: "stepOneLeftSide"
                            },
                        ],
                    },
                    {
                        stack: [
                            {
                                text: [
                                    { text: 'Reporting Period: ', style: "stepOneTitle" },
                                    { text: o_period_month[0], decoration: 'underline', style: "subheader" },
                                    { text: ' ' },
                                    { text: o_period_month[1], decoration: 'underline', style: "subheader" },
                                    { text: ' / ' },
                                    { text: o_period_year[0], decoration: 'underline', style: "subheader" },
                                    { text: ' ' },
                                    { text: o_period_year[1], decoration: 'underline', style: "subheader" },
                                    { text: ' ' },
                                    { text: o_period_year[2], decoration: 'underline', style: "subheader" },
                                    { text: ' ' },
                                    { text: o_period_year[3], decoration: 'underline', style: "subheader" },
                                    { text: ' ' },
                                    { text: '  ( Month/Year )', style: "stepOneTitle" },
                                ],
                                style: "stepOneRightSide",
                            },
                            {
                                text: [
                                    { text: 'License No.:', style: "stepOneTitle" },
                                    { text: '                                    ', decoration: 'underline', style: "subheader" }
                                ],
                                style: "stepOneRightSide",
                            },
                            {
                                text: [
                                    { text: 'Federal Employer Identification number:  ', style: "stepOneTitle" },
                                    { text: `${o_fein}`, decoration: 'underline', style: "subheader" },
                                ]
                            },
                            {
                                stack: [{ text: '(FEIN)', fontSize: 6, margin: [187, 0, 0, 0] }],
                            },
                            {
                                text: [
                                    { text: 'Telephone:', style: "stepOneTitle" },
                                    { text: o_telephone, decoration: 'underline', style: "subheader" },

                                    { text: 'Ext:', style: "stepOneTitle" },
                                    { text: o_phone_extention, decoration: 'underline', style: "subheader" },
                                ],
                                style: "stepOneRightSide",
                                margin: [0, 0, 0, 5]
                            },
                            {
                                text: [
                                    { text: 'Email address:', style: "stepOneTitle" },
                                    { text: o_email, decoration: 'underline', style: "subheader" }
                                ]
                            }
                        ]
                    }
                ]
            },
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 20, y2: 5, lineWidth: 3 }] },
            {
                text: [
                    { text: 'Step 2. Identify your sales into', style: "subheader", bold: true },
                    { text: ' ' },
                    { text: o_state, decoration: 'underline', style: "subheader" }
                ],
                margin: [0, 10, 0, 0],
            },
            {
                stack: [{ text: 'Identify the state', style: 'stepTwoTitle' }],
                margin: [180, 0, 0, 5]
            },

            {
                stack: o_parsed_lines
            },

            { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 595 - 2 * 20, y2: 10, lineWidth: 3 }] },
            {
                text: [
                    { text: 'Step 3: Sign below', style: "subheader", bold: true }
                ],
                margin: [0, 10, 0, 0],
            },
            {
                text: [
                    { text: 'Under penalties of perjury, I state that I have examined this report, and to the best of my knowledge, it is true, correct, and complete. I also state that such information is taken from the books and records of the business for which this report is filed.', fontSize: 8 }
                ],
                margin: [0, 10]
            },
            {
                alignment: 'justify',
                columns: [
                    {
                        width: '33%',
                        text: [
                            { text: ' ' },
                            { text: '                                 ', decoration: 'underline', style: "subheader" }
                        ]
                    },
                    {
                        width: '32%',
                        text: [
                            { text: 'Title:', fontSize: 8 },
                            { text: '                          ', decoration: 'underline', style: "subheader" },
                        ]
                    },
                    {
                        width: '21%',
                        text: [
                            { text: ' ' },
                            { text: '(   )', decoration: 'underline', style: "subheader" },
                            { text: ' ' },
                            { text: '      ', decoration: 'underline', style: "subheader" },
                            { text: '-' },
                            { text: '      ', decoration: 'underline', style: "subheader" }
                        ]
                    },
                    {
                        width: '25%',
                        text: [
                            { text: ' ' },
                            { text: '   ', decoration: 'underline', style: "subheader" },
                            { text: '/' },
                            { text: '   ', decoration: 'underline', style: "subheader" },
                            { text: '/' },
                            { text: '   ', decoration: 'underline', style: "subheader" },
                        ]
                    },
                ]
            },
            {
                stack: [{ text: 'Owner or officer`s signature and title (state if individual owner, member of firm, or corporate officer title)            Telephone number (include area code)    Date', style: 'partFourSpan', fontSize: 5 }],
            },
            {
                margin: [0, 10, 0, 0],
                alignment: 'justify',
                columns: [
                    {
                        width: '33%',
                        text: [
                            { text: ' ' },
                            { text: '                                 ', decoration: 'underline', style: "subheader" }
                        ]
                    },
                    {
                        width: '32%',
                        text: [
                            { text: 'Title:', fontSize: 8 },
                            { text: '                          ', decoration: 'underline', style: "subheader" },
                        ]
                    },
                    {
                        width: '21%',
                        text: [
                            { text: ' ' },
                            { text: '(   )', decoration: 'underline', style: "subheader" },
                            { text: ' ' },
                            { text: '      ', decoration: 'underline', style: "subheader" },
                            { text: '-' },
                            { text: '      ', decoration: 'underline', style: "subheader" }
                        ]
                    },
                    {
                        width: '25%',
                        text: [
                            { text: ' ' },
                            { text: '   ', decoration: 'underline', style: "subheader" },
                            { text: '/' },
                            { text: '   ', decoration: 'underline', style: "subheader" },
                            { text: '/' },
                            { text: '   ', decoration: 'underline', style: "subheader" },
                        ]
                    },
                ]
            },
            {
                stack: [{ text: 'Preparer`s signature and title (state if individual owner, member of firm, or corporate officer title)                    Telephone number (include area code)    Date', style: 'partFourSpan', fontSize: 5 }],
            },
        ],
        images: {
            checked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF+2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTItMzBUMDE6Mzc6MjArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMSIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkRvdCBHYWluIDIwJSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowNzVjYjZmMy1jNGIxLTRiZjctYWMyOS03YzUxMWY5MWJjYzQiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5ZTM1YTc3ZC0zNDM0LTI5NGQtYmEwOC1iY2I5MjYyMjBiOGIiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowYzc2MDY3Ny0xNDcwLTRlZDUtOGU4ZS1kNTdjODJlZDk1Y2UiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjBjNzYwNjc3LTE0NzAtNGVkNS04ZThlLWQ1N2M4MmVkOTVjZSIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozNzoyMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjA3NWNiNmYzLWM0YjEtNGJmNy1hYzI5LTdjNTExZjkxYmNjNCIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozODoyOCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+jHsR7AAAAUNJREFUOMvN1T9Lw0AYx/EviLVFxFH8M3USgyAFoUsQ0UV8F6Ui4qCTbuJg34HgptBdUATrUoxiqYMgiOBoIcW9BVED+jgkntGm9i6CmN+Sg/vAcc89dwBd5Clzj6uZGg7LJAC62UFipEgKcmroaeZj/gpcIAhl5rE1M0cJQbiCOsIrs5h8WZ4R6j72yBrhcRo+dhE8bCOcoYng/hFOMxAXb/DAHTNxcCGo7JE5LqhjsW2KP6nDcGecCv1vRdC2eJQDLllooach2hbvIghvLJJgM0QHdeq8F0x/5ETRM4b0DonF7be+Pf+y4A4bZnETok4E/XG3xxR3WhasUWeLCg2OGYnXGP1MkPwnLRmJf3UN+RfgtBGe5MnHVQShxBQZzdgcIgjXsKSu/KZmXgKxBkmKsZ6bffoAelilQs3goauyTi+8A8mhgeQlxdNWAAAAAElFTkSuQmCC',
            unchecked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF+2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTItMzBUMDE6Mzc6MjArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjU3KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjU3KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMSIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9IkRvdCBHYWluIDIwJSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpjMGUyMmJhZC1lY2VkLTQzZWUtYjIzZC1jNDZjOTNiM2UzNWMiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5M2FhOTEzYy1hZDVmLWZmNGEtOWE5Ny1kMmUwZjdmYzFlYmUiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozYmY2ODFlMy1hMTRhLTQyODMtOGIxNi0zNjQ4M2E2YmZlNjYiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjNiZjY4MWUzLWExNGEtNDI4My04YjE2LTM2NDgzYTZiZmU2NiIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozNzoyMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmMwZTIyYmFkLWVjZWQtNDNlZS1iMjNkLWM0NmM5M2IzZTM1YyIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozODo1NyswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+6AB6cQAAAPxJREFUOMvF1b1Kw1AYBuAnFf8QL8WlIHQJIriIdyEu4qCTXop7dwenTgUHpYvgJVhob8AuakE+h9hapJqcFDXvFDgPIXlzvgNLjnQ9GlRM340TK7DsUtRI2zqH09txxUzWn3IrhK4DecXs6wjhnqHwZk/K1fIiDAs81krCW54KPBDG8iTcNBIGf4ND1MWTdmrgqIOL5TM0S8SRhmMu1dAo+2DZ57t9eWajtKrvN1GVnrMK9HewhbBy+nPPJbTsJwmymOn8P7fkfLzQGCoG4G4S3vZc4J4QOnY0KyZ3LYQHjqcjf1Qxrx/inDXtWsfNlU1YdeZOP+Gg67mwwTvIDqR1iAowgQAAAABJRU5ErkJggg==',
        },
        defaultStyle: {
            font: 'CourierPrime'
        },
        pageSize: 'A4',
        pageMargins: [30, 30, 0, 30],
        styles: {
            leftSpan: {
                fontSize: 6,
                alignment: 'left'
            },
            rightSpan: {
                fontSize: 6,
                alignment: 'right'
            },
            partFourHeader: {
                alignment: 'center',
                fontSize: 7.5
            },
            partFourSpan: {
                fontSize: 7,
                alignment: 'left',
            },
            secondTableHeader: {
                fontSize: 6,
            },
            span: {
                fontSize: 5,
                italics: true
            },
            secondTableCol: {
                fontSize: 5.5,
                alignment: 'center',
            },
            lineTop: {
                decoration: "overline"
            },
            right: {
                alignment: 'right'
            },
            header: {
                fontSize: 13,
                bold: true,
            },
            subheader: {
                fontSize: 9,
                margin: [0, 5, 0, 5],
            },
            tableOpacityExample: {
                margin: [0, 5, 0, 15],
                fillColor: "blue",
                fillOpacity: 0.3,
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: "black",
            },
            stepOneTitle: {
                fontSize: 8,
                color: "black",
            },
            stepTwoTitle: {
                fontSize: 10
            },
            stepOneRightSide: {
                margin: [0, 0, 0, 3]
            },
            stepOneLeftSide: {
                margin: [0, 0, 0, 2]
            }
        },

    }

    var nevada_definition = {
        laycsout: 'noBorders',
        content: [
            {
                table: {
                    body: [
                        [
                            {
                                text: [
                                    { text: 'NEVADA DEPARTMENT OF TAXATION\n', background: 'black', fontSize: 12, bold: true, color: 'white' },
                                    { text: 'OTHER TOBACCO PRODUCTS\n', bold: true, fontSize: 12 },
                                    { text: 'EXCISE TAX RETURN FORM #1\n', fontSize: 12, bold: true },
                                    { text: 'MAIL ORIGINAL TO: NEVADA DEPARTMENT OF TAXATION\n', fontSize: 7, },
                                    { text: '1550 COLLEGE PARKWAY SUITE 115\n', fontSize: 7, alignment: "center" },
                                    { text: 'CARSON CITY NV 89706\n', fontSize: 7, alignment: "center" },
                                ],
                                border: [false, false, false, false],
                            },
                            {
                                text: [
                                    { text: 'Taxpayer ID: ', fontSize: 8, },
                                    { text: '1042708371-001', background: '#f1f4ff', fontSize: 8,},
                                ],
                                border: [false, false, false, false],
                                margin: [150, 0, 0, 0]
                            },
                            {
                                border: [false, false, false, false],
                                margin: [-80, 35, 0, 0],
                                table: {
                                    widths: [120],
                                    body: [
                                        [
                                            {
                                                text: [
                                                    { text: 'FOR MONTH ENDING ', fontSize: 7, margin: [0, 5, 0, 0] },
                                                    { text: `${date_to}`, background: '#f1f4ff', fontSize: 7, margin: [0, 5, 0, 0] },
                                                ]
                                            }
                                        ],
                                    ],
                                },
                            },
                        ]
                    ]
                }
            },
            {
                table: {
                    widths: [500],
                    body: [
                        [{ text: 'THIS FORM IS TO REPORT ALL PRODUCTS RECEIVED BY AN IN-STATE WHOLESALE DEALER OR ALL PRODUCTS SOLD INTO NEVADA BY AN OUT-OF-STATE WHOLESALE DEALER DURING THE REPORTING PERIOD.', fontSize: 7, alignment: 'center', bold: true }],
                    ],
                },
                margin: [25, 5, 0, 5],
                layout: 'noBorders',
            },
            {
                table: {
                    widths: [400],
                    body: [
                        [{ text: 'IN-STATE WHOLESALE DEALERS, PLEASE SEE INSTRUCTIONS ON PAGES 8 – 10. OUT-OF-STATE WHOLESALE DEALERS, PLEASE SEE INSTRUCTIONS ON PAGES 11 – 12.', fontSize: 6, alignment: 'center', bold: true }],
                    ],
                },
                margin: [70, 5, 0, 5],
                layout: 'noBorders',
            },
            {
                table: {
                    widths: [20, 240, 240],
                    body: [
                        [{ text: 'PRODUCT CODES', colSpan: 3, bold: true, alignment: 'center', fillColor: 'silver', }, {}, {}],
                        [{ text: 'TPP', fontSize: 8, bold: true, alignment: 'center' }, { text: 'TAX PAID PRODUCT RECEIVED (FOR PRODUCTS RECEIVED FROM ANOTHER IN-STATE LICENSED WHOLESALE DEALER)', colSpan: 2, fontSize: 8, bold: true, alignment: 'center', fillColor: 'silver' }, {}],
                        [{ text: 'UTP', fontSize: 8, bold: true, alignment: 'center' }, { text: 'UNTAXED PRODUCT RECEIVED (FOR PRODUCTS RECEIVED FOR WHICH NO TAX HAS BEEN PAID BY ANY WHOLESALE DEALER)', colSpan: 2, fontSize: 8, bold: true, alignment: 'center', fillColor: 'silver' }, {}],
                        [{ text: 'SP', fontSize: 8, bold: true, alignment: 'center' }, { text: 'SOLD PRODUCT (FOR PRODUCTS SOLD INTO NEVADA BY WHOLESALE DEALERS LOCATED OUTSIDE OF NEVADA) ', colSpan: 2, fontSize: 8, bold: true, alignment: 'center', fillColor: 'silver' }, {}],
                    ]
                }
            },
            {
                table: {
                    widths: [78, 78, 78, 80, 80, 78],
                    heights: [14],
                    body: [
                        [{ text: 'PRODUCT CODE', bold: true, fontSize: 8, alignment: 'center', fillColor: 'silver', }, { text: 'INVOICE DATE', fontSize: 8, bold: true, alignment: 'center', fillColor: 'silver', }, { text: 'INVOICE NUMBER', bold: true, fontSize: 8, alignment: 'center', fillColor: 'silver', }, { text: 'RECEIVED FROM OR SOLD TO', bold: true, fontSize: 8, alignment: 'center', fillColor: 'silver', colSpan: 2 }, { text: 'RECEIVED FROM OR SOLD TO', bold: true, fontSize: 8, alignment: 'center', fillColor: 'silver', }, { text: 'WHOLESALE PRICE', bold: true, fontSize: 8, alignment: 'center', fillColor: 'silver', }],

                        ...nevada_parsed_lines,


                        [{ stack: [{ text: '' }], border: [false, false, false, false], }, { stack: [{ text: '' }], border: [false, false, false, false], }, { stack: [{ text: 'TOTAL WHOLESALE PRICE $', bold: true, alignment: 'center', fontSize: 10 },], fillColor: 'silver', colSpan: 3, border: [true, true, true, true] }, {}, {}, { text: total_cost.toFixed(2), fontSize: 7, alignment: 'center', }]
                    ]
                },
                margin: [0, 10, 0, 0]
            },
            {
                table: {
                    widths: [135, 110, 135, 110],
                    body: [
                        [{ text: [{ text: 'TOTAL ON-HAND WHOLESALE INVENTORY VALUE', bold: true, fontSize: 10, }, { text: ' (FOR IN-STATE WHOLESALE DEALERS ONLY)', fontSize: 9 },], fillColor: 'silver', colSpan: 4, alignment: 'center' }, {}, {}, {}],
                        [{ text: 'BEG INVENTORY: ', fontSize: 8, bold: true, alignment: 'center', fillColor: 'silver' }, { text: '$', fontSize: 8, bold: true }, { text: 'END INVENTORY: ', fontSize: 8, bold: true, alignment: 'center', fillColor: 'silver' }, { text: '$', fontSize: 8, bold: true }],
                    ]
                },
                margin: [0, 10, 0, 0]
            },
        ],
        pageSize: 'A4',
        pageMargins: [30, 30, 0, 30],
        styles: {
            leftSpan: {
                fontSize: 6,
                alignment: 'left',
            },
            rightSpan: {
                fontSize: 6,
                alignment: 'right'
            },
            partFourHeader: {
                alignment: 'center',
                fontSize: 7.5
            },
            partFourSpan: {
                fontSize: 7,
                alignment: 'left',
            },
            secondTableHeader: {
                fontSize: 6,
            },
            span: {
                fontSize: 5,
                italics: true
            },
            secondTableCol: {
                fontSize: 5.5,
                alignment: 'center',
            },
            lineTop: {
                decoration: "overline"
            },
            right: {
                alignment: 'right'
            },
            header: {
                fontSize: 13,
                bold: true,
            },
            subheader: {
                fontSize: 9,
                margin: [0, 5, 0, 5],
            },
            tableOpacityExample: {
                margin: [0, 5, 0, 15],
                fillColor: "blue",
                fillOpacity: 0.3,
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: "black",
            },
            stepOneTitle: {
                fontSize: 8,
                color: "black",
                bold: true,
                decoration: 'underline',
            },
            stepTwoTitle: {
                fontSize: 10
            },
            stepOneRightSide: {
                margin: [0, 0, 0, 3]
            },
            stepOneLeftSide: {
                margin: [0, 0, 0, 2]
            }
        },
    }

    let final_definition;
    if (state === 'Ohio')
        final_definition = ohio_definition
    else if (state === 'Nevada')
        final_definition = nevada_definition
    else
        final_definition = docDefinition
    pdfMake.createPdf(final_definition).download(`${state}`);
};



const months = [
    { short_name: "Jan", full_name: "January" },
    { short_name: "Feb", full_name: "February" },
    { short_name: "Mar", full_name: "March" },
    { short_name: "Apr", full_name: "April" },
    { short_name: "May", full_name: "May" },
    { short_name: "Jun", full_name: "June" },
    { short_name: "Jul", full_name: "July" },
    { short_name: "Aug", full_name: "August" },
    { short_name: "Sep", full_name: "September" },
    { short_name: "Oct", full_name: "October" },
    { short_name: "Nov", full_name: "November" },
    { short_name: "Dec", full_name: "December" },
]