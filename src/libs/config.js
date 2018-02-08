const _ = require('lodash')

function expand (args) {
 let result = []
 Object.keys(args)
 	.forEach(attribute => {
    result = _.flatten(args[attribute]
      .map(value => ({[attribute]: value}))
      .map(value => result.length ? result.map(item => Object.assign({}, item, value)) : [value])
    )
 	})
	return result
}

module.exports =  {
	expand,
}
