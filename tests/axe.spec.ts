import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
// import { createHtmlReport } from "axe-html-reporter";

// テスト対象のページ一覧
const pages = [
  { path: "/", name: "home" },
  { path: "/page01/", name: "page01" },
  { path: "/page02/", name: "page02" },
  { path: "/page03/", name: "page03" },
];

function violationFingerprints(accessibilityScanResults) {
  const violationFingerprints = accessibilityScanResults.violations.map(
    (violation) => ({
      rule: violation.id,
      targets: violation.nodes.map((node) => node.target),
    }),
  );
  return JSON.stringify(violationFingerprints, null, 2);
}

// 各ページに対してテストを実行
for (const { path, name } of pages) {
  test(`a11y test / ${name}`, async ({ page }) => {
    await page.goto(`http://localhost:4321${path}`);

    // 現在のビューポートサイズを取得
    const viewport = page.viewportSize();
    const viewportLabel = viewport.width === 1440 ? 'desktop' : 'mobile';

    // axe-core を使ってアクセシビリティテストを実行
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // レポートのファイル名にページ名とビューポートサイズを含める
    // const reportFileName = `accessibility-report-${name}-${viewportLabel}`;

    // アクセシビリティテストの結果を出力
    // createHtmlReport({
    //   results,
    //   options: {
    //     outputDir: 'accessibility-reports',
    //     reportFileName,
    //   },
    // });

    // エラー発生時に詳細情報を出力
    if (results.violations.length > 0) {
      console.log(`Accessibility violations found on ${name} (${viewportLabel}):`);
      console.log(violationFingerprints(results));
    }

    // アクセシビリティテストの結果がエラーがないことを確認
    expect(results.violations.length, `Accessibility violations found on ${name} (${viewportLabel})`).toBe(0);
  });
}
