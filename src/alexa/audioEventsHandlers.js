const Youtube = require('simple-youtube-api')
const youtube = new Youtube(process.env.YOUTUBE_KEY)

const { log, info, error, getPlayParams } = require('../helper')

const state = require('../state')

const eventList = ['PlaybackFinished', 'PlaybackStopped', 'PlaybackFailed']

const standardHandlers = eventList.map(eventName => {
	return {
		canHandle(handlerInput) {
			return handlerInput.requestEnvelope.request.type === `AudioPlayer.${eventName}`
		},
		async handle(handlerInput) {
			info(eventName)
			return Promise.resolve(handlerInput.responseBuilder.getResponse())
		},
	}
})

const PlaybackStartedHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === `AudioPlayer.PlaybackStarted`
	},
	async handle(handlerInput) {
		const videoId = handlerInput.requestEnvelope.context.AudioPlayer.token
		info(`PlaybackStarted ${videoId}`)

		return Promise.resolve(handlerInput.responseBuilder.getResponse())
	},
}

const PlaybackPausedHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === `AudioPlayer.PlaybackPaused`
	},
	async handle(handlerInput) {
		// TODO: Handle offset and stuff
		console.log('paused', JSON.stringify(handlerInput))
		return Promise.resolve(handlerInput.responseBuilder.getResponse())
	},
}

const PlaybackNearlyFinishedHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === `AudioPlayer.PlaybackNearlyFinished`
	},
	async handle(handlerInput) {
		const videoId = handlerInput.requestEnvelope.context.AudioPlayer.token
		if (state.autoPlay) {
			return (
				youtube
					// Empty array sometimes when only querying 1
					// Seems to be the youtube api issue so let's just get 3 to be safe
					.searchVideos('', 3, { relatedToVideoId: videoId })
					.then(res => {
						const videoObj = res[0]
						info(`PlaybackNearlyFinished ${videoId} ${videoObj.id} \`${videoObj.title}\``)
						return handlerInput.responseBuilder
							.addAudioPlayerPlayDirective(...getPlayParams(videoObj.id, 'REPLACE_ENQUEUED'))
							.withShouldEndSession(true)
							.getResponse()
					})
					.catch(err => {
						console.log(err)
					})
			)
		}
		return Promise.resolve(handlerInput.responseBuilder.getResponse())
	},
}

module.exports = [...standardHandlers, PlaybackStartedHandler, PlaybackPausedHandler, PlaybackNearlyFinishedHandler]
