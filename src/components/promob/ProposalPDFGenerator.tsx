import React, { useState } from 'react';
import { FurnitureModule } from '@/types';
import { X, Download, FileText, Image, Palette, Building2, Phone, Mail, Calendar } from 'lucide-react';

interface ProposalPDFGeneratorProps {
  modules: FurnitureModule[];
  projectName: string;
  clientName: string;
  floorWidth: number;
  floorDepth: number;
  onClose: () => void;
}

interface CompanyInfo {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  cnpj: string;
}

interface ProposalConfig {
  showImages: boolean;
  showDetails: boolean;
  showPaymentTerms: boolean;
  discount: number;
  paymentTerms: string;
  validityDays: number;
  notes: string;
}

const ProposalPDFGenerator: React.FC<ProposalPDFGeneratorProps> = ({
  modules,
  projectName,
  clientName,
  floorWidth,
  floorDepth,
  onClose,
}) => {
  const [company, setCompany] = useState<CompanyInfo>({
    name: 'SD Móveis Planejados',
    logo: '',
    address: 'Rua das Indústrias, 1000 - Distrito Industrial',
    phone: '(11) 99999-9999',
    email: 'contato@sdmoveis.com.br',
    cnpj: '00.000.000/0001-00',
  });

  const [config, setConfig] = useState<ProposalConfig>({
    showImages: true,
    showDetails: true,
    showPaymentTerms: true,
    discount: 0,
    paymentTerms: '50% entrada + 50% na entrega',
    validityDays: 15,
    notes: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate totals
  const subtotal = modules.reduce((sum, m) => sum + m.price, 0);
  const discountValue = subtotal * (config.discount / 100);
  const total = subtotal - discountValue;

  // Group modules by category
  const modulesByCategory = modules.reduce((acc, mod) => {
    if (!acc[mod.category]) acc[mod.category] = [];
    acc[mod.category].push(mod);
    return acc;
  }, {} as Record<string, FurnitureModule[]>);

  const generatePDF = async () => {
    setIsGenerating(true);

    // Create printable HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Proposta - ${projectName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.5; }
          .page { padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #d97706; padding-bottom: 20px; margin-bottom: 30px; }
          .company-info h1 { color: #d97706; font-size: 24px; margin-bottom: 5px; }
          .company-info p { font-size: 12px; color: #666; }
          .proposal-title { text-align: right; }
          .proposal-title h2 { color: #1a1a2e; font-size: 20px; }
          .proposal-title p { font-size: 12px; color: #666; }
          .client-box { background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .client-box h3 { color: #d97706; margin-bottom: 10px; font-size: 14px; }
          .client-box p { font-size: 13px; }
          .section { margin-bottom: 30px; }
          .section h3 { color: #1a1a2e; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 15px; font-size: 16px; }
          .category { margin-bottom: 20px; }
          .category h4 { background: #d97706; color: white; padding: 8px 12px; font-size: 13px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #1a1a2e; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          tr:nth-child(even) { background: #f9f9f9; }
          .totals { background: #1a1a2e; color: white; padding: 20px; border-radius: 8px; margin-top: 30px; }
          .totals .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .totals .total { font-size: 20px; font-weight: bold; color: #d97706; }
          .payment-terms { background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .payment-terms h4 { color: #d97706; margin-bottom: 10px; }
          .notes { margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 8px; font-size: 12px; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          .signature { margin-top: 60px; display: flex; justify-content: space-around; }
          .signature-line { width: 200px; border-top: 1px solid #333; padding-top: 5px; text-align: center; font-size: 11px; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="company-info">
              <h1>${company.name}</h1>
              <p>${company.address}</p>
              <p>Tel: ${company.phone} | Email: ${company.email}</p>
              <p>CNPJ: ${company.cnpj}</p>
            </div>
            <div class="proposal-title">
              <h2>PROPOSTA COMERCIAL</h2>
              <p>Nº ${Date.now().toString().slice(-6)}</p>
              <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
              <p>Validade: ${config.validityDays} dias</p>
            </div>
          </div>

          <div class="client-box">
            <h3>DADOS DO CLIENTE</h3>
            <p><strong>Cliente:</strong> ${clientName}</p>
            <p><strong>Projeto:</strong> ${projectName}</p>
            <p><strong>Ambiente:</strong> ${(floorWidth / 1000).toFixed(2)}m × ${(floorDepth / 1000).toFixed(2)}m</p>
          </div>

          <div class="section">
            <h3>ITENS DO PROJETO</h3>
            ${Object.entries(modulesByCategory).map(([category, mods]) => `
              <div class="category">
                <h4>${category} (${mods.length} ${mods.length === 1 ? 'item' : 'itens'})</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Dimensões</th>
                      <th>Acabamento</th>
                      <th style="text-align: right;">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${mods.filter(m => !m.isAppliance).map(m => `
                      <tr>
                        <td>${m.type}</td>
                        <td>${m.width}×${m.height}×${m.depth}mm</td>
                        <td>${m.finish}</td>
                        <td style="text-align: right;">R$ ${m.price.toLocaleString('pt-BR')}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <div class="row">
              <span>Subtotal (${modules.filter(m => !m.isAppliance).length} módulos):</span>
              <span>R$ ${subtotal.toLocaleString('pt-BR')}</span>
            </div>
            ${config.discount > 0 ? `
              <div class="row">
                <span>Desconto (${config.discount}%):</span>
                <span>- R$ ${discountValue.toLocaleString('pt-BR')}</span>
              </div>
            ` : ''}
            <div class="row total">
              <span>TOTAL:</span>
              <span>R$ ${total.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          ${config.showPaymentTerms ? `
            <div class="payment-terms">
              <h4>CONDIÇÕES DE PAGAMENTO</h4>
              <p>${config.paymentTerms}</p>
            </div>
          ` : ''}

          ${config.notes ? `
            <div class="notes">
              <strong>Observações:</strong><br>
              ${config.notes}
            </div>
          ` : ''}

          <div class="notes">
            <strong>Incluso:</strong> Projeto 3D, produção sob medida, montagem e garantia de 5 anos.<br>
            <strong>Prazo de entrega:</strong> 30-45 dias úteis após confirmação do pedido.<br>
            <strong>Esta proposta é válida por ${config.validityDays} dias.</strong>
          </div>

          <div class="signature">
            <div class="signature-line">
              ${company.name}
            </div>
            <div class="signature-line">
              ${clientName}
            </div>
          </div>

          <div class="footer">
            <p>${company.name} - ${company.address}</p>
            <p>Tel: ${company.phone} | ${company.email}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        setIsGenerating(false);
      }, 500);
    } else {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-amber-500/30 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-3 flex items-center justify-between">
          <h2 className="text-amber-950 font-bold flex items-center gap-2">
            <FileText size={18} />
            Gerar Proposta Comercial PDF
          </h2>
          <button onClick={onClose} className="text-amber-900 hover:text-amber-950">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Company Info */}
            <div className="space-y-3">
              <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-1">
                  <Building2 size={14} />
                  Dados da Empresa
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={company.name}
                    onChange={(e) => setCompany(c => ({ ...c, name: e.target.value }))}
                    placeholder="Nome da empresa"
                    className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                  />
                  <input
                    type="text"
                    value={company.address}
                    onChange={(e) => setCompany(c => ({ ...c, address: e.target.value }))}
                    placeholder="Endereço"
                    className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={company.phone}
                      onChange={(e) => setCompany(c => ({ ...c, phone: e.target.value }))}
                      placeholder="Telefone"
                      className="bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                    />
                    <input
                      type="text"
                      value={company.cnpj}
                      onChange={(e) => setCompany(c => ({ ...c, cnpj: e.target.value }))}
                      placeholder="CNPJ"
                      className="bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                    />
                  </div>
                  <input
                    type="email"
                    value={company.email}
                    onChange={(e) => setCompany(c => ({ ...c, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                  />
                </div>
              </div>

              {/* Configuration */}
              <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-1">
                  <Palette size={14} />
                  Configurações da Proposta
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-amber-100">
                    <input
                      type="checkbox"
                      checked={config.showImages}
                      onChange={(e) => setConfig(c => ({ ...c, showImages: e.target.checked }))}
                      className="w-3 h-3 accent-amber-500"
                    />
                    Incluir imagens do projeto
                  </label>
                  <label className="flex items-center gap-2 text-xs text-amber-100">
                    <input
                      type="checkbox"
                      checked={config.showDetails}
                      onChange={(e) => setConfig(c => ({ ...c, showDetails: e.target.checked }))}
                      className="w-3 h-3 accent-amber-500"
                    />
                    Mostrar detalhes técnicos
                  </label>
                  <label className="flex items-center gap-2 text-xs text-amber-100">
                    <input
                      type="checkbox"
                      checked={config.showPaymentTerms}
                      onChange={(e) => setConfig(c => ({ ...c, showPaymentTerms: e.target.checked }))}
                      className="w-3 h-3 accent-amber-500"
                    />
                    Incluir condições de pagamento
                  </label>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-1">
                  <Calendar size={14} />
                  Pagamento e Validade
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-amber-300/70 text-[10px]">Desconto (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={config.discount}
                      onChange={(e) => setConfig(c => ({ ...c, discount: Number(e.target.value) }))}
                      className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-amber-300/70 text-[10px]">Condições de pagamento</label>
                    <input
                      type="text"
                      value={config.paymentTerms}
                      onChange={(e) => setConfig(c => ({ ...c, paymentTerms: e.target.value }))}
                      className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-amber-300/70 text-[10px]">Validade (dias)</label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={config.validityDays}
                      onChange={(e) => setConfig(c => ({ ...c, validityDays: Number(e.target.value) }))}
                      className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="bg-[#0f0f23] rounded-lg p-3 border border-amber-500/10">
              <h3 className="text-amber-400 text-sm font-bold mb-3">Prévia do Orçamento</h3>
              
              <div className="bg-white text-gray-900 rounded p-3 text-xs space-y-3 max-h-80 overflow-auto">
                {/* Header Preview */}
                <div className="border-b-2 border-amber-500 pb-2">
                  <h4 className="text-amber-600 font-bold">{company.name}</h4>
                  <p className="text-[10px] text-gray-500">{company.address}</p>
                </div>

                {/* Client */}
                <div className="bg-gray-100 p-2 rounded">
                  <p className="font-bold">Cliente: {clientName}</p>
                  <p>Projeto: {projectName}</p>
                </div>

                {/* Items Summary */}
                <div>
                  <h5 className="font-bold border-b pb-1 mb-1">Itens ({modules.filter(m => !m.isAppliance).length})</h5>
                  {Object.entries(modulesByCategory).slice(0, 2).map(([cat, mods]) => (
                    <div key={cat} className="mb-1">
                      <span className="font-medium text-amber-600">{cat}:</span> {mods.filter(m => !m.isAppliance).length} módulos
                    </div>
                  ))}
                  {Object.keys(modulesByCategory).length > 2 && (
                    <p className="text-gray-400">+{Object.keys(modulesByCategory).length - 2} categorias...</p>
                  )}
                </div>

                {/* Totals */}
                <div className="bg-gray-900 text-white p-2 rounded">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
                  </div>
                  {config.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Desconto ({config.discount}%):</span>
                      <span>-R$ {discountValue.toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-amber-400 mt-1 pt-1 border-t border-gray-700">
                    <span>TOTAL:</span>
                    <span>R$ {total.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-3">
                <label className="text-amber-300/70 text-[10px]">Observações</label>
                <textarea
                  value={config.notes}
                  onChange={(e) => setConfig(c => ({ ...c, notes: e.target.value }))}
                  placeholder="Notas adicionais para a proposta..."
                  rows={3}
                  className="w-full bg-[#16213e] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#16213e] border-t border-amber-500/20 flex justify-between items-center">
          <div className="text-xs text-amber-300/70">
            <p>Total: <span className="text-amber-400 font-bold">R$ {total.toLocaleString('pt-BR')}</span></p>
            <p>{modules.filter(m => !m.isAppliance).length} módulos</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
            >
              Cancelar
            </button>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-amber-950 rounded text-sm font-bold flex items-center gap-2"
            >
              {isGenerating ? 'Gerando...' : (
                <>
                  <Download size={14} />
                  Gerar PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalPDFGenerator;
