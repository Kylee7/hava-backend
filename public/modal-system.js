// Shared Modal System for Backend
class ModalSystem {
    constructor() {
        this.createModalContainer();
    }

    createModalContainer() {
        if (document.getElementById('globalModalContainer')) return;
        
        const container = document.createElement('div');
        container.id = 'globalModalContainer';
        
        // Make sure body exists
        if (document.body) {
            document.body.appendChild(container);
        } else {
            // Wait for DOM to be ready
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(container);
            });
        }
    }

    showAlert(title, message, type = 'info') {
        this.removeExistingModal();

        const icons = {
            success: { icon: 'fa-check-circle', color: '#10b981' },
            error: { icon: 'fa-times-circle', color: '#ef4444' },
            warning: { icon: 'fa-exclamation-triangle', color: '#f59e0b' },
            info: { icon: 'fa-info-circle', color: '#3b82f6' }
        };

        const iconData = icons[type] || icons.info;

        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="custom-modal-content">
                <div class="custom-modal-icon" style="background: ${iconData.color}20;">
                    <i class="fas ${iconData.icon}" style="color: ${iconData.color};"></i>
                </div>
                <h3 class="custom-modal-title">${title}</h3>
                <p class="custom-modal-message">${message}</p>
                <button class="custom-modal-btn custom-modal-btn-primary" onclick="window.modalSystem.close()">
                    <i class="fas fa-check"></i> حسناً
                </button>
            </div>
        `;

        document.getElementById('globalModalContainer').appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        modal.onclick = (e) => {
            if (e.target === modal) this.close();
        };
    }

    showToast(message, type = 'success') {
        const icons = {
            success: { icon: 'fa-check-circle', color: '#10b981' },
            error: { icon: 'fa-times-circle', color: '#ef4444' },
            warning: { icon: 'fa-exclamation-triangle', color: '#f59e0b' },
            info: { icon: 'fa-info-circle', color: '#3b82f6' }
        };

        const iconData = icons[type] || icons.success;

        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${iconData.color};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 99999;
            font-family: 'Cairo', sans-serif;
            font-weight: 600;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        toast.innerHTML = `
            <i class="fas ${iconData.icon}" style="font-size: 20px;"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Slide in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);

        // Slide out and remove
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showConfirm(title, message, onConfirm) {
        this.removeExistingModal();

        const confirmBtnId = `confirmBtn_${Date.now()}`;
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="custom-modal-content">
                <div class="custom-modal-icon" style="background: rgba(239, 68, 68, 0.2);">
                    <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                </div>
                <h3 class="custom-modal-title">${title}</h3>
                <p class="custom-modal-message">${message}</p>
                <div class="custom-modal-buttons">
                    <button class="custom-modal-btn custom-modal-btn-secondary" id="cancelBtn_${Date.now()}">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                    <button class="custom-modal-btn custom-modal-btn-danger" id="${confirmBtnId}">
                        <i class="fas fa-check"></i> تأكيد
                    </button>
                </div>
            </div>
        `;

        document.getElementById('globalModalContainer').appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        // Cancel button
        const cancelBtn = modal.querySelector('.custom-modal-btn-secondary');
        cancelBtn.onclick = () => {
            this.close();
        };

        // Confirm button - execute callback then close
        const confirmBtn = document.getElementById(confirmBtnId);
        confirmBtn.onclick = () => {
            this.close();
            // Execute callback immediately after starting to close
            if (onConfirm) {
                onConfirm();
            }
        };

        modal.onclick = (e) => {
            if (e.target === modal) this.close();
        };
    }

    removeExistingModal() {
        const existing = document.querySelector('.custom-modal');
        if (existing) existing.remove();
    }

    close() {
        const modal = document.querySelector('.custom-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }
}

// Initialize global modal system after DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.modalSystem = new ModalSystem();
        });
    } else {
        // DOM already loaded
        window.modalSystem = new ModalSystem();
    }
}

// Add CSS for modals
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .custom-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    }

    .custom-modal.show {
        opacity: 1;
        pointer-events: all;
    }

    .custom-modal-content {
        background: linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 100%);
        border: 2px solid rgba(167, 139, 250, 0.3);
        border-radius: 20px;
        padding: 40px;
        max-width: 450px;
        width: 90%;
        text-align: center;
        transform: scale(0.8) translateY(20px);
        transition: transform 0.3s ease;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .custom-modal.show .custom-modal-content {
        transform: scale(1) translateY(0);
    }

    .custom-modal-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .custom-modal-icon i {
        font-size: 40px;
    }

    .custom-modal-title {
        font-size: 24px;
        color: #a78bfa;
        margin-bottom: 15px;
        font-weight: 700;
        font-family: 'Cairo', sans-serif;
    }

    .custom-modal-message {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 30px;
        line-height: 1.6;
        font-family: 'Cairo', sans-serif;
    }

    .custom-modal-btn {
        padding: 15px 30px;
        border: none;
        border-radius: 12px;
        color: white;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Cairo', sans-serif;
    }

    .custom-modal-btn-primary {
        background: linear-gradient(135deg, #7c3aed, #a78bfa);
    }

    .custom-modal-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(124, 58, 237, 0.4);
    }

    .custom-modal-btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(167, 139, 250, 0.3);
    }

    .custom-modal-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.15);
    }

    .custom-modal-btn-danger {
        background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .custom-modal-btn-danger:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);
    }

    .custom-modal-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
    }
`;
document.head.appendChild(modalStyles);
