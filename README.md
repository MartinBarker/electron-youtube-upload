# electron-youtube-upload
Use the Youtube-API to upload videos in an electron application
Based on this example: https://quanticdev.com/articles/automating-my-youtube-uploads-using-nodejs/
(The original example .js file is located inside unused-files\youtube-upload.js)

# Setup:
1) Clone repo
2) Run `npm i `
3) Get youtube api auth.json credentials file

To run this repo you will need an `auth.json` file placed in the root of this project.
    - Open google cloud, 
    - Create new project
    - go to APIs & Services page
    - enable apis and services
    - search 'youtube data api v3' and enable
    - click 'create credentials'
    - fill out form for app name and email
    - add scope: youtube upload
    - application type: desktop app
    - Download credentials as auth.json file
    - Should match format of 'example-auth.json'
    - While app is not published and is in 'testing' mode, you need to add whatever email you want to use as a test user on the 'OAuth consent screen' page

4) Run `npm start`
5) Click blue link to open in browser
6) sign in
7) copy all the text after `code=`
8) paste that code into electron window
9) you are now signed in and can choose a video to upload!

