# Electronic Gmail

> A Gmail client built with Electron for OS X and Windows

## Features

### OS X Only

- Shows number of unread emails in Dock.
- Able to handle mailto url.
 - You can use [RCDefaultApp](http://www.rubicode.com/Software/RCDefaultApp/) to set Electronic Gmail as your default email application.
 - The mail address will be filled in for you.

### All Platforms

- Shows notifications in the notification center when new emails come.
- Checks new email per ~10 seconds, which is faster than the default frequency of per ~2.5 minutes.
- Able to zoom in and remember the zoom factor, which is useful for large monitors.
- Able to add to Google Calendar from a string in the email indicating a date.
 - Select and right click on a date in your email.
 - Click on `Add to Calendar`.
 - If it's the first time, you'll be redirected to Google to do an OAuth2 authentication.
 - Then you can add an event to your Google Calendar with the date filled in there.

## Download

Please download the binary files from [Releases](https://github.com/764664/electronic-gmail/releases).

Windows version is not fully tested. You're encouraged to open an issue if you find any bugs.

## Credits

- [electron](https://github.com/electron/electron)
- [electron-packager](https://github.com/electron-userland/electron-packager)
- [gmail](https://github.com/paulot/gmail)