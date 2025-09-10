/**
 * PDF Generator for OS System
 * Handles PDF generation using jsPDF
 */

class PDFGenerator {
    constructor() {
        this.pageWidth = 210;
        this.pageHeight = 297;
        this.margin = 20;
        this.contentWidth = this.pageWidth - (2 * this.margin);
        this.currentY = this.margin;
        this.lineHeight = 6;
        this.sectionSpacing = 15;
    }

    generateOSPDF(formData) {
        try {
            // Create new PDF document
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            this.doc = doc;
            this.currentY = this.margin;

            // Generate PDF content
            this.addHeader(formData);
            this.addBasicInfo(formData);
            this.addContratanteInfo(formData);
            this.addContratadaInfo(formData);
            this.addTecnicoInfo(formData);
            this.addDescricao(formData);
            this.addSignatures();
            this.addFooter();

            // Generate filename
            const filename = this.generateFilename(formData);

            // Save PDF
            doc.save(filename);

            return true;
        } catch (error) {
            console.error('Error generating PDF:', error);
            return false;
        }
    }

    addHeader(formData) {
        const doc = this.doc;
        
        // Title
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(42, 82, 152);
        doc.text('ORDEM DE SERVIÇO', this.pageWidth / 2, this.currentY, { align: 'center' });
        
        this.currentY += 10;
        
        // Subtitle
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 102, 102);
        doc.text('Sistema de Manutenção', this.pageWidth / 2, this.currentY, { align: 'center' });
        
        this.currentY += 5;
        
        // OS Number
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(42, 82, 152);
        const osNumber = this.generateOSNumber();
        doc.text(`OS Nº ${osNumber}`, this.pageWidth / 2, this.currentY, { align: 'center' });
        
        this.currentY += 10;
        
        // Line separator
        doc.setLineWidth(1);
        doc.setDrawColor(42, 82, 152);
        doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        
        this.currentY += this.sectionSpacing;
    }

    addBasicInfo(formData) {
        this.addSectionTitle('INFORMAÇÕES BÁSICAS');
        
        const fields = [
            { label: 'Data e Hora:', value: this.formatDateTime(formData.dataHora) },
            { label: 'Tipo de Manutenção:', value: this.formatMaintenanceType(formData.tipoManutencao) },
            { label: 'Data de Solicitação:', value: this.formatDate(formData.dataSolicitacao) }
        ];
        
        fields.forEach(field => {
            this.addField(field.label, field.value);
        });
        
        this.currentY += this.sectionSpacing;
    }

    addContratanteInfo(formData) {
        this.addSectionTitle('DADOS DA CONTRATANTE');
        
        const fields = [
            { label: 'Empresa:', value: formData.contratanteNome },
            { label: 'CNPJ:', value: formData.contratanteCnpj },
            { label: 'Endereço:', value: formData.contratanteEndereco },
            { label: 'Telefone:', value: formData.contratanteTelefone }
        ];
        
        fields.forEach(field => {
            this.addField(field.label, field.value);
        });
        
        this.currentY += this.sectionSpacing;
    }

    addContratadaInfo(formData) {
        this.addSectionTitle('DADOS DA CONTRATADA');
        
        const fields = [
            { label: 'Empresa:', value: formData.contratadaNome },
            { label: 'CNPJ:', value: formData.contratadaCnpj },
            { label: 'Endereço:', value: formData.contratadaEndereco },
            { label: 'Telefone:', value: formData.contratadaTelefone }
        ];
        
        fields.forEach(field => {
            this.addField(field.label, field.value);
        });
        
        this.currentY += this.sectionSpacing;
    }

    addTecnicoInfo(formData) {
        this.addSectionTitle('TÉCNICO RESPONSÁVEL');
        
        const fields = [
            { label: 'Nome:', value: formData.tecnicoNome },
            { label: 'CPF:', value: formData.tecnicoCpf }
        ];
        
        fields.forEach(field => {
            this.addField(field.label, field.value);
        });
        
        this.currentY += this.sectionSpacing;
    }

    addDescricao(formData) {
        this.addSectionTitle('DESCRIÇÃO DA SOLICITAÇÃO');
        
        const doc = this.doc;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        // Check if we need a new page
        if (this.currentY + 50 > this.pageHeight - this.margin) {
            doc.addPage();
            this.currentY = this.margin;
        }
        
        // Add description box
        const boxHeight = 40;
        doc.setDrawColor(221, 221, 221);
        doc.setFillColor(250, 250, 250);
        doc.rect(this.margin, this.currentY, this.contentWidth, boxHeight, 'FD');
        
        // Add description text
        const textLines = doc.splitTextToSize(formData.descricao, this.contentWidth - 6);
        doc.text(textLines, this.margin + 3, this.currentY + 8);
        
        this.currentY += boxHeight + this.sectionSpacing;
    }

    addSignatures() {
        const doc = this.doc;
        
        // Check if we need a new page
        if (this.currentY + 60 > this.pageHeight - this.margin) {
            doc.addPage();
            this.currentY = this.margin;
        }
        
        this.currentY += 20;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(42, 82, 152);
        doc.text('ASSINATURAS', this.pageWidth / 2, this.currentY, { align: 'center' });
        
        this.currentY += 30;
        
        // Signature lines
        const signatureWidth = 80;
        const leftSignatureX = this.margin + 10;
        const rightSignatureX = this.pageWidth - this.margin - signatureWidth - 10;
        
        // Left signature
        doc.setDrawColor(0, 0, 0);
        doc.line(leftSignatureX, this.currentY, leftSignatureX + signatureWidth, this.currentY);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 102, 102);
        doc.text('Contratante', leftSignatureX + (signatureWidth / 2), this.currentY + 8, { align: 'center' });
        
        // Right signature
        doc.line(rightSignatureX, this.currentY, rightSignatureX + signatureWidth, this.currentY);
        doc.text('Contratada', rightSignatureX + (signatureWidth / 2), this.currentY + 8, { align: 'center' });
        
        this.currentY += 25;
        
        // Date and location
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const today = new Date().toLocaleDateString('pt-BR');
        doc.text(`Data: ${today}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    }

    addFooter() {
        const doc = this.doc;
        const footerY = this.pageHeight - 15;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 102, 102);
        doc.text('Sistema de Emissão de Ordens de Serviço - Gerado automaticamente', 
                this.pageWidth / 2, footerY, { align: 'center' });
    }

    addSectionTitle(title) {
        const doc = this.doc;
        
        // Check if we need a new page
        if (this.currentY + 25 > this.pageHeight - this.margin) {
            doc.addPage();
            this.currentY = this.margin;
        }
        
        // Section background
        doc.setFillColor(42, 82, 152);
        doc.rect(this.margin, this.currentY, this.contentWidth, 8, 'F');
        
        // Section title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(title, this.margin + 3, this.currentY + 6);
        
        this.currentY += 12;
    }

    addField(label, value) {
        const doc = this.doc;
        
        // Check if we need a new page
        if (this.currentY + 10 > this.pageHeight - this.margin) {
            doc.addPage();
            this.currentY = this.margin;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 51, 51);
        doc.text(label, this.margin, this.currentY);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        // Calculate label width for proper alignment
        const labelWidth = doc.getTextWidth(label) + 5;
        
        // Draw value with underline
        const valueX = this.margin + labelWidth;
        const valueWidth = this.contentWidth - labelWidth;
        
        // Truncate value if too long
        let displayValue = value || '_'.repeat(30);
        const maxValueWidth = valueWidth - 5;
        
        if (doc.getTextWidth(displayValue) > maxValueWidth) {
            while (doc.getTextWidth(displayValue + '...') > maxValueWidth && displayValue.length > 0) {
                displayValue = displayValue.slice(0, -1);
            }
            displayValue += '...';
        }
        
        doc.text(displayValue, valueX, this.currentY);
        
        // Underline
        doc.setDrawColor(221, 221, 221);
        doc.line(valueX, this.currentY + 1, valueX + valueWidth, this.currentY + 1);
        
        this.currentY += this.lineHeight + 2;
    }

    generateOSNumber() {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        return `${year}${month}${day}${random}`;
    }

    generateFilename(formData) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
        const osNumber = this.generateOSNumber();
        
        return `OS_${osNumber}_${dateStr}_${timeStr}.pdf`;
    }

    formatDateTime(dateTimeString) {
        if (!dateTimeString) return '';
        
        const date = new Date(dateTimeString);
        return date.toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    }

    formatMaintenanceType(type) {
        const types = {
            'diaria': 'Manutenção Diária',
            'semanal': 'Manutenção Semanal',
            'mensal': 'Manutenção Mensal',
            'trimestral': 'Manutenção Trimestral',
            'anual': 'Manutenção Anual'
        };
        
        return types[type] || type;
    }

    // Generate HTML preview
    generatePreviewHTML(formData) {
        const osNumber = this.generateOSNumber();
        
        return `
            <div class="os-preview">
                <div class="os-header">
                    <div class="os-title">ORDEM DE SERVIÇO</div>
                    <div class="os-subtitle">Sistema de Manutenção</div>
                    <div class="os-number">OS Nº ${osNumber}</div>
                </div>
                
                <div class="os-section">
                    <div class="os-section-title">INFORMAÇÕES BÁSICAS</div>
                    <div class="os-field">
                        <span class="os-field-label">Data e Hora:</span>
                        <span class="os-field-value">${this.formatDateTime(formData.dataHora)}</span>
                    </div>
                    <div class="os-field">
                        <span class="os-field-label">Tipo de Manutenção:</span>
                        <span class="os-field-value">${this.formatMaintenanceType(formData.tipoManutencao)}</span>
                    </div>
                    <div class="os-field">
                        <span class="os-field-label">Data de Solicitação:</span>
                        <span class="os-field-value">${this.formatDate(formData.dataSolicitacao)}</span>
                    </div>
                </div>
                
                <div class="os-section">
                    <div class="os-section-title">DADOS DA CONTRATANTE</div>
                    <div class="os-field">
                        <span class="os-field-label">Empresa:</span>
                        <span class="os-field-value">${formData.contratanteNome}</span>
                    </div>
                    <div class="os-field">
                        <span class="os-field-label">CNPJ:</span>
                        <span class="os-field-value">${formData.contratanteCnpj}</span>
                    </div>
                    <div class="os-field">
                        <span class="os-field-label">Endereço:</span>
                        <span class="os-field-value">${formData.contratanteEndereco}</span>
                    </div>
                    <div class="os-field">
                        <span class="os-field-label">Telefone:</span>
                        <span class="os-field-value">${formData.contratanteTelefone}</span>
                    </div>
                </div>
                
                <div class="os-section">
                    <div class="os-section-title">DADOS DA CONTRATADA</div>
                    <div class="os-field">
                        <span class="os-field-label">Empresa:</span>
                        <span class="os-field-value">${formData.contratadaNome}</span>
                    </div>
                    <div class="os-field">
                        <span class="os-field-label">CNPJ:</span>
                        <span class="os-field-value">${formData.contratadaCnpj}</span>
                    </div>
                    <div class="os-field">
                        <span class="os-field-label">Endereço:</span>
                        <span class="os-field-value">${formData.contratadaEndereco}</span>
                    </div>
                    <div class="os-field">
                        <span class="os-field-label">Telefone:</span>
                        <span class="os-field-value">${formData.contratadaTelefone}</span>
                    </div>
                </div>
                
                <div class="os-section">
                    <div class="os-section-title">TÉCNICO RESPONSÁVEL</div>
                    <div class="os-field">
                        <span class="os-field-label">Nome:</span>
                        <span class="os-field-value">${formData.tecnicoNome}</span>
                    </div>
                    <div class="os-field">
                        <span class="os-field-label">CPF:</span>
                        <span class="os-field-value">${formData.tecnicoCpf}</span>
                    </div>
                </div>
                
                <div class="os-section">
                    <div class="os-section-title">DESCRIÇÃO DA SOLICITAÇÃO</div>
                    <div class="os-field-full">
                        <div class="os-field-value">${formData.descricao}</div>
                    </div>
                </div>
                
                <div class="pdf-signature-section">
                    <div class="os-section-title">ASSINATURAS</div>
                    <div class="pdf-signatures">
                        <div class="pdf-signature">
                            <div class="pdf-signature-line">Contratante</div>
                        </div>
                        <div class="pdf-signature">
                            <div class="pdf-signature-line">Contratada</div>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 20px; font-size: 0.9em; color: #666;">
                        Data: ${new Date().toLocaleDateString('pt-BR')}
                    </div>
                </div>
            </div>
        `;
    }
}

// Create global instance
window.pdfGenerator = new PDFGenerator();