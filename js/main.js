/**
 * Main Application Logic for OS System
 */

class OSSystemApp {
    constructor() {
        this.currentFormData = null;
        this.currentCompanyType = null;
        this.editingCompanyId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeForm();
        this.loadCompaniesLists();
        this.loadCompanySelects();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form auto-fill date/time
        this.setCurrentDateTime();

        // Company selection handlers
        document.getElementById('contratante-select').addEventListener('change', (e) => {
            this.fillCompanyData('contratante', e.target.value);
        });

        document.getElementById('contratada-select').addEventListener('change', (e) => {
            this.fillCompanyData('contratada', e.target.value);
        });

        // New company buttons
        document.getElementById('new-contratante').addEventListener('click', () => {
            this.openCompanyModal('contratante');
        });

        document.getElementById('new-contratada').addEventListener('click', () => {
            this.openCompanyModal('contratada');
        });

        // Add company buttons
        document.getElementById('add-contratante').addEventListener('click', () => {
            this.openCompanyModal('contratante');
        });

        document.getElementById('add-contratada').addEventListener('click', () => {
            this.openCompanyModal('contratada');
        });

        // Form actions
        document.getElementById('clear-form').addEventListener('click', () => {
            this.clearForm();
        });

        document.getElementById('preview-btn').addEventListener('click', () => {
            this.previewOS();
        });

        document.getElementById('generate-pdf').addEventListener('click', () => {
            this.generatePDF();
        });

        document.getElementById('generate-pdf-preview').addEventListener('click', () => {
            this.generatePDF();
        });

        // Modal handlers
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeCompanyModal();
        });

        document.getElementById('cancel-company').addEventListener('click', () => {
            this.closeCompanyModal();
        });

        document.getElementById('save-company').addEventListener('click', () => {
            this.saveCompany();
        });

        // Backup handlers
        document.getElementById('export-backup').addEventListener('click', () => {
            this.exportBackup();
        });

        document.getElementById('import-backup-btn').addEventListener('click', () => {
            document.getElementById('import-backup').click();
        });

        document.getElementById('import-backup').addEventListener('change', (e) => {
            this.importBackup(e.target.files[0]);
        });

        document.getElementById('clear-all-data').addEventListener('click', () => {
            this.clearAllData();
        });

        // Input formatting
        this.setupInputFormatting();

        // Auto-save form data
        this.setupAutoSave();

        // Close modal on outside click
        document.getElementById('company-modal').addEventListener('click', (e) => {
            if (e.target.id === 'company-modal') {
                this.closeCompanyModal();
            }
        });
    }

    setupInputFormatting() {
        // CNPJ formatting
        document.querySelectorAll('input[name*="Cnpj"]').forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = window.storageManager.formatCNPJ(e.target.value);
            });
        });

        // CPF formatting
        document.querySelectorAll('input[name*="Cpf"]').forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = window.storageManager.formatCPF(e.target.value);
            });
        });

        // Phone formatting
        document.querySelectorAll('input[name*="Telefone"]').forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = window.storageManager.formatPhone(e.target.value);
            });
        });
    }

    setupAutoSave() {
        const form = document.getElementById('os-form');
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.autoSaveForm();
            });
        });
    }

    autoSaveForm() {
        const formData = this.getFormData();
        if (formData && Object.values(formData).some(value => value)) {
            window.storageManager.saveFormData(formData);
        }
    }

    initializeForm() {
        // Load last form data if available
        const lastFormData = window.storageManager.getLastFormData();
        if (lastFormData) {
            this.fillFormData(lastFormData);
        }
    }

    setCurrentDateTime() {
        const now = new Date();
        const datetime = now.toISOString().slice(0, 16);
        document.getElementById('data-hora').value = datetime;
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    loadCompanySelects() {
        const contratantes = window.storageManager.getContratantes();
        const contratadas = window.storageManager.getContratadas();

        // Load contratante select
        const contratanteSelect = document.getElementById('contratante-select');
        contratanteSelect.innerHTML = '<option value="">Selecionar empresa ou preencher manualmente</option>';
        contratantes.forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = company.nome;
            contratanteSelect.appendChild(option);
        });

        // Load contratada select
        const contratadaSelect = document.getElementById('contratada-select');
        contratadaSelect.innerHTML = '<option value="">Selecionar empresa ou preencher manualmente</option>';
        contratadas.forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = company.nome;
            contratadaSelect.appendChild(option);
        });
    }

    fillCompanyData(type, companyId) {
        if (!companyId) return;

        let company;
        if (type === 'contratante') {
            company = window.storageManager.getContratante(companyId);
        } else {
            company = window.storageManager.getContratada(companyId);
        }

        if (company) {
            document.getElementById(`${type}-nome`).value = company.nome;
            document.getElementById(`${type}-cnpj`).value = company.cnpj;
            document.getElementById(`${type}-endereco`).value = company.endereco;
            document.getElementById(`${type}-telefone`).value = company.telefone;
        }
    }

    loadCompaniesLists() {
        this.loadContratantesList();
        this.loadContratadasList();
    }

    loadContratantesList() {
        const contratantes = window.storageManager.getContratantes();
        const container = document.getElementById('contratantes-list');
        
        container.innerHTML = '';
        
        if (contratantes.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 2rem;">Nenhuma empresa contratante cadastrada.</p>';
            return;
        }

        contratantes.forEach(company => {
            const item = this.createCompanyListItem(company, 'contratante');
            container.appendChild(item);
        });
    }

    loadContratadasList() {
        const contratadas = window.storageManager.getContratadas();
        const container = document.getElementById('contratadas-list');
        
        container.innerHTML = '';
        
        if (contratadas.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 2rem;">Nenhuma empresa contratada cadastrada.</p>';
            return;
        }

        contratadas.forEach(company => {
            const item = this.createCompanyListItem(company, 'contratada');
            container.appendChild(item);
        });
    }

    createCompanyListItem(company, type) {
        const item = document.createElement('div');
        item.className = 'company-item';
        
        item.innerHTML = `
            <div class="company-info">
                <h4>${company.nome}</h4>
                <p>CNPJ: ${company.cnpj}</p>
                <p>${company.endereco}</p>
                <p>Tel: ${company.telefone}</p>
            </div>
            <div class="company-actions">
                <button class="btn-primary btn-small" onclick="app.editCompany('${company.id}', '${type}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-danger btn-small" onclick="app.deleteCompany('${company.id}', '${type}')">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;
        
        return item;
    }

    openCompanyModal(type, companyId = null) {
        this.currentCompanyType = type;
        this.editingCompanyId = companyId;
        
        const modal = document.getElementById('company-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('company-form');
        
        form.reset();
        
        if (companyId) {
            title.textContent = 'Editar Empresa';
            const company = type === 'contratante' ? 
                window.storageManager.getContratante(companyId) :
                window.storageManager.getContratada(companyId);
                
            if (company) {
                document.getElementById('company-nome').value = company.nome;
                document.getElementById('company-cnpj').value = company.cnpj;
                document.getElementById('company-endereco').value = company.endereco;
                document.getElementById('company-telefone').value = company.telefone;
            }
        } else {
            title.textContent = `Adicionar ${type === 'contratante' ? 'Contratante' : 'Contratada'}`;
        }
        
        modal.style.display = 'block';
        document.getElementById('company-nome').focus();
    }

    closeCompanyModal() {
        document.getElementById('company-modal').style.display = 'none';
        this.currentCompanyType = null;
        this.editingCompanyId = null;
    }

    saveCompany() {
        const form = document.getElementById('company-form');
        const formData = new FormData(form);
        
        const company = {
            nome: formData.get('nome').trim(),
            cnpj: formData.get('cnpj').trim(),
            endereco: formData.get('endereco').trim(),
            telefone: formData.get('telefone').trim()
        };
        
        // Validation
        if (!company.nome || !company.cnpj || !company.endereco || !company.telefone) {
            this.showAlert('Todos os campos são obrigatórios!', 'error');
            return;
        }
        
        if (!window.storageManager.validateCNPJ(company.cnpj)) {
            this.showAlert('CNPJ inválido!', 'error');
            return;
        }
        
        // Format data
        company.cnpj = window.storageManager.formatCNPJ(company.cnpj);
        company.telefone = window.storageManager.formatPhone(company.telefone);
        
        let success = false;
        
        if (this.editingCompanyId) {
            // Update existing company
            if (this.currentCompanyType === 'contratante') {
                success = window.storageManager.updateContratante(this.editingCompanyId, company);
            } else {
                success = window.storageManager.updateContratada(this.editingCompanyId, company);
            }
        } else {
            // Add new company
            if (this.currentCompanyType === 'contratante') {
                success = window.storageManager.addContratante(company);
            } else {
                success = window.storageManager.addContratada(company);
            }
        }
        
        if (success) {
            this.showAlert(`Empresa ${this.editingCompanyId ? 'atualizada' : 'adicionada'} com sucesso!`, 'success');
            this.closeCompanyModal();
            this.loadCompaniesLists();
            this.loadCompanySelects();
        } else {
            this.showAlert('Erro ao salvar empresa!', 'error');
        }
    }

    editCompany(id, type) {
        this.openCompanyModal(type, id);
    }

    deleteCompany(id, type) {
        if (!confirm('Tem certeza que deseja excluir esta empresa?')) {
            return;
        }
        
        let success = false;
        
        if (type === 'contratante') {
            success = window.storageManager.deleteContratante(id);
        } else {
            success = window.storageManager.deleteContratada(id);
        }
        
        if (success) {
            this.showAlert('Empresa excluída com sucesso!', 'success');
            this.loadCompaniesLists();
            this.loadCompanySelects();
        } else {
            this.showAlert('Erro ao excluir empresa!', 'error');
        }
    }

    getFormData() {
        const form = document.getElementById('os-form');
        const formData = new FormData(form);
        
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }
        
        return data;
    }

    fillFormData(data) {
        Object.entries(data).forEach(([key, value]) => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
        });
    }

    validateForm() {
        const data = this.getFormData();
        const errors = [];
        
        // Basic validation
        if (!data.dataHora) errors.push('Data e hora são obrigatórias');
        if (!data.tipoManutencao) errors.push('Tipo de manutenção é obrigatório');
        if (!data.dataSolicitacao) errors.push('Data de solicitação é obrigatória');
        if (!data.contratanteNome) errors.push('Nome da contratante é obrigatório');
        if (!data.contratanteCnpj) errors.push('CNPJ da contratante é obrigatório');
        if (!data.contratanteEndereco) errors.push('Endereço da contratante é obrigatório');
        if (!data.contratanteTelefone) errors.push('Telefone da contratante é obrigatório');
        if (!data.contratadaNome) errors.push('Nome da contratada é obrigatório');
        if (!data.contratadaCnpj) errors.push('CNPJ da contratada é obrigatório');
        if (!data.contratadaEndereco) errors.push('Endereço da contratada é obrigatório');
        if (!data.contratadaTelefone) errors.push('Telefone da contratada é obrigatório');
        if (!data.tecnicoNome) errors.push('Nome do técnico é obrigatório');
        if (!data.tecnicoCpf) errors.push('CPF do técnico é obrigatório');
        if (!data.descricao) errors.push('Descrição é obrigatória');
        
        // CNPJ validation
        if (data.contratanteCnpj && !window.storageManager.validateCNPJ(data.contratanteCnpj)) {
            errors.push('CNPJ da contratante é inválido');
        }
        if (data.contratadaCnpj && !window.storageManager.validateCNPJ(data.contratadaCnpj)) {
            errors.push('CNPJ da contratada é inválido');
        }
        
        // CPF validation
        if (data.tecnicoCpf && !window.storageManager.validateCPF(data.tecnicoCpf)) {
            errors.push('CPF do técnico é inválido');
        }
        
        return errors;
    }

    previewOS() {
        const errors = this.validateForm();
        if (errors.length > 0) {
            this.showAlert('Erros no formulário:\n' + errors.join('\n'), 'error');
            return;
        }
        
        const formData = this.getFormData();
        this.currentFormData = formData;
        
        const previewHTML = window.pdfGenerator.generatePreviewHTML(formData);
        document.getElementById('preview-content').innerHTML = previewHTML;
        
        this.switchTab('preview');
    }

    generatePDF() {
        const formData = this.currentFormData || this.getFormData();
        
        const errors = this.validateForm();
        if (errors.length > 0) {
            this.showAlert('Erros no formulário:\n' + errors.join('\n'), 'error');
            return;
        }
        
        const success = window.pdfGenerator.generateOSPDF(formData);
        if (success) {
            this.showAlert('PDF gerado com sucesso!', 'success');
            // Clear last form data after successful PDF generation
            window.storageManager.clearLastFormData();
        } else {
            this.showAlert('Erro ao gerar PDF!', 'error');
        }
    }

    clearForm() {
        if (confirm('Tem certeza que deseja limpar todos os campos?')) {
            document.getElementById('os-form').reset();
            this.setCurrentDateTime();
            window.storageManager.clearLastFormData();
            this.showAlert('Formulário limpo!', 'info');
        }
    }

    exportBackup() {
        const backup = window.storageManager.exportBackup();
        if (backup) {
            const blob = new Blob([backup], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_os_system_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showAlert('Backup exportado com sucesso!', 'success');
        } else {
            this.showAlert('Erro ao exportar backup!', 'error');
        }
    }

    importBackup(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const success = window.storageManager.importBackup(e.target.result);
            if (success) {
                this.showAlert('Backup importado com sucesso!', 'success');
                this.loadCompaniesLists();
                this.loadCompanySelects();
            } else {
                this.showAlert('Erro ao importar backup! Verifique se o arquivo é válido.', 'error');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        if (confirm('ATENÇÃO: Esta ação irá apagar todos os dados salvos e não pode ser desfeita. Tem certeza?')) {
            if (confirm('Última confirmação: Todos os dados serão perdidos permanentemente!')) {
                const success = window.storageManager.clearAllData();
                if (success) {
                    this.showAlert('Todos os dados foram limpos!', 'info');
                    this.loadCompaniesLists();
                    this.loadCompanySelects();
                    this.clearForm();
                } else {
                    this.showAlert('Erro ao limpar dados!', 'error');
                }
            }
        }
    }

    showAlert(message, type = 'info') {
        // Remove existing alerts
        document.querySelectorAll('.alert').forEach(alert => alert.remove());
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message.replace(/\n/g, '<br>')}
        `;
        
        // Insert at the top of the current tab content
        const activeTab = document.querySelector('.tab-content.active');
        activeTab.insertBefore(alert, activeTab.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new OSSystemApp();
});