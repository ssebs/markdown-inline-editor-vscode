// Jest setup file to handle ESM modules
// This file runs before tests to configure the environment

// Mock the require function to handle ESM modules
const originalRequire = require;
const Module = require('module');

// This is a workaround - in practice, we need Jest to transform these modules
// For now, we'll let the actual require() calls fail gracefully in tests
// and handle them in the parser-remark.ts file



