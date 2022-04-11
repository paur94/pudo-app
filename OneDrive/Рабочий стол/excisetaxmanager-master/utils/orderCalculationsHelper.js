

function getLineSubtotalData(order, line_item) {
    let refunded_quantity = 0
    order.refunds.forEach(refund => {
        refund.refund_line_items.forEach(refund_line => {
            if (refund_line.line_item_id == line_item.id) {
                refunded_quantity += refund_line.quantity
            }
        })
    })

    const quantity = Number(line_item.quantity)
    const final_quantity = quantity - refunded_quantity;

    if (final_quantity == 0)
        return { final_quantity }

    const line_discount = line_item.discount_allocations && line_item.discount_allocations.reduce((accumulator, a) => accumulator + a.amount, 0) || 0
    const line_sale_price = ((line_item.price * final_quantity) - line_discount) / final_quantity;

    return { line_sale_price, final_quantity }

}

module.exports = { getLineSubtotalData }