let hasSubString = (str, sub) => {
    //For case sensitive
    //let re = new RegExp(sub,"g");

    //for case insensitive
    let re = new RegExp(sub, "gi");

    return (str.match(re) || []).length !== 0;
}
module.exports = { hasSubString }