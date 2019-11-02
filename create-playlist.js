'use strict'

const commander = require('commander')

const OauthUtility = require('./oauth-utility')

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
  const authUrl = await oauthUtility.generateAuthUrl()
  console.log(`Sign in with your Google Account at: ${authUrl}`)
  const oauthClient = await oauthUtility.waitForCallback()
  console.log(oauthClient)
}
main()
