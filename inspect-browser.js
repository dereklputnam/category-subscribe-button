// Copy and paste this into your browser's Developer Console (F12)
// while viewing a topic page with the subscription banner

(function inspectBannerAlignment() {
  console.clear();
  console.log('=== Banner Alignment Inspector ===\n');

  // Get elements
  const banner = document.querySelector('.subscription-notification-container');
  const bannerWrapper = document.querySelector('.subscription-notification-wrapper');
  const postStream = document.querySelector('.post-stream');
  const firstPost = document.querySelector('.topic-post article');
  const topicBody = document.querySelector('.topic-body');
  const topicTitle = document.querySelector('#topic-title');
  const mainOutlet = document.querySelector('#main-outlet');
  const wrap = document.querySelector('.wrap');

  // Helper to get computed styles
  const getStyles = (el, label) => {
    if (!el) {
      console.log(`❌ ${label} not found`);
      return null;
    }

    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    const info = {
      element: label,
      computed: {
        width: computed.width,
        maxWidth: computed.maxWidth,
        minWidth: computed.minWidth,
        marginLeft: computed.marginLeft,
        marginRight: computed.marginRight,
        paddingLeft: computed.paddingLeft,
        paddingRight: computed.paddingRight,
        boxSizing: computed.boxSizing,
        display: computed.display,
        justifyContent: computed.justifyContent
      },
      measurements: {
        offsetWidth: el.offsetWidth,
        clientWidth: el.clientWidth,
        scrollWidth: el.scrollWidth
      },
      position: {
        left: rect.left,
        right: rect.right,
        width: rect.width,
        x: rect.x
      }
    };

    console.log(`\n📦 ${label}:`);
    console.log(JSON.stringify(info, null, 2));

    return info;
  };

  // Inspect all elements
  const wrapInfo = getStyles(wrap, '.wrap (outer container)');
  const mainOutletInfo = getStyles(mainOutlet, '#main-outlet');
  const postStreamInfo = getStyles(postStream, '.post-stream');
  const firstPostInfo = getStyles(firstPost, '.topic-post article (actual post)');
  const topicBodyInfo = getStyles(topicBody, '.topic-body');
  const topicTitleInfo = getStyles(topicTitle, '#topic-title');
  const bannerWrapperInfo = getStyles(bannerWrapper, '.subscription-notification-wrapper');
  const bannerInfo = getStyles(banner, '.subscription-notification-container');

  // Compare alignment
  if (postStreamInfo && bannerInfo) {
    console.log('\n\n🔍 ALIGNMENT COMPARISON (Post Stream):');
    console.log('----------------------------------------');

    const leftDiff = Math.abs(postStreamInfo.position.left - bannerInfo.position.left);
    const rightDiff = Math.abs(postStreamInfo.position.right - bannerInfo.position.right);
    const widthDiff = Math.abs(postStreamInfo.position.width - bannerInfo.position.width);

    console.log(`Post Stream left:   ${postStreamInfo.position.left.toFixed(2)}px`);
    console.log(`Banner left:        ${bannerInfo.position.left.toFixed(2)}px`);
    console.log(`❌ Left diff:       ${leftDiff.toFixed(2)}px\n`);

    console.log(`Post Stream right:  ${postStreamInfo.position.right.toFixed(2)}px`);
    console.log(`Banner right:       ${bannerInfo.position.right.toFixed(2)}px`);
    console.log(`❌ Right diff:      ${rightDiff.toFixed(2)}px\n`);

    console.log(`Post Stream width:  ${postStreamInfo.position.width.toFixed(2)}px`);
    console.log(`Banner width:       ${bannerInfo.position.width.toFixed(2)}px`);
    console.log(`❌ Width diff:      ${widthDiff.toFixed(2)}px`);

    console.log('----------------------------------------');

    // Visual indicators
    if (leftDiff < 2 && rightDiff < 2) {
      console.log('✅ PERFECT ALIGNMENT!');
    } else if (leftDiff < 10 && rightDiff < 10) {
      console.log('⚠️  CLOSE - Minor misalignment');
    } else {
      console.log('❌ MISALIGNED - Needs adjustment');
    }
  }

  // Compare with actual post article
  if (firstPostInfo && bannerInfo) {
    console.log('\n\n🔍 ALIGNMENT COMPARISON (Actual Post Article):');
    console.log('----------------------------------------');

    const leftDiff = Math.abs(firstPostInfo.position.left - bannerInfo.position.left);
    const rightDiff = Math.abs(firstPostInfo.position.right - bannerInfo.position.right);
    const widthDiff = Math.abs(firstPostInfo.position.width - bannerInfo.position.width);

    console.log(`Post Article left:  ${firstPostInfo.position.left.toFixed(2)}px`);
    console.log(`Banner left:        ${bannerInfo.position.left.toFixed(2)}px`);
    console.log(`❌ Left diff:       ${leftDiff.toFixed(2)}px\n`);

    console.log(`Post Article right: ${firstPostInfo.position.right.toFixed(2)}px`);
    console.log(`Banner right:       ${bannerInfo.position.right.toFixed(2)}px`);
    console.log(`❌ Right diff:      ${rightDiff.toFixed(2)}px\n`);

    console.log(`Post Article width: ${firstPostInfo.position.width.toFixed(2)}px`);
    console.log(`Banner width:       ${bannerInfo.position.width.toFixed(2)}px`);
    console.log(`❌ Width diff:      ${widthDiff.toFixed(2)}px`);

    console.log('----------------------------------------');

    // Visual indicators
    if (leftDiff < 2 && rightDiff < 2) {
      console.log('✅ PERFECT ALIGNMENT WITH POST ARTICLE!');
    } else if (leftDiff < 10 && rightDiff < 10) {
      console.log('⚠️  CLOSE - Minor misalignment with post article');
    } else {
      console.log('❌ MISALIGNED - Needs adjustment to match post article');
    }
  }

  // Check viewport
  console.log('\n\n📐 VIEWPORT:');
  console.log(`Window width: ${window.innerWidth}px`);
  console.log(`Window height: ${window.innerHeight}px`);

  // Highlight elements visually
  console.log('\n\n🎨 Adding visual highlights...');

  if (postStream) {
    postStream.style.outline = '3px solid red';
    postStream.style.outlineOffset = '-3px';
  }

  if (firstPost) {
    firstPost.style.outline = '3px solid green';
    firstPost.style.outlineOffset = '-3px';
  }

  if (banner) {
    banner.style.outline = '3px solid blue';
    banner.style.outlineOffset = '-3px';
  }

  console.log('✅ Red outline = Post Stream container');
  console.log('✅ Green outline = Actual post article');
  console.log('✅ Blue outline = Banner');
  console.log('\nReload page to remove outlines');

  // Return data for further inspection
  return {
    wrap: wrapInfo,
    mainOutlet: mainOutletInfo,
    postStream: postStreamInfo,
    firstPost: firstPostInfo,
    topicBody: topicBodyInfo,
    topicTitle: topicTitleInfo,
    bannerWrapper: bannerWrapperInfo,
    banner: bannerInfo,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
})();
