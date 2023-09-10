# Electron Example App with Native Node Module 
This is an Electron To Do list example application to demonstrate how to use Electron Builder to package distributables for the Mac App Store and the Microsoft Store. This app uses a Sqlite database and the better-sqlite3 npm package which is a native node module (i.e., uses C++ code that needs to be recompiled).

Native node modules must be code signed for the Mac App Store.

This app goes along with the tutorials:<br>
<a href="https://gist.github.com/steve981cr/def310670dfd9ed1439bf31cc734f941">How to Release an Electron App on the Mac App Store</a><br>
<a href="https://gist.github.com/steve981cr/52ca0ae39403dba73a7dbdbe5d231bbf">How to Release an Electron App on the Microsoft Store</a>

# Mac App Store:
Steps to package this app for the Mac App store:<br>
Must be done on a Mac.

### Run it in development mode:
- Load the development dependencies electron and electron-builder:<br>
  `npm install -D electron`<br>
  `npm i -D electron-builder`
  `npm i better-sqlite3`
- Run the postinstall script to recompile the better-sqlite3 native node module:<br>
  `npm run postinstall`
- Run it in dev mode to make sure it works: `npm start`
- Optionally install nodemon as a global or development dependency `npm i -g nodemon` then execute the script `npm run dev`.

### Apple Signing Certificates:
- You need three signing certificates: 

Certificate | Target | Expiration
----------- | ------ | ----------
Apple Development | MAS dev | Expires in one year
Apple Distribution | MAS | Expires in one year
Mac Installer Distribution | MAS installer | Expires in one year

Add or update expired certificates with XCode:
Open XCode > Click the XCode menu > Select Preferences > Click Accounts > Click the Manage Certificates button > Click the + button in the lower left corner > Select the certificate type to create (Apple Development, Apple Distribution, Mac Installer Distribution).

View your certificates: `security find-identity -v`

### Provisioning Profiles

File | Target | Expiration
---- | ------ | ----------
AppleDevelopment.provisionprofile | MAS dev | Expires in one year
MacAppStore.provisionprofile | MAS | Expires in one year

Create development (local testing) and distribution provisioning profiles in your developer account: https://developer.apple.com/account/resources/profiles/list
Download them, rename them to AppleDevelopment.provisionprofile and MacAppStore.provisionprofile, and place them in the build/mac directory.

To read the files enter:
`security cms -D -i build/mac/AppleDevelopment.provisionprofile`

`security cms -D -i build/mac/MacAppStore.provisionprofile`

### Entitlement files:
Entitlements | Target | Expiration
------------ | ------ | ----------
entitlements.mas.plist | MAS | no expiration
entitlements.mas.inherit.plist | MAS | no expiration

- Use the entitlement files in the build/mac directory as is except for the TeamID.appID.
- Add your own TeamID.appID in the entitlements.mas.plist file on line 9.
  - Get Team ID from: https://developer.apple.com/account#MembershipDetailsCard
  - Get appID from: https://developer.apple.com/account/resources/identifiers/list. The appID is the "identifier.

### Package.json - Development Version
Update the package.json file and build the app for testing using the mas-dev target:

- The package.json file is set up for the mas-dev target. This build allows you can package the app and test it locally.
- At a minimum change the name, productName, and appId properties to your information.
- Run the script: `npm run dist` or `npm run distMac`
- A local packaged version of your app should be in the build/mas-dev folder. Double click it to launch it and to make sure it works.
- Test that the app is signed (Change Todo Example.app to your app's name if you changed it): `codesign --display --verbose=2 "dist/mas-dev/ToDo Example.app"`
- Test that the native node module is signed (Change Todo Example.app to your app's name if you changed it): `codesign --display --verbose=2 "dist/mas-dev/ToDo Example.app/Contents/Resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node"`

### Package.json - Distribution Version
Build the app for the Mac App Store using the mas target:

- In the package.json file, change the below "mac" properties:
```json
  "target": "mas",
  "type": "distribution",
  <remove the identity property>
  "provisioningProfile": "build/mac/MacAppStore.provisionprofile",
```

- Build the app for the mac app store: `npm run dist` or `npm run distMac`
- This will generate a .pkg installer in dist/mas/ToDo Example-1.0.0.pkg
- You will not be able to open the app since it was not signed by the Apple Store.
- Test that it is signed, changing the app name: `codesign --display --verbose=2 "dist/mas/ToDo Example.app"`
- Test that the native node module is signed, changing the app name: `codesign --display --verbose=2 "dist/mas/ToDo Example.app/Contents/Resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node"`
- Test that the pkg installer is signed, changing the app name: `pkgutil --check-signature "dist/mas/ToDo Example-1.0.0.pkg"`

_____________________________________________________________

# Microsoft Store:
Steps to package this app for the Microsoft Store:

- Must be packaged in a Windows environment (e.g., on a Windows PC or Mac with Parallels Pro Edition).
- Delete the node_modules folder and package-lock.json files if they were installed on Mac.
- Load the development dependencies electron and electron-builder:<br>
  `npm install -D electron`<br>
  `npm i -D electron-builder`
  `npm i better-sqlite3`
- Run the postinstall script to recompile the better-sqlite3 native node module:<br>
  `npm run postinstall`
- Run it in development mode to make sure it works: `npm start`

### package.json
- Change the values in the package.json file to your own:
  - Go to your Microsoft App Dashboard <a href="https://partner.microsoft.com/en-us/dashboard/apps-and-games/overview">partner.microsoft.com/en-us/dashboard/apps-and-games/overview</a> > click your App name > click Product Identity > Get the package: Identity/Name, Identity/Publisher, Properties/PublisherDisplayName. 
  - "identityName": "<i>Put Identity/Name value here</i>",
  - "publisher": "<i>Put Identity/Publisher value here</i>",
  - "publisherDisplayName": "<i>Put Properties/PublisherDisplayName value here</i>"

### Build the appx file
- Build the app for the Microsoft Store. Run the script: `npm run dist` or `npm run distWin`
- This will generate an executable app in build\win-unpacked\ToDo Example.exe
- And a .appx app installer in dist\ToDo Example 1.0.0.appx
