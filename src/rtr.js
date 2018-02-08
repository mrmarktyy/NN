const neataptic = require('neataptic')
const _ = require('lodash')

const csv = require('./libs/csv')
const { expand } = require('./libs/config')
const Network = require('./Network')

const TRAINING_RATE = 0.5

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
  const networks = []
  const varitions = {
    hidden: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    cost: ['CROSS_ENTROPY', 'MSE', 'BINARY'],
    dropout: [0, 0.2, 0.4],
  }
  const configs = expand(varitions)
  configs.forEach(config => {
    networks.push(
      new Network({
        id: `${config.hidden}-${config.cost}-${config.dropout}`,
        config: Object.assign({}, {
          input: 16,
          output: 1,
          log: 1000,
          error: 0.0001,
          iterations: 10000,
          hidden: 8,
          cost: 'MSE',
          dropout: 0,
        }, {
          hidden: config.hidden,
          cost: config.cost,
          dropout: config.dropout,
        }),
        trainingSet,
        testingSet,
      })
    )
  })

  const results = networks.map(network => {
    network.train()
    return network.test()
  })
  console.log('done', results)
  // network.nodes[network.nodes.length - 1].squash = Methods.activation.RELU
}

main()
