// Copy and paste this into your browser's Developer Console (F12)
// This script will monitor the banner alignment in real-time as you resize

(function inspectResponsiveBanner() {
  console.clear();
  console.log('=== Responsive Banner Inspector ===');
  console.log('This will log alignment data every time you resize the window\n');

  const measureAlignment = () => {
    const banner = document.querySelector('.subscription-notification-container');
    const bannerWrapper = document.querySelector('.subscription-notification-wrapper');
    const postStream = document.querySelector('.post-stream');
    const firstPost = document.querySelector('.topic-post article');
    const topicBody = document.querySelector('.topic-body');

    if (!banner || !bannerWrapper) {
      console.log('❌ Banner not found on page');
      return;
    }

    const bannerRect = banner.getBoundingClientRect();
    const wrapperRect = bannerWrapper.getBoundingClientRect();
    const postStreamRect = postStream?.getBoundingClientRect();
    const firstPostRect = firstPost?.getBoundingClientRect();
    const topicBodyRect = topicBody?.getBoundingClientRect();

    const wrapperComputed = window.getComputedStyle(bannerWrapper);

    console.log('\n' + '='.repeat(60));
    console.log(`Viewport: ${window.innerWidth}px wide`);
    console.log('='.repeat(60));

    console.log('\n📦 Banner Wrapper Computed Styles:');
    console.log(`  width: ${wrapperComputed.width}`);
    console.log(`  max-width: ${wrapperComputed.maxWidth}`);
    console.log(`  margin-left: ${wrapperComputed.marginLeft}`);
    console.log(`  margin-right: ${wrapperComputed.marginRight}`);
    console.log(`  display: ${wrapperComputed.display}`);

    console.log('\n📐 Banner Wrapper Position:');
    console.log(`  Actual width: ${wrapperRect.width.toFixed(2)}px`);
    console.log(`  Left edge: ${wrapperRect.left.toFixed(2)}px`);
    console.log(`  Right edge: ${wrapperRect.right.toFixed(2)}px`);

    console.log('\n📐 Banner Container Position:');
    console.log(`  Width: ${bannerRect.width.toFixed(2)}px`);
    console.log(`  Left edge: ${bannerRect.left.toFixed(2)}px`);
    console.log(`  Right edge: ${bannerRect.right.toFixed(2)}px`);

    if (postStreamRect) {
      console.log('\n📊 Post Stream:');
      console.log(`  Width: ${postStreamRect.width.toFixed(2)}px`);
      console.log(`  Left edge: ${postStreamRect.left.toFixed(2)}px`);
      console.log(`  Right edge: ${postStreamRect.right.toFixed(2)}px`);

      const leftDiff = Math.abs(bannerRect.left - postStreamRect.left);
      const rightDiff = Math.abs(bannerRect.right - postStreamRect.right);

      console.log(`\n  vs Banner:`);
      console.log(`    Left difference: ${leftDiff.toFixed(2)}px`);
      console.log(`    Right difference: ${rightDiff.toFixed(2)}px`);
    }

    if (firstPostRect) {
      console.log('\n📊 First Post Article:');
      console.log(`  Width: ${firstPostRect.width.toFixed(2)}px`);
      console.log(`  Left edge: ${firstPostRect.left.toFixed(2)}px`);
      console.log(`  Right edge: ${firstPostRect.right.toFixed(2)}px`);

      const leftDiff = Math.abs(bannerRect.left - firstPostRect.left);
      const rightDiff = Math.abs(bannerRect.right - firstPostRect.right);

      console.log(`\n  vs Banner:`);
      console.log(`    Left difference: ${leftDiff.toFixed(2)}px`);
      console.log(`    Right difference: ${rightDiff.toFixed(2)}px`);

      if (leftDiff < 2 && rightDiff < 2) {
        console.log('    ✅ PERFECT ALIGNMENT!');
      } else if (leftDiff < 10 && rightDiff < 10) {
        console.log('    ⚠️  Close alignment');
      } else {
        console.log('    ❌ Misaligned');
      }
    }

    if (topicBodyRect) {
      console.log('\n📊 Topic Body:');
      console.log(`  Width: ${topicBodyRect.width.toFixed(2)}px`);
      console.log(`  Left edge: ${topicBodyRect.left.toFixed(2)}px`);
      console.log(`  Right edge: ${topicBodyRect.right.toFixed(2)}px`);

      const leftDiff = Math.abs(bannerRect.left - topicBodyRect.left);
      const rightDiff = Math.abs(bannerRect.right - topicBodyRect.right);

      console.log(`\n  vs Banner:`);
      console.log(`    Left difference: ${leftDiff.toFixed(2)}px`);
      console.log(`    Right difference: ${rightDiff.toFixed(2)}px`);
    }

    // Calculate what the actual margin values are
    const parentWidth = bannerWrapper.parentElement.offsetWidth;
    const wrapperWidth = wrapperRect.width;
    const actualLeftMargin = wrapperRect.left - bannerWrapper.parentElement.getBoundingClientRect().left;
    const actualRightMargin = (bannerWrapper.parentElement.getBoundingClientRect().right - wrapperRect.right);

    console.log('\n🔍 Calculated Margins:');
    console.log(`  Parent width: ${parentWidth}px`);
    console.log(`  Wrapper width: ${wrapperWidth.toFixed(2)}px`);
    console.log(`  Actual left margin: ${actualLeftMargin.toFixed(2)}px`);
    console.log(`  Actual right margin: ${actualRightMargin.toFixed(2)}px`);
    console.log(`  Margin difference: ${(actualLeftMargin - actualRightMargin).toFixed(2)}px`);

    return {
      viewport: window.innerWidth,
      banner: bannerRect,
      wrapper: wrapperRect,
      postStream: postStreamRect,
      firstPost: firstPostRect,
      topicBody: topicBodyRect,
      margins: {
        left: actualLeftMargin,
        right: actualRightMargin,
        difference: actualLeftMargin - actualRightMargin
      }
    };
  };

  // Initial measurement
  console.log('📸 Taking initial measurement...');
  const initialData = measureAlignment();

  // Set up resize listener
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      console.log('\n🔄 Window resized, measuring again...');
      measureAlignment();
    }, 250);
  });

  console.log('\n✅ Monitoring active! Resize your window to see updates.');
  console.log('💡 Tip: Watch the "Actual left margin" vs "Actual right margin" values');
  console.log('   The right margin should be 18px less than the left margin');

  return initialData;
})();
