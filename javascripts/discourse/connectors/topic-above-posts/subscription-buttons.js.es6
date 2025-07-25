export default {
  setupComponent(args, component) {
    const currentUser = this.currentUser;
    const topic = args.model;
    const category = topic?.category;
    
    if (!currentUser || !category) {
      component.set("shouldRender", false);
      return;
    }


    // Get notification level
    let notificationLevel = 1; // Default to Regular
    
    if (currentUser.watched_first_post_category_ids?.includes(category.id)) {
      notificationLevel = 4; // Watching First Post
    } else if (currentUser.watched_category_ids?.includes(category.id)) {
      notificationLevel = 3; // Watching
    } else if (currentUser.tracked_category_ids?.includes(category.id)) {
      notificationLevel = 2; // Tracking
    } else if (currentUser.muted_category_ids?.includes(category.id)) {
      notificationLevel = 0; // Muted
    }

    // Category detection logic (name-based like original)
    const categoryName = category.name?.toLowerCase() || "";
    const isNewsCategory = categoryName.includes("news") || categoryName.includes("announcement");
    const isSecurityCategory = categoryName.includes("security") || categoryName.includes("advisory");

    // Determine what to show
    const shouldShowNewsButton = isNewsCategory && notificationLevel !== 4;
    const shouldShowSecurityButton = isSecurityCategory && notificationLevel !== 3;
    const shouldRender = shouldShowNewsButton || shouldShowSecurityButton;

    // Get category label with exception handling
    const allCategories = Discourse.__container__.lookup("site:main").get("categories");
    const parent = category.parent_category_id
      ? allCategories.find(c => c.id === category.parent_category_id)
      : null;
    
    // Special handling for Security Information category (ID 214) - show only current category name
    const fullLabel = (category.id === 214) ? category.name : (parent ? `${parent.name} ${category.name}` : category.name);

    // Set component properties
    component.setProperties({
      shouldRender,
      shouldShowNewsButton,
      shouldShowSecurityButton,
      fullLabel,
      category,
      currentUser,
      notificationLevel
    });

    // Define actions on the component
    component.actions = component.actions || {};
    
    component.actions.subscribeToNews = function() {
      const category = component.get("category");
      const currentUser = component.get("currentUser");
      const fullLabel = component.get("fullLabel");
      const targetLevel = 4;
      const successMessage = `✅ You're now subscribed to ${fullLabel}.`;
      
      require("discourse/lib/ajax").ajax(`/category/${category.id}/notifications`, {
        type: "POST",
        data: { notification_level: targetLevel }
      }).then(() => {
        // Update user arrays for Watching First Post (level 4)
        if (!currentUser.watched_first_post_category_ids) {
          currentUser.watched_first_post_category_ids = [];
        }
        
        if (!currentUser.watched_first_post_category_ids.includes(category.id)) {
          currentUser.watched_first_post_category_ids.push(category.id);
        }
        
        // Remove from other arrays
        if (currentUser.watched_category_ids) {
          const watchingIndex = currentUser.watched_category_ids.indexOf(category.id);
          if (watchingIndex > -1) {
            currentUser.watched_category_ids.splice(watchingIndex, 1);
          }
        }
        
        if (currentUser.tracked_category_ids) {
          const trackedIndex = currentUser.tracked_category_ids.indexOf(category.id);
          if (trackedIndex > -1) {
            currentUser.tracked_category_ids.splice(trackedIndex, 1);
          }
        }
        
        if (currentUser.muted_category_ids) {
          const mutedIndex = currentUser.muted_category_ids.indexOf(category.id);
          if (mutedIndex > -1) {
            currentUser.muted_category_ids.splice(mutedIndex, 1);
          }
        }

        // Show success message
        component.setProperties({
          showSuccessMessage: true,
          successMessage: successMessage,
          shouldShowNewsButton: false,
          shouldShowSecurityButton: false
        });

        // Hide success message after 5 seconds
        setTimeout(() => {
          component.set("showSuccessMessage", false);
        }, 5000);
      }).catch((error) => {
        console.error("Failed to update category subscription:", error);
      });
    };

    component.actions.subscribeToSecurity = function() {
      const category = component.get("category");
      const currentUser = component.get("currentUser");
      const fullLabel = component.get("fullLabel");
      const targetLevel = 3;
      const successMessage = `✅ You'll receive all updates for ${fullLabel}.`;
      
      require("discourse/lib/ajax").ajax(`/category/${category.id}/notifications`, {
        type: "POST",
        data: { notification_level: targetLevel }
      }).then(() => {
        // Update user arrays for Watching
        if (!currentUser.watched_category_ids) {
          currentUser.watched_category_ids = [];
        }
        if (!currentUser.watched_category_ids.includes(category.id)) {
          currentUser.watched_category_ids.push(category.id);
        }
        const firstPostIndex = currentUser.watched_first_post_category_ids?.indexOf(category.id);
        if (firstPostIndex > -1) {
          currentUser.watched_first_post_category_ids.splice(firstPostIndex, 1);
        }

        // Show success message
        component.setProperties({
          showSuccessMessage: true,
          successMessage: successMessage,
          shouldShowNewsButton: false,
          shouldShowSecurityButton: false
        });

        // Hide success message after 5 seconds
        setTimeout(() => {
          component.set("showSuccessMessage", false);
        }, 5000);
      }).catch((error) => {
        console.error("Failed to update category subscription:", error);
      });
    };
  }
};