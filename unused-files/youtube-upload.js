console.log('file called')
// YouTube API video uploader using JavaScript/Node.js
// You can find the full visual guide at: https://www.youtube.com/watch?v=gncPwSEzq1s
// You can find the brief written guide at: https://quanticdev.com/articles/automating-my-youtube-uploads-using-nodejs
//
// Upload code is adapted from: https://developers.google.com/youtube/v3/quickstart/nodejs

const fs = require('fs');
const readline = require('readline');
const assert = require('assert')
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;


// video category IDs for YouTube:
const categoryIds = {
    Entertainment: 24,
    Education: 27,
    ScienceTechnology: 28
}

// If modifying these scopes, delete your previously saved credentials in client_oauth_token.json
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const TOKEN_PATH = '' + 'client_oauth_token.json';

const videoFilePath = 'vid.mp4'
const fileSize = fs.statSync(videoFilePath).size;
console.log('fileSize=',fileSize)

const thumbFilePath = 'thumb.png'

console.log('begin')
//exports.uploadVideo = (title, description, tags) => {
assert(fs.existsSync(videoFilePath))
assert(fs.existsSync(thumbFilePath))

console.log('auth1')
// Load client secrets from a local file.
fs.readFile('auth.json', function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    console.log('auth2')
    // Authorize a client with the loaded credentials, then call the YouTube API.
    authorize(JSON.parse(content), (auth) => uploadVideo(auth, title='a', description='b', tags='c'));
});

console.log('end func1')
//}

/**
 * Upload the video file.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function uploadVideo(auth, title, description, tags) {
    const service = google.youtube('v3')
    console.log('uploadVideo() auth=', auth)
    console.log('uploadVideo() videoFilePath=', videoFilePath)
    service.videos.insert({
        auth: auth,
        part: 'snippet,status',
        requestBody: {
            snippet: {
                title,
                description,
                tags,
                categoryId: categoryIds.ScienceTechnology,
                defaultLanguage: 'en',
                defaultAudioLanguage: 'en'
            },
            status: {
                privacyStatus: "private"
            },
        },
        media: {
            body: fs.createReadStream(videoFilePath),
        },
    },
    {
      // Use the `onUploadProgress` event from Axios to track the
      // number of bytes uploaded to this point.
      onUploadProgress: evt => {
        const progress = (evt.bytesRead / fileSize) * 100;
        //console.log(`${Math.round(progress)}% complete`);
        console.log(`${Math.round(progress * 100) / 100}% complete`);
      },
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log(response.data)

        console.log('Video uploaded. Uploading the thumbnail now.')
        service.thumbnails.set({
            auth: auth,
            videoId: response.data.id,
            media: {
                body: fs.createReadStream(thumbFilePath)
            },
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            console.log(response.data)
        })
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            console.log('SETTING oauth2Client.credentials, token = ', token)
            console.log('JSON.parse(token) = ', JSON.parse(token))
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        console.log('user entered code, now auth with it')

        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            console.log('setting oauth2Client.credentials = token = save to file', token)
            oauth2Client.credentials = token;
            console.log('oauth2Client = ', oauth2Client)

            storeToken(token);
            callback(oauth2Client);
        });
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


function getAllVideos(){
    console.log('getAllVideos()')
    try{
        var request = google.youtube('v3').client.youtube.channels.list({
            // mine: true indicates that we want to retrieve the channel for the authenticated user.
            mine: true,
            part: 'contentDetails'
          });
          request.execute(function(response) {
            playlistId = response.result.channels[0].contentDetails.uploads;
            console.log('playlistId=',playlistId)
          });
    }catch(err){
        console.log(err)
    }

}