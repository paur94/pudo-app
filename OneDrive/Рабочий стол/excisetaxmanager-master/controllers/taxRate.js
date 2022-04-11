const Router = require('koa-router');
const router = new Router();
const TaxRate = require('../models/TaxRate')

router.get(`/:page/:page_size/:sort`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const count = await TaxRate.find({ shop }).count()
    const tax_rates = await TaxRate.find({ shop }).skip(page * page_size).limit(page_size * 1).sort({ [`${sort || 'state.name'}`]: -1 });
    ctx.status = 200;
    ctx.body = { data: tax_rates, count: count };
})

router.get(`/by_states`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const count = await TaxRate.find({ shop }).count()
    const tax_rates = await TaxRate.find({ shop });

    const states_taxes = [...states];

    tax_rates.forEach(tax_rate => {

        const state_tax_item_data = {
            taxType: tax_rate.taxType,
            tag: tax_rate.tag,
            value: tax_rate.value,
        }

        const state_data = states_taxes.find(st => st.state_shortcode == tax_rate.state.shortcode)
        const token = !!tax_rate.bound ? tax_rate.tax.tag : tax_rate.tax.tag + '_freebase'
        if (state_data)
            state_data[tax_rate.tax.tag] = state_tax_item_data
        else
            states_taxes.push({
                [tax_rate.tax.tag]: state_tax_item_data,
                state_shortcode: tax_rate.state.shortcode,
                state_name: tax_rate.state.name
            })

    });

    ctx.status = 200;
    ctx.body = { data: states_taxes };
})

router.post('/', async (ctx) => {
    const { shop } = ctx.session;
    try {
        const data = ctx.request.body;

        const tax_rate = {
            tax: { name: data.tax_name, tag: data.tax_tag },
            state: { name: data.state_name, shortcode: data.state_shortcode },
            shop: shop,
            taxType: data.taxType,
            value: data.value,
        }

        if (data.bound_unit)
            tax_rate.bound = {
                unit: data.bound_unit, min: data.bound_min, max: data.bound_max
            }

        let new_data = await TaxRate.create(tax_rate);
        ctx.status = 201;
        ctx.body = new_data;
    }
    catch (err) {
        ctx.status = 500;
        ctx.body = { error: err.message };
    }
});

router.put('/:id', async (ctx) => {
    const { shop } = ctx.session;
    const { id } = ctx.params;
    const new_data = ctx.request.body;
    const tax_rate = await TaxRate.findOneAndUpdate({ _id: id, shop }, new_data, { new: true })
    if (!tax_rate) {
        ctx.status = 404;
        ctx.body = {};
        return
    }
    ctx.status = 200;
    ctx.body = tax_rate;
});

router.delete('/:id', async (ctx) => {
    const { shop } = ctx.session;
    const { id } = ctx.params;
    const tax_rate = await TaxRate.findOne({ _id: id, shop })
    if (!tax_rate) {
        ctx.status = 404;
        ctx.body = {};
        return
    }
    await tax_rate.remove()
    ctx.status = 200;
    ctx.body = {};
});

const states = [
    { state_shortcode: "AL", state_name: "Alabama" },
    { state_shortcode: "AK", state_name: "Alaska" },
    { state_shortcode: "AS", state_name: "American Samoa" },
    { state_shortcode: "AZ", state_name: "Arizona", },
    { state_shortcode: "AR", state_name: "Arkansas", },
    { state_shortcode: "CA", state_name: "California", },
    { state_shortcode: "CO", state_name: "Colorado", },
    { state_shortcode: "CT", state_name: "Connecticut", },
    { state_shortcode: "DE", state_name: "Delaware", },
    { state_shortcode: "DC", state_name: "District Of Columbia", },
    { state_shortcode: "FM", state_name: "Federated States Of Micronesia", },
    { state_shortcode: "FL", state_name: "Florida", },
    { state_shortcode: "GA", state_name: "Georgia", },
    { state_shortcode: "GU", state_name: "Guam", },
    { state_shortcode: "HI", state_name: "Hawaii", },
    { state_shortcode: "ID", state_name: "Idaho", },
    { state_shortcode: "IL", state_name: "Illinois", },
    { state_shortcode: "IN", state_name: "Indiana", },
    { state_shortcode: "IA", state_name: "Iowa", },
    { state_shortcode: "KS", state_name: "Kansas", },
    { state_shortcode: "KY", state_name: "Kentucky", },
    { state_shortcode: "LA", state_name: "Louisiana", },
    { state_shortcode: "ME", state_name: "Maine", },
    { state_shortcode: "MH", state_name: "Marshall Islands", },
    { state_shortcode: "MD", state_name: "Maryland", },
    { state_shortcode: "MA", state_name: "Massachusetts", },
    { state_shortcode: "MI", state_name: "Michigan", },
    { state_shortcode: "MN", state_name: "Minnesota", },
    { state_shortcode: "MS", state_name: "Mississippi", },
    { state_shortcode: "MO", state_name: "Missouri", },
    { state_shortcode: "MT", state_name: "Montana", },
    { state_shortcode: "NE", state_name: "Nebraska", },
    { state_shortcode: "NV", state_name: "Nevada", },
    { state_shortcode: "NH", state_name: "New Hampshire", },
    { state_shortcode: "NJ", state_name: "New Jersey", },
    { state_shortcode: "NM", state_name: "New Mexico", },
    { state_shortcode: "NY", state_name: "New York", },
    { state_shortcode: "NC", state_name: "North Carolina", },
    { state_shortcode: "ND", state_name: "North Dakota", },
    { state_shortcode: "MP", state_name: "Northern Mariana Islands", },
    { state_shortcode: "OH", state_name: "Ohio", },
    { state_shortcode: "OK", state_name: "Oklahoma", },
    { state_shortcode: "OR", state_name: "Oregon", },
    { state_shortcode: "PW", state_name: "Palau", },
    { state_shortcode: "PA", state_name: "Pennsylvania", },
    { state_shortcode: "PR", state_name: "Puerto Rico", },
    { state_shortcode: "RI", state_name: "Rhode Island", },
    { state_shortcode: "SC", state_name: "South Carolina", },
    { state_shortcode: "SD", state_name: "South Dakota", },
    { state_shortcode: "TN", state_name: "Tennessee", },
    { state_shortcode: "TX", state_name: "Texas", },
    { state_shortcode: "UT", state_name: "Utah", },
    { state_shortcode: "VT", state_name: "Vermont", },
    { state_shortcode: "VI", state_name: "Virgin Islands", },
    { state_shortcode: "VA", state_name: "Virginia", },
    { state_shortcode: "WA", state_name: "Washington", },
    { state_shortcode: "WV", state_name: "West Virginia", },
    { state_shortcode: "WI", state_name: "Wisconsin", },
    { state_shortcode: "WY", state_name: "Wyoming" },
]

module.exports = router