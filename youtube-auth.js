
const fs = require('fs');
const readline = require('readline');
const assert = require('assert')
const { google } = require('googleapis');
const { resolve } = require('path');
const OAuth2 = google.auth.OAuth2;
const { Console } = require('console');

// If modifying these scopes, delete your previously saved credentials in client_oauth_token.json
const SCOPES = [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtubepartner',
    'https://www.googleapis.com/auth/youtubepartner-channel-audit'
];
const TOKEN_PATH = '' + 'client_oauth_token.json';

const videoFilePath = 'vid.mp4'
const thumbFilePath = 'thumb.png'
const categoryIds = {
    Entertainment: 24,
    Education: 27,
    ScienceTechnology: 28
}

var oauth2Client = null;

async function createOauth2Client(token=null){
    return new Promise(async function (resolve, reject) {
        console.log('createOauth2Client() token=',token)
        fs.readFile('auth.json', async function processClientSecrets(err, content) {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }
            console.log('createOauth2Client() read auth.json file fine')
            // Authorize a client with the loaded credentials, then call the YouTube API.
            let credentials = JSON.parse(content)
            const clientSecret = credentials.installed.client_secret;
            const clientId = credentials.installed.client_id;
            const redirectUrl = credentials.installed.redirect_uris[0];
            oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
            
            /*
            //authenticate if token is available
            if(token){
                console.log('createOauth2Client()  authenticating token')
                //oauth2Client.credentials = JSON.parse(token);
                let tokenAuthRsp = await authWithToken(token)
                console.log('createOauth2Client()  tokenAuthRsp = ', tokenAuthRsp)
            }
            */

            // Check if we have previously stored a token.
            fs.readFile(TOKEN_PATH, async function(err, token) {
                if (err) {
                    console.log('err reading TOKEN_PATH (DOESNT EXIST?)')
                    //getNewToken(oauth2Client, callback);
                } else {
                    console.log('local file TOKEN_PATH read fine')
                    //oauth2Client.credentials = JSON.parse(token);
                    //let tokenAuthRsp = await authWithToken(token)
                    //console.log('local file TOKEN_PATH read fine, tokenAuthRsp = ', tokenAuthRsp)
                    
                    //oauth2Client.credentials = JSON.parse(token);
                    //callback(oauth2Client);
                }
            });

            console.log('createOauth2Client() done, oauth2Client = ',oauth2Client)
            resolve('createOauth2Client() done, oauth2Client = ',oauth2Client)
        });
    })
}

async function generateUrl() {
    return new Promise(async function (resolve, reject) {
        console.log('generateUrl()')
        // Load client secrets from a local file.
            console.log('generateUrl, oauth2Client = ',oauth2Client)
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log('Authorize this app by visiting this url: ', authUrl);
        resolve(authUrl)
    })
}

async function authWithToken(code) {
    return new Promise(async function (resolve, reject) {
        console.log('authWithToken() code=',code)
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                resolve(err);
            }
            console.log('authWithToken() got token=',token)
            oauth2Client.credentials = token;
            //store local token copy
            storeToken(token);
            resolve(token);
        })
    });
}


async function uploadVideo(vidFilepath, auth, title, description, tags) {
    return new Promise(async function (resolve, reject) {
        console.log('uploadVideo() oauth2Client = ', oauth2Client, ', vidFilepath=',vidFilepath)
        const service = google.youtube('v3')
        title='electron-upload'
        console.log('begin upload, title=',title)
        service.videos.insert({
            auth: oauth2Client,
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title:title,
                    description:description,
                    tags:tags,
                    categoryId: categoryIds.ScienceTechnology,
                    defaultLanguage: 'en',
                    defaultAudioLanguage: 'en'
                },
                status: {
                    privacyStatus: "private"
                },
            },
            media: {
                body: fs.createReadStream(vidFilepath),
            },
        }, function (err, response) {
            if (err) {
                console.log('Error uploading video: ' + err);
                console.log(response)
                resolve('Error uploading video: ' + err)
            }
            console.log('uploading video... ')
            console.log('------------\n', response, '------------\n')
            resolve('uploading video...')
        });
    })
}

async function getAllVideos() {
    return new Promise(async function (resolve, reject) {

        try{
            google.youtube('v3').channels.list({
                // mine: true indicates that we want to retrieve the channel for the authenticated user.
                auth: oauth2Client,
                mine: true,
                part: 'contentDetails'
            }, function (err, response) {
                if (err) {
                    console.log('getAllVideos() err: ' + err);
                    console.log(response)
                }
                console.log('success, response=')
                console.log('------------\n', response.data.items, '------------\n')
                playlistId = response.data.items[0].id
                console.log('playlistId=', playlistId)
                //resolve(playlistId)

                //now get uploaded videos
                google.youtube('v3').playlistItems.list({
                //var request = gapi.client.youtube.playlistItems.list({
                    auth: oauth2Client,
                    playlistId: playlistId,
                    part: 'snippet',
                }, function (err, response) {
                    if (err) {
                        console.log('get uploaded videos err: ' + err);
                        console.log(response)
                    }

                    console.log('get uploaded videos: response=',response)
                    // Go through response.result.playlistItems to view list of uploaded videos.
                    resolve('gotem')
                })


            });
        }catch(err){
            console.log(err)
            resolve(err)
        }
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
 function storeToken(token) {
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) throw err;
      console.log('Token stored to ' + TOKEN_PATH);
    });
  }

module.exports = {
    generateUrl, uploadVideo, createOauth2Client, authWithToken, getAllVideos

}

