import pdfMake from "pdfmake/build/pdfmake";
import vfsFonts from 'pdfmake/build/vfs_fonts'
import { NONAME } from "dns";

export const exportPdfTable = (line_items, state, date_from, date_to) => {
    const { vfs } = vfsFonts.pdfMake;
    pdfMake.vfs = vfs;
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

    const total_weight = line_items.reduce((accumulator, line) => accumulator + ((isNaN(line.item_weight) ? 0 : line.item_weight) * line.quantity),0)
    const total_sales_price = line_items.reduce((accumulator, line) => accumulator + ((isNaN(line.item_retail_price) ? 0 : line.item_retail_price) * line.quantity),0)
    const total_cost = line_items.reduce((accumulator, line) => accumulator + ((isNaN(line.item_cost) ? 0 : line.item_cost) * line.quantity),0)
    
    var docDefinition = {
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
                                [{ text: state, alignment: 'center', style: 'noBorders', fontSize: 9 }],
                                [{ text: "(Identify the state)", alignment: 'center', style: 'lineTop', fontSize: 9 }]
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
                style: 'tableExample',
                table: {
                    widths: [120, 50, 30, 60, 80, 145],
                    body: [
                        [{ stack: [{ text: 'Name - please print', style: 'partFourSpan' }, { text: 'Siroart Inc., DBA Vape JuiceDepot', style: 'partFourHeader' },], colSpan: 4, }, {}, {}, {}, { stack: [{ text: 'Reporting Period - MM/DD/YYYY', style: 'partFourSpan' }, { text: `${date_from} - ${date_to}`, style: 'partFourHeader' },] }, { stack: [{ text: 'State Identification Number', style: 'partFourSpan' }, { text: 'CA', style: 'partFourHeader' },] }],
                        [{ stack: [{ text: 'Location Address - number and street', style: 'partFourSpan' }, { text: '555 Riverdale Dr. Ste D', style: 'partFourHeader' },], alignment: 'center' }, { stack: [{ text: 'City', style: 'partFourSpan' }, { text: 'Glendale', style: 'partFourHeader' },] }, { stack: [{ text: 'State', style: 'partFourSpan' }, { text: 'CA', style: 'partFourHeader' },] }, { stack: [{ text: 'Zip Code - Postal Code', style: 'partFourSpan' }, { text: '91204', style: 'partFourHeader' },], }, { stack: [{ text: 'Country - Territory', style: 'partFourSpan' }, { text: 'Los Angeles', style: 'partFourHeader' },], }, { stack: [{ text: 'Federal Employee Identification Number', style: 'partFourSpan' }, { text: '811373814', style: 'partFourHeader' },], },],
                        [{ stack: [{ text: 'Location Address - number and street', style: 'partFourSpan' }, { text: '555 Riverdale Dr. Ste D', style: 'partFourHeader' },], alignment: 'center' }, { stack: [{ text: 'City', style: 'partFourSpan' }, { text: 'Glendale', style: 'partFourHeader' },] }, { stack: [{ text: 'State', style: 'partFourSpan' }, { text: 'CA', style: 'partFourHeader' },] }, { stack: [{ text: 'Zip Code - Postal Code', style: 'partFourSpan' }, { text: '91204', style: 'partFourHeader' },], }, { stack: [{ text: 'Country - Territory', style: 'partFourSpan' }, { text: 'Los Angeles', style: 'partFourHeader' },], }, { stack: [{ text: 'Email Address', style: 'partFourSpan' }, { text: 'regulatory@vapejuicedepot.com', style: 'partFourHeader' },], },],
                    ]
                }
            },
            {
                text: "Part 2 - Identify Your Sales",
                style: "subheader",
            },
            {
                style: 'tableExample',
                table: {
                    widths: [55, 105, 15, 45, 30, 30, 25, 30, 30, 30, 45],
                    headerRows: 1,
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
                style: 'tableExample',
                table: {
                    headerRows: 1,
                    widths: [172, 210, 130],
                    body: [
                        [{ text: 'Delivery Service Name *', style: 'secondTableHeader' }, { text: 'Address* ', style: 'secondTableHeader' }, { text: 'Phone number *', style: 'secondTableHeader' }],
                        [{ text: 'United States Postal Service', style: 'secondTableCol' }, { text: '3370 Glendale Blvd, Los Angeles, CA 90039', style: 'secondTableCol' }, { text: '(800) 275-8777', style: 'secondTableCol' }],
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
                style: 'tableExample',
                table: {
                    widths: [130, 130, 60, 95, 78],
                    body: [
                        [{ stack: [{ text: 'Signature of Responsible Party', style: 'partFourSpan' }, { text: '', style: 'partFourHeader' },] }, { stack: [{ text: 'Responsible Party’s Name – please print', style: 'partFourSpan' }, { text: 'Habib Kajajian', style: 'partFourHeader' },] }, { stack: [{ text: 'Title', style: 'partFourSpan' }, { text: 'CEO', style: 'partFourHeader' },] }, { stack: [{ text: 'Title', style: 'partFourSpan' }, { text: '(800) 275-8777', style: 'partFourHeader' },] }, { stack: [{ text: 'Date', style: 'partFourSpan' }, { text: '', style: 'partFourHeader' },] }],
                    ]
                }
            },
            {
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
                fontSize: 5,
                alignment: 'left',
            },
            secondTableHeader: {
                fontSize: 6.5,
                alignment: 'center',
                verticalAlign: 'middle',
                bold: true
            },
            span: {
                fontSize: 5,
                italics: true
            },
            secondTableCol: {
                fontSize: 6,
                alignment: 'center',
            },
            lineTop: {
                decoration: "overline"
            },
            right: {
                alignment: 'right'
            },
            header: {
                fontSize: 11,
                bold: true,
                margin: [0, 0, 0, 10],
            },
            subheader: {
                fontSize: 9,
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
                fontSize: 11,
                color: "black",
            },
        },

    };
    pdfMake.createPdf(docDefinition).open();
};