# The Mainframe Android Production Readiness Guide

The current APK is a **debug APK for testing**, not a production release. Before publishing or distributing it broadly, complete the items below.

## 1. Create a production signing key

Create the signing key once and keep it secure:

```bash
keytool -genkeypair \
  -v \
  -keystore mainframe-upload.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias mainframe-upload
```

Do **not** commit `mainframe-upload.jks` to GitHub. Losing this key can prevent publishing future updates.

For Google Play, use **Play App Signing** and treat this key as the upload key.

## 2. Configure release signing

Create this private file:

```text
src-tauri/gen/android/keystore.properties
```

Contents:

```properties
keyAlias=mainframe-upload
password=YOUR_KEY_PASSWORD
storeFile=/absolute/path/to/mainframe-upload.jks
```

Then configure the release signing block in:

```text
src-tauri/gen/android/app/build.gradle.kts
```

Add the imports and signing configuration:

```kotlin
import java.io.FileInputStream
import java.util.Properties

val keystorePropertiesFile = rootProject.file("keystore.properties")
val keystoreProperties = Properties()

if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["password"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["password"] as String
        }
    }

    buildTypes {
        getByName("release") {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true
        }
    }
}
```

Add these entries to `.gitignore`:

```gitignore
src-tauri/gen/android/keystore.properties
*.jks
*.keystore
```

The Android signing key must be backed up securely. Never store it in the repository.

## 3. Fix sync security before releasing

The current sync server uses:

- HTTP on port `9377`.
- A PIN in the URL query string.
- An unauthenticated `/info` endpoint.

That is acceptable for early local testing, but it is not ideal for production.

Before release, the sync protocol should:

- Replace local HTTP with HTTPS or an authenticated encrypted transport.
- Send the PIN in an `Authorization` header rather than `?pin=...`.
- Add failed-attempt rate limiting.
- Expire the PIN after a short time, not only after a successful transfer.
- Require a pairing confirmation on both devices.
- Add database hash and schema/version checks before transferring.
- Avoid exposing unnecessary information through unauthenticated `/info`.
- Validate the remote device identity before accepting a database.

This is the most important technical production blocker in the current implementation.

## 4. Test Android lifecycle behavior

Test on real devices running Android 12 and newer, including the versions most relevant to the intended audience.

Test all of the following:

- Normal Wi-Fi router.
- Phone hotspot.
- Guest Wi-Fi with device isolation.
- Bluetooth enabled and disabled.
- Wi-Fi Direct unavailable.
- Screen locked during a large sync.
- App backgrounded during a large sync.
- Large databases.
- Interrupted transfers.
- Low storage.
- Permission denial and permission revocation.
- Repeated sync and merge operations.
- Upgrade from an older installed version.
- App reinstall and database restore.

For a production app, active transfers should use an Android-safe background mechanism such as a **foreground service**, so transfers do not stop when the app is backgrounded.

## 5. Add proper data protection

Before publishing, document:

- What data is stored locally.
- Whether the app makes network connections.
- Whether analytics or crash reporting is used.
- Whether local databases are encrypted at rest.
- How users export, delete, and restore data.
- What happens if a device is lost.
- How users recover from a damaged database.

This information is needed for the Google Play **Data safety** form and privacy policy.

## 6. Set production version metadata

The current Android defaults are:

```text
versionCode = 1
versionName = 1.0
```

Use a real release version, for example:

```text
versionCode = 1
versionName = 1.0.0
```

Every later Google Play release must increase `versionCode`.

Keep this application ID stable:

```text
com.kwadw.the-mainframe
```

Changing it later creates a different Android application.

## 7. Review Android permissions

The app currently uses permissions for:

- Nearby Wi-Fi devices.
- Bluetooth scanning.
- Bluetooth connections.
- Legacy location/Bluetooth support on older Android versions.
- Network access.

For production:

- Request permissions only when the user starts discovery.
- Explain why each permission is needed.
- Continue to work when BLE or Wi-Fi Direct permissions are denied.
- Remove permissions that are not strictly required.
- Verify permission declarations against current Google Play policy.

Bluetooth is used for discovery, not bulk database transfer. Bulk transfer should use the faster encrypted Wi-Fi, hotspot, or LAN path.

## 8. Build production artifacts

### Google Play

The preferred Google Play artifact is an Android App Bundle:

```bash
npm run tauri android build -- --release --target aarch64 --aab
```

Do not upload the debug APK to Google Play.

### Direct APK distribution

For a signed release APK:

```bash
npm run tauri android build -- --release --target aarch64 --apk
```

Verify the resulting APK:

```bash
apksigner verify --verbose path/to/release.apk
```

The `aarch64` build is appropriate for most modern Android phones. Build additional architecture variants or a universal APK if older devices must be supported.

## 9. Recommended production sequence

1. Finish HTTPS/authenticated sync.
2. Add transfer resume, cancellation, and foreground transfer handling.
3. Create and securely back up the signing key.
4. Configure release signing.
5. Set the final version number.
6. Test on multiple real Android devices.
7. Build a signed `.aab`.
8. Upload it to Google Play internal testing.
9. Test installation, upgrades, permissions, sync, and rollback.
10. Complete the privacy policy and Data safety form.
11. Release gradually.

## Current status

The current APK is suitable for **internal alpha testing**. It is not yet a production release because release signing, encrypted sync transport, Android lifecycle testing, privacy/data-safety documentation, and final release configuration still need to be completed.
