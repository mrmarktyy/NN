const Architect = neataptic.architect
const Methods = neataptic.methods
const Neat = neataptic.Neat

const ITERATIONS = 100
const ITERTATION_INTERVAL = 0
const POPSIZE = 10
const MUTATION_RATE = 0.3
const ELITISM_RATE = 0.1
const INPUT_NODES = 9
const HIDDEN_NODES = 5
const OUTPUT_NODES = 1

let MAX_GENERATION = 0
let STARTING_GENERATION = 0
let games
let neat
let state = [5, 4, 7, 8, 2, 6, 1, 3, 0]
let highestAvgScore = +localStorage.getItem('maxAvg')
$('.title').append(`<p>Generation #${localStorage.getItem('maxAvgGeneration')}, average score: ${localStorage.getItem('maxAvg')}</p>`)

function createNeat () {
  const options = {
    mutation: [
      Methods.mutation.ADD_NODE,
      Methods.mutation.SUB_NODE,
      Methods.mutation.ADD_CONN,
      Methods.mutation.SUB_CONN,
      Methods.mutation.MOD_WEIGHT,
      Methods.mutation.MOD_BIAS,
      Methods.mutation.MOD_ACTIVATION,
      Methods.mutation.ADD_GATE,
      Methods.mutation.SUB_GATE,
      Methods.mutation.ADD_SELF_CONN,
      Methods.mutation.SUB_SELF_CONN,
      Methods.mutation.ADD_BACK_CONN,
      Methods.mutation.SUB_BACK_CONN,
    ],
    popsize: POPSIZE,
    mutationRate: MUTATION_RATE,
    elitism: ~~(ELITISM_RATE * POPSIZE),
    network: new Architect.Perceptron(INPUT_NODES, HIDDEN_NODES, OUTPUT_NODES),
  }
  return new Neat(INPUT_NODES, OUTPUT_NODES, null, options)
}

function startEvaluation () {
  $('#app').empty()

  // let state = _.concat(_.shuffle([1, 2, 3, 4, 5, 6, 7, 8]), 0)
  games = neat.population.map((genome, index) => new Game(genome, state.slice(0), { index, ui: index === 0 }))

  startIteration()
}

function startIteration (i = 0) {
  if (i === ITERATIONS) {
    endEvaluation()
    return
  }
  for (let j = games.length - 1; j >= 0; j--) {
    games[j].update()
  }
  setTimeout(() => startIteration(++i), ITERTATION_INTERVAL)
}

function endEvaluation () {
  const avg = neat.getAverage()
  if (avg > highestAvgScore) {
    $('.title').append(`<p>Generation #${getCurrentGeneration()}, average score: ${avg}</p>`)
    highestAvgScore = avg
    localStorage.setItem('maxAvg', highestAvgScore)
    localStorage.setItem('maxAvgGeneration', getCurrentGeneration())
    localStorage.setItem('maxAvgPopulation', JSON.stringify(neat.export()))
  }
  savePopulation()

  neat.sort()
  const newPopulation = []
  for (let i = 0; i < neat.elitism; i++) {
    newPopulation.push(neat.population[i])
  }
  for (let i = 0; i < neat.popsize - neat.elitism; i++) {
    newPopulation.push(neat.getOffspring())
  }
  neat.population = newPopulation
  neat.mutate()
  neat.generation++

  if (neat.generation < MAX_GENERATION) {
    startEvaluation()
    return
  }
}

function getCurrentGeneration () {
  return STARTING_GENERATION + neat.generation
}

function savePopulation () {
  const population = JSON.stringify(neat.export())
  $('#output').val(population)
  $('#generation').text(`Current generation: ${getCurrentGeneration()}`)
  localStorage.setItem('output', population)
  localStorage.setItem('generation', getCurrentGeneration())
}

function loadPopulation () {
  const population = $('#output').val() || localStorage.getItem('output')
  STARTING_GENERATION = +localStorage.getItem('generation')
  $('#output').val(population)
  $('#generation').text(`Current generation: ${getCurrentGeneration()}`)
  neat.import(JSON.parse(population))
}

function clearPopulation () {
  $('#output').val('')
  localStorage.removeItem('output')
  localStorage.removeItem('generation')
}

(function main () {
  neat = createNeat()

  $('#start').click(() => {
    MAX_GENERATION += 5000
    startEvaluation()
  })
  $('#load').click(loadPopulation)
  $('#clear').click(clearPopulation)
})()

