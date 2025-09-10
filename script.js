// Work Order System JavaScript
class WorkOrderSystem {
    constructor() {
        this.workOrders = this.loadWorkOrders();
        this.initializeEventListeners();
        this.renderWorkOrders();
    }

    initializeEventListeners() {
        const form = document.getElementById('workOrderForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const workOrder = {
            orderId: formData.get('orderId'),
            description: formData.get('description'),
            status: formData.get('status'),
            createdAt: new Date().toISOString()
        };

        // Validate required fields
        if (!workOrder.orderId || !workOrder.description) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Check if order ID already exists
        if (this.workOrders.find(order => order.orderId === workOrder.orderId)) {
            alert('ID da ordem já existe. Por favor, use um ID único.');
            return;
        }

        this.addWorkOrder(workOrder);
        e.target.reset();
    }

    addWorkOrder(workOrder) {
        this.workOrders.push(workOrder);
        this.saveWorkOrders();
        this.renderWorkOrders();
        
        // Show success message
        this.showMessage('Ordem de trabalho criada com sucesso!', 'success');
    }

    renderWorkOrders() {
        const tbody = document.querySelector('#workOrdersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.workOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.orderId}</td>
                <td>${order.description}</td>
                <td>
                    <span class="status-badge status-${order.status}">
                        ${this.getStatusLabel(order.status)}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'Pendente',
            'in_progress': 'Em Progresso',
            'completed': 'Concluído'
        };
        return labels[status] || status;
    }

    loadWorkOrders() {
        try {
            const stored = localStorage.getItem('workOrders');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Erro ao carregar ordens de trabalho:', error);
            return [];
        }
    }

    saveWorkOrders() {
        try {
            localStorage.setItem('workOrders', JSON.stringify(this.workOrders));
        } catch (error) {
            console.error('Erro ao salvar ordens de trabalho:', error);
        }
    }

    showMessage(message, type = 'info') {
        // Create message element if it doesn't exist
        let messageEl = document.getElementById('message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'message';
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 5px;
                color: white;
                font-weight: 600;
                z-index: 1000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            document.body.appendChild(messageEl);
        }

        // Set message content and style
        messageEl.textContent = message;
        messageEl.className = `message-${type}`;
        
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            info: '#2196f3',
            warning: '#ff9800'
        };
        
        messageEl.style.backgroundColor = colors[type] || colors.info;
        
        // Show message
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);

        // Hide message after 3 seconds
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
        }, 3000);
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WorkOrderSystem();
});

// Add some CSS for status badges
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-pending {
        background-color: #fff3cd;
        color: #856404;
    }
    
    .status-in_progress {
        background-color: #cce5ff;
        color: #0066cc;
    }
    
    .status-completed {
        background-color: #d4edda;
        color: #155724;
    }
`;
document.head.appendChild(style);