// ========== MODAL DE ESTATÍSTICAS DE VISUALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
  const btnStats = document.getElementById('btn-stats-viewers');
  const modal = document.getElementById('modal-stats-viewers');
  const closeModal = document.getElementById('close-modal-stats');

  // Função para buscar IP público
  async function getUserIP() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch {
      return 'desconhecido';
    }
  }

  // Atualização em tempo real do painel
  let statsInterval;
  if (btnStats && modal && closeModal) {
    btnStats.addEventListener('click', function(e) {
      console.log('Botão de estatísticas clicado');
      
      // Inicializar o novo dashboard
      if (window.statsDashboard) {
        console.log('Dashboard já existe, atualizando...');
        window.statsDashboard.updateStats();
        window.statsDashboard.switchTab('overview');
        // Rebind events to ensure tabs work correctly
        setTimeout(() => {
          window.statsDashboard.bindEvents();
        }, 100);
      } else {
        // Se o dashboard não existir, criar uma nova instância
        console.log('Criando novo dashboard...');
        window.statsDashboard = new StatsDashboard();
        window.statsDashboard.init();
        window.statsDashboard.updateStats();
        window.statsDashboard.switchTab('overview');
      }
      
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      statsInterval = setInterval(() => {
        if (window.statsDashboard) {
          window.statsDashboard.updateStats();
          // Não atualizamos automaticamente o conteúdo para evitar flicker
        }
      }, 60000); // Atualiza a cada 60 segundos
    });
    
    closeModal.addEventListener('click', function() {
      console.log('Fechando modal de estatísticas');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (statsInterval) clearInterval(statsInterval);
    });
    
    // Fechar ao clicar fora do modal
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        if (statsInterval) clearInterval(statsInterval);
      }
    });
    
    // ESC fecha
    document.addEventListener('keydown', function(e) {
      if (!modal.classList.contains('hidden') && e.key === 'Escape') {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        if (statsInterval) clearInterval(statsInterval);
      }
    });
    
    // Exportar JSON ao clicar no botão
    modal.addEventListener('click', async function(e) {
      if (e.target && e.target.id === 'btn-export-json') {
        const ip = await getUserIP();
        const json = window.getUserStatsJSON(ip);
        const blob = new Blob([json], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `infinity_stats_${ip}.json`;
        document.body.appendChild(a);
        a.click();
        setTimeout(()=>{
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }
    });
  } else {
    console.error('Elementos necessários para o modal de estatísticas não encontrados');
  }
});