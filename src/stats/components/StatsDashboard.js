// StatsDashboard.js - Componente principal do painel de estatísticas refatorado

class StatsDashboard {
  constructor() {
    this.stats = window.userStats || {};
    this.currentTab = 'overview';
    this.chartInstances = {};
  }

  init() {
    this.render();
    this.bindEvents();
    this.updateStats();
  }

  render() {
    const modalContent = document.getElementById('modal-stats-viewers');
    if (!modalContent) return;

    // O HTML já está no index.html, então não precisamos recriá-lo
    // Apenas inicializamos os eventos
    this.bindEvents();
  }

  bindEvents() {
    // Eventos para as abas
    const tabs = document.querySelectorAll('.stats-tab');
    
    // Remover event listeners antigos para evitar duplicação
    tabs.forEach(tab => {
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);
    });
    
    // Adicionar novos event listeners
    document.querySelectorAll('.stats-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = tab.getAttribute('data-tab');
        this.switchTab(tabName);
      });
    });

    // Evento para fechar o modal
    const closeModalBtn = document.getElementById('close-modal-stats');
    if (closeModalBtn) {
      // Remover event listener antigo
      const newCloseBtn = closeModalBtn.cloneNode(true);
      closeModalBtn.parentNode.replaceChild(newCloseBtn, closeModalBtn);
      
      // Adicionar novo event listener
      newCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = document.getElementById('modal-stats-viewers');
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      });
    }

    // Evento para atualizar estatísticas
    const refreshBtn = document.getElementById('btn-refresh-stats');
    if (refreshBtn) {
      // Remover event listener antigo
      const newRefreshBtn = refreshBtn.cloneNode(true);
      refreshBtn.parentNode.replaceChild(newRefreshBtn, refreshBtn);
      
      // Adicionar novo event listener
      newRefreshBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.updateStats();
        this.renderTabContent(this.currentTab);
      });
    }

    // Eventos para exportação
    const exportJsonBtn = document.getElementById('btn-export-json');
    if (exportJsonBtn) {
      // Remover event listener antigo
      const newExportJsonBtn = exportJsonBtn.cloneNode(true);
      exportJsonBtn.parentNode.replaceChild(newExportJsonBtn, exportJsonBtn);
      
      // Adicionar novo event listener
      newExportJsonBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.exportToJSON();
      });
    }

    const exportCsvBtn = document.getElementById('btn-export-csv');
    if (exportCsvBtn) {
      // Remover event listener antigo
      const newExportCsvBtn = exportCsvBtn.cloneNode(true);
      exportCsvBtn.parentNode.replaceChild(newExportCsvBtn, exportCsvBtn);
      
      // Adicionar novo event listener
      newExportCsvBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.exportToCSV();
      });
    }
  }

  switchTab(tabName) {
    console.log('Trocando para aba:', tabName);
    this.currentTab = tabName;
    
    // Atualizar classe ativa nas abas
    const tabs = document.querySelectorAll('.stats-tab');
    tabs.forEach(tab => {
      tab.classList.remove('bg-purple-600', 'text-white');
      tab.classList.add('bg-gray-800', 'text-gray-300');
      
      if (tab.getAttribute('data-tab') === tabName) {
        tab.classList.remove('bg-gray-800', 'text-gray-300');
        tab.classList.add('bg-purple-600', 'text-white');
      }
    });
    
    // Renderizar conteúdo da aba
    this.renderTabContent(tabName);
  }

  renderTabContent(tabName) {
    console.log('Renderizando conteúdo da aba:', tabName);
    const contentContainer = document.getElementById('stats-tab-content');
    if (!contentContainer) {
      console.error('Container de conteúdo da aba não encontrado');
      return;
    }

    switch (tabName) {
      case 'overview':
        contentContainer.innerHTML = this.renderOverviewTab();
        // Usar setTimeout para garantir que os elementos DOM sejam criados antes de inicializar os gráficos
        setTimeout(() => {
          this.initOverviewCharts();
        }, 100);
        break;
      case 'time-watched':
        contentContainer.innerHTML = this.renderTimeWatchedTab();
        setTimeout(() => {
          this.initTimeWatchedCharts();
        }, 100);
        break;
      case 'favorites':
        contentContainer.innerHTML = this.renderFavoritesTab();
        setTimeout(() => {
          this.initFavoritesCharts();
        }, 100);
        break;
      case 'history':
        contentContainer.innerHTML = this.renderHistoryTab();
        break;
      case 'settings':
        contentContainer.innerHTML = this.renderSettingsTab();
        // Adicionar eventos para os botões de remover canais customizados
        setTimeout(() => {
          this.bindCustomChannelEvents();
        }, 100);
        break;
      default:
        contentContainer.innerHTML = '<div class="text-center py-8 text-gray-500">Aba não encontrada</div>';
    }
    
    // Atualizar hora da última atualização
    const updateTimeElement = document.getElementById('last-update-time');
    if (updateTimeElement) {
      updateTimeElement.textContent = new Date().toLocaleTimeString();
    }
  }

  renderOverviewTab() {
    const stats = this.stats;
    const totalWatchTime = Object.values(stats.canaisTempoAssistido || {}).reduce((a, b) => a + b, 0);
    const formattedTime = this.formatTime(totalWatchTime);
    const favoritesCount = Object.entries(stats.canaisFavoritos || {}).filter(([c, v]) => v > 0).length;
    
    // Top 5 canais por tempo assistido
    const topChannels = Object.entries(stats.canaisTempoAssistido || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([channel, time]) => ({
        channel,
        name: twitchChannels[channel]?.name || channel,
        time,
        formattedTime: this.formatTime(time)
      }));

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg metric-card">
          <div class="text-gray-400 text-sm mb-1">Visitas</div>
          <div class="text-2xl font-bold text-yellow-400">${stats.visitas || 0}</div>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg metric-card">
          <div class="text-gray-400 text-sm mb-1">Lives Abertas</div>
          <div class="text-2xl font-bold text-blue-400">${stats.livesAbertas || 0}</div>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg metric-card">
          <div class="text-gray-400 text-sm mb-1">Lives Fechadas</div>
          <div class="text-2xl font-bold text-red-400">${stats.livesFechadas || 0}</div>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg metric-card">
          <div class="text-gray-400 text-sm mb-1">Favoritos</div>
          <div class="text-2xl font-bold text-purple-400">${favoritesCount}</div>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg metric-card">
          <div class="text-gray-400 text-sm mb-1">Tempo Total</div>
          <div class="text-2xl font-bold text-green-400">${formattedTime}</div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
          <h3 class="text-lg font-semibold mb-4 text-gray-200">Top 5 Canais por Tempo Assistido</h3>
          <div id="top-channels-chart" class="h-64">
            <canvas id="top-channels-chart-canvas"></canvas>
          </div>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
          <h3 class="text-lg font-semibold mb-4 text-gray-200">Distribuição por Tipo de Canal</h3>
          <div id="channel-type-chart" class="h-64">
            <canvas id="channel-type-chart-canvas"></canvas>
          </div>
        </div>
      </div>
      
      <div class="mt-6 bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
        <h3 class="text-lg font-semibold mb-4 text-gray-200">Atividade Semanal</h3>
        <div id="weekly-activity-chart" class="h-64">
          <canvas id="weekly-activity-chart-canvas"></canvas>
        </div>
      </div>
    `;
  }

  renderTimeWatchedTab() {
    // Detalhes dos canais por tempo assistido
    const channelDetails = Object.keys(twitchChannels).map(channel => {
      return {
        channel,
        name: twitchChannels[channel].name,
        type: twitchChannels[channel].type,
        timesOpened: this.stats.canaisAbertos?.[channel] || 0,
        timeWatched: this.stats.canaisTempoAssistido?.[channel] || 0,
        isFavorite: (this.stats.canaisFavoritos?.[channel] || 0) > 0
      };
    }).sort((a, b) => b.timeWatched - a.timeWatched);

    return `
      <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
        <h3 class="text-lg font-semibold mb-4 text-gray-200">Tempo Assistido por Canal</h3>
        <div id="time-watched-chart" class="h-80 mb-6">
          <canvas id="time-watched-chart-canvas"></canvas>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-700 stats-table">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Canal</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vezes Aberto</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tempo Assistido</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Favorito</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              ${channelDetails.map(channel => `
                <tr>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">${channel.name}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 rounded text-xs font-medium channel-type-${channel.type}">
                      ${channel.type.charAt(0).toUpperCase() + channel.type.slice(1)}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">${channel.timesOpened}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">${this.formatTime(channel.timeWatched)}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    ${channel.isFavorite ? '⭐' : '-'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderFavoritesTab() {
    const favorites = Object.entries(this.stats.canaisFavoritos || {})
      .filter(([channel, count]) => count > 0)
      .map(([channel, count]) => ({
        channel,
        name: twitchChannels[channel]?.name || channel,
        count,
        timeWatched: this.stats.canaisTempoAssistido?.[channel] || 0
      }))
      .sort((a, b) => b.count - a.count);

    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
          <h3 class="text-lg font-semibold mb-4 text-gray-200">Canais Favoritos</h3>
          <div id="favorites-chart" class="h-64">
            <canvas id="favorites-chart-canvas"></canvas>
          </div>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
          <h3 class="text-lg font-semibold mb-4 text-gray-200">Distribuição de Tempo por Favoritos</h3>
          <div id="favorites-time-chart" class="h-64">
            <canvas id="favorites-time-chart-canvas"></canvas>
          </div>
        </div>
      </div>
      
      <div class="mt-6 bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
        <h3 class="text-lg font-semibold mb-4 text-gray-200">Lista de Favoritos</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-700 stats-table">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Canal</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vezes Favoritado</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tempo Assistido</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              ${favorites.map(fav => `
                <tr>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">${fav.name}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">${fav.count}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">${this.formatTime(fav.timeWatched)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderHistoryTab() {
    const history = [...(this.stats.historicoAcoes || [])].reverse().slice(0, 50);
    
    return `
      <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
        <h3 class="text-lg font-semibold mb-4 text-gray-200">Histórico de Ações</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-700 stats-table">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ação</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Canal</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              ${history.map(action => `
                <tr>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 rounded text-xs font-medium ${
                      action.acao === 'abrir_live' ? 'bg-green-500/20 text-green-400' :
                      action.acao === 'fechar_live' ? 'bg-red-500/20 text-red-400' :
                      'bg-purple-500/20 text-purple-400'
                    }">
                      ${action.acao === 'abrir_live' ? 'Abrir Live' : 
                        action.acao === 'fechar_live' ? 'Fechar Live' : 
                        'Favoritar'}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    ${twitchChannels[action.canal]?.name || action.canal}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    ${new Date(action.data).toLocaleString()}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderSettingsTab() {
    // Carregar canais customizados
    const customChannels = this.loadCustomChannels();
    
    return `
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
        <h3 class="text-lg font-semibold mb-4 text-gray-200">Configurações de Estatísticas</h3>
        
        <div class="space-y-6">
          <div>
            <h4 class="text-md font-medium text-gray-300 mb-3">Exportação de Dados</h4>
            <div class="flex flex-wrap gap-3">
              <button id="export-json-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2 export-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                </svg>
                Exportar JSON
              </button>
              <button id="export-csv-btn" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center gap-2 export-btn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2H7a2 2 0 012 2v1a2 2 0 01-2 2H5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar CSV
              </button>
            </div>
          </div>
          
          <div>
            <h4 class="text-md font-medium text-gray-300 mb-3">Gerenciamento de Canais Customizados</h4>
            <div class="bg-gray-750 p-4 rounded-lg">
              ${
                customChannels.length > 0 
                ? `
                  <div class="space-y-2 max-h-60 overflow-y-auto" id="custom-channels-list">
                    ${customChannels.map(channel => `
                      <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                        <span class="text-gray-300">${channel.name}</span>
                        <button class="remove-custom-channel-btn px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-bold" data-id="${channel.id}">
                          Remover
                        </button>
                      </div>
                    `).join('')}
                  </div>
                `
                : '<p class="text-gray-400 text-sm">Nenhum canal customizado adicionado.</p>'
              }
            </div>
          </div>
          
          <div>
            <h4 class="text-md font-medium text-gray-300 mb-3">Preferências de Visualização</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-750 p-4 rounded-lg">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" class="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500" checked>
                  <span class="text-gray-300">Mostrar gráficos interativos</span>
                </label>
              </div>
              <div class="bg-gray-750 p-4 rounded-lg">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" class="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500" checked>
                  <span class="text-gray-300">Atualização automática</span>
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <h4 class="text-md font-medium text-gray-300 mb-3">Sobre</h4>
            <div class="bg-gray-750 p-4 rounded-lg">
              <p class="text-gray-400 text-sm">
                Painel de estatísticas do Infinity Nexus Viewer v2.0<br>
                Desenvolvido para ajudar você a entender seus hábitos de visualização.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindCustomChannelEvents() {
    // Adicionar eventos para os botões de remover canais customizados
    const container = document.getElementById('custom-channels-list');
    if (container) {
      // Remover event listeners antigos para evitar duplicação
      container.removeEventListener('click', this.handleCustomChannelClick);
      
      // Vincular novo event listener
      this.handleCustomChannelClick = (e) => {
        if (e.target && e.target.classList.contains('remove-custom-channel-btn')) {
          e.preventDefault();
          const channelId = e.target.getAttribute('data-id');
          this.removeCustomChannel(channelId);
        }
      };
      container.addEventListener('click', this.handleCustomChannelClick);
    }
  }

  removeCustomChannel(channelId) {
    // Confirmar com o usuário antes de remover
    if (!confirm(`Tem certeza que deseja remover o canal customizado?`)) {
      return;
    }
    
    try {
      // Carregar canais customizados
      let customChannels = this.loadCustomChannels();
      
      // Remover o canal da lista
      customChannels = customChannels.filter(channel => channel.id !== channelId);
      
      // Salvar a lista atualizada
      this.saveCustomChannels(customChannels);
      
      // Remover do objeto global twitchChannels
      if (twitchChannels[channelId]) {
        delete twitchChannels[channelId];
      }
      
      // Atualizar a aba de configurações
      this.renderTabContent('settings');
      
      // Atualizar a lista de canais na interface principal
      if (typeof updateAllChannelsListSmooth === 'function') {
        updateAllChannelsListSmooth();
      }
      
      // Mostrar mensagem de sucesso
      alert('Canal removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover canal customizado:', error);
      alert('Erro ao remover canal customizado. Por favor, tente novamente.');
    }
  }

  loadCustomChannels() {
    try {
      const data = JSON.parse(localStorage.getItem('customChannels') || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  saveCustomChannels(list) {
    localStorage.setItem('customChannels', JSON.stringify(list));
  }

  initOverviewCharts() {
    // Inicializar gráfico de top canais
    const topChannelsCtx = document.getElementById('top-channels-chart-canvas');
    if (topChannelsCtx) {
      const topChannels = Object.entries(this.stats.canaisTempoAssistido || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([channel, time]) => ({
          channel,
          name: twitchChannels[channel]?.name || channel,
          time
        }));

      if (this.chartInstances.topChannels) {
        this.chartInstances.topChannels.destroy();
      }

      this.chartInstances.topChannels = new Chart(topChannelsCtx, {
        type: 'bar',
        data: {
          labels: topChannels.map(c => c.name),
          datasets: [{
            label: 'Tempo Assistido (minutos)',
            data: topChannels.map(c => Math.round(c.time / 60)),
            backgroundColor: [
              'rgba(251, 191, 36, 0.7)',
              'rgba(167, 139, 250, 0.7)',
              'rgba(96, 165, 250, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(156, 163, 175, 0.7)'
            ],
            borderColor: [
              'rgb(251, 191, 36)',
              'rgb(167, 139, 250)',
              'rgb(96, 165, 250)',
              'rgb(16, 185, 129)',
              'rgb(156, 163, 175)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#9CA3AF'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#9CA3AF'
              }
            }
          }
        }
      });
    }

    // Inicializar gráfico de distribuição por tipo de canal
    const channelTypeCtx = document.getElementById('channel-type-chart-canvas');
    if (channelTypeCtx) {
      const channelTypes = {};
      Object.keys(this.stats.canaisTempoAssistido || {}).forEach(channel => {
        const type = twitchChannels[channel]?.type || 'normal';
        const time = this.stats.canaisTempoAssistido[channel] || 0;
        channelTypes[type] = (channelTypes[type] || 0) + time;
      });

      const typeLabels = Object.keys(channelTypes);
      const typeData = Object.values(channelTypes).map(time => Math.round(time / 60));

      if (this.chartInstances.channelType) {
        this.chartInstances.channelType.destroy();
      }

      this.chartInstances.channelType = new Chart(channelTypeCtx, {
        type: 'doughnut',
        data: {
          labels: typeLabels.map(type => type.charAt(0).toUpperCase() + type.slice(1)),
          datasets: [{
            data: typeData,
            backgroundColor: [
              'rgba(251, 191, 36, 0.7)',
              'rgba(167, 139, 250, 0.7)',
              'rgba(96, 165, 250, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(156, 163, 175, 0.7)',
              'rgba(6, 182, 212, 0.7)'
            ],
            borderColor: [
              'rgb(251, 191, 36)',
              'rgb(167, 139, 250)',
              'rgb(96, 165, 250)',
              'rgb(16, 185, 129)',
              'rgb(156, 163, 175)',
              'rgb(6, 182, 212)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#9CA3AF'
              }
            }
          }
        }
      });
    }

    // Inicializar gráfico de atividade semanal
    const weeklyActivityCtx = document.getElementById('weekly-activity-chart-canvas');
    if (weeklyActivityCtx) {
      // Gerar dados de exemplo para a semana (em um sistema real, isso viria dos dados)
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const activityData = [12, 19, 3, 5, 2, 3, 15]; // dados de exemplo

      if (this.chartInstances.weeklyActivity) {
        this.chartInstances.weeklyActivity.destroy();
      }

      this.chartInstances.weeklyActivity = new Chart(weeklyActivityCtx, {
        type: 'line',
        data: {
          labels: days,
          datasets: [{
            label: 'Minutos assistidos',
            data: activityData,
            fill: false,
            borderColor: 'rgb(167, 139, 250)',
            tension: 0.1,
            pointBackgroundColor: 'rgb(167, 139, 250)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(167, 139, 250)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#9CA3AF'
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#9CA3AF'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: '#9CA3AF'
              }
            }
          }
        }
      });
    }
  }

  initTimeWatchedCharts() {
    const timeWatchedCtx = document.getElementById('time-watched-chart-canvas');
    if (timeWatchedCtx) {
      const channelDetails = Object.keys(twitchChannels).map(channel => {
        return {
          channel,
          name: twitchChannels[channel].name,
          timeWatched: this.stats.canaisTempoAssistido?.[channel] || 0
        };
      }).sort((a, b) => b.timeWatched - a.timeWatched).slice(0, 10);

      if (this.chartInstances.timeWatched) {
        this.chartInstances.timeWatched.destroy();
      }

      this.chartInstances.timeWatched = new Chart(timeWatchedCtx, {
        type: 'bar',
        data: {
          labels: channelDetails.map(c => c.name),
          datasets: [{
            label: 'Tempo Assistido (minutos)',
            data: channelDetails.map(c => Math.round(c.timeWatched / 60)),
            backgroundColor: 'rgba(96, 165, 250, 0.7)',
            borderColor: 'rgb(96, 165, 250)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#9CA3AF'
              }
            },
            y: {
              grid: {
                display: false
              },
              ticks: {
                color: '#9CA3AF'
              }
            }
          }
        }
      });
    }
  }

  initFavoritesCharts() {
    const favoritesCtx = document.getElementById('favorites-chart-canvas');
    if (favoritesCtx) {
      const favorites = Object.entries(this.stats.canaisFavoritos || {})
        .filter(([channel, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([channel, count]) => ({
          channel,
          name: twitchChannels[channel]?.name || channel,
          count
        }));

      if (this.chartInstances.favorites) {
        this.chartInstances.favorites.destroy();
      }

      this.chartInstances.favorites = new Chart(favoritesCtx, {
        type: 'bar',
        data: {
          labels: favorites.map(f => f.name),
          datasets: [{
            label: 'Vezes Favoritado',
            data: favorites.map(f => f.count),
            backgroundColor: 'rgba(167, 139, 250, 0.7)',
            borderColor: 'rgb(167, 139, 250)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#9CA3AF'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#9CA3AF'
              }
            }
          }
        }
      });
    }

    const favoritesTimeCtx = document.getElementById('favorites-time-chart-canvas');
    if (favoritesTimeCtx) {
      const favoritesTime = Object.entries(this.stats.canaisFavoritos || {})
        .filter(([channel, count]) => count > 0)
        .map(([channel, count]) => ({
          channel,
          name: twitchChannels[channel]?.name || channel,
          time: this.stats.canaisTempoAssistido?.[channel] || 0
        }))
        .sort((a, b) => b.time - a.time)
        .slice(0, 5);

      if (this.chartInstances.favoritesTime) {
        this.chartInstances.favoritesTime.destroy();
      }

      this.chartInstances.favoritesTime = new Chart(favoritesTimeCtx, {
        type: 'doughnut',
        data: {
          labels: favoritesTime.map(f => f.name),
          datasets: [{
            label: 'Tempo Assistido (minutos)',
            data: favoritesTime.map(f => Math.round(f.time / 60)),
            backgroundColor: [
              'rgba(251, 191, 36, 0.7)',
              'rgba(167, 139, 250, 0.7)',
              'rgba(96, 165, 250, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(156, 163, 175, 0.7)'
            ],
            borderColor: [
              'rgb(251, 191, 36)',
              'rgb(167, 139, 250)',
              'rgb(96, 165, 250)',
              'rgb(16, 185, 129)',
              'rgb(156, 163, 175)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#9CA3AF'
              }
            }
          }
        }
      });
    }
  }

  updateStats() {
    this.stats = window.userStats || {};
  }

  formatTime(seconds) {
    if (!seconds || seconds < 1) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) {
      return `${h}h ${m}m`;
    } else {
      return `${m}m`;
    }
  }

  async exportToJSON() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      const ip = data.ip;
      
      const json = window.getUserStatsJSON(ip);
      const blob = new Blob([json], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `infinity_stats_${ip}.json`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Erro ao exportar JSON:', error);
    }
  }

  exportToCSV() {
    try {
      const stats = this.stats;
      let csv = 'Canal,Tipo,Vezes Aberto,Tempo Assistido (segundos),Favorito\n';
      
      Object.keys(twitchChannels).forEach(channel => {
        const channelData = twitchChannels[channel];
        const timesOpened = stats.canaisAbertos?.[channel] || 0;
        const timeWatched = stats.canaisTempoAssistido?.[channel] || 0;
        const isFavorite = (stats.canaisFavoritos?.[channel] || 0) > 0 ? 'Sim' : 'Não';
        
        csv += `"${channelData.name}",${channelData.type},${timesOpened},${timeWatched},${isFavorite}\n`;
      });
      
      const blob = new Blob([csv], {type: 'text/csv'});
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `infinity_stats_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    }
  }
}

// Inicializar o dashboard quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Criar uma instância global do dashboard
  window.statsDashboard = new StatsDashboard();
  
  // Substituir a função original de renderização
  window.renderStats = function() {
    // Inicializar o dashboard quando o modal for aberto
    const dashboard = window.statsDashboard;
    dashboard.updateStats();
    dashboard.switchTab('overview');
  };
});