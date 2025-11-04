import { apiInitializer } from "discourse/lib/api";
import { ajax } from "discourse/lib/ajax";

export default apiInitializer("category-subscribe-banner", (api) => {
  console.log("🎯🎯🎯 Category Subscribe Banner: API Initializer Starting!");

  // Parse category IDs from settings
  const parseCategories = (categoryData) => {
    if (!categoryData) return [];
    if (Array.isArray(categoryData)) {
      return categoryData.map(item => {
        const id = typeof item === 'object' ? item.id : item;
        return parseInt(id);
      }).filter(id => !isNaN(id) && id > 0);
    }
    return [];
  };

  const showSubscribeBanner = () => {
    console.log("🎯 showSubscribeBanner called");

    const currentUser = api.getCurrentUser();
    if (!currentUser) {
      console.log("🎯 No user");
      return;
    }

    // Get topic from the page
    const topicController = api.container?.lookup?.("controller:topic");
    if (!topicController?.model) {
      console.log("🎯 No topic controller");
      return;
    }

    const topic = topicController.model;
    const category = topic.category;

    if (!category) {
      console.log("🎯 No category");
      return;
    }

    console.log("🎯 Category found:", category.name, "ID:", category.id);

    const subscribeCategories = parseCategories(settings.subscribe_categories);
    const watchingCategories = parseCategories(settings.watching_categories);

    console.log("🎯 Subscribe cats:", subscribeCategories);
    console.log("🎯 Watching cats:", watchingCategories);

    const isNewsCategory = subscribeCategories.includes(category.id);
    const isSecurityCategory = watchingCategories.includes(category.id);

    if (!isNewsCategory && !isSecurityCategory) {
      console.log("🎯 Category not in list");
      document.querySelector('.subscription-notification-wrapper')?.remove();
      return;
    }

    const watchedFirst = currentUser.watched_first_post_category_ids || [];
    const watched = currentUser.watched_category_ids || [];

    const shouldShowNewsButton = isNewsCategory && !watchedFirst.includes(category.id);
    const shouldShowSecurityButton = isSecurityCategory && !watched.includes(category.id);

    console.log("🎯 Should show news?", shouldShowNewsButton, "security?", shouldShowSecurityButton);

    if (!shouldShowNewsButton && !shouldShowSecurityButton) {
      console.log("🎯 Already subscribed");
      document.querySelector('.subscription-notification-wrapper')?.remove();
      return;
    }

    // Get label
    const allCategories = api.container.lookup("site:main").get("categories");
    const parent = category.parent_category_id
      ? allCategories.find(c => c.id === category.parent_category_id)
      : null;

    const subscribeExceptions = parseCategories(settings.subscribe_category_name_only_exceptions);
    const watchingExceptions = parseCategories(settings.watching_category_name_only_exceptions);

    let isNameOnlyException = false;
    if (shouldShowNewsButton && subscribeExceptions.includes(category.id)) {
      isNameOnlyException = true;
    } else if (shouldShowSecurityButton && watchingExceptions.includes(category.id)) {
      isNameOnlyException = true;
    }

    const fullLabel = isNameOnlyException ? category.name : (parent ? `${parent.name} ${category.name}` : category.name);

    console.log("🎯 Creating banner for:", fullLabel);

    // Remove existing
    document.querySelector('.subscription-notification-wrapper')?.remove();

    // Create banner
    const wrapper = document.createElement('div');
    wrapper.className = 'subscription-notification-wrapper';
    wrapper.style.cssText = 'margin: 20px 0; width: 100%;';

    let html = '<div class="subscription-notification-container" style="background: var(--secondary); border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">';

    if (shouldShowNewsButton) {
      html += `
        <div class="subscription-notification news-notification" style="display: flex; align-items: center; gap: 16px; border-left: 4px solid var(--tertiary); padding-left: 16px;">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 4px 0; font-size: 18px;">Stay Informed</h4>
            <p style="margin: 0; color: var(--primary-medium);">Get notified of all ${fullLabel} topics</p>
          </div>
          <button class="btn btn-primary subscribe-news-btn">Subscribe</button>
        </div>
      `;
    }

    if (shouldShowSecurityButton) {
      html += `
        <div class="subscription-notification security-notification" style="display: flex; align-items: center; gap: 16px; border-left: 4px solid #ff0000; padding-left: 16px; ${shouldShowNewsButton ? 'margin-top: 12px;' : ''}">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 4px 0; font-size: 18px;">Stay Informed</h4>
            <p style="margin: 0; color: var(--primary-medium);">Receive all ${fullLabel} updates</p>
          </div>
          <button class="btn subscribe-security-btn" style="background: #ff0000; color: white;">Watch All</button>
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
      console.log("🎯 Banner inserted!");
    } else {
      console.log("🎯 ERROR: Could not find insertion point!");
      return;
    }

    // Click handlers
    wrapper.querySelector('.subscribe-news-btn')?.addEventListener('click', () => {
      console.log("🎯 News clicked");
      ajax(`/category/${category.id}/notifications`, {
        type: "POST",
        data: { notification_level: 4 }
      }).then(() => {
        if (!currentUser.watched_first_post_category_ids) {
          currentUser.watched_first_post_category_ids = [];
        }
        currentUser.watched_first_post_category_ids.push(category.id);
        wrapper.innerHTML = `<div style="background: var(--success-low); color: var(--success); padding: 16px; border-radius: 8px; text-align: center;">✅ You're now subscribed to ${fullLabel}.</div>`;
        setTimeout(() => wrapper.remove(), 5000);
      }).catch(err => console.error("🎯 Error:", err));
    });

    wrapper.querySelector('.subscribe-security-btn')?.addEventListener('click', () => {
      console.log("🎯 Security clicked");
      ajax(`/category/${category.id}/notifications`, {
        type: "POST",
        data: { notification_level: 3 }
      }).then(() => {
        if (!currentUser.watched_category_ids) {
          currentUser.watched_category_ids = [];
        }
        currentUser.watched_category_ids.push(category.id);
        wrapper.innerHTML = `<div style="background: var(--success-low); color: var(--success); padding: 16px; border-radius: 8px; text-align: center;">✅ You'll receive all updates for ${fullLabel}.</div>`;
        setTimeout(() => wrapper.remove(), 5000);
      }).catch(err => console.error("🎯 Error:", err));
    });
  };

  // Try on page change
  api.onPageChange((url) => {
    console.log("🎯 Page changed:", url);
    setTimeout(showSubscribeBanner, 300);
  });

  // Try on initial load
  setTimeout(() => {
    console.log("🎯 Initial load check");
    showSubscribeBanner();
  }, 1000);

  console.log("🎯🎯🎯 Category Subscribe Banner: Initializer Registered!");
});
