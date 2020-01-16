const ytdl = require('ytdl-core')
const ffmpeg = require('fluent-ffmpeg')

const { log, info, error } = require('./helper')

module.exports = app => {
	app.get('/video/:videoId', (req, res) => {
		try {
			const videoId = req.params.videoId

			log(`Start streaming on video with ID: ${videoId}`)

			const stream = ytdl(`http://www.youtube.com/watch?v=${videoId}`, {
				filter: 'audioonly',
			})
			const ffmpegProcess = new ffmpeg({ source: stream })

			res.setHeader('Content-disposition', 'attachment; filename=' + 'audio' + '.mp3')
			res.setHeader('Content-type', 'audio/mpeg')

			ffmpegProcess
				.withAudioCodec('libmp3lame')
				.toFormat('mp3')
				.output(res)
				.run()

			res.on('end', () => {
				info('Ended: response')
			})
			stream.on('end', () => {
				info('Ended: youtubedl stream')
				res.end()
			})
			ffmpegProcess.on('end', err => {
				info('Ended: ffmpeg')
				res.end()
			})
			ffmpegProcess.on('error', err => {
				error('ffmpegProcess Error')
				res.end()
			})
		} catch (err) {
			error(err)
			res.status(500)
		}
	})
}
