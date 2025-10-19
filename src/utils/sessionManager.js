import api from '../services/api';
import { clearToken, getToken } from './auth';

class SessionManager {
  constructor() {
    this.isLoggingOut = false;
    this.isNavigating = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Only setup listeners if user is logged in
    if (getToken()) {
      // Handle tab close/refresh
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
      
      // Handle visibility change (tab switching, minimizing, etc.)
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      
      // Handle page unload
      window.addEventListener('unload', this.handleUnload.bind(this));
      
      // Handle navigation within the app
      window.addEventListener('popstate', this.handleNavigation.bind(this));
    }
  }

  async handleBeforeUnload(event) {
    // Only logout if user is actually closing the tab (not just refreshing or navigating)
    if (!this.isLoggingOut && !this.isNavigating && getToken()) {
      this.isLoggingOut = true;
      await this.performLogout();
    }
  }

  async handleVisibilityChange() {
    // If page becomes hidden and user is not actively navigating within the app
    if (document.hidden && !this.isLoggingOut && !this.isNavigating && getToken()) {
      // Add a small delay to avoid logout on quick tab switches
      setTimeout(async () => {
        if (document.hidden && !this.isLoggingOut && !this.isNavigating && getToken()) {
          this.isLoggingOut = true;
          await this.performLogout();
        }
      }, 2000); // 2 second delay for better UX
    }
  }

  async handleUnload() {
    if (!this.isLoggingOut && !this.isNavigating && getToken()) {
      this.isLoggingOut = true;
      await this.performLogout();
    }
  }

  handleNavigation() {
    // Mark as navigating to prevent logout
    this.isNavigating = true;
    setTimeout(() => {
      this.isNavigating = false;
    }, 500);
  }

  async performLogout() {
    try {
      // Clear token from localStorage immediately
      clearToken();
      
      // Send logout request to backend to clear Redis session
      await api.post('/auth/logout');
      
      console.log('Session cleared due to tab close');
    } catch (error) {
      // Even if the API call fails, we've cleared the local token
      console.error('Error during automatic logout:', error);
    }
  }

  // Method to manually trigger logout (for normal logout button)
  async manualLogout() {
    this.isLoggingOut = true;
    await this.performLogout();
  }

  // Method to prevent logout (for navigation within the app)
  preventLogout() {
    this.isNavigating = true;
    // Reset the flag after a short delay
    setTimeout(() => {
      this.isNavigating = false;
    }, 100);
  }

  // Method to reinitialize listeners after login
  reinitialize() {
    this.isLoggingOut = false;
    this.isNavigating = false;
    this.setupEventListeners();
  }
}

// Create and export a singleton instance
const sessionManager = new SessionManager();
export default sessionManager;
