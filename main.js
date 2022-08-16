const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const ytAuth = require('./youtube-auth');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    win.loadFile('index.html')

    
    win.webContents.openDevTools()
}

app.on('window-all-closed', function () {
    app.quit();
});

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    app.on('closed', function () {
        app = null;
    });
})

console.log('main ran')

//
// ipcMain Functions
//

ipcMain.handle('auth-with-token', async (event, token) => {
    console.log('auth-with-token()')
    let rsp = await ytAuth.authWithToken(token)
    return rsp
})



ipcMain.handle('create-Oauth2-Client', async (event, token) => {
    console.log('create-Oauth2-Client()')
    let rsp = await ytAuth.createOauth2Client(token)
    return rsp
})

//get auth url for user to log in
ipcMain.handle('get-auth-url', async (event) => {
    console.log('get-auth-url()')
    let url = await ytAuth.generateUrl()
    return url
})

//upload video from local filepath to youtube
ipcMain.handle('upload-video', async (event, vidFilepath, vidInfo, authToken, ) => {
    console.log('upload-video()')
    let vidStatus = await ytAuth.uploadVideo(vidFilepath, authToken, 'title', 'description', 'tags')
    return vidStatus
})

