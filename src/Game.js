class Game {
  constructor (genome, state, { index, ui = false }) {
    this.state = state || this.init()
    this.index = index
    this.ui = ui
    this.turn = 0
    this.highestScore = +localStorage.getItem('highestScore') || +localStorage.getItem('maxAvg')

    this.brain = genome
    this.brain.score = 0

    if (this.ui) {
      this.$network = $('<div>').prop('class', 'network')
      this.$board = $('<div>').prop('class', 'board')
      this.$network
        .append('<h4>')
        .append(this.$board)
      $('#app').append(this.$network)
      this.render()
    }
  }
  init () {
    return _.concat(_.shuffle([1, 2, 3, 4, 5, 6, 7, 8]), 0)
  }
  update () {
    const before = this.state.join('')
    const input = this.input
    const output = this.brain.activate(input)[0]
    if (output < 0.25) this.up()
    else if (output >= 0.25 && output < 0.5) this.right()
    else if (output >= 0.5 && output < 0.75) this.down()
    else if (output >= 0.75) this.left()

    const score = this.score + (before === this.state.join('') ? 0 : 4)
    this.brain.score = score
    if (this.ui) {
      if (score > this.highestScore) {
        this.highestScore = score
        localStorage.setItem('highestScore', this.highestScore)
        $('.title').append(`<p>Higest score: ${this.highestScore}, Turn: ${this.turn}</p>`)
      }
      console.log(score)
      this.render()
    }
  }
  render () {
    this.$network.find('h4').text(`Turn: ${this.turn}`)
    this.$board.empty()
    this.state.forEach((value, i) => {
      if (value)
        this.$board.append(
          $('<div>').prop('class', `cell c${i+1}`).text(value)
        )
    })
  }
  findIndex (value) {
    return _.indexOf(this.state, 0)
  }
  up () {
    const emptyIndex = this.findIndex(0)
    let  { x, y } = this.toXY(emptyIndex)
    y = y - 1
    y = y < 0 ? 0 : y
    this.swap(emptyIndex, this.toIdx(x, y))
    this.turn++
  }
  right () {
    const emptyIndex = this.findIndex(0)
    let  { x, y } = this.toXY(emptyIndex)
    x = x + 1
    x = x > 2 ? 2 : x
    this.swap(emptyIndex, this.toIdx(x, y))
    this.turn++
  }
  down () {
    const emptyIndex = this.findIndex(0)
    let  { x, y } = this.toXY(emptyIndex)
    y = y + 1
    y = y > 2 ? 2 : y
    this.swap(emptyIndex, this.toIdx(x, y))
    this.turn++
  }
  left () {
    const emptyIndex = this.findIndex(0)
    let  { x, y } = this.toXY(emptyIndex)
    x = x - 1
    x = x < 0 ? 0 : x
    this.swap(emptyIndex, this.toIdx(x, y))
    this.turn++
  }
  swap (idxA, idxB) {
    const t = this.state[idxA]
    this.state[idxA] = this.state[idxB]
    this.state[idxB] = t
  }
  get score () {
    return this.state.reduce((acc, value, index) => {
      const { x: x1, y: y1 } = this.toXY(index)
      const { x: x2, y: y2 } = value === 0 ? this.toXY(8) : this.toXY(value - 1)
      return acc + 4 - (this.abs(x1 - x2) + this.abs(y1 - y2))
    }, 0)
  }
  get input () {
    return this.state.map(value => value / 8)
  }
  toXY (index) {
    return { x: index % 3, y: ~~(index / 3) }
  }
  toIdx (x, y) {
    return y * 3 + x
  }
  abs (x) {
    x = +x
    return x > 0 ? x : 0 - x
  }
}
