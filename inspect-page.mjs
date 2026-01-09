import { chromium } from 'playwright';

async function inspectDiscourse() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // You'll need to provide the URL
  const url = process.argv[2];
  if (!url) {
    console.error('Please provide a Discourse topic URL as an argument');
    process.exit(1);
  }

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for content to load
  await page.waitForTimeout(3000);

  // Inspect the post stream container
  const postStreamInfo = await page.evaluate(() => {
    const postStream = document.querySelector('.post-stream');
    const topic = document.querySelector('#topic-title');
    const mainOutlet = document.querySelector('#main-outlet');
    const bannerWrapper = document.querySelector('.subscription-notification-wrapper');
    const bannerContainer = document.querySelector('.subscription-notification-container');

    const getComputedStyles = (el) => {
      if (!el) return null;
      const computed = window.getComputedStyle(el);
      return {
        width: computed.width,
        maxWidth: computed.maxWidth,
        marginLeft: computed.marginLeft,
        marginRight: computed.marginRight,
        paddingLeft: computed.paddingLeft,
        paddingRight: computed.paddingRight,
        boxSizing: computed.boxSizing,
        offsetWidth: el.offsetWidth,
        clientWidth: el.clientWidth,
        boundingRect: el.getBoundingClientRect()
      };
    };

    return {
      postStream: getComputedStyles(postStream),
      topic: getComputedStyles(topic),
      mainOutlet: getComputedStyles(mainOutlet),
      bannerWrapper: getComputedStyles(bannerWrapper),
      bannerContainer: getComputedStyles(bannerContainer),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  });

  console.log('\n=== Viewport Info ===');
  console.log(JSON.stringify(postStreamInfo.viewport, null, 2));

  console.log('\n=== Main Outlet (#main-outlet) ===');
  console.log(JSON.stringify(postStreamInfo.mainOutlet, null, 2));

  console.log('\n=== Post Stream (.post-stream) ===');
  console.log(JSON.stringify(postStreamInfo.postStream, null, 2));

  console.log('\n=== Topic Title (#topic-title) ===');
  console.log(JSON.stringify(postStreamInfo.topic, null, 2));

  console.log('\n=== Banner Wrapper (.subscription-notification-wrapper) ===');
  console.log(JSON.stringify(postStreamInfo.bannerWrapper, null, 2));

  console.log('\n=== Banner Container (.subscription-notification-container) ===');
  console.log(JSON.stringify(postStreamInfo.bannerContainer, null, 2));

  // Test at different viewport sizes
  const viewports = [
    { width: 1920, height: 1080, label: 'Desktop Large' },
    { width: 1366, height: 768, label: 'Desktop Medium' },
    { width: 768, height: 1024, label: 'Tablet' },
    { width: 375, height: 667, label: 'Mobile' }
  ];

  console.log('\n=== Responsive Testing ===');
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(500);

    const metrics = await page.evaluate(() => {
      const postStream = document.querySelector('.post-stream');
      const banner = document.querySelector('.subscription-notification-container');

      if (!postStream || !banner) return null;

      const postRect = postStream.getBoundingClientRect();
      const bannerRect = banner.getBoundingClientRect();

      return {
        postStream: {
          left: postRect.left,
          right: postRect.right,
          width: postRect.width
        },
        banner: {
          left: bannerRect.left,
          right: bannerRect.right,
          width: bannerRect.width
        },
        alignment: {
          leftDiff: Math.abs(postRect.left - bannerRect.left),
          rightDiff: Math.abs(postRect.right - bannerRect.right),
          widthDiff: Math.abs(postRect.width - bannerRect.width)
        }
      };
    });

    console.log(`\n${vp.label} (${vp.width}x${vp.height}):`);
    console.log(JSON.stringify(metrics, null, 2));
  }

  await browser.close();
  console.log('\nInspection complete!');
}

inspectDiscourse().catch(console.error);
