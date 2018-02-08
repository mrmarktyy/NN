const neataptic = require('neataptic')
const _ = require('lodash')
const json2csv = require('json2csv')
const fs = require('fs')

const Architect = neataptic.architect
const Methods = neataptic.methods

class Network {
  constructor ({id, config, trainingSet, testingSet}) {
    this.id = id
    this.config = config
    this.trainingSet = trainingSet
    this.testingSet = testingSet
    this.network = new Architect.Perceptron(this.config.input, this.config.hidden, this.config.output)
  }
  async train () {
    await this.network.train(this.trainingSet, {
      cost: Methods.cost[this.config.cost] || Methods.cost.MSE,
      error: this.config.error || 0.03,
      iterations: this.config.iterations || 10000,
      dropout: this.config.dropout || 0,
      schedule: {
        function: ({ error, iteration }) => console.log({ error, iteration }),
        iterations: this.config.log || 100,
      },
      batchSize: this.config.batchSize || 1
    })
  }
  test (report = true) {
    const fields = ['id', 'algorithm', 'manual', 'diff']
    const data = this.testingSet.map(({input, output, id}) => {
      const algorithm = +(this.network.activate(input) * 5).toFixed(1)
      const manual = +(output * 5).toFixed(1)
      const diff = +(algorithm - manual).toFixed(1)
      return { id, algorithm, manual, diff }
    })
    let output
    if (report) {
      output = {
        id: this.id,
        config: this.config,
        mean: _.meanBy(data, ({diff}) => Math.abs(diff)),
        max: _.maxBy(data, ({diff}) => Math.abs(diff)),
      }
      console.log(output)
      const csv = json2csv({ data, fields })
      fs.writeFile(`./output/${this.id}-${output.mean.toFixed(3)}.csv`, csv, {encoding: 'utf8'}, (err) => {
        if (err) throw err
      })
    }
    return output
  }
}

module.exports = Network
