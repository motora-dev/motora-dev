/**
 * Jest setup file for ESM support
 * ESMモードでjestグローバルオブジェクトを利用可能にする
 */
import { jest } from '@jest/globals';

// グローバルにjestを公開
globalThis.jest = jest;
