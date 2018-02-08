const fs = require('fs')
const _ = require('lodash')

fs.readdir('./output', (err, files) => {
  if (err) throw err
  const reports = _.orderBy(
    files.map(file => {
      const [ hidden, cost, dropout, mean ] = file.replace('.csv', '').split('-')
      return {
        mean: +mean,
        hidden: +hidden,
        cost,
        dropout: +dropout,
        name: file,
      }
    }), 'mean', 'asc')
  fs.writeFile('stats.json', JSON.stringify(reports, null, 2), 'utf-8', (err) => {
    if (err) throw err
    console.log('done')
  })
})
