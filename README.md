# 🎵 Offline Music Syncer (OMS)

A fast, smart CLI tool to **sync Apple Music (macOS) → Android** using
ADB.

------------------------------------------------------------------------

## ✨ Features

-   🔄 One-way sync (Mac → Android)
-   ⚡ Fast transfer using TAR streaming (auto-enabled)
-   🧠 Smart diff engine (ADD / UPDATE / DELETE)
-   📊 Clean progress bar with speed & ETA
-   🧪 Dry-run mode (preview changes safely)
-   📁 Config-driven setup
-   📱 Multi-device support (ADB)

------------------------------------------------------------------------

## 📦 Installation (Local)

``` bash
git clone https://github.com/Jayanthbm/offline-music-syncer
cd offline-music-syncer
npm install
```

Run directly:

``` bash
node bin/cli.js sync
```

------------------------------------------------------------------------

## ⚙️ Configuration

Create a file:

### `oms.config.json`

``` json
{
  "macRoot": "~/Music/Music/Media.localized/Music",
  "androidRoot": "/sdcard/Music",
  "extensions": [".mp3", ".m4a"],
  "ignore": [".DS_Store", ".thumbnails", ".stfolder"],
  "tarThreshold": 20
}
```

------------------------------------------------------------------------

## 🚀 Usage

### 🔍 List devices

``` bash
node bin/cli.js devices
```

------------------------------------------------------------------------

### 🔄 Sync music

``` bash
node bin/cli.js sync
```

------------------------------------------------------------------------

### 🧪 Dry run (safe preview)

``` bash
node bin/cli.js sync --dry-run
```

------------------------------------------------------------------------

### 🔍 Verbose mode

``` bash
node bin/cli.js sync --verbose
```

------------------------------------------------------------------------

## 🧠 How It Works

1.  Scan Mac music folder\
2.  Scan Android `/sdcard/Music`\
3.  Build file maps\
4.  Compute diff:
    -   ADD → copy to Android\
    -   UPDATE → overwrite\
    -   DELETE → remove from Android\
5.  Apply changes:
    -   Small changes → sequential push\
    -   Large changes → TAR streaming (fast)

------------------------------------------------------------------------

## ⚡ Performance

  Mode         Use Case
  ------------ -------------------
  Sequential   Small changes
  TAR          Large sync (auto)

------------------------------------------------------------------------

## 📊 Example Output

    Summary:
    ADD: 20
    UPDATE: 0
    DELETE: 0

    Auto-selected mode: TAR

    Progress |████████████████████| 100% | Batch transfer | 20/20 | 150 MB / 150 MB | 20 MB/s

    ✅ Sync completed

    Transferred: 150 MB
    Files      : 20
    Time       : 7.2s
    Avg Speed  : 20.8 MB/s

------------------------------------------------------------------------

## ⚠️ Requirements

-   macOS (Apple Music library)
-   Android device
-   ADB installed

``` bash
adb devices
```

------------------------------------------------------------------------

## 📌 Notes

-   Mac is the **source of truth**
-   Android folder will be mirrored
-   Hidden/system files are ignored

------------------------------------------------------------------------

## 🚧 Roadmap

-   [ ] Watch mode\
-   [ ] Resume support\
-   [ ] Global CLI install\
-   [ ] Hash sync (optional)

------------------------------------------------------------------------

## 🛠 Tech Stack

-   Node.js\
-   ADB\
-   cli-progress

------------------------------------------------------------------------

## 📄 License

MIT
