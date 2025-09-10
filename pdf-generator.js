// Simple PDF generation without external dependencies
class SimplePDFGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
    }

    async generatePDF(data) {
        return new Promise((resolve, reject) => {
            try {
                // Create a new window for PDF content
                const printWindow = window.open('', '_blank', 'width=800,height=600');
                
                const htmlContent = this.generatePrintableHTML(data);
                
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                
                // Wait for content to load
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                        resolve(true);
                    }, 500);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }

    generatePrintableHTML(data) {
        const currentDate = new Date().toLocaleDateString('pt-BR');
        const total = this.calculateTotal(data.valeTransporte, data.valeAlimentacao);
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Recibo - ${data.funcionarioNome}</title>
            <style>
                @page {
                    size: A4;
                    margin: 2cm;
                }
                
                body {
                    font-family: Arial, sans-serif;
                    font-size: 12pt;
                    line-height: 1.4;
                    color: #000;
                    background: white;
                    margin: 0;
                    padding: 20px;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                }
                
                .header h1 {
                    color: #1a237e;
                    margin: 0;
                    font-size: 20pt;
                    font-weight: bold;
                }
                
                .header h2 {
                    color: #666;
                    margin: 10px 0 0 0;
                    font-size: 14pt;
                    font-weight: normal;
                }
                
                .section {
                    margin-bottom: 25px;
                }
                
                .section h3 {
                    color: #333;
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 5px;
                    margin-bottom: 15px;
                    font-size: 14pt;
                }
                
                .info-row {
                    margin: 8px 0;
                    display: flex;
                    justify-content: space-between;
                }
                
                .info-label {
                    font-weight: bold;
                    color: #333;
                }
                
                .info-value {
                    color: #000;
                }
                
                .values-grid {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 15px 0;
                }
                
                .value-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #ddd;
                }
                
                .value-row:last-child {
                    border-bottom: none;
                    background: #1a237e;
                    color: white;
                    padding: 15px;
                    margin: 10px -15px -15px -15px;
                    font-weight: bold;
                    font-size: 14pt;
                }
                
                .signature-area {
                    margin-top: 50px;
                    text-align: center;
                }
                
                .signature-line {
                    border-top: 1px solid #333;
                    width: 300px;
                    margin: 0 auto 10px auto;
                }
                
                .footer-note {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 10pt;
                    color: #666;
                    line-height: 1.3;
                }
                
                .document-border {
                    border: 2px solid #333;
                    padding: 30px;
                    border-radius: 10px;
                    max-width: 750px;
                    margin: 0 auto;
                }
                
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    
                    .document-border {
                        border: 2px solid #333;
                        page-break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <div class="document-border">
                <div class="header">
                    <h1>RECIBO DE PAGAMENTO</h1>
                    <h2>VALE TRANSPORTE E VALE ALIMENTAÇÃO</h2>
                </div>
                
                <div class="section">
                    <h3>DADOS DA EMPRESA</h3>
                    <div class="info-row">
                        <span class="info-label">Empresa:</span>
                        <span class="info-value">${data.empresaNome}</span>
                    </div>
                    ${data.empresaCnpj ? `
                    <div class="info-row">
                        <span class="info-label">CNPJ:</span>
                        <span class="info-value">${data.empresaCnpj}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="section">
                    <h3>DADOS DO FUNCIONÁRIO</h3>
                    <div class="info-row">
                        <span class="info-label">Nome:</span>
                        <span class="info-value">${data.funcionarioNome}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">CPF:</span>
                        <span class="info-value">${data.funcionarioCpf}</span>
                    </div>
                    ${data.funcionarioMatricula ? `
                    <div class="info-row">
                        <span class="info-label">Matrícula:</span>
                        <span class="info-value">${data.funcionarioMatricula}</span>
                    </div>
                    ` : ''}
                    ${data.funcionarioCargo ? `
                    <div class="info-row">
                        <span class="info-label">Cargo:</span>
                        <span class="info-value">${data.funcionarioCargo}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="section">
                    <h3>VALORES DOS BENEFÍCIOS</h3>
                    <div class="values-grid">
                        <div class="value-row">
                            <span>Vale Transporte:</span>
                            <span style="font-size: 14pt; color: #1a237e; font-weight: bold;">${data.valeTransporte}</span>
                        </div>
                        <div class="value-row">
                            <span>Vale Alimentação:</span>
                            <span style="font-size: 14pt; color: #1a237e; font-weight: bold;">${data.valeAlimentacao}</span>
                        </div>
                        <div class="value-row">
                            <span>TOTAL:</span>
                            <span>${total}</span>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="info-row">
                        <span class="info-label">Data de Emissão:</span>
                        <span class="info-value">${this.formatDate(data.dataRecibo)}</span>
                    </div>
                    ${data.periodoReferencia ? `
                    <div class="info-row">
                        <span class="info-label">Período de Referência:</span>
                        <span class="info-value">${this.formatMonth(data.periodoReferencia)}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="signature-area">
                    <div class="signature-line"></div>
                    <p style="margin-top: 10px; font-size: 12pt;">Assinatura do Responsável</p>
                </div>
                
                <div class="footer-note">
                    <p>Este documento comprova o recebimento dos valores de vale transporte e vale alimentação</p>
                    <p>conforme especificado acima para o período de referência indicado.</p>
                    <p style="margin-top: 15px; font-size: 9pt;">Gerado em: ${currentDate}</p>
                </div>
            </div>
        </body>
        </html>`;
    }

    calculateTotal(valeTransporte, valeAlimentacao) {
        const val1 = this.parseMoneyValue(valeTransporte);
        const val2 = this.parseMoneyValue(valeAlimentacao);
        const total = val1 + val2;
        return `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    parseMoneyValue(moneyString) {
        if (!moneyString) return 0;
        return parseFloat(moneyString.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
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
}

// Export for use in main script
window.SimplePDFGenerator = SimplePDFGenerator;