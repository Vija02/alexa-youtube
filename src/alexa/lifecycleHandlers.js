const { log, info, error } = require('../helper')

const LaunchRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
	},
	async handle(handlerInput) {
		return handlerInput.responseBuilder.speak('App Launched').getResponse()
	},
}

const ExitHandler = {
	async canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request

		return (
			request.type === 'IntentRequest' &&
			(request.intent.name === 'AMAZON.StopIntent' || request.intent.name === 'AMAZON.CancelIntent')
		)
	},
	handle(handlerInput) {
		return handlerInput.responseBuilder
			.speak('Goodbye!')
			.addAudioPlayerStopDirective()
			.getResponse()
	},
}

const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
	},
	handle(handlerInput) {
		info(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`)

		return handlerInput.responseBuilder.getResponse()
	},
}

module.exports = [LaunchRequestHandler, ExitHandler, SessionEndedRequestHandler]
