const Alexa = require('ask-sdk')

const { log, info, error } = require('../helper')

const lifecycleHandlers = require('./lifecycleHandlers')
const videoPlayerHandlers = require('./videoPlayerHandlers')
const audioEventsHandlers = require('./audioEventsHandlers')

module.exports = app => {
	app.post('/', (req, res) => {
		const skill = Alexa.SkillBuilders.custom()
			.addRequestHandlers(...lifecycleHandlers, ...videoPlayerHandlers, ...audioEventsHandlers)
			.addErrorHandlers(ErrorHandler)
			.create()

		skill
			.invoke(req.body)
			.then(responseBody => {
				res.json(responseBody)
			})
			.catch(err => {
				error(err)
				res.status(500).send('Error during the request')
			})
	})
}

const logHandler = {
	canHandle(param) {
		log(JSON.stringify(param))
		return false
	},
	handle() {},
}
const ErrorHandler = {
	canHandle() {
		return true
	},
	handle(handlerInput, err) {
		error(`Error handled: ${err.message}`)
		error(JSON.stringify(handlerInput))
		const message = 'Invalid Command'

		return handlerInput.responseBuilder
			.speak(message)
			.reprompt(message)
			.getResponse()
	},
}
