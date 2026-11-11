import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Web App Manifest (public/manifest.json)', () => {
  const manifestPath = path.resolve(__dirname, '../../public/manifest.json');

  it('exists and is valid JSON', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);
    expect(manifest).toBeDefined();
    expect(typeof manifest).toBe('object');
  });

  it('specifies core PWA identity and standalone mode', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.name).toBe('Stellar Bazaar - Cooperative Demand Protocol');
    expect(manifest.short_name).toBe('Stellar Bazaar');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#0f172a');
    expect(manifest.theme_color).toBe('#06b6d4');
  });

  it('includes web+stellar protocol handler for SEP-0007 links', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(Array.isArray(manifest.protocol_handlers)).toBe(true);
    const stellarHandler = manifest.protocol_handlers.find(
      (h: any) => h.protocol === 'web+stellar'
    );
    expect(stellarHandler).toBeDefined();
    expect(stellarHandler.url).toContain('/?sep7=%s');
  });

  it('defines required application icons', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    expect(manifest.icons.some((i: any) => i.sizes === '192x192')).toBe(true);
    expect(manifest.icons.some((i: any) => i.sizes === '512x512')).toBe(true);
  });
});
