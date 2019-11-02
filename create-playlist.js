'use strict'

const commander = require('commander')

const OauthUtility = require('./oauth-utility')
const YouTubeUtility = require('./you-tube-utility')

const PORT = 9000

/**
 * Main
 */
async function main() {
  const program = new commander.Command()
  program
      .requiredOption('-u, --username <string>', 'YouTube username')
      .requiredOption('-i, --clientid <string>', 'Google OAuth client ID')
      .requiredOption('-s, --clientsecret <string>', 'Google OAuth client secret')
  program.parse(process.argv)
  //console.log(program.opts())

  const youTubeUsername = program.username
  const oauthClientId = program.clientid
  const oauthClientSecret = program.clientsecret

  const oauthUtility = new OauthUtility(oauthClientId, oauthClientSecret, PORT)
  //const authUrl = await oauthUtility.generateAuthUrl()
  //console.log(`\nSign in with your Google Account at:\n${authUrl}\n`)
  //const oauthClient = await oauthUtility.waitForCallback()
  //console.log('came back from WaitForCallback')
  ////console.log(oauthClient)

  const oauthClient = oauthUtility.oauthClient
  const refreshToken = ''
  oauthClient.setCredentials({ refresh_token: refreshToken })

  const youTubeUtility = new YouTubeUtility(oauthClient)
  console.log('retrieving upload playlist id')
  const uploadPlaylistId =
      await youTubeUtility.uploadPlaylistId(youTubeUsername)
  console.log(uploadPlaylistId)

  const videos = await youTubeUtility.videos(uploadPlaylistId)
  console.log(videos)
}
main()
