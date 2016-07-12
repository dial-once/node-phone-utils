# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- Support for async (bulk) phone number lookup via hlr-lookups.com provider
- Example of server implementation via expressjs and integration tests
- Lots of new tests to up the coverage to 100%
- Sonar tracking and code quality checking
- Bunch of badges in readme file

### Changed
- Refactored providers and simplified code by removing unneeded parts
- Removed the need to use ENABLE_HLR_LOOKUPS env var to specify fake or real lookup provider calls (breaking change)

## [1.0.0] - 2016-04-15
### Added
- Support for validating phone numbers
- Support for formatting phone numbers
- Support for checking if phone numbers are mobile
- Support for single phone number hlr lookup via smsapi.com and hlr-lookups.com providers
- Initial tests
