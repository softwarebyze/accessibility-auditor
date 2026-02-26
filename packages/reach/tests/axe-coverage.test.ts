import { describe, expect, it } from 'vitest';
import {
  AXE_COVERAGE_ANALYSIS,
  WAVE_SPECIFIC_CHECKS,
  getCoverageReport,
} from '../src/core/axe-coverage.js';

describe('Axe Coverage Analysis', () => {
  describe('AXE_COVERAGE_ANALYSIS', () => {
    it('should have correct structure', () => {
      expect(AXE_COVERAGE_ANALYSIS).toBeDefined();
      expect(AXE_COVERAGE_ANALYSIS.wcagLevel).toBe('WCAG 2.1 AA');
      expect(AXE_COVERAGE_ANALYSIS.totalChecks).toBeGreaterThan(0);
      expect(AXE_COVERAGE_ANALYSIS.coveragePercentage).toBeGreaterThan(0);
      expect(AXE_COVERAGE_ANALYSIS.coveragePercentage).toBeLessThanOrEqual(100);
      expect(AXE_COVERAGE_ANALYSIS.checks).toBeInstanceOf(Array);
    });

    it('should have verified checks', () => {
      const verifiedChecks = AXE_COVERAGE_ANALYSIS.checks.filter((c) => c.verified);
      expect(verifiedChecks.length).toBeGreaterThan(0);

      // Check that verified checks have proper structure
      for (const check of verifiedChecks) {
        expect(check.id).toBeDefined();
        expect(check.description).toBeDefined();
        expect(check.wcagCriteria).toBeInstanceOf(Array);
        expect(check.wcagCriteria.length).toBeGreaterThan(0);
        expect(['critical', 'serious', 'moderate', 'minor']).toContain(check.impact);
        expect(typeof check.verified).toBe('boolean');
      }
    });

    it('should have specific verified checks we expect', () => {
      const checkIds = AXE_COVERAGE_ANALYSIS.checks.map((c) => c.id);

      // These are the core checks we've verified
      expect(checkIds).toContain('image-alt');
      expect(checkIds).toContain('label');
      expect(checkIds).toContain('color-contrast');
      expect(checkIds).toContain('html-has-lang');
      expect(checkIds).toContain('link-name');
      expect(checkIds).toContain('button-name');
    });

    it('should have proper WCAG criteria format', () => {
      for (const check of AXE_COVERAGE_ANALYSIS.checks) {
        for (const criterion of check.wcagCriteria) {
          // WCAG criteria should be in format like "1.1.1", "2.4.6", etc.
          expect(criterion).toMatch(/^\d+\.\d+\.\d+$/);
        }
      }
    });

    it('should have valid impact levels', () => {
      const validImpacts = ['critical', 'serious', 'moderate', 'minor'];

      for (const check of AXE_COVERAGE_ANALYSIS.checks) {
        expect(validImpacts).toContain(check.impact);
      }
    });
  });

  describe('WAVE_SPECIFIC_CHECKS', () => {
    it('should be an array of strings', () => {
      expect(WAVE_SPECIFIC_CHECKS).toBeInstanceOf(Array);
      expect(WAVE_SPECIFIC_CHECKS.length).toBeGreaterThan(0);

      for (const check of WAVE_SPECIFIC_CHECKS) {
        expect(typeof check).toBe('string');
        expect(check.length).toBeGreaterThan(0);
      }
    });

    it('should contain expected WAVE-specific checks', () => {
      expect(WAVE_SPECIFIC_CHECKS).toContain('alt_link_missing');
      expect(WAVE_SPECIFIC_CHECKS).toContain('alt_spacer_missing');
      expect(WAVE_SPECIFIC_CHECKS).toContain('form_label');
      expect(WAVE_SPECIFIC_CHECKS).toContain('th_scope');
      expect(WAVE_SPECIFIC_CHECKS).toContain('iframe');
    });
  });

  describe('getCoverageReport', () => {
    it('should generate a valid coverage report', () => {
      const report = getCoverageReport();

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('should contain key sections', () => {
      const report = getCoverageReport();

      expect(report).toContain('🔍 Axe-Core Accessibility Coverage Report');
      expect(report).toContain('✅ Verified Checks:');
      expect(report).toContain('📊 Estimated Coverage:');
      expect(report).toContain('🎯 WCAG Level:');
      expect(report).toContain('VERIFIED CHECKS');
      expect(report).toContain('ADDITIONAL CHECKS');
      expect(report).toContain('WAVE-SPECIFIC CHECKS');
      expect(report).toContain('CONFIDENCE LEVEL');
      expect(report).toContain('IMPORTANT LIMITATIONS');
    });

    it('should include verified check counts', () => {
      const report = getCoverageReport();
      const verifiedCount = AXE_COVERAGE_ANALYSIS.checks.filter((c) => c.verified).length;
      const totalCount = AXE_COVERAGE_ANALYSIS.checks.length;

      expect(report).toContain(`✅ Verified Checks: ${verifiedCount}/${totalCount}`);
    });

    it('should include coverage percentage', () => {
      const report = getCoverageReport();

      expect(report).toContain(
        `📊 Estimated Coverage: ${AXE_COVERAGE_ANALYSIS.coveragePercentage}%`
      );
    });

    it('should list verified checks with details', () => {
      const report = getCoverageReport();
      const verifiedChecks = AXE_COVERAGE_ANALYSIS.checks.filter((c) => c.verified);

      for (const check of verifiedChecks) {
        expect(report).toContain(check.id);
        expect(report).toContain(check.description);
        expect(report).toContain(`WCAG: ${check.wcagCriteria.join(', ')}`);
      }
    });

    it('should include confidence and limitation information', () => {
      const report = getCoverageReport();

      expect(report).toContain('💡 CONFIDENCE LEVEL: HIGH');
      expect(report).toContain('⚠️  IMPORTANT LIMITATIONS');
      expect(report).toContain('Automated testing catches ~30-50% of accessibility issues');
      expect(report).toContain('Manual testing with screen readers is still essential');
    });
  });
});
