import { apiInitializer } from "discourse/lib/api";
import { ajax } from "discourse/lib/ajax";

export default apiInitializer("category-subscribe-banner", (api) => {
  const themeSettings = settings;

  // Get banner styles
  const getBannerStyles = (isSubscribe) => {
    const baseStyles = "display: flex; align-items: center; gap: 16px; padding: 16px; padding-top: 20px;";
    const gradientColor = isSubscribe ? "var(--tertiary-50)" : "rgba(255,0,0,0.1)";
    return `${baseStyles} border: 1px solid var(--primary-low-mid); background: linear-gradient(90deg, ${gradientColor} 0%, var(--secondary) 100%); position: relative;`;
  };

  // Parse category IDs from settings
  const parseCategories = (categoryData) => {
    if (!categoryData) return [];

    // Handle string format (pipe-separated: "161|193")
    if (typeof categoryData === 'string') {
      return categoryData.split('|')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id) && id > 0);
    }

    // Handle array format
    if (Array.isArray(categoryData)) {
      return categoryData.map(item => {
        const id = typeof item === 'object' ? item.id : item;
        return parseInt(id);
      }).filter(id => !isNaN(id) && id > 0);
    }

    return [];
  };

  const showSubscribeBanner = () => {
    const currentUser = api.getCurrentUser();
    if (!currentUser) return;

    // Get topic from the page
    const topicController = api.container?.lookup?.("controller:topic");
    if (!topicController?.model) return;

    const topic = topicController.model;
    const category = topic.category;
    if (!category) return;

    const subscribeCategories = parseCategories(themeSettings.subscribe_categories);
    const watchingCategories = parseCategories(themeSettings.watching_categories);
    const subscribeExceptions = parseCategories(themeSettings.subscribe_category_name_only_exceptions);
    const watchingExceptions = parseCategories(themeSettings.watching_category_name_only_exceptions);

    // Check if category is in main lists OR exception lists
    const isNewsCategory = subscribeCategories.includes(category.id) || subscribeExceptions.includes(category.id);
    const isSecurityCategory = watchingCategories.includes(category.id) || watchingExceptions.includes(category.id);

    if (!isNewsCategory && !isSecurityCategory) {
      document.querySelector('.subscription-notification-wrapper')?.remove();
      return;
    }

    const watchedFirst = currentUser.watched_first_post_category_ids || [];
    const watched = currentUser.watched_category_ids || [];

    const shouldShowNewsButton = isNewsCategory && !watchedFirst.includes(category.id);
    const shouldShowSecurityButton = isSecurityCategory && !watched.includes(category.id);

    if (!shouldShowNewsButton && !shouldShowSecurityButton) {
      document.querySelector('.subscription-notification-wrapper')?.remove();
      return;
    }

    // Get label - check if category is in exception list (name only) or use full label
    const allCategories = api.container.lookup("site:main").get("categories");
    const parent = category.parent_category_id
      ? allCategories.find(c => c.id === category.parent_category_id)
      : null;

    // Categories in exception lists should show name only
    const isNameOnlyException = subscribeExceptions.includes(category.id) || watchingExceptions.includes(category.id);
    const fullLabel = isNameOnlyException ? category.name : (parent ? `${parent.name} ${category.name}` : category.name);

    // Remove existing
    document.querySelector('.subscription-notification-wrapper')?.remove();

    // Create banner with responsive CSS
    const wrapper = document.createElement('div');
    wrapper.className = 'subscription-notification-wrapper';

    let html = `<div class="subscription-notification-container">`;

    if (shouldShowNewsButton) {
      const newsStyles = getBannerStyles(true);
      html += `
        <div class="subscription-notification news-notification" style="${newsStyles}">
          <div style="position: absolute; top: 1px; left: 1px; right: 1px; height: 4px; background: var(--tertiary);"></div>
          <div style="flex: 1;">
            <h4 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 700;">Stay Informed</h4>
            <p style="margin: 0; color: var(--primary-medium);">Get notified of all ${fullLabel} topics</p>
          </div>
          <button class="btn btn-primary subscribe-news-btn" style="font-size: 1rem; font-weight: 400; padding: 0.5em 1em; border-radius: 25px;">Subscribe</button>
        </div>
      `;
    }

    if (shouldShowSecurityButton) {
      const securityStyles = getBannerStyles(false);
      html += `
        <div class="subscription-notification security-notification" style="${securityStyles}${shouldShowNewsButton ? ' margin-top: 12px;' : ''}">
          <div style="position: absolute; top: 1px; left: 1px; right: 1px; height: 4px; background: #ff0000;"></div>
          <div style="flex: 1;">
            <h4 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 700;">Stay Informed</h4>
            <p style="margin: 0; color: var(--primary-medium);">Receive all ${fullLabel} updates</p>
          </div>
          <button class="btn subscribe-security-btn" style="background: #ff0000; color: white; font-size: 1rem; font-weight: 400; padding: 0.5em 1em; border-radius: 25px; transition: background 0.2s;">Watch All</button>
        </div>
      `;
    }

    html += '</div>';
    wrapper.innerHTML = html;

    // Find insertion point
    const postStream = document.querySelector('.post-stream');
    const topicTitle = document.querySelector('#topic-title');
    const mainOutlet = document.querySelector('#main-outlet');

    let insertionPoint = postStream || topicTitle || mainOutlet;

    if (insertionPoint) {
      insertionPoint.insertAdjacentElement('beforebegin', wrapper);
    } else {
      console.error("Category Subscribe Banner: Could not find insertion point");
      return;
    }

    // Add hover effect for red Watch All button
    const securityBtn = wrapper.querySelector('.subscribe-security-btn');
    if (securityBtn) {
      securityBtn.addEventListener('mouseenter', () => {
        securityBtn.style.background = '#cc0000';
      });
      securityBtn.addEventListener('mouseleave', () => {
        securityBtn.style.background = '#ff0000';
      });
    }

    // Click handlers
    wrapper.querySelector('.subscribe-news-btn')?.addEventListener('click', () => {
      ajax(`/category/${category.id}/notifications`, {
        type: "POST",
        data: { notification_level: 4 }
      }).then(() => {
        if (!currentUser.watched_first_post_category_ids) {
          currentUser.watched_first_post_category_ids = [];
        }
        currentUser.watched_first_post_category_ids.push(category.id);
        wrapper.innerHTML = `<div style="background: var(--success-low); color: var(--success-high); padding: 16px; text-align: center; border: 1px solid var(--success); font-size: 15px; font-weight: 500;">✅ You're now subscribed to ${fullLabel}</div>`;
        setTimeout(() => wrapper.remove(), 5000);
      }).catch(err => {
        console.error("Category Subscribe Banner: Failed to subscribe", err);
        wrapper.innerHTML = `<div style="background: var(--danger-low); color: var(--danger-high); padding: 16px; text-align: center; border: 1px solid var(--danger); font-size: 15px; font-weight: 500;">❌ Failed to subscribe. Please try again.</div>`;
        setTimeout(() => wrapper.remove(), 5000);
      });
    });

    wrapper.querySelector('.subscribe-security-btn')?.addEventListener('click', () => {
      ajax(`/category/${category.id}/notifications`, {
        type: "POST",
        data: { notification_level: 3 }
      }).then(() => {
        if (!currentUser.watched_category_ids) {
          currentUser.watched_category_ids = [];
        }
        currentUser.watched_category_ids.push(category.id);
        wrapper.innerHTML = `<div style="background: var(--success-low); color: var(--success-high); padding: 16px; text-align: center; border: 1px solid var(--success); font-size: 15px; font-weight: 500;">✅ You'll receive all updates for ${fullLabel}</div>`;
        setTimeout(() => wrapper.remove(), 5000);
      }).catch(err => {
        console.error("Category Subscribe Banner: Failed to watch", err);
        wrapper.innerHTML = `<div style="background: var(--danger-low); color: var(--danger-high); padding: 16px; text-align: center; border: 1px solid var(--danger); font-size: 15px; font-weight: 500;">❌ Failed to watch category. Please try again.</div>`;
        setTimeout(() => wrapper.remove(), 5000);
      });
    });
  };

  // Try on page change
  api.onPageChange(() => {
    setTimeout(showSubscribeBanner, 300);
  });

  // Try on initial load
  setTimeout(showSubscribeBanner, 1000);
});
