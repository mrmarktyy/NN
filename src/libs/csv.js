const csv = require('csvtojson')

module.exports = function (filePath) {
  let list = []
  return new Promise((resolve) => {
    csv()
      .fromFile(filePath)
      .on('end_parsed', (dataArray) => list = dataArray)
      .on('done', (error) => {
        if (error) return error
        resolve(list)
      })
    })
}
