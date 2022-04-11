const Router = require('koa-router');
const router = new Router();


router.get(`/`, async (ctx) => {
    const { shop } = ctx.session;
    ctx.status = 200;
    ctx.body = {yaay:"ok"};
})


function calcTax(){
    return 5;
}


module.exports = router