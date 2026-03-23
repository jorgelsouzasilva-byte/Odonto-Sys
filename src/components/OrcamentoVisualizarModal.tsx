
import React from 'react';
import { X, ClipboardList, FileDown } from 'lucide-react';
import { Orcamento } from '@/types/paciente';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrcamentoVisualizarModalProps {
  isOpen: boolean;
  onClose: () => void;
  orcamento: Orcamento | null;
  pacienteNome?: string;
}

export default function OrcamentoVisualizarModal({ isOpen, onClose, orcamento, pacienteNome }: OrcamentoVisualizarModalProps) {
  if (!isOpen || !orcamento) return null;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text('Orçamento Odontológico', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(`Paciente: ${pacienteNome || 'Não informado'}`, 20, 40);
    doc.text(`Data: ${orcamento.data}`, 20, 48);
    doc.text(`Status: ${orcamento.status}`, 20, 56);
    
    // Table
    const tableData = orcamento.itens.map(item => [
      item.dente,
      item.procedimentoNome,
      item.superficies.join(', '),
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)
    ]);
    
    autoTable(doc, {
      startY: 65,
      head: [['Dente', 'Procedimento', 'Superfícies', 'Valor']],
      body: tableData,
      headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
      alternateRowStyles: { fillColor: [248, 250, 252] }, // Slate-50
    });
    
    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(11);
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.subtotal)}`, 190, finalY, { align: 'right' });
    
    doc.text(`Desconto:`, 140, finalY + 8);
    doc.text(`${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.desconto)}`, 190, finalY + 8, { align: 'right' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Final:`, 140, finalY + 20);
    doc.text(`${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.total)}`, 190, finalY + 20, { align: 'right' });
    
    // Info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    let currentY = finalY + 35;
    
    if (orcamento.formaPagamento) {
      doc.setFont('helvetica', 'bold');
      doc.text('Forma de Pagamento:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(orcamento.formaPagamento, 20, currentY + 7);
      currentY += 20;
    }
    
    if (orcamento.observacoes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Observações:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      const splitObs = doc.splitTextToSize(orcamento.observacoes, 170);
      doc.text(splitObs, 20, currentY + 7);
    }
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(
        `Gerado em ${new Date().toLocaleString('pt-BR')}`,
        105,
        285,
        { align: 'center' }
      );
    }
    
    doc.save(`orcamento_${orcamento.id}_${pacienteNome?.replace(/\s+/g, '_') || 'paciente'}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-[900px] max-h-[90vh] overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Orçamento - {pacienteNome} - {orcamento.data}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-indigo-500" />
                  Itens do Orçamento
                </h3>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                  {orcamento.itens.length} itens
                </span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[400px]">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Dente</th>
                      <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Procedimento</th>
                      <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orcamento.itens.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{item.dente}</span>
                            <span className="text-[10px] text-slate-400">{item.superficies.join(', ')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600 dark:text-slate-400">{item.procedimentoNome}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Desconto</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.desconto)}
                  </span>
                </div>

                {orcamento.formaPagamento && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Forma de Pagamento</span>
                    <span className="font-medium text-slate-900 dark:text-white">{orcamento.formaPagamento}</span>
                  </div>
                )}

                {orcamento.observacoes && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Observações</span>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{orcamento.observacoes}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900 dark:text-white">Total Final</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-700"
          >
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
