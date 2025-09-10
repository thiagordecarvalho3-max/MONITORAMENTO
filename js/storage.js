/**
 * Local Storage Management for OS System
 * Handles saving, loading, and managing local data
 */

class StorageManager {
    constructor() {
        this.storageKeys = {
            contratantes: 'os-system-contratantes',
            contratadas: 'os-system-contratadas',
            settings: 'os-system-settings',
            lastForm: 'os-system-last-form'
        };
        this.init();
    }

    init() {
        // Initialize storage if not exists
        if (!this.getContratantes()) {
            this.saveContratantes([]);
        }
        if (!this.getContratadas()) {
            this.saveContratadas([]);
        }
        if (!this.getSettings()) {
            this.saveSettings(this.getDefaultSettings());
        }
    }

    getDefaultSettings() {
        return {
            autoSaveForm: true,
            defaultTechnician: '',
            defaultTechnicianCPF: '',
            pdfSettings: {
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            }
        };
    }

    // Contratantes Management
    getContratantes() {
        try {
            const data = localStorage.getItem(this.storageKeys.contratantes);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading contratantes:', error);
            return [];
        }
    }

    saveContratantes(contratantes) {
        try {
            localStorage.setItem(this.storageKeys.contratantes, JSON.stringify(contratantes));
            return true;
        } catch (error) {
            console.error('Error saving contratantes:', error);
            return false;
        }
    }

    addContratante(contratante) {
        const contratantes = this.getContratantes();
        contratante.id = this.generateId();
        contratante.createdAt = new Date().toISOString();
        contratantes.push(contratante);
        return this.saveContratantes(contratantes);
    }

    updateContratante(id, updatedData) {
        const contratantes = this.getContratantes();
        const index = contratantes.findIndex(c => c.id === id);
        if (index !== -1) {
            contratantes[index] = { ...contratantes[index], ...updatedData, updatedAt: new Date().toISOString() };
            return this.saveContratantes(contratantes);
        }
        return false;
    }

    deleteContratante(id) {
        const contratantes = this.getContratantes();
        const filtered = contratantes.filter(c => c.id !== id);
        return this.saveContratantes(filtered);
    }

    getContratante(id) {
        const contratantes = this.getContratantes();
        return contratantes.find(c => c.id === id);
    }

    // Contratadas Management
    getContratadas() {
        try {
            const data = localStorage.getItem(this.storageKeys.contratadas);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading contratadas:', error);
            return [];
        }
    }

    saveContratadas(contratadas) {
        try {
            localStorage.setItem(this.storageKeys.contratadas, JSON.stringify(contratadas));
            return true;
        } catch (error) {
            console.error('Error saving contratadas:', error);
            return false;
        }
    }

    addContratada(contratada) {
        const contratadas = this.getContratadas();
        contratada.id = this.generateId();
        contratada.createdAt = new Date().toISOString();
        contratadas.push(contratada);
        return this.saveContratadas(contratadas);
    }

    updateContratada(id, updatedData) {
        const contratadas = this.getContratadas();
        const index = contratadas.findIndex(c => c.id === id);
        if (index !== -1) {
            contratadas[index] = { ...contratadas[index], ...updatedData, updatedAt: new Date().toISOString() };
            return this.saveContratadas(contratadas);
        }
        return false;
    }

    deleteContratada(id) {
        const contratadas = this.getContratadas();
        const filtered = contratadas.filter(c => c.id !== id);
        return this.saveContratadas(contratadas);
    }

    getContratada(id) {
        const contratadas = this.getContratadas();
        return contratadas.find(c => c.id === id);
    }

    // Settings Management
    getSettings() {
        try {
            const data = localStorage.getItem(this.storageKeys.settings);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading settings:', error);
            return null;
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem(this.storageKeys.settings, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    // Form Data Management
    saveFormData(formData) {
        try {
            localStorage.setItem(this.storageKeys.lastForm, JSON.stringify(formData));
            return true;
        } catch (error) {
            console.error('Error saving form data:', error);
            return false;
        }
    }

    getLastFormData() {
        try {
            const data = localStorage.getItem(this.storageKeys.lastForm);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading form data:', error);
            return null;
        }
    }

    clearLastFormData() {
        try {
            localStorage.removeItem(this.storageKeys.lastForm);
            return true;
        } catch (error) {
            console.error('Error clearing form data:', error);
            return false;
        }
    }

    // Backup and Restore
    exportBackup() {
        try {
            const backup = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: {
                    contratantes: this.getContratantes(),
                    contratadas: this.getContratadas(),
                    settings: this.getSettings()
                }
            };
            return JSON.stringify(backup, null, 2);
        } catch (error) {
            console.error('Error creating backup:', error);
            return null;
        }
    }

    importBackup(backupData) {
        try {
            const backup = JSON.parse(backupData);
            
            // Validate backup structure
            if (!backup.data || !backup.version) {
                throw new Error('Invalid backup format');
            }

            // Import data
            if (backup.data.contratantes) {
                this.saveContratantes(backup.data.contratantes);
            }
            if (backup.data.contratadas) {
                this.saveContratadas(backup.data.contratadas);
            }
            if (backup.data.settings) {
                this.saveSettings(backup.data.settings);
            }

            return true;
        } catch (error) {
            console.error('Error importing backup:', error);
            return false;
        }
    }

    // Utility Methods
    generateId() {
        return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatCNPJ(cnpj) {
        // Remove non-numeric characters
        const numbers = cnpj.replace(/\D/g, '');
        
        // Format as XX.XXX.XXX/XXXX-XX
        if (numbers.length === 14) {
            return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        
        return cnpj;
    }

    formatCPF(cpf) {
        // Remove non-numeric characters
        const numbers = cpf.replace(/\D/g, '');
        
        // Format as XXX.XXX.XXX-XX
        if (numbers.length === 11) {
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        
        return cpf;
    }

    formatPhone(phone) {
        // Remove non-numeric characters
        const numbers = phone.replace(/\D/g, '');
        
        // Format based on length
        if (numbers.length === 11) {
            // Cell phone: (XX) XXXXX-XXXX
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (numbers.length === 10) {
            // Landline: (XX) XXXX-XXXX
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        return phone;
    }

    validateCNPJ(cnpj) {
        const numbers = cnpj.replace(/\D/g, '');
        
        if (numbers.length !== 14) {
            return false;
        }

        // Basic CNPJ validation algorithm
        let sum = 0;
        let pos = 5;
        
        for (let i = 0; i < 12; i++) {
            sum += parseInt(numbers.charAt(i)) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(numbers.charAt(12))) {
            return false;
        }
        
        sum = 0;
        pos = 6;
        
        for (let i = 0; i < 13; i++) {
            sum += parseInt(numbers.charAt(i)) * pos--;
            if (pos < 2) pos = 9;
        }
        
        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        return result === parseInt(numbers.charAt(13));
    }

    validateCPF(cpf) {
        const numbers = cpf.replace(/\D/g, '');
        
        if (numbers.length !== 11) {
            return false;
        }

        // Check for known invalid CPFs
        if (/^(\d)\1{10}$/.test(numbers)) {
            return false;
        }

        // Basic CPF validation algorithm
        let sum = 0;
        
        for (let i = 0; i < 9; i++) {
            sum += parseInt(numbers.charAt(i)) * (10 - i);
        }
        
        let digit = 11 - (sum % 11);
        if (digit === 10 || digit === 11) digit = 0;
        if (digit !== parseInt(numbers.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(numbers.charAt(i)) * (11 - i);
        }
        
        digit = 11 - (sum % 11);
        if (digit === 10 || digit === 11) digit = 0;
        return digit === parseInt(numbers.charAt(10));
    }

    // Clear all data
    clearAllData() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            this.init(); // Reinitialize with defaults
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    }

    // Get storage usage info
    getStorageInfo() {
        try {
            let totalSize = 0;
            const details = {};
            
            Object.entries(this.storageKeys).forEach(([name, key]) => {
                const data = localStorage.getItem(key);
                const size = data ? data.length : 0;
                details[name] = {
                    size: size,
                    sizeFormatted: this.formatBytes(size)
                };
                totalSize += size;
            });
            
            return {
                total: totalSize,
                totalFormatted: this.formatBytes(totalSize),
                details: details
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Create global instance
window.storageManager = new StorageManager();