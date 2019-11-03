'use strict'

const commander = require('commander')

const OauthUtility = require('./oauth-utility')
const YouTubeUtility = require('./you-tube-utility')

const PORT = 9000
const NUMBER_OF_VIDEOS_TO_PICK = 100

/**
 * Main
 */
async function main() {
  const program = new commander.Command()
  program
      .requiredOption('-u, --username <string>', 'YouTube username')
      .requiredOption('-i, --clientid <string>', 'Google OAuth client ID')
      .requiredOption('-s, --clientsecret <string>', 'Google OAuth client secret')
      .requiredOption('-p, --playlistname <string>', 'New playlist name')
  program.parse(process.argv)
  //console.log(program.opts())

  const youTubeUsername = program.username
  const oauthClientId = program.clientid
  const oauthClientSecret = program.clientsecret
  const newPlaylistName = program.playlistname

  const oauthUtility = new OauthUtility(oauthClientId, oauthClientSecret, PORT)
  const authUrl = await oauthUtility.generateAuthUrl()
  console.log(`\nSign in with your Google Account at:\n${authUrl}\n`)
  const oauthClient = await oauthUtility.waitForCallback()
  //console.log('came back from WaitForCallback')
  //console.log(oauthClient)

  //const oauthClient = oauthUtility.oauthClient
  //const refreshToken = ''
  //oauthClient.setCredentials({ refresh_token: refreshToken })

  const youTubeUtility = new YouTubeUtility(oauthClient)
  //console.log('retrieving upload playlist id')
  const uploadPlaylistId =
      await youTubeUtility.uploadPlaylistId(youTubeUsername)
  //console.log(uploadPlaylistId)

  console.log(`retrieve all videos from playlist: ${uploadPlaylistId}`)
  const videos = await youTubeUtility.videos(uploadPlaylistId)
  const pickedVideos =
      await youTubeUtility.pickVideos(videos, NUMBER_OF_VIDEOS_TO_PICK)
  //console.log(pickedVideos)
  await youTubeUtility.preparePlaylist(newPlaylistName, pickedVideos)

  console.log('done')
}
main()
