// Receipt Generation System JavaScript
class ReceitosSystem {
    constructor() {
        this.currentTab = 'generator';
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.currentMonth = new Date();
        this.selectedDays = new Set();
        this.history = this.loadHistory();
        this.config = this.loadConfig();
        this.templates = this.loadTemplates();
        this.holidays = this.loadHolidays();
        
        this.init();
    }

    // Initialization
    init() {
        this.applyTheme();
        this.initializeEventListeners();
        this.initializeInputMasks();
        this.initializeValidation();
        this.loadStoredData();
        this.renderCalendar();
        this.renderHistory();
        this.setCurrentDate();
    }

    // Event Listeners
    initializeEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Form actions
        document.getElementById('previewBtn')?.addEventListener('click', () => this.previewReceipt());
        document.getElementById('generateBtn')?.addEventListener('click', () => this.generatePDF());
        document.getElementById('saveConfigBtn')?.addEventListener('click', () => this.saveConfiguration());
        
        // Calendar navigation
        document.getElementById('prevMonth')?.addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('nextMonth')?.addEventListener('click', () => this.navigateMonth(1));
        document.getElementById('clearSelection')?.addEventListener('click', () => this.clearCalendarSelection());
        document.getElementById('applyDays')?.addEventListener('click', () => this.applySelectedDays());
        
        // Modal controls
        document.getElementById('closePreview')?.addEventListener('click', () => this.closeModal('previewModal'));
        document.getElementById('cancelPreview')?.addEventListener('click', () => this.closeModal('previewModal'));
        document.getElementById('confirmGenerate')?.addEventListener('click', () => this.confirmGenerate());
        
        // History controls
        document.getElementById('exportHistory')?.addEventListener('click', () => this.exportHistory());
        document.getElementById('clearHistory')?.addEventListener('click', () => this.clearHistory());
        document.getElementById('historySearch')?.addEventListener('input', (e) => this.filterHistory(e.target.value));
        document.getElementById('historyFilter')?.addEventListener('change', (e) => this.filterHistory(null, e.target.value));
        
        // Template selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => this.selectTemplate(card.dataset.template));
        });
        
        // File upload
        document.getElementById('logoUpload')?.addEventListener('change', (e) => this.handleLogoUpload(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Auto-save
        this.setupAutoSave();
    }

    // Input Masks
    initializeInputMasks() {
        // CPF Mask
        this.addMask('.cpf-mask', '000.000.000-00');
        
        // CNPJ Mask
        this.addMask('.cnpj-mask', '00.000.000/0000-00');
        
        // Money Mask
        document.querySelectorAll('.money-mask').forEach(input => {
            input.addEventListener('input', (e) => this.applyMoneyMask(e.target));
            input.addEventListener('focus', (e) => this.handleMoneyFocus(e.target));
            input.addEventListener('blur', (e) => this.handleMoneyBlur(e.target));
        });
    }

    addMask(selector, pattern) {
        document.querySelectorAll(selector).forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                let maskedValue = '';
                let patternIndex = 0;
                
                for (let i = 0; i < pattern.length && patternIndex < value.length; i++) {
                    if (pattern[i] === '0') {
                        maskedValue += value[patternIndex];
                        patternIndex++;
                    } else {
                        maskedValue += pattern[i];
                    }
                }
                
                e.target.value = maskedValue;
            });
        });
    }

    applyMoneyMask(input) {
        let value = input.value.replace(/\D/g, '');
        value = (value / 100).toFixed(2);
        value = value.replace('.', ',');
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        input.value = 'R$ ' + value;
    }

    handleMoneyFocus(input) {
        if (input.value === 'R$ 0,00') {
            input.value = '';
        }
    }

    handleMoneyBlur(input) {
        if (input.value === '' || input.value === 'R$ ') {
            input.value = 'R$ 0,00';
        }
    }

    // Validation
    initializeValidation() {
        const inputs = document.querySelectorAll('.form-input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.id;
        let isValid = true;
        let errorMessage = '';

        if (!value) {
            isValid = false;
            errorMessage = 'Este campo é obrigatório';
        } else {
            switch (fieldName) {
                case 'funcionarioCpf':
                    isValid = this.validateCPF(value);
                    errorMessage = isValid ? '' : 'CPF inválido';
                    break;
                case 'empresaCnpj':
                    if (value) {
                        isValid = this.validateCNPJ(value);
                        errorMessage = isValid ? '' : 'CNPJ inválido';
                    }
                    break;
                case 'funcionarioNome':
                case 'empresaNome':
                    isValid = value.length >= 2;
                    errorMessage = isValid ? '' : 'Nome deve ter pelo menos 2 caracteres';
                    break;
            }
        }

        this.showFieldError(input, errorMessage, !isValid);
        return isValid;
    }

    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let digit1 = (sum * 10) % 11;
        if (digit1 === 10) digit1 = 0;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        let digit2 = (sum * 10) % 11;
        if (digit2 === 10) digit2 = 0;
        
        return digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10));
    }

    validateCNPJ(cnpj) {
        cnpj = cnpj.replace(/\D/g, '');
        if (cnpj.length !== 14) return false;
        
        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cnpj.charAt(i)) * weights1[i];
        }
        let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        
        sum = 0;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cnpj.charAt(i)) * weights2[i];
        }
        let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        
        return digit1 === parseInt(cnpj.charAt(12)) && digit2 === parseInt(cnpj.charAt(13));
    }

    showFieldError(input, message, hasError) {
        const errorElement = document.getElementById(`error-${input.id}`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.toggle('show', hasError);
        }
        
        input.classList.toggle('error', hasError);
        input.classList.toggle('success', !hasError && input.value.trim());
    }

    clearFieldError(input) {
        const errorElement = document.getElementById(`error-${input.id}`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        input.classList.remove('error');
    }

    // Theme Management
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
    }

    // Tab Management
    switchTab(tabName) {
        if (!tabName) return;
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });
        
        this.currentTab = tabName;
        
        // Tab-specific actions
        if (tabName === 'calendar') {
            this.renderCalendar();
        } else if (tabName === 'history') {
            this.renderHistory();
        }
    }

    // Calendar Functions
    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonthElement = document.getElementById('currentMonth');
        
        if (!calendarGrid || !currentMonthElement) return;
        
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        // Update month display
        currentMonthElement.textContent = new Intl.DateTimeFormat('pt-BR', {
            month: 'long',
            year: 'numeric'
        }).format(this.currentMonth);
        
        // Clear calendar
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            dayHeader.style.cssText = `
                padding: 0.5rem;
                font-weight: 600;
                text-align: center;
                background: var(--bg-tertiary);
                color: var(--text-secondary);
                font-size: var(--font-size-sm);
            `;
            calendarGrid.appendChild(dayHeader);
        });
        
        // Get first day of month and days in month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // Generate calendar days
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = currentDate.getDate();
            
            // Add classes
            if (currentDate.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            if (this.isWeekend(currentDate)) {
                dayElement.classList.add('weekend');
            }
            
            if (this.isHoliday(currentDate)) {
                dayElement.classList.add('holiday');
            }
            
            if (this.selectedDays.has(currentDate.toDateString())) {
                dayElement.classList.add('selected');
            }
            
            // Add click handler
            dayElement.addEventListener('click', () => {
                if (currentDate.getMonth() === month) {
                    this.toggleDaySelection(currentDate, dayElement);
                }
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }

    isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6;
    }

    isHoliday(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.holidays.includes(dateString);
    }

    toggleDaySelection(date, element) {
        const dateString = date.toDateString();
        
        if (this.selectedDays.has(dateString)) {
            this.selectedDays.delete(dateString);
            element.classList.remove('selected');
        } else {
            this.selectedDays.add(dateString);
            element.classList.add('selected');
        }
        
        this.showNotification(`${this.selectedDays.size} dias selecionados`, 'info');
    }

    clearCalendarSelection() {
        this.selectedDays.clear();
        this.renderCalendar();
        this.showNotification('Seleção limpa', 'info');
    }

    applySelectedDays() {
        if (this.selectedDays.size === 0) {
            this.showNotification('Nenhum dia selecionado', 'warning');
            return;
        }
        
        // Calculate total value for selected days
        const valeTransporte = this.parseMoneyValue(document.getElementById('valeTransporte')?.value || '0');
        const valeAlimentacao = this.parseMoneyValue(document.getElementById('valeAlimentacao')?.value || '0');
        
        const workDays = Array.from(this.selectedDays).filter(dateString => {
            const date = new Date(dateString);
            return !this.isWeekend(date) && !this.isHoliday(date);
        }).length;
        
        const totalTransporte = valeTransporte * workDays;
        const totalAlimentacao = valeAlimentacao * workDays;
        
        this.showNotification(
            `Calculado para ${workDays} dias úteis:\nTransporte: R$ ${totalTransporte.toFixed(2)}\nAlimentação: R$ ${totalAlimentacao.toFixed(2)}`,
            'success'
        );
        
        // Switch to generator tab
        this.switchTab('generator');
    }

    navigateMonth(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.renderCalendar();
    }

    // PDF Generation
    async previewReceipt() {
        if (!this.validateForm()) {
            this.showNotification('Por favor, corrija os erros no formulário', 'error');
            return;
        }
        
        const previewData = this.getFormData();
        const previewHTML = this.generateReceiptHTML(previewData);
        
        const previewElement = document.getElementById('pdfPreview');
        if (previewElement) {
            previewElement.innerHTML = previewHTML;
        }
        
        this.showModal('previewModal');
    }

    async generatePDF() {
        if (!this.validateForm()) {
            this.showNotification('Por favor, corrija os erros no formulário', 'error');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const formData = this.getFormData();
            const receiptHTML = this.generateReceiptHTML(formData);
            
            // Create temporary element for PDF generation
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = receiptHTML;
            tempDiv.style.cssText = `
                position: absolute;
                top: -9999px;
                left: -9999px;
                width: 794px;
                background: white;
                padding: 40px;
            `;
            document.body.appendChild(tempDiv);
            
            // Generate PDF using html2canvas and jsPDF
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                useCORS: true,
                allowTaint: true
            });
            
            document.body.removeChild(tempDiv);
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            const fileName = `recibo_${formData.funcionarioNome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            // Save to history
            this.saveToHistory(formData);
            
            this.showNotification('PDF gerado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            this.showNotification('Erro ao gerar PDF. Tente novamente.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    confirmGenerate() {
        this.closeModal('previewModal');
        this.generatePDF();
    }

    generateReceiptHTML(data) {
        const template = this.templates[this.config.selectedTemplate || 'default'];
        
        return `
        <div style="font-family: Arial, sans-serif; max-width: 794px; margin: 0 auto; padding: 40px; background: white;">
            <div style="border: 2px solid #333; padding: 30px; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
                    <h1 style="color: ${template.headerColor}; margin: 0; font-size: 24px;">RECIBO DE PAGAMENTO</h1>
                    <h2 style="color: #666; margin: 10px 0 0 0; font-size: 16px;">VALE TRANSPORTE E VALE ALIMENTAÇÃO</h2>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">DADOS DA EMPRESA</h3>
                    <p style="margin: 5px 0;"><strong>Empresa:</strong> ${data.empresaNome}</p>
                    ${data.empresaCnpj ? `<p style="margin: 5px 0;"><strong>CNPJ:</strong> ${data.empresaCnpj}</p>` : ''}
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">DADOS DO FUNCIONÁRIO</h3>
                    <p style="margin: 5px 0;"><strong>Nome:</strong> ${data.funcionarioNome}</p>
                    <p style="margin: 5px 0;"><strong>CPF:</strong> ${data.funcionarioCpf}</p>
                    ${data.funcionarioMatricula ? `<p style="margin: 5px 0;"><strong>Matrícula:</strong> ${data.funcionarioMatricula}</p>` : ''}
                    ${data.funcionarioCargo ? `<p style="margin: 5px 0;"><strong>Cargo:</strong> ${data.funcionarioCargo}</p>` : ''}
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">VALORES DOS BENEFÍCIOS</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 5px; margin-bottom: 10px;">
                        <span><strong>Vale Transporte:</strong></span>
                        <span style="font-size: 18px; color: ${template.headerColor}; font-weight: bold;">${data.valeTransporte}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 5px; margin-bottom: 10px;">
                        <span><strong>Vale Alimentação:</strong></span>
                        <span style="font-size: 18px; color: ${template.headerColor}; font-weight: bold;">${data.valeAlimentacao}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: ${template.headerColor}; color: white; border-radius: 5px; font-weight: bold; font-size: 18px;">
                        <span>TOTAL:</span>
                        <span>${this.calculateTotal(data.valeTransporte, data.valeAlimentacao)}</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <p style="margin: 5px 0;"><strong>Data de Emissão:</strong> ${this.formatDate(data.dataRecibo)}</p>
                    ${data.periodoReferencia ? `<p style="margin: 5px 0;"><strong>Período de Referência:</strong> ${this.formatMonth(data.periodoReferencia)}</p>` : ''}
                </div>
                
                <div style="margin-top: 50px; text-align: center;">
                    <div style="border-top: 1px solid #333; width: 300px; margin: 0 auto;">
                        <p style="margin-top: 10px; font-size: 14px;">Assinatura do Responsável</p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
                    <p>Este documento comprova o recebimento dos valores de vale transporte e vale alimentação</p>
                    <p>conforme especificado acima para o período de referência indicado.</p>
                </div>
            </div>
        </div>`;
    }

    // Data Management
    getFormData() {
        return {
            funcionarioNome: document.getElementById('funcionarioNome')?.value || '',
            funcionarioCpf: document.getElementById('funcionarioCpf')?.value || '',
            funcionarioMatricula: document.getElementById('funcionarioMatricula')?.value || '',
            funcionarioCargo: document.getElementById('funcionarioCargo')?.value || '',
            empresaNome: document.getElementById('empresaNome')?.value || '',
            empresaCnpj: document.getElementById('empresaCnpj')?.value || '',
            valeTransporte: document.getElementById('valeTransporte')?.value || 'R$ 0,00',
            valeAlimentacao: document.getElementById('valeAlimentacao')?.value || 'R$ 0,00',
            dataRecibo: document.getElementById('dataRecibo')?.value || '',
            periodoReferencia: document.getElementById('periodoReferencia')?.value || ''
        };
    }

    validateForm() {
        const requiredFields = document.querySelectorAll('.form-input[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    parseMoneyValue(moneyString) {
        return parseFloat(moneyString.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    }

    calculateTotal(valeTransporte, valeAlimentacao) {
        const total = this.parseMoneyValue(valeTransporte) + this.parseMoneyValue(valeAlimentacao);
        return `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
    }

    formatMonth(monthString) {
        if (!monthString) return '';
        const [year, month] = monthString.split('-');
        return new Date(year, month - 1).toLocaleDateString('pt-BR', { 
            month: 'long', 
            year: 'numeric' 
        });
    }

    setCurrentDate() {
        const dateInput = document.getElementById('dataRecibo');
        const monthInput = document.getElementById('periodoReferencia');
        
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        
        if (monthInput && !monthInput.value) {
            const now = new Date();
            monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
    }

    // Storage Functions
    loadConfig() {
        try {
            return JSON.parse(localStorage.getItem('recibos_config')) || {
                selectedTemplate: 'default',
                autoSave: true,
                headerColor: '#1a237e'
            };
        } catch {
            return { selectedTemplate: 'default', autoSave: true, headerColor: '#1a237e' };
        }
    }

    saveConfiguration() {
        const formData = this.getFormData();
        this.config = { ...this.config, lastFormData: formData };
        localStorage.setItem('recibos_config', JSON.stringify(this.config));
        this.showNotification('Configuração salva!', 'success');
    }

    loadStoredData() {
        if (this.config.lastFormData && this.config.autoSave) {
            const data = this.config.lastFormData;
            Object.keys(data).forEach(key => {
                const input = document.getElementById(key);
                if (input && data[key]) {
                    input.value = data[key];
                }
            });
        }
    }

    setupAutoSave() {
        if (this.config.autoSave) {
            setInterval(() => {
                const formData = this.getFormData();
                if (Object.values(formData).some(value => value.trim())) {
                    this.config.lastFormData = formData;
                    localStorage.setItem('recibos_config', JSON.stringify(this.config));
                }
            }, 30000); // Auto-save every 30 seconds
        }
    }

    // History Management
    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem('recibos_history')) || [];
        } catch {
            return [];
        }
    }

    saveToHistory(data) {
        const historyItem = {
            id: Date.now(),
            ...data,
            createdAt: new Date().toISOString(),
            type: this.getReceiptType(data)
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last 100 items
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }
        
        localStorage.setItem('recibos_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    getReceiptType(data) {
        const hasTransporte = this.parseMoneyValue(data.valeTransporte) > 0;
        const hasAlimentacao = this.parseMoneyValue(data.valeAlimentacao) > 0;
        
        if (hasTransporte && hasAlimentacao) return 'ambos';
        if (hasTransporte) return 'transporte';
        if (hasAlimentacao) return 'alimentacao';
        return 'ambos';
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Nenhum recibo encontrado no histórico</div>';
            return;
        }
        
        historyList.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div class="history-info">
                    <h4>${item.funcionarioNome}</h4>
                    <p>CPF: ${item.funcionarioCpf} | Data: ${this.formatDate(item.dataRecibo)}</p>
                    <p>Total: ${this.calculateTotal(item.valeTransporte, item.valeAlimentacao)}</p>
                </div>
                <div class="history-actions-item">
                    <button class="btn btn-secondary btn-sm" onclick="recibosSystem.loadFromHistory(${item.id})">
                        <i>📝</i> Editar
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="recibosSystem.regenerateFromHistory(${item.id})">
                        <i>📄</i> Gerar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="recibosSystem.deleteFromHistory(${item.id})">
                        <i>🗑️</i> Excluir
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadFromHistory(id) {
        const item = this.history.find(h => h.id === id);
        if (!item) return;
        
        Object.keys(item).forEach(key => {
            const input = document.getElementById(key);
            if (input && item[key]) {
                input.value = item[key];
            }
        });
        
        this.switchTab('generator');
        this.showNotification('Dados carregados do histórico', 'success');
    }

    async regenerateFromHistory(id) {
        const item = this.history.find(h => h.id === id);
        if (!item) return;
        
        this.loadFromHistory(id);
        setTimeout(() => this.generatePDF(), 500);
    }

    deleteFromHistory(id) {
        if (confirm('Tem certeza que deseja excluir este item do histórico?')) {
            this.history = this.history.filter(h => h.id !== id);
            localStorage.setItem('recibos_history', JSON.stringify(this.history));
            this.renderHistory();
            this.showNotification('Item removido do histórico', 'info');
        }
    }

    filterHistory(searchTerm = '', type = '') {
        const searchInput = document.getElementById('historySearch');
        const typeFilter = document.getElementById('historyFilter');
        
        searchTerm = searchTerm || (searchInput ? searchInput.value.toLowerCase() : '');
        type = type || (typeFilter ? typeFilter.value : '');
        
        let filteredHistory = this.history;
        
        if (searchTerm) {
            filteredHistory = filteredHistory.filter(item => 
                item.funcionarioNome.toLowerCase().includes(searchTerm) ||
                item.funcionarioCpf.includes(searchTerm)
            );
        }
        
        if (type) {
            filteredHistory = filteredHistory.filter(item => item.type === type);
        }
        
        // Temporarily replace history for rendering
        const originalHistory = this.history;
        this.history = filteredHistory;
        this.renderHistory();
        this.history = originalHistory;
    }

    exportHistory() {
        if (this.history.length === 0) {
            this.showNotification('Nenhum dado para exportar', 'warning');
            return;
        }
        
        const csv = this.generateCSV(this.history);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `historico_recibos_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showNotification('Histórico exportado!', 'success');
    }

    generateCSV(data) {
        const headers = ['Nome', 'CPF', 'Empresa', 'Vale Transporte', 'Vale Alimentação', 'Data', 'Período'];
        const rows = data.map(item => [
            item.funcionarioNome,
            item.funcionarioCpf,
            item.empresaNome,
            item.valeTransporte,
            item.valeAlimentacao,
            this.formatDate(item.dataRecibo),
            this.formatMonth(item.periodoReferencia)
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    clearHistory() {
        if (confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
            this.history = [];
            localStorage.removeItem('recibos_history');
            this.renderHistory();
            this.showNotification('Histórico limpo', 'info');
        }
    }

    // Template Management
    loadTemplates() {
        return {
            default: {
                name: 'Padrão',
                headerColor: '#1a237e',
                fontSize: 'medium'
            },
            professional: {
                name: 'Profissional',
                headerColor: '#2c3e50',
                fontSize: 'medium'
            },
            modern: {
                name: 'Moderno',
                headerColor: '#8e24aa',
                fontSize: 'large'
            }
        };
    }

    selectTemplate(templateName) {
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.toggle('active', card.dataset.template === templateName);
        });
        
        this.config.selectedTemplate = templateName;
        this.showNotification(`Template "${this.templates[templateName].name}" selecionado`, 'info');
    }

    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showNotification('Por favor, selecione um arquivo de imagem', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.config.logoData = e.target.result;
            this.showNotification('Logo carregado com sucesso!', 'success');
        };
        reader.readAsDataURL(file);
    }

    // Holiday Management
    loadHolidays() {
        // Brazilian national holidays for 2024
        return [
            '2024-01-01', // New Year
            '2024-02-12', // Carnival Monday
            '2024-02-13', // Carnival Tuesday
            '2024-03-29', // Good Friday
            '2024-04-21', // Tiradentes
            '2024-05-01', // Labor Day
            '2024-09-07', // Independence Day
            '2024-10-12', // Our Lady of Aparecida
            '2024-11-02', // All Souls' Day
            '2024-11-15', // Proclamation of the Republic
            '2024-12-25'  // Christmas
        ];
    }

    // Keyboard Shortcuts
    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    this.saveConfiguration();
                    break;
                case 'p':
                    event.preventDefault();
                    this.previewReceipt();
                    break;
                case 'g':
                    event.preventDefault();
                    this.generatePDF();
                    break;
                case '1':
                    event.preventDefault();
                    this.switchTab('generator');
                    break;
                case '2':
                    event.preventDefault();
                    this.switchTab('calendar');
                    break;
                case '3':
                    event.preventDefault();
                    this.switchTab('history');
                    break;
                case '4':
                    event.preventDefault();
                    this.switchTab('templates');
                    break;
            }
        }
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Loading Management
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('show', show);
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        if (!notifications) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icons[type] || icons.info}</div>
                <div class="notification-text">
                    <div class="notification-message">${message}</div>
                </div>
            </div>
        `;
        
        notifications.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'notificationSlideOut 0.3s ease-in-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Initialize the system when DOM is loaded
let recibosSystem;
document.addEventListener('DOMContentLoaded', () => {
    recibosSystem = new ReceitosSystem();
});

// Add exit animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes notificationSlideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .btn-sm {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
    }
    
    .calendar-day-header {
        padding: 0.5rem;
        font-weight: 600;
        text-align: center;
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
    }
`;
document.head.appendChild(style);