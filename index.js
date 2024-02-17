import puppeteer from "puppeteer";

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  try {
    const page = (await browser.pages())[0];

    await page.goto("https://humanbenchmark.com/tests/number-memory");

    await page.setViewport({ width: 1080, height: 1024 });

    await page.evaluate(() => {
      const elem = document.getElementsByClassName("number-memory-test")[0];
      let lastNum = "";
      let sent = true;
      const callback = () => {
        const num_elems = elem.getElementsByClassName("big-number");
        if (num_elems.length && num_elems[0].innerText != lastNum) {
          lastNum = num_elems[0].innerText;
          sent = false;
        }
        const inputs = elem.getElementsByTagName("input");
        if (!sent && inputs.length) {
          type_and_click(lastNum);
          sent = true;
        }
      };
      const observer = new MutationObserver(callback);
      const config = { subtree: true, childList: true };
      observer.observe(elem, config);
    });

    const memtest = await page.waitForSelector(".number-memory-test");

    async function type_and_click(value) {
      console.log(`VALUE: ${value}`);
      const input = await memtest.$("input");
      await input.type(value);
      const submit_button = await memtest.$("button");
      await submit_button.click();
      const next_button = await page.waitForSelector("button ::-p-text(NEXT)");
      await next_button.click();
    }

    page.exposeFunction("type_and_click", type_and_click);

    const start_button = await memtest.$("button");
    await start_button.click();
  } catch (e) {
    console.log(e);
  } finally {
    await browser.close();
  }
}

main();
