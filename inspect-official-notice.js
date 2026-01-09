// Copy and paste this into your browser's Developer Console (F12)
// This script will inspect the Official Notice banner styling

(function inspectOfficialNotice() {
  console.clear();
  console.log('=== Official Notice Banner Inspector ===\n');

  // Get elements
  const officialNotice = document.querySelector('.row.global-notice-alert') ||
                         document.querySelector('.global-notice') ||
                         document.querySelector('[class*="notice"]');
  const customBanner = document.querySelector('.subscription-notification-wrapper');
  const postStream = document.querySelector('.post-stream');
  const firstPost = document.querySelector('.topic-post article');

  const inspectElement = (el, label) => {
    if (!el) {
      console.log(`❌ ${label} not found`);
      return null;
    }

    const computed = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const parent = el.parentElement;
    const parentRect = parent?.getBoundingClientRect();

    console.log(`\n📦 ${label}:`);
    console.log('  Class:', el.className);
    console.log('  Tag:', el.tagName.toLowerCase());

    console.log('\n  Computed Styles:');
    console.log(`    width: ${computed.width}`);
    console.log(`    max-width: ${computed.maxWidth}`);
    console.log(`    margin-left: ${computed.marginLeft}`);
    console.log(`    margin-right: ${computed.marginRight}`);
    console.log(`    padding-left: ${computed.paddingLeft}`);
    console.log(`    padding-right: ${computed.paddingRight}`);
    console.log(`    position: ${computed.position}`);
    console.log(`    left: ${computed.left}`);
    console.log(`    right: ${computed.right}`);
    console.log(`    display: ${computed.display}`);
    console.log(`    box-sizing: ${computed.boxSizing}`);

    console.log('\n  Position:');
    console.log(`    Left edge: ${rect.left.toFixed(2)}px`);
    console.log(`    Right edge: ${rect.right.toFixed(2)}px`);
    console.log(`    Width: ${rect.width.toFixed(2)}px`);

    if (parent && parentRect) {
      const leftOffset = rect.left - parentRect.left;
      const rightOffset = parentRect.right - rect.right;
      console.log('\n  Relative to Parent:');
      console.log(`    Left offset: ${leftOffset.toFixed(2)}px`);
      console.log(`    Right offset: ${rightOffset.toFixed(2)}px`);
      console.log(`    Parent: ${parent.className || parent.tagName}`);
    }

    // Add visual outline
    el.style.outline = '3px solid orange';
    el.style.outlineOffset = '-3px';

    return {
      element: label,
      className: el.className,
      computed: {
        width: computed.width,
        maxWidth: computed.maxWidth,
        marginLeft: computed.marginLeft,
        marginRight: computed.marginRight,
        position: computed.position,
        left: computed.left,
        right: computed.right,
      },
      rect: {
        left: rect.left,
        right: rect.right,
        width: rect.width,
      }
    };
  };

  // Inspect the official notice
  const noticeData = inspectElement(officialNotice, 'Official Notice Banner');

  // Inspect our custom banner
  const customData = inspectElement(customBanner, 'Custom Subscription Banner');

  // Inspect post stream for reference
  const postStreamData = inspectElement(postStream, 'Post Stream');

  // Compare alignment
  if (noticeData && customData) {
    console.log('\n\n🔍 ALIGNMENT COMPARISON:');
    console.log('========================================');

    const leftDiff = Math.abs(noticeData.rect.left - customData.rect.left);
    const rightDiff = Math.abs(noticeData.rect.right - customData.rect.right);
    const widthDiff = Math.abs(noticeData.rect.width - customData.rect.width);

    console.log(`Official Notice left:  ${noticeData.rect.left.toFixed(2)}px`);
    console.log(`Custom Banner left:    ${customData.rect.left.toFixed(2)}px`);
    console.log(`Difference:            ${leftDiff.toFixed(2)}px\n`);

    console.log(`Official Notice right: ${noticeData.rect.right.toFixed(2)}px`);
    console.log(`Custom Banner right:   ${customData.rect.right.toFixed(2)}px`);
    console.log(`Difference:            ${rightDiff.toFixed(2)}px\n`);

    console.log(`Official Notice width: ${noticeData.rect.width.toFixed(2)}px`);
    console.log(`Custom Banner width:   ${customData.rect.width.toFixed(2)}px`);
    console.log(`Difference:            ${widthDiff.toFixed(2)}px`);
  }

  // Get all relevant CSS rules for the official notice
  if (officialNotice) {
    console.log('\n\n📝 CSS CLASSES TO MIMIC:');
    console.log('========================================');
    console.log('Official Notice classes:', officialNotice.className);

    // Try to find parent wrapper
    let parent = officialNotice.parentElement;
    let depth = 0;
    console.log('\nParent hierarchy:');
    while (parent && depth < 5) {
      console.log(`  ${depth + 1}. <${parent.tagName.toLowerCase()}${parent.className ? ' class="' + parent.className + '"' : ''}>`);
      const parentComputed = window.getComputedStyle(parent);
      console.log(`     width: ${parentComputed.width}, max-width: ${parentComputed.maxWidth}, margin: ${parentComputed.marginLeft} ${parentComputed.marginRight}`);
      parent = parent.parentElement;
      depth++;
    }
  }

  console.log('\n\n🎨 Visual Highlights Added:');
  console.log('🟠 Orange outline = Official Notice');
  console.log('🔵 Blue outline = Custom Banner (if present)');
  console.log('\nReload page to remove outlines');

  console.log('\n\n💡 RECOMMENDATION:');
  console.log('Copy the CSS structure from the Official Notice banner');
  console.log('to ensure consistent alignment with Discourse patterns.');

  return {
    officialNotice: noticeData,
    customBanner: customData,
    postStream: postStreamData,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
})();
