import { After, Before, Status, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium } from "@playwright/test";

setDefaultTimeout(60_000);

Before(async function () {
  this.browser = await chromium.launch({
    headless: process.env.PWDEBUG !== "1" && process.env.PWDEBUG !== "console",
  });
  this.context = await this.browser.newContext({
    serviceWorkers: "block",
  });
  await this.context.addInitScript(() => {
    window.localStorage.clear();
  });
  this.page = await this.context.newPage();
});

After(async function (scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    await this.attach(await this.page.screenshot({ fullPage: true, timeout: 5_000 }), "image/png");
  }

  await this.page?.close();
  await this.context?.close();
  await this.browser?.close();
});
