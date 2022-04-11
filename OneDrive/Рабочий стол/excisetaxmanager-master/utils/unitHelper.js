function getUnitfromString(unit, text, inverse = false) {
    const regexp_string = inverse ? `(\\s*(${unit} ?)\\d+(\\.?\\d+)?)` : `(\\d+(?:\\.\\d+)?)\\s*(${unit})`;
    const regex = new RegExp(regexp_string, 'i')
    const reg_match = text.match(regex)

    let result = Number(reg_match && reg_match[1])
    if (!inverse)
        return Number(reg_match && reg_match[1])

    //Here we have unit with number so we should extract number with one more match
    const result_with_unit = reg_match && reg_match[1]
    //Khir vi ko
    if (result_with_unit) {
        const result = result_with_unit.match(/\d+/g);
        return Number(result && result[0])
    }
    return null
}

module.exports = { getUnitfromString }