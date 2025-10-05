# Change log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Fixed
- Editor initialization failure error handling. #INT-3366

## 2.3.1 - 2025-08-11

### Fixed
- JS files were missing in the NPM package. #TINY-12257

## 2.3.0 - 2025-07-31

### Changed
- Set the default channel to `8`. INT-3354

## 2.2.0 - 2025-05-29

### Added
- New `readonly` attribute that can be used to toggle the editor's `readonly` mode. #TINY-11911

## 2.1.0 - 2024-01-08

### Added
- Added new `statusbar` attribute that sets the editors `statusbar` config option.

### Fixed
- The `id` attribute was not being used as the id for the editor.

## 2.0.2 - 2023-03-27

### Fixed
- Updated CI library to latest
- Updated dependencies

## 2.0.1 - 2022-07-27

### Fixed
- Find an associated form even when in a nested shadow DOM.
- Updated dependencies to latest version

## 2.0.0 - 2022-04-08

### Changed
- License changed to MIT (from Apache 2) this matches TinyMCE 6 license
- Changed default cloudChannel to `'6'`.

### Fixed
- Updated dependencies to latest available versions.

## 1.2.0 - 2021-03-11

### Fixed
- Updated dependencies to latest available versions.

## 1.1.0 - 2021-01-07

### Changed
- Converted demo server app to TypeScript.
- Updated dependencies.
- Added eslint.
- Adopted beehive-flow branching and versioning process/tooling.

## 1.0.2 - 2020-09-22

### Changed
- Updated dependencies to latest available versions

## 1.0.1 - 2020-08-31

### Added
- Added CDN demo.

### Changed
- Updated README.md

## 1.0.0 - 2020-08-27

### Added
- Initial release of web component wrapper around TinyMCE.
