'use strict'

const { google } = require('googleapis')

const MAX_RESULTS = 50

/**
 * This class provides utility functions around YouTube.
 */
class YouTubeUtility {
  /**
   * Constructor.
   * @param {!Object} oauthClient google.auth.OAuth2 object.
   */
  constructor(oauthClient) {
    this.oauthClient = oauthClient

    this.youTube = google.youtube({
      version: 'v3',
      auth: oauthClient,
    });
  }

  /**
   * Retrieves the upload playlist ID.
   * @param {string} username YouTube username.
   * @return {string} Upload playlist ID.
   */
  async uploadPlaylistId(username) {
    const response = await this.youTube.channels.list({
      part: 'contentDetails',
      forUsername: username,
    })
    return response.data.items[0].contentDetails.relatedPlaylists.uploads
  }

  /**
   * Retrieves playlist items.
   * @param {string} playlistId Playlist ID.
   */
  async videos(playlistId) {
    let data
    let count = 0
    let nextPageToken = null
    const videos = []
    do {
      data = await this.retrievePlaylistItems(playlistId, nextPageToken)
      console.log(data)
      videos.push(...data.items)
      nextPageToken = data.nextPageToken
      const totalResults = data.pageInfo.totalResults
      count += 1

      console.log(`retrived: ${count} / ${Math.floor(totalResults / MAX_RESULTS)}`)
      await this.wait(1000)
    } while (nextPageToken)

    return videos
  }

  /**
   * Retrieve videos.
   * @private
   * @param {string} playlistId Playlist ID.
   * @param {?string} nextPageToken Page token for next page.
   */
  async retrievePlaylistItems(playlistId, nextPageToken = null) {
    let parameters = {
      part: 'snippet',
      playlistId: playlistId,
      maxResults: MAX_RESULTS,
    }
    if (nextPageToken) {
      parameters = Object.assign({}, parameters, { pageToken: nextPageToken })
    }
    console.log(`sending parameters: ${JSON.stringify(parameters)}`)

    const response = await this.youTube.playlistItems.list(parameters)
    return response.data
  }

  /**
   * Waits.
   * @private
   * @param {number} milliseconds Milliseconds to wait.
   */
  wait(milliseconds) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, milliseconds)
    })
  }
}

module.exports = YouTubeUtility
