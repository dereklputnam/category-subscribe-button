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

    // Get theme settings using the correct approach for connectors
    const site = Discourse.__container__.lookup("site:main");
    const settings = site.theme_settings || {};
    
    // Parse settings with proper null/undefined checks and trimming
    const parseSettingList = (settingValue) => {
      if (!settingValue || settingValue === "") return [];
      return settingValue.toString().split("|")
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id) && id > 0);
    };
    
    // Parse category name settings (these might be names instead of IDs)
    const parseCategoryNames = (settingValue) => {
      if (!settingValue || settingValue === "") return [];
      return settingValue.toString().split(",")
        .map(name => name.trim())
        .filter(name => name.length > 0);
    };
    
    const subscribeCategories = parseSettingList(settings?.subscribe_categories);
    const subscribeCategoryNameOnlyExceptions = parseCategoryNames(settings?.subscribe_category_name_only_exceptions);
    const watchingCategories = parseSettingList(settings?.watching_categories);
    const watchingCategoryNameOnlyExceptions = parseCategoryNames(settings?.watching_category_name_only_exceptions);

    // Category detection logic using settings with fallback to name-based detection
    let isNewsCategory = subscribeCategories.includes(category.id);
    let isSecurityCategory = watchingCategories.includes(category.id);
    
    // Fallback to name-based detection if no categories configured in settings
    if (subscribeCategories.length === 0 && watchingCategories.length === 0) {
      const categoryName = category.name?.toLowerCase() || "";
      isNewsCategory = categoryName.includes("news") || categoryName.includes("announcement");
      isSecurityCategory = categoryName.includes("security") || categoryName.includes("advisory");
    }

    // Determine what to show
    const shouldShowNewsButton = isNewsCategory && notificationLevel !== 4;
    const shouldShowSecurityButton = isSecurityCategory && notificationLevel !== 3;
    const shouldRender = shouldShowNewsButton || shouldShowSecurityButton;

    // Get category label with settings-based exception handling
    const allCategories = Discourse.__container__.lookup("site:main").get("categories");
    const parent = category.parent_category_id
      ? allCategories.find(c => c.id === category.parent_category_id)
      : null;
    
    // Check if this category should show name only based on settings
    const isNameOnlyException = subscribeCategoryNameOnlyExceptions.includes(category.name) || 
                               watchingCategoryNameOnlyExceptions.includes(category.name);
    
    // Quick debug to see what's happening
    if (category.name === "Community News") {
      console.log("Community News Debug:", {
        categoryName: category.name,
        subscribeCategoryNameOnlyExceptions,
        watchingCategoryNameOnlyExceptions,
        isNameOnlyException,
        rawSettings: settings?.subscribe_category_name_only_exceptions
      });
    }
    
    // Generate label: use only category name if it's a name-only exception, otherwise include parent
    const fullLabel = isNameOnlyException ? category.name : (parent ? `${parent.name} ${category.name}` : category.name);

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