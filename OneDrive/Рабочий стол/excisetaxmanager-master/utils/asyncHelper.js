

const asyncForEach = async (array, callback) => {
  
  if(array == undefined)
    return null

  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {  asyncForEach, sleep }