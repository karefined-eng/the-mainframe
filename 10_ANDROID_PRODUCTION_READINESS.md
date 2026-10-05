# The Mainframe Android Distribution Guide

The repository includes a reproducible GitHub Actions debug APK build for internal
testing. It is not a signed store release. The Android project under
`src-tauri/gen/android` is intentionally committed because Tauri uses it directly
for builds and it contains the Android manifest and Gradle configuration.

## Local Android setup

Install Node.js 18+, Rust with `rustup`, Android Studio, and the Android SDK
platform/build tools required by the checked-in Gradle project. Add the Android
Rust target once:

```bash
rustup target add aarch64-linux-android
npm ci
npm run tauri android dev
```

For a local debug APK:

```bash
npm run tauri android build -- --debug --target aarch64
```

The generated APK is under
`src-tauri/gen/android/app/build/outputs/apk/debug/`.

The project is not regenerated in CI. If `tauri android init` is needed after a
Tauri configuration change, commit the reviewed `src-tauri/gen/android` changes
so local and CI builds use the same project.

## GitHub Actions artifacts

`.github/workflows/android.yml` installs Node, Rust, the Android SDK/NDK, and the
`aarch64-linux-android` target before running `npm ci` and the Android debug build.
The unsigned/debug APK is uploaded as a workflow artifact for internal testing.
It is not suitable for Google Play.

The workflow does not sign artifacts. If CI signing is added later, store the
keystore as a base64-encoded `ANDROID_KEYSTORE_BASE64` repository secret and
provide `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, and
`ANDROID_STORE_PASSWORD` as repository secrets or protected environment
variables. Do not add those values to the workflow file or commit a keystore.

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
keyPassword=change-me
storeFile=/absolute/path/to/mainframe-upload.jks
storePassword=change-me
```

Use separate `keyPassword` and `storePassword` entries matching the key you
created. Keep this file and the keystore outside version control.

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
            keyPassword = keystoreProperties["keyPassword"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["storePassword"] as String
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

## 3. Sync limitations and security

The current sync server uses:

- HTTP on port `9377`.
- A PIN in the URL query string.
- An unauthenticated `/info` endpoint.

The Android manifest grants Internet access and release builds explicitly allow
cleartext traffic because this protocol is currently HTTP. The PIN is a useful
one-time pairing check on a trusted LAN, but it is not encryption and query
parameters may be visible to network observers. Treat sync as local-network-only
and do not use it across untrusted Wi-Fi, the public Internet, or a forwarded
port.

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

The preferred Google Play artifact is an Android App Bundle after signing is
configured:

```bash
npm run tauri android build -- --release --target aarch64 --aab
```

Do not upload the debug APK to Google Play.

### Direct APK distribution

For a signed release APK after configuring the local keystore:

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

The current APK is suitable for **internal alpha testing**. It is not yet a
production release because release signing, encrypted sync transport, Android
lifecycle testing, privacy/data-safety documentation, and final release
configuration still need to be completed. The Android sync UI currently
requires entering the source device's displayed IP and PIN manually; the QR
code is informational and is not scanned by the app.
