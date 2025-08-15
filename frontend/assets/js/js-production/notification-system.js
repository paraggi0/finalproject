// Enhanced Notification System - PT. Topline Evergreen Manufacturing
// Advanced user feedback and notification management

class NotificationManager {
    constructor() {
        this.notifications = new Map();
        this.config = {
            defaultDuration: 5000,
            maxNotifications: 5,
            position: 'top-right'
        };
        this.initializeContainer();
    }

    /**
     * Initialize notification container
     */
    initializeContainer() {
        if (document.getElementById('notification-container')) return;

        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Type: success, error, warning, info
     * @param {Object} options - Additional options
     */
    show(message, type = 'info', options = {}) {
        const id = this.generateId();
        const notification = this.createNotification(id, message, type, options);
        
        this.addToContainer(notification);
        this.notifications.set(id, notification);
        
        // Auto remove after duration
        const duration = options.duration !== undefined ? options.duration : this.config.defaultDuration;
        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }

        // Limit max notifications
        this.enforceLimit();

        return id;
    }

    /**
     * Create notification element
     * @param {string} id - Notification ID
     * @param {string} message - Message text
     * @param {string} type - Notification type
     * @param {Object} options - Options
     */
    createNotification(id, message, type, options) {
        const notification = document.createElement('div');
        notification.id = `notification-${id}`;
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIcon(type);
        const showClose = options.closable !== false;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icon}</div>
                <div class="notification-text">
                    ${options.title ? `<div class="notification-title">${options.title}</div>` : ''}
                    <div class="notification-message">${message}</div>
                </div>
                ${showClose ? '<button class="notification-close" onclick="notificationManager.remove(\'' + id + '\')">&times;</button>' : ''}
            </div>
            ${options.progress ? '<div class="notification-progress"><div class="notification-progress-bar"></div></div>' : ''}
        `;

        this.applyStyles(notification, type);
        notification.style.pointerEvents = 'auto';

        // Add click handler if provided
        if (options.onClick) {
            notification.style.cursor = 'pointer';
            notification.addEventListener('click', options.onClick);
        }

        return notification;
    }

    /**
     * Apply styles to notification
     * @param {HTMLElement} notification - Notification element
     * @param {string} type - Notification type
     */
    applyStyles(notification, type) {
        const baseStyles = `
            margin-bottom: 10px;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            animation: slideIn 0.3s ease-out;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            max-width: 100%;
            word-wrap: break-word;
        `;

        const typeStyles = {
            success: 'background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9)); color: white;',
            error: 'background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9)); color: white;',
            warning: 'background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9)); color: white;',
            info: 'background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9)); color: white;'
        };

        notification.style.cssText = baseStyles + (typeStyles[type] || typeStyles.info);

        // Add CSS animations if not already added
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                .notification-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                }
                
                .notification-icon {
                    font-size: 18px;
                    margin-top: 2px;
                    flex-shrink: 0;
                }
                
                .notification-text {
                    flex: 1;
                }
                
                .notification-title {
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                
                .notification-message {
                    opacity: 0.95;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: currentColor;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 10px;
                    opacity: 0.7;
                    flex-shrink: 0;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
                
                .notification-progress {
                    margin-top: 8px;
                    height: 3px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 2px;
                    overflow: hidden;
                }
                
                .notification-progress-bar {
                    height: 100%;
                    background: rgba(255,255,255,0.8);
                    border-radius: 2px;
                    animation: progress linear;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    /**
     * Get icon for notification type
     * @param {string} type - Notification type
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Add notification to container
     * @param {HTMLElement} notification - Notification element
     */
    addToContainer(notification) {
        const container = document.getElementById('notification-container');
        container.appendChild(notification);
    }

    /**
     * Remove notification
     * @param {string} id - Notification ID
     */
    remove(id) {
        const notification = document.getElementById(`notification-${id}`);
        if (notification) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 300);
        }
    }

    /**
     * Remove all notifications
     */
    clear() {
        this.notifications.forEach((_, id) => this.remove(id));
    }

    /**
     * Enforce maximum notification limit
     */
    enforceLimit() {
        if (this.notifications.size > this.config.maxNotifications) {
            const oldestId = this.notifications.keys().next().value;
            this.remove(oldestId);
        }
    }

    /**
     * Generate unique notification ID
     */
    generateId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Show success notification
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    /**
     * Show error notification
     */
    error(message, options = {}) {
        return this.show(message, 'error', { duration: 8000, ...options });
    }

    /**
     * Show warning notification
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', { duration: 6000, ...options });
    }

    /**
     * Show info notification
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    /**
     * Show progress notification
     * @param {string} message - Message
     * @param {number} duration - Duration in ms
     */
    progress(message, duration = 3000) {
        const id = this.show(message, 'info', {
            progress: true,
            duration: 0,
            closable: false
        });

        const notification = document.getElementById(`notification-${id}`);
        const progressBar = notification.querySelector('.notification-progress-bar');
        
        if (progressBar) {
            progressBar.style.animationDuration = `${duration}ms`;
            progressBar.style.animationName = 'progress';
            progressBar.style.animationTimingFunction = 'linear';
            
            // Add progress animation
            const progressStyle = document.createElement('style');
            progressStyle.textContent = `
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `;
            document.head.appendChild(progressStyle);
        }

        setTimeout(() => this.remove(id), duration);
        return id;
    }
}

// Create global instance
const notificationManager = new NotificationManager();

// Export to global scope
window.notificationManager = notificationManager;
window.showMessage = (message, type, options) => notificationManager.show(message, type, options);
