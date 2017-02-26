# Electronic Gmail

> A Gmail client built with Electron for macOS and Windows

## Features

### macOS Only

- Shows number of unread emails in Dock.
- Offers option to set as default application for handling mailto protocol.
 - The mail address will be filled out for you.

### All Platforms

- Shows notifications in the notification center when new emails come.
- Checks new email once per ~6 seconds
- Able to zoom in and remember the zoom factor, which is useful for larger displays.
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

## TODO

- Click on notification will navigate to the corresponding email