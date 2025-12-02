/* ===================================
   PERFECT CFW - MODAL SYSTEM JS
   نظام Modal شامل - JavaScript
   =================================== */

class ModalSystem {
    constructor() {
        this.createModalContainer();
    }

    // إنشاء Modal Container
    createModalContainer() {
        if (!document.getElementById('modal-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'modal-overlay';
            overlay.className = 'modal-overlay';
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
            document.body.appendChild(overlay);
        }
    }

    // Show Modal
    show(options) {
        const {
            title = 'إشعار',
            message = '',
            type = 'info', // success, error, warning, info
            icon = this.getIcon(type),
            buttons = [{ text: 'حسناً', class: 'modal-btn-primary' }],
            closeButton = true
        } = options;

        const overlay = document.getElementById('modal-overlay');
        
        const modalHTML = `
            <div class="modal-box">
                ${closeButton ? '<button class="modal-close" onclick="modalSystem.close()">✕</button>' : ''}
                <div class="modal-header">
                    <div class="modal-icon ${type}">
                        ${icon}
                    </div>
                    <h3 class="modal-title">${title}</h3>
                </div>
                <div class="modal-body">
                    ${message}
                </div>
                <div class="modal-footer">
                    ${buttons.map((btn, index) => `
                        <button class="modal-btn ${btn.class || 'modal-btn-secondary'}" 
                                onclick="modalSystem.handleButtonClick(${index})"
                                ${btn.loading ? 'disabled' : ''}>
                            ${btn.loading ? '<span class="modal-loading"></span>' : btn.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        overlay.innerHTML = modalHTML;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Store button callbacks
        this.buttonCallbacks = buttons.map(btn => btn.onClick);

        return new Promise((resolve) => {
            this.resolveCallback = resolve;
        });
    }

    // Handle button click
    handleButtonClick(index) {
        const callback = this.buttonCallbacks[index];
        if (callback) {
            const result = callback();
            if (result !== false) {
                this.close();
                if (this.resolveCallback) {
                    this.resolveCallback(index);
                }
            }
        } else {
            this.close();
            if (this.resolveCallback) {
                this.resolveCallback(index);
            }
        }
    }

    // Close Modal
    close() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            overlay.innerHTML = '';
        }, 300);
    }

    // Get Icon
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    // Alert Modal
    alert(message, title = 'تنبيه', type = 'info') {
        return this.show({
            title,
            message,
            type,
            buttons: [
                {
                    text: 'حسناً',
                    class: 'modal-btn-primary',
                    onClick: () => true
                }
            ]
        });
    }

    // Success Modal
    success(message, title = 'نجح!') {
        return this.show({
            title,
            message,
            type: 'success',
            buttons: [
                {
                    text: 'رائع!',
                    class: 'modal-btn-success',
                    onClick: () => true
                }
            ]
        });
    }

    // Error Modal
    error(message, title = 'خطأ!') {
        return this.show({
            title,
            message,
            type: 'error',
            buttons: [
                {
                    text: 'حسناً',
                    class: 'modal-btn-danger',
                    onClick: () => true
                }
            ]
        });
    }

    // Warning Modal
    warning(message, title = 'تحذير!') {
        return this.show({
            title,
            message,
            type: 'warning',
            buttons: [
                {
                    text: 'فهمت',
                    class: 'modal-btn-primary',
                    onClick: () => true
                }
            ]
        });
    }

    // Confirm Modal
    confirm(message, title = 'تأكيد') {
        return this.show({
            title,
            message,
            type: 'warning',
            buttons: [
                {
                    text: 'إلغاء',
                    class: 'modal-btn-secondary',
                    onClick: () => {
                        if (this.resolveCallback) this.resolveCallback(false);
                        return true;
                    }
                },
                {
                    text: 'تأكيد',
                    class: 'modal-btn-danger',
                    onClick: () => {
                        if (this.resolveCallback) this.resolveCallback(true);
                        return true;
                    }
                }
            ]
        });
    }

    // Loading Modal
    loading(message = 'جاري التحميل...', title = 'انتظر') {
        return this.show({
            title,
            message: `<div style="text-align: center;">${message}</div>`,
            type: 'info',
            buttons: [],
            closeButton: false
        });
    }

    // Toast Notification
    toast(message, type = 'success', duration = 3000) {
        const titles = {
            success: 'نجح!',
            error: 'خطأ!',
            warning: 'تحذير!',
            info: 'معلومة'
        };

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon ${type}">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">✕</button>
        `;

        document.body.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        return toast;
    }

    // Remove Toast
    removeToast(toast) {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    // Custom Modal with Form
    prompt(options) {
        const {
            title = 'إدخال',
            message = '',
            placeholder = 'أدخل القيمة...',
            defaultValue = '',
            type = 'text',
            required = true
        } = options;

        const inputId = 'modal-prompt-input-' + Date.now();

        return this.show({
            title,
            message: `
                ${message ? `<p>${message}</p>` : ''}
                <input type="${type}" 
                       id="${inputId}"
                       class="modal-input"
                       placeholder="${placeholder}"
                       value="${defaultValue}"
                       ${required ? 'required' : ''}
                       style="width: 100%; padding: 12px; border: 2px solid rgba(167, 139, 250, 0.3); border-radius: 10px; background: rgba(255, 255, 255, 0.05); color: white; font-family: 'Cairo', sans-serif; font-size: 15px; margin-top: 10px;">
            `,
            type: 'info',
            buttons: [
                {
                    text: 'إلغاء',
                    class: 'modal-btn-secondary',
                    onClick: () => {
                        if (this.resolveCallback) this.resolveCallback(null);
                        return true;
                    }
                },
                {
                    text: 'حسناً',
                    class: 'modal-btn-primary',
                    onClick: () => {
                        const input = document.getElementById(inputId);
                        const value = input.value.trim();
                        
                        if (required && !value) {
                            input.style.borderColor = '#ef4444';
                            return false; // Don't close
                        }
                        
                        if (this.resolveCallback) this.resolveCallback(value);
                        return true;
                    }
                }
            ]
        });
    }
}

// Create global instance
const modalSystem = new ModalSystem();

// Backward compatibility functions
function showNotification(message, type = 'success') {
    modalSystem.toast(message, type);
}

function showModal(title, message, type = 'info') {
    modalSystem.alert(message, title, type);
}

function confirmAction(message, title = 'تأكيد') {
    return modalSystem.confirm(message, title);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModalSystem, modalSystem };
}
