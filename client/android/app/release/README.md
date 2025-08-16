# Release APK

This directory contains the release APK file for distribution.

## File: `app-release.apk`

This is the production-ready APK file that users can download and install on their Android devices.

**How to use:**
1. Download the `app-release.apk` file
2. Enable "Install from unknown sources" on your Android device
3. Install the APK file

**Note:** This APK is built with production configuration and connects to the live API server.

## Building Release APK

To generate a new release APK:

```bash
cd client
npm run build --mode production
npx cap sync android
npx cap open android
```

Then in Android Studio:
1. Go to Build → Generate Signed Bundle / APK
2. Choose APK
3. Select your keystore (or create one)
4. Build release variant
5. Replace the existing `app-release.apk` file
