# electron-youtube-upload
Use the Youtube-API to upload videos in an electron application

# Setup:
Clone repo
Run `npm i`
Run `npm start`
Right click + inspect element or press `ctrl=shift+i` to open developer console
Copy the login url in dev console, and pase it in your web-browser
Choose a google account / youtube app to sign in with
Once signed in, copy the code in the URL you get redirected to.
Example:
```
http://localhost/?code=4/000000BLAHBLAHBLAH/auth/abcabc
```
So copy this section:
```
4/000000BLAHBLAHBLAH/auth/abcabc
```
Paste the code in the text box, click submit, and you will now be able to upload videos. 