# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-27

### Added
- Initial release of PocketVex - Schema migration system for PocketBase
- **Schema-as-Code**: Define PocketBase schema in TypeScript
- **Real-time Migration**: Watch schema files and apply changes automatically
- **Safe vs Unsafe Operations**: Automatic categorization and handling of schema changes
- **Migration Generation**: Generate migration files for production deployments
- **Development Server**: Hot-reload schema changes during development
- **Unified CLI**: Comprehensive command-line interface with organized commands
- **JavaScript VM Integration**: Full support for PocketBase JavaScript features
- **Event Hooks**: Custom business logic with TypeScript definitions
- **Scheduled Jobs**: CRON jobs for automation and background tasks
- **Console Commands**: Custom CLI commands for database management
- **Raw Database Queries**: Advanced SQL operations with type safety
- **Type Generation**: Automatic TypeScript types from schema definitions
- **Interactive Demos**: Comprehensive demo system for learning and testing
- **Convex-like Experience**: Complete development workflow similar to Convex
- **Host Selection**: Interactive host selection with credential caching
- **Credential Management**: Secure credential storage and management
- **File Watching**: Automatic detection and deployment of JavaScript VM files
- **Hot Reload**: No manual intervention required during development

### Features
- Support for all PocketBase field types (text, number, bool, email, url, date, select, json, file, relation, editor)
- Comprehensive schema validation and diff analysis
- Migration rollback support
- Environment-specific configuration
- Programmatic API for library usage
- Rich text editor field support
- Custom schema loading
- Migration hooks for data transformation
- Safety features including dry-run mode and backup generation

### Technical
- Built with Bun for fast development experience
- ESM module support
- TypeScript definitions included
- Node.js 18+ compatibility
- Comprehensive error handling and logging
- Secure credential encryption and storage
