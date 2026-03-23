
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { financeiroService } from "./financeiroService";
import { pacienteService } from "./pacienteService";
import { orcamentoService } from "./orcamentoService";

export const dashboardService = {
  getDashboardStats: async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    // 1. Faturamento do mês
    const financeiroSummary = await financeiroService.getSummary({ type: 'receita', period: 'month' });
    
    // 2. Novos pacientes (this month)
    const pacientesResponse = await pacienteService.getPacientes();
    const totalPacientes = pacientesResponse.data.length;
    
    // 3. Orçamentos pendentes
    const orcamentosQuery = query(collection(db, "orcamentos"), where("status", "==", "Pendente"));
    const orcamentosSnap = await getDocs(orcamentosQuery);
    const orcamentosPendentes = orcamentosSnap.size;
    
    // 4. Procedimentos realizados
    const procedimentosSnap = await getDocs(collection(db, "procedimentos_realizados"));
    const procedimentosRealizados = procedimentosSnap.size;

    // 5. Agenda do dia (Mock for now as we don't have a full agenda service yet)
    const agendaDoDia = 0; 
    const pacientesAConfirmar = 0;

    return [
      { name: 'Pacientes a Confirmar', stat: pacientesAConfirmar.toString(), change: '0%', changeType: 'increase', href: '/agenda' },
      { name: 'Agenda do Dia', stat: agendaDoDia.toString(), change: '0%', changeType: 'increase', href: '/agenda' },
      { name: 'Estoque Crítico', stat: '0', change: '0', changeType: 'decrease', href: '/estoque' },
      { name: 'Faturamento (Mês)', stat: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financeiroSummary.receitas), change: '0%', changeType: 'increase', href: '/financeiro' },
      { name: 'Procedimentos Realizados', stat: procedimentosRealizados.toString(), change: '0%', changeType: 'increase', href: '/procedimentos' },
      { name: 'Orçamentos Pendentes', stat: orcamentosPendentes.toString(), change: '0', changeType: 'decrease', href: '/pacientes' },
      { name: 'Novos Pacientes', stat: totalPacientes.toString(), change: '0%', changeType: 'increase', href: '/pacientes' },
    ];
  },

  getChartData: async () => {
    // Mock data for chart for now, but could be aggregated from financeiro
    return [
      { name: 'Jan', total: 0 },
      { name: 'Fev', total: 0 },
      { name: 'Mar', total: 0 },
      { name: 'Abr', total: 0 },
      { name: 'Mai', total: 0 },
      { name: 'Jun', total: 0 },
    ];
  }
};
