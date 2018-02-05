const neataptic = require('neataptic')
const _ = require('lodash')
const json2csv = require('json2csv')
const fs = require('fs')
const csv = require('./libs/csv')

const Layer = neataptic.Layer
const Network = neataptic.Network
const Architect = neataptic.architect
const Methods = neataptic.methods

const TRAINING_RATE = 0.8
const INPUT_SIZE = 16
const OUTPUT_SIZE = 1
const HIDDEN_SIZE = Math.floor((INPUT_SIZE + OUTPUT_SIZE) / 2)
// const HIDDEN_SIZE = 16

async function getDataset () {
  const homeloans = await csv('./data/homeloans.csv')
  const trainingSize = Math.floor(homeloans.length * TRAINING_RATE)
  const normalised = homeloans.map((h) => {
    return {
      input: [
        +h.extrarepaymentsallowed,
        +h.allowssplitloan,
        +h.hasoffsetaccount,
        +h.hasredrawfacility,
        +h.redrawactivationfee,
        +h.hasfortnightlyrepayments,
        +h.hasfulloffset,
        +h.hasmonthlyrepayments,
        +h.hasrepayholiday,
        +h.hasweeklyrepayments,
        +h.hasmortgageportability,
        +h.hasprincipalandinterest,
        +h.hasinterestonly,
        +h.hasconstructionfacility,
        +h.portabilitytransferfee / 1000,
        +h.totalcost / 150000,
      ],
      output: [+h.manual / 5],
      id: h.companyvariation,
    }
  })
  return {
    trainingSet: normalised.slice(0, trainingSize),
    testingSet: normalised.slice(trainingSize)
  }
}

async function main () {
  const { trainingSet, testingSet } = await getDataset()
  const network = new Architect.Perceptron(INPUT_SIZE, HIDDEN_SIZE, OUTPUT_SIZE)
  // network.nodes[network.nodes.length - 1].squash = Methods.activation.RELU
  await network.train(trainingSet, {
    cost: Methods.cost.MSE,
    log: 100,
    error: 0.0001,
    iterations: 20000,
  })


  const results = testingSet.map(({input, output, id}) => {
    const algorithm = +(network.activate(input) * 5).toFixed(1)
    const manual = +(output * 5).toFixed(1)
    const diff = +(algorithm - manual).toFixed(1)
    return {
      id,
      algorithm,
      manual,
      diff,
    }
  })

  const csv = json2csv({data: results, fields: ['id', 'algorithm', 'manual', 'diff']})
  fs.writeFile('./output/result.csv', csv, {encoding: 'utf8'}, (err) => {
    if (err) throw err
    console.log('done')
  })

  console.log('Mean Diff', _.meanBy(results, ({diff}) => Math.abs(diff)))
  console.log('Max Diff', _.maxBy(results, ({diff}) => Math.abs(diff)))
}

main()
