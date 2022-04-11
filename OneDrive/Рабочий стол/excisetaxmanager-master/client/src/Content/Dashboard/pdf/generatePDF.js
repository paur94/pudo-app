import React from "react";
import pdfMake from "pdfmake/build/pdfmake";
import vfsFonts from 'pdfmake/build/vfs_fonts'
import { NONAME } from "dns";

export default function GeneratePDF() {
    const _exportPdfTable = () => {
        const { vfs } = vfsFonts.pdfMake;
        pdfMake.vfs = vfs;
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
                                    [{ text: 'WY', alignment: 'center', style: 'noBorders' }],
                                    [{ text: "(Identify the state)", alignment: 'center', style: 'lineTop' }]
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
                        body: [
                            [{ stack: [{ text: 'Name - please print', style: 'partFourSpan' }, { text: 'Siroart Inc., DBA Vape JuiceDepot', style: 'partFourHeader' },], colSpan: 4, }, {}, {}, {}, { stack: [{ text: 'Reporting Period - MM/DD/YYYY', style: 'partFourSpan' }, { text: '4/1/2021 - 4/30/2021', style: 'partFourHeader' },] }, { stack: [{ text: 'State Identification Number', style: 'partFourSpan' }, { text: 'CA', style: 'partFourHeader' },] }],
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
                        headerRows: 1,
                        body: [
                            [{ text: 'Customer name*', style: 'secondTableHeader' }, { text: 'Address* ', style: 'secondTableHeader' }, { text: 'Type', style: 'secondTableHeader' }, { text: 'Brand Family*', style: 'secondTableHeader' }, { text: 'Invoice\nDate', style: 'secondTableHeader' }, { text: 'Invoice\nNumber', style: 'secondTableHeader' }, { text: 'Quantity*', style: 'secondTableHeader' }, { text: 'RYO Total\nWeight*', style: 'secondTableHeader' }, { text: 'OTP Total\nWeight', style: 'secondTableHeader' }, { text: 'Retail Sale\nPrice($)**', style: 'secondTableHeader' }, { text: "Manufacturer's/Wholesale\nList Price**", style: 'secondTableHeader' },],
                            [{ text: 'Letasha Pair', style: 'secondTableCol' }, { text: '5509 Franklin Dr Cheyenne WY US', style: 'secondTableCol' }, { text: '4', style: 'secondTableCol' }, { text: 'Suorin', style: 'secondTableCol' }, { text: '4/29/2021', style: 'secondTableCol' }, { text: '#233984', style: 'secondTableCol' }, { text: '1', style: 'secondTableCol' }, { text: 'N/A', style: 'secondTableCol' }, { text: '14', style: 'secondTableCol' }, { text: '$8.52', style: 'secondTableCol' }, { text: '$2.1', style: 'secondTableCol' },],
                            [{ text: 'Letasha Pair', style: 'secondTableCol' }, { text: '5509 Franklin Dr Cheyenne WY US', style: 'secondTableCol' }, { text: '4', style: 'secondTableCol' }, { text: 'Suorin', style: 'secondTableCol' }, { text: '4/29/2021', style: 'secondTableCol' }, { text: '#233984', style: 'secondTableCol' }, { text: '1', style: 'secondTableCol' }, { text: 'N/A', style: 'secondTableCol' }, { text: '14', style: 'secondTableCol' }, { text: '$8.52', style: 'secondTableCol' }, { text: '$2.1', style: 'secondTableCol' },],
                            [{ text: 'Letasha Pair', style: 'secondTableCol' }, { text: '5509 Franklin Dr Cheyenne WY US', style: 'secondTableCol' }, { text: '4', style: 'secondTableCol' }, { text: 'Suorin', style: 'secondTableCol' }, { text: '4/29/2021', style: 'secondTableCol' }, { text: '#233984', style: 'secondTableCol' }, { text: '1', style: 'secondTableCol' }, { text: 'N/A', style: 'secondTableCol' }, { text: '14', style: 'secondTableCol' }, { text: '$8.52', style: 'secondTableCol' }, { text: '$2.1', style: 'secondTableCol' },],
                            [{ text: 'Letasha Pair', style: 'secondTableCol' }, { text: '5509 Franklin Dr Cheyenne WY US', style: 'secondTableCol' }, { text: '4', style: 'secondTableCol' }, { text: 'Suorin', style: 'secondTableCol' }, { text: '4/29/2021', style: 'secondTableCol' }, { text: '#233984', style: 'secondTableCol' }, { text: '1', style: 'secondTableCol' }, { text: 'N/A', style: 'secondTableCol' }, { text: '14', style: 'secondTableCol' }, { text: '$8.52', style: 'secondTableCol' }, { text: '$2.1', style: 'secondTableCol' },],
                            [{ border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: '' }, { border: [false, false, false, false], text: 'Totals', style: 'secondTableHeader' }, { text: '1572', style: 'secondTableCol' }, { text: '$748.08', style: 'secondTableCol' }, { text: '$257.78', style: 'secondTableCol' },]
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
                        widths: [140, 210, 140,],
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
                        widths: [130, 130, 60, 90, 60],
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
                    fontSize: 10
                },
                partFourSpan: {
                    fontSize: 6,
                    alignment: 'left',
                },
                secondTableHeader: {
                    fontSize: 8,
                    alignment: 'center',
                    bold: true
                },
                span: {
                    fontSize: 8,
                    italics: true
                },
                secondTableCol: {
                    fontSize: 8,
                    alignment: 'center',
                },
                lineTop: {
                    decoration: "overline"
                },
                right: {
                    alignment: 'right'
                },
                header: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 0, 0, 10],
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 10, 0, 5],
                },
                tableExample: {
                    margin: [0, 5, 0, 15],
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
            },
        };
        pdfMake.createPdf(docDefinition).open();
    };
    return (
        <>
            <button onClick={_exportPdfTable}>Export PDF</button>
        </>
    );
}
