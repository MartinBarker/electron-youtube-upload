
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
    'https://www.googleapis.com/auth/youtube.upload'
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
            
            //authenticate if token is available
            if(token){
                console.log('createOauth2Client()  authenticating token')
                //oauth2Client.credentials = JSON.parse(token);
                let tokenAuthRsp = await authWithToken(token)
                console.log('createOauth2Client()  tokenAuthRsp = ', tokenAuthRsp)
            }

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

module.exports = {
    generateUrl, uploadVideo, createOauth2Client, authWithToken

}