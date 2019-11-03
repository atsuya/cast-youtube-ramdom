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
      // to reduce loops for debugging
      //if (count >= 3) {
      //  console.log('exiting the loop for debugging')
      //  break
      //}

      data = await this.retrievePlaylistItems(playlistId, nextPageToken)
      videos.push(...data.items)
      nextPageToken = data.nextPageToken
      const totalResults = data.pageInfo.totalResults
      count += 1

      console.log(`retrived: ${count} / ${Math.ceil(totalResults / MAX_RESULTS)}`)
      await this.wait(1000)
    } while (nextPageToken)

    return videos
  }

  /**
   * Picks videos randomly.
   * @param {!Array<!Object>} videos A list of videos.
   * @param {number} numberOfVideos A number of videos to pick.
   * @return {!Array<!Object>} The videos being picked.
   */
  async pickVideos(videos, numberOfVideos) {
    const pickedVideos = new Map()

    while (pickedVideos.size < numberOfVideos) {
      const index = Math.floor(Math.random() * videos.length)
      if (!pickedVideos.has(index)) {
        const video = videos[index]
        pickedVideos.set(index, video)
      } else {
        console.log(`WARNING: the same index: ${index}`)
      }
    }

    return Array.from(pickedVideos.values())
  }

  /**
   * Creates a new playlist and add all videos to it.
   * @param {string} name New playlist name.
   * @param {!Array<!Object>} videos The videos to add.
   */
  async preparePlaylist(name, videos) {
    //console.log(videos[0].snippet.resourceId)
    console.log(`creating a new playlist: ${name}`)
    const playlistId = await this.createPlaylist(name)

    for (let index = 0; index < videos.length; index++) {
      const video = videos[index]
      const videoId = video.snippet.resourceId.videoId
      console.log(`adding a video [${index + 1}/${videos.length}]: ${videoId}`)

      await this.addVideoToPlaylist(playlistId, videoId)
    }
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
    //console.log(`sending parameters: ${JSON.stringify(parameters)}`)

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

  /**
   * Creates a new playlist.
   * @param {string} name New playlist name.
   * @return {string} Newly created playlist ID.
   */
  async createPlaylist(name) {
    const response = await this.youTube.playlists.insert({
      part: 'snippet',
      requestBody: {
        snippet: {
          title: name,
        },
      },
    })
    return response.data.id
  }

  /**
   * Adds a video to the playlist.
   * @param {string} playlistId The playlist ID.
   * @param {string} videoId The video ID to add.
   */
  async addVideoToPlaylist(playlistId, videoId) {
    const response = await this.youTube.playlistItems.insert({
      part: 'snippet',
      requestBody: {
        snippet: {
          playlistId: playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId: videoId,
          },
        },
      },
    })
    return response.data
  }
}

module.exports = YouTubeUtility
