'use strict'

const http = require('http')
const url = require('url')

const { google } = require('googleapis')

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.force-ssl',
]

/**
 * This class handles a flow of retrieving OAuth access token from a user.
 */
class OauthUtility {
  /**
   * Constructor.
   * @param {string} clientId OAuth client ID.
   * @param {string} clientSecret OAuth client secret.
   * @param {number} port Port number for local http server.
   */
  constructor(clientId, clientSecret, port) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.port = port

    const redirectUri = `http://127.0.0.1:${port}`

    this.oauthClient = new google.auth.OAuth2(
        this.clientId,
        this.clientSecret,
        redirectUri)
  }

  /**
   * Starts OAuth sign in flow.
   * @return {string} Authentication URL.
   */
  async generateAuthUrl() {
    return this.oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    })
  }

  /**
   * Waits until the callback is called.
   * @return {!Object} google.auth.OAuth2 object with refresh token set.
   */
  waitForCallback() {
    return new Promise((resolve, reject) => {
      const server = http.createServer(async (request, response) => {
        //console.log(`received a request: ${request.url}`)
        response.end('Great. Go back to the terminal to continue.')

        const urlToParse = `http://127.0.0.1:${this.port}${request.url}`
        const queryParameters = new url.URL(urlToParse).searchParams
        const code = queryParameters.get('code')

        //console.log(`code: ${code}`)

        // very bad hack. it should check for the actual callback path or state
        // to determine a valid callback.
        if (code) {
          //console.log('getting tokens...')

          const { tokens } = await this.oauthClient.getToken(code)
          this.oauthClient.setCredentials(tokens)

          //console.log(tokens)
          console.log('oauth credentials set')
          console.log('closing the server')

          server.close()
          resolve(this.oauthClient)
        }
      })
      server.listen(this.port)
      return
    })
  }
}

module.exports = OauthUtility
