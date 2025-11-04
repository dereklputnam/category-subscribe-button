import { apiInitializer } from "discourse/lib/api";
import { ajax } from "discourse/lib/ajax";

export default apiInitializer("1.0.0", (api) => {
  api.onPageChange((url, title) => {
    const currentUser = api.getCurrentUser();
    if (!currentUser) return;

    // Get current topic
    const topicController = api.container.lookup("controller:topic");
    if (!topicController) return;

    const topic = topicController.get("model");
    if (!topic) return;

    const category = topic.category;
    if (!category) return;

    // Parse settings
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

    const subscribeCategories = parseCategories(settings.subscribe_categories);
    const watchingCategories = parseCategories(settings.watching_categories);

    // Check if current category is in our lists
    const isNewsCategory = subscribeCategories.includes(category.id);
    const isSecurityCategory = watchingCategories.includes(category.id);

    if (!isNewsCategory && !isSecurityCategory) {
      // Remove any existing banner
      document.querySelector('.subscription-notification-wrapper')?.remove();
      return;
    }

    // Check notification levels
    const watchedFirst = currentUser.watched_first_post_category_ids || [];
    const watched = currentUser.watched_category_ids || [];

    const shouldShowNewsButton = isNewsCategory && !watchedFirst.includes(category.id);
    const shouldShowSecurityButton = isSecurityCategory && !watched.includes(category.id);

    if (!shouldShowNewsButton && !shouldShowSecurityButton) {
      // User already subscribed
      document.querySelector('.subscription-notification-wrapper')?.remove();
      return;
    }

    // Get category label
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

    // Remove existing banner if any
    document.querySelector('.subscription-notification-wrapper')?.remove();

    // Create banner
    const wrapper = document.createElement('div');
    wrapper.className = 'subscription-notification-wrapper';

    let bannerHTML = '<div class="subscription-notification-container">';

    if (shouldShowNewsButton) {
      bannerHTML += `
        <div class="subscription-notification news-notification">
          <div class="notification-content">
            <div class="notification-icon news-icon">
              <svg width="20" height="20" viewBox="0 0 512 512" fill="none">
                <path d="M480 32c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9L381.7 53c-48 48-113.1 75-181 75H192 160 64c-35.3 0-64 28.7-64 64v96c0 35.3 28.7 64 64 64l0 128c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V352l8.7 0c67.9 0 133 27 181 75l43.6 43.6c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V300.4c18.6-8.8 32-32.5 32-60.4s-13.4-51.6-32-60.4V32zm-64 76.7V240 371.3C357.2 317.8 280.5 288 200.7 288H192V192h8.7c79.8 0 156.5-29.8 215.3-83.3z" fill="currentColor"/>
              </svg>
            </div>
            <div class="notification-text">
              <h4>Stay Informed</h4>
              <p>Get notified of all ${fullLabel} topics</p>
            </div>
          </div>
          <button class="btn btn-primary subscription-btn subscribe-news-btn">
            Subscribe
          </button>
        </div>
      `;
    }

    if (shouldShowSecurityButton) {
      bannerHTML += `
        <div class="subscription-notification security-notification">
          <div class="notification-content">
            <div class="notification-icon security-icon">
              <svg width="20" height="20" viewBox="0 0 512 512" fill="none">
                <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.7 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8V444.8C394 378 431.1 230.1 432 141.4L256 66.8z" fill="currentColor"/>
              </svg>
            </div>
            <div class="notification-text">
              <h4>Stay Informed</h4>
              <p>Receive all ${fullLabel} updates</p>
            </div>
          </div>
          <button class="btn subscription-btn security-btn subscribe-security-btn">
            Watch All
          </button>
        </div>
      `;
    }

    bannerHTML += '</div>';
    wrapper.innerHTML = bannerHTML;

    // Insert banner above posts
    const postsContainer = document.querySelector('.topic-above-post-stream-outlet') ||
                          document.querySelector('.container.posts') ||
                          document.querySelector('#topic-title');

    if (postsContainer) {
      postsContainer.parentNode.insertBefore(wrapper, postsContainer);
    }

    // Add click handlers
    const newsBtn = wrapper.querySelector('.subscribe-news-btn');
    if (newsBtn) {
      newsBtn.addEventListener('click', () => {
        ajax(`/category/${category.id}/notifications`, {
          type: "POST",
          data: { notification_level: 4 }
        }).then(() => {
          if (!currentUser.watched_first_post_category_ids) {
            currentUser.watched_first_post_category_ids = [];
          }
          if (!currentUser.watched_first_post_category_ids.includes(category.id)) {
            currentUser.watched_first_post_category_ids.push(category.id);
          }

          wrapper.innerHTML = `<div class="success-message">✅ You're now subscribed to ${fullLabel}.</div>`;
          setTimeout(() => wrapper.remove(), 5000);
        }).catch((error) => {
          console.error("Failed to subscribe:", error);
        });
      });
    }

    const securityBtn = wrapper.querySelector('.subscribe-security-btn');
    if (securityBtn) {
      securityBtn.addEventListener('click', () => {
        ajax(`/category/${category.id}/notifications`, {
          type: "POST",
          data: { notification_level: 3 }
        }).then(() => {
          if (!currentUser.watched_category_ids) {
            currentUser.watched_category_ids = [];
          }
          if (!currentUser.watched_category_ids.includes(category.id)) {
            currentUser.watched_category_ids.push(category.id);
          }

          wrapper.innerHTML = `<div class="success-message">✅ You'll receive all updates for ${fullLabel}.</div>`;
          setTimeout(() => wrapper.remove(), 5000);
        }).catch((error) => {
          console.error("Failed to subscribe:", error);
        });
      });
    }
  });
});
