
const { ipcRenderer } = window.require('electron');

createOauth2Client()
async function createOauth2Client(){
    console.log('createOauth2Client()')
    
    let token = localStorage.getItem("clientOauthToken");
    console.log('createOauth2Client() token=',token)

    let rsp = await ipcRenderer.invoke('create-Oauth2-Client', token);
    console.log('createOauth2Client() rsp=',rsp)

    if (token === null) {
        console.log('createOauth2Client() token not found')
        //token not found
        document.getElementById('client-oauth-token-status').innerHTML = 'Not Found'
        //generate url for user to visit
        let authUrl = await ipcRenderer.invoke('get-auth-url');
        console.log('authUrl=', authUrl)
        document.getElementById('client-auth-url').innerHTML = authUrl
        document.getElementById('client-auth-url').href = authUrl
    } else {
        console.log('createOauth2Client() token found')
        //token found
        document.getElementById('client-oauth-token-status').innerHTML = 'Token found'
    }


}

//clientAuthCheck()

async function clientAuthCheck() {
    let token = localStorage.getItem("clientOauthToken");
    console.log('token=', token)
    if (token === null) {
        //token not found
        document.getElementById('client-oauth-token-status').innerHTML = 'Not Found'
        //generate url for user to visit
        let authUrl = await ipcRenderer.invoke('get-auth-url');
        console.log('authUrl=', authUrl)
        document.getElementById('client-auth-url').innerHTML = authUrl
        document.getElementById('client-auth-url').href = authUrl
    } else {
        //token found
        document.getElementById('client-oauth-token-status').innerHTML = 'Token found'
    }
    //localStorage.setItem("lastname", "Smith");

    //let fileContents = await ipcRenderer.invoke('get-file-contents', 'client_oauth_token.json');
    //console.log('fileContents=',fileContents)
}

//attach files uploaded listener
//document.getElementById('fileUpload').addEventListener('change', handleFileSelect, false);

//handle files uploaded
document.getElementById('fileUpload').onchange = async function (e) {
    var files = e.currentTarget.files;
    console.log('Uploading first file: ', files)
    //get filepath of first file
    var videoFilepath = files[0].path
    let token = localStorage.getItem("clientOauthToken");
    let uploadVidStatus = await ipcRenderer.invoke('upload-video', videoFilepath=videoFilepath, vidInfo={title:'a'}, authToken=token);
    console.log('uploadVidStatus: ', uploadVidStatus)
};

async function getAllVideos(){
    console.log('getAllVideos()')
    let status = await ipcRenderer.invoke('get-all-videos');
    console.log(status)
}

//submit token button click
document.getElementById('tokenSubmit').onclick = async function () {
    let tokenVal = document.getElementById('tokenInput').value
    console.log("button was clicked: ", tokenVal);
    localStorage.setItem("clientOauthToken", tokenVal);
    document.getElementById('client-oauth-token-status').innerHTML = `Set: ${tokenVal}`
    console.log('auth-with-token')
    let authTokenRsp = await ipcRenderer.invoke('auth-with-token', tokenVal);
    console.log('authTokenRsp=',authTokenRsp)
    
}

//clear token clicked
document.getElementById('clearToken').onclick = function () {
    localStorage.removeItem('clientOauthToken')
}
