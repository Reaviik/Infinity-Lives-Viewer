// ========== MODAL DE ESTATÍSTICAS DE VISUALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
  const btnStats = document.getElementById('btn-stats-viewers');
  const modal = document.getElementById('modal-stats-viewers');
  const closeModal = document.getElementById('close-modal-stats');
  const statsContent = document.getElementById('stats-content');

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

  function renderStats() {
    const stats = window.userStats || {};
    let favoritos = Object.entries(stats.canaisFavoritos || {}).filter(([c,v]) => v > 0).sort((a,b)=>b[1]-a[1]);
    let abertos = Object.entries(stats.canaisAbertos || {}).sort((a,b)=>b[1]-a[1]);
    function formatTempo(seg) {
      if (!seg || seg < 1) return '0m';
      const h = Math.floor(seg/3600);
      const m = Math.floor((seg%3600)/60);
      if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}h`;
      } else {
        return `${m}m`;
      }
    }
    let abertosTempo = abertos.map(([c,v]) => {
      const tempo = formatTempo(stats.canaisTempoAssistido && stats.canaisTempoAssistido[c]);
      return `${c} (${v}x${tempo && tempo!=='0m' ? ' '+tempo : ''})`;
    });
    let totalSeg = Object.values(stats.canaisTempoAssistido||{}).reduce((a,b)=>a+b,0);
    let totalTempo = formatTempo(totalSeg);
    // Top 5 canais por tempo assistido
    let topTempo = Object.entries(stats.canaisTempoAssistido||{}).sort((a,b)=>b[1]-a[1]).slice(0,5);
    // Lista detalhada de canais
    let canaisDetalhe = Object.keys(twitchChannels).map(c=>{
      return {
        canal: c,
        nome: twitchChannels[c].name,
        tipo: twitchChannels[c].type,
        vezes: stats.canaisAbertos && stats.canaisAbertos[c] || 0,
        tempo: stats.canaisTempoAssistido && stats.canaisTempoAssistido[c] || 0,
        favorito: stats.canaisFavoritos && stats.canaisFavoritos[c] > 0
      };
    }).sort((a,b)=>b.tempo-a.tempo);
    // Badges de tipo
    const typeBadge = {
      premium: '<span class="px-2 py-0.5 rounded bg-yellow-400 text-yellow-900 text-xs font-bold ml-1">Premium</span>',
      plus: '<span class="px-2 py-0.5 rounded bg-purple-400 text-purple-900 text-xs font-bold ml-1">Plus</span>',
      normal: '<span class="px-2 py-0.5 rounded bg-blue-400 text-blue-900 text-xs font-bold ml-1">Normal</span>',
      iniciante: '<span class="px-2 py-0.5 rounded bg-green-300 text-green-900 text-xs font-bold ml-1">Iniciante</span>',
      desertor: '<span class="px-2 py-0.5 rounded bg-gray-300 text-gray-800 text-xs font-bold ml-1">Desertor</span>'
    };
    // Gráfico de barras
    function barra(pct, cor) {
      return `<div style="height:18px;width:${pct}%;background:${cor};border-radius:6px;"></div>`;
    }
    // Paleta para gráfico
    const cores = ['#fbbf24','#a78bfa','#60a5fa','#34d399','#a3a3a3'];
    // Cards de totais
    statsContent.innerHTML = `
      <div class="flex flex-row flex-wrap gap-3 mb-1 justify-center max-w-5xl mx-auto" style="width:90%;">
        <div class="card-total" style="min-width:120px;max-width:150px;padding:8px 3px;">
          <span class="valor flex flex-row items-center justify-center gap-2" style="font-size:1.3rem;"><span class="icon" style="font-size:1.2rem;">👁️</span><span>${stats.visitas||0}</span></span>
          <span class="label block w-full text-center" style="font-size:0.95rem;">Visitas</span>
        </div>
        <div class="card-total" style="min-width:120px;max-width:150px;padding:8px 3px;">
          <span class="valor flex flex-row items-center justify-center gap-2" style="font-size:1.3rem;"><span class="icon" style="font-size:1.2rem;">📺</span><span>${stats.livesAbertas||0}</span></span>
          <span class="label block w-full text-center" style="font-size:0.95rem;">Lives abertas</span>
        </div>
        <div class="card-total" style="min-width:120px;max-width:150px;padding:8px 3px;">
          <span class="valor flex flex-row items-center justify-center gap-2" style="font-size:1.3rem;"><span class="icon" style="font-size:1.2rem;">🛑</span><span>${stats.livesFechadas||0}</span></span>
          <span class="label block w-full text-center" style="font-size:0.95rem;">Lives fechadas</span>
        </div>
        <div class="card-total" style="min-width:120px;max-width:150px;padding:8px 3px;">
          <span class="valor flex flex-row items-center justify-center gap-2" style="font-size:1.3rem;"><span class="icon" style="font-size:1.2rem;">⭐</span><span>${favoritos.length}</span></span>
          <span class="label block w-full text-center" style="font-size:0.95rem;">Favoritos</span>
        </div>
        <div class="card-total" style="min-width:120px;max-width:150px;padding:8px 3px;">
          <span class="valor flex flex-row items-center justify-center gap-2" style="font-size:1.3rem;"><span class="icon" style="font-size:1.2rem;">⏱️</span><span>${totalTempo}</span></span>
          <span class="label block w-full text-center" style="font-size:0.95rem;">Tempo total</span>
        </div>
      </div>
      <div class="flex flex-row flex-wrap gap-8 max-w-5xl mx-auto mb-1 items-start justify-center" style="width:90%;">
        <div class="flex-1 min-w-[260px] max-w-[500px]" style="max-width:500px;width:50%;">
          <div class="font-semibold text-lm text-gray-200 mb-2 flex items-center gap-2"><span>Top 5 canais por tempo assistido</span></div>
          <div class="space-y-2">
            ${topTempo.map(([c,seg],i)=>{
              const canal = twitchChannels[c]?.name||c;
              const tempo = formatTempo(seg);
              const cor = cores[i%cores.length];
              const pct = totalSeg ? Math.max(10,seg/totalSeg*100) : 10;
              return `<div class="flex items-center gap-2" style='min-height:32px;'>
                <span class="w-32 truncate canal-nome-tooltip" data-nome="${canal}">${canal}</span>
                <div class="barra-animada" style="width:60%">
                  <div class="preenchimento" style="width:${pct}%;background:${cor};"></div>
                  <span class="tooltip-barra">${tempo}</span>
                </div>
                <span class="text-xs text-gray-400 ml-2">${tempo}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="flex-1 min-w-[260px] max-w-[500px]" style="max-width:500px;width:50%;">
          <div class="font-semibold text-lg text-gray-200 mb-2 flex items-center gap-2"><span>Canais customizados</span></div>
          <div class="space-y-2" id="custom-channels-list" style="max-height: 192px; overflow-y: auto;">
            ${loadCustomChannels().length === 0 ? '<div class="text-gray-400 text-sm">Nenhum canal customizado</div>' :
              loadCustomChannels().map(({id, name}) =>
                `<div class='flex items-center gap-2' style='min-height:32px;'>
                  <span class='w-32 truncate canal-nome-tooltip' data-nome='${name}'>${name}</span>
                  <button class='remove-custom-channel-btn px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-bold' data-id='${id}' title='Remover canal'>🗑️</button>
                </div>`
              ).join('')
            }
          </div>
        </div>
      </div>
      <div class="mb-2 text-xs text-gray-400 max-w-5xl mx-auto" style="width:90%;">Última visita: <span class="font-mono">${stats.ultimaVisita?new Date(stats.ultimaVisita).toLocaleString():'-'}</span></div>
      <div class="mt-2 max-w-5xl mx-auto" style="width:90%;"><button id="btn-exportar-json" class="exportar-btn"><svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1' /></svg>Exportar JSON</button></div>
    `;
    // Adicionar listeners para remover canais customizados
    setTimeout(() => {
      document.querySelectorAll('.remove-custom-channel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          // Remover do localStorage
          let list = loadCustomChannels();
          list = list.filter(c => c.id !== id);
          saveCustomChannels(list);
          // Remover do objeto global
          if (twitchChannels[id]) delete twitchChannels[id];
          // Atualizar painel e lista de canais
          renderStats();
          updateAllChannelsListSmooth && updateAllChannelsListSmooth();
        });
      });
    }, 100);
  }
  // Atualização em tempo real do painel
  let statsInterval;
  if (btnStats && modal && closeModal && statsContent) {
    btnStats.addEventListener('click', function(e) {
      renderStats();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      statsInterval = setInterval(renderStats, 60000); // Atualiza a cada 10 segundos
    });
    closeModal.addEventListener('click', function() {
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
      if (e.target && e.target.id === 'btn-exportar-json') {
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
  }
}); 