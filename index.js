// Lista de canais disponíveis
const twitchChannels = {
  moldador:      { name: 'Moldador',      color: 'bg-indigo-600', type: 'premium' },
  lucyjapinha:   { name: 'Lucyjapinha',   color: 'bg-pink-500',   type: 'premium' },
  galvinoo:      { name: 'Galvinoo',      color: 'bg-green-500',  type: 'premium' },
  amandinhalsls: { name: 'AmandinhaLsLs', color: 'bg-blue-500',   type: 'plus' },
  amandinhalsls: { name: 'AmandinhaLsLs', color: 'bg-blue-500',   type: 'plus' },
  barbasirius:   { name: 'Obarbasirius',  color: 'bg-yellow-500', type: 'plus' },
  lobinhopelud:  { name: 'LobinhoPelud',  color: 'bg-pink-500',   type: 'plus' },
  bhaaskara:     { name: 'Bhaaskara',     color: 'bg-green-500',  type: 'plus' },
  lordrebechi:   { name: 'LordRebechi',   color: 'bg-yellow-500', type: 'plus' },
  sauletagames:  { name: 'Sauletagames',  color: 'bg-yellow-500', type: 'normal' },
  deedobr:       { name: 'DeedoBR',       color: 'bg-yellow-500', type: 'normal' },
  arondesu0:     { name: 'AronDesu0',     color: 'bg-blue-500',   type: 'normal' },
  tsdesert:      { name: 'TsDesert',      color: 'bg-pink-500',   type: 'iniciante' },
  ofirofiro:     { name: 'OfirOfiro',     color: 'bg-pink-500',   type: 'iniciante' },
};

// Função auxiliar para obter classes CSS padronizadas dos botões de canal
function getChannelButtonClasses(channelConfig) {
  const baseClasses = 'flex items-center space-x-2 mt-1 w-full hover:bg-gray-700 rounded px-2 py-1 transition relative';
  let typeClasses = '';
  if (channelConfig.type === 'premium') {
    typeClasses = 'bg-gradient-to-r from-yellow-900 via-yellow-800 to-yellow-700 shadow-lg';
  } else if (channelConfig.type === 'plus') {
    typeClasses = 'bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 shadow-lg';
  } else if (channelConfig.type === 'normal') {
    typeClasses = 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 shadow-lg';
  } else {
    // iniciante - sem background colorido, apenas sombra
    typeClasses = 'shadow-lg';
  }
  return `${baseClasses} ${typeClasses}`;
}
// Lista de lives abertas (ordem importa)
let openLives = [];
const MAX_LIVES = 4;

// Objeto para guardar status anterior dos canais
const previousStatus = {};

// Função para exibir card animado de 'Online agora'
function showOnlineNowCard(channel) {
  const livesArea = document.querySelector('.lateral-esquerda.lateral-direita') || document.getElementById('lives-container').parentElement;
  if (!livesArea) return;
  const channelConfig = twitchChannels[channel];
  const avatarUrl = document.getElementById(`avatar-${channel}`)?.querySelector('img')?.src;

  // Cria o card
  const card = document.createElement('div');
  card.className = 'fixed left-0 top-24 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in';
  card.style.minWidth = '260px';
  card.style.maxWidth = '90vw';
  card.style.fontWeight = 'bold';
  card.style.fontSize = '1.1rem';

  card.innerHTML = `
    <div class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-900 border-2 border-white">
      ${avatarUrl ? `<img src='${avatarUrl}' class='w-full h-full object-cover'/>` : channelConfig.name.charAt(0)}
    </div>
    <div>
      <div>Online agora!</div>
      <div class='font-semibold'>${channelConfig.name}</div>
    </div>
  `;

  document.body.appendChild(card);

  // Animação: slide in
  card.animate([
    { transform: 'translateX(-120%)', opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 }
  ], {
    duration: 500,
    fill: 'forwards'
  });

  // Remove após 4 segundos
  setTimeout(() => {
    card.animate([
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(-120%)', opacity: 0 }
    ], {
      duration: 400,
      fill: 'forwards'
    });
    setTimeout(() => card.remove(), 400);
  }, 4000);
}

// Função para verificar status online dos streamers usando a API GraphQL da Twitch
async function checkStreamerStatus(channel) {
  try {
    const response = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko'
      },
      body: JSON.stringify({
        query: `
          query {
            user(login: "${channel}") {
              stream {
                id
              }
            }
          }
        `
      })
    });
    
    const data = await response.json();
    const isOnline = data.data && data.data.user && data.data.user.stream && data.data.user.stream.id;
    
    updateStatusIndicator(channel, isOnline);
    return isOnline;
  } catch (error) {
    console.log('Erro ao verificar status:', error);
    updateStatusIndicator(channel, false);
    return false;
  }
}

// Função para atualizar o indicador visual de status
function updateStatusIndicator(channel, isOnline) {
  const statusElement = document.getElementById(`status-${channel}`);
  if (statusElement) {
    if (isOnline) {
      statusElement.className = 'absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-850 animate-pulse';
    } else {
      statusElement.className = 'absolute bottom-0 right-0 w-3 h-3 bg-gray-500 rounded-full border-2 border-gray-850';
    }
  }
  
  // Atualizar também a borda do avatar
  updateAvatarBorder(channel);
}

// Função para verificar status de todos os streamers
async function checkAllStreamersStatus() {
  const channels = Object.keys(twitchChannels);
  for (const channel of channels) {
    await checkStreamerStatus(channel);
    // Pequeno delay entre as verificações
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

function renderLives() {
  const container = document.getElementById('lives-container');
  container.innerHTML = '';
  openLives.forEach(channel => {
    const liveDiv = document.createElement('div');
    let liveClass = openLives.length === 1 ? 'w-full h-full' : 'w-full md:w-1/2';
    liveDiv.className = `${liveClass} bg-gray-900 rounded-lg shadow-lg p-2 flex flex-col items-center relative`;
    liveDiv.id = `live-${channel}`;
    liveDiv.innerHTML = `
      <button onclick="closeLive('${channel}')" class="absolute top-1 right-1 text-gray-400 hover:text-red-500 text-xl font-bold z-10">&times;</button>
      <div class="mb-2 text-center text-sm text-gray-300">Canal: <span class="font-semibold">${twitchChannels[channel] ? twitchChannels[channel].name : channel}</span></div>
      <div class='w-full aspect-w-16 aspect-h-9'>
        <iframe
          src="https://player.twitch.tv/?channel=${channel}&parent=localhost&parent=127.0.0.1"
          allowfullscreen
          frameborder="0"
          class="rounded-lg w-full h-full"
        ></iframe>
      </div>
    `;
    container.appendChild(liveDiv);
  });
}

function toggleLive(channel) {
  const idx = openLives.indexOf(channel);
  if (idx !== -1) {
    // Já está aberto, não faz nada (ou pode dar foco)
    return;
  }
  if (openLives.length >= MAX_LIVES) {
    // Remove o mais antigo sem recarregar todas
    const oldestChannel = openLives.shift();
    removeLiveWindow(oldestChannel);
  }
  openLives.push(channel);
  
  // Adicionar a janela da live primeiro
  addLiveWindow(channel);
  
  // Ajustar tamanho das lives
  adjustLiveSizes();
  
  // Atualizar botões de chat com um pequeno delay
  setTimeout(() => {
    updateChatButtons();
  }, 100);
  
  // Mostrar o chat da live recém-adicionada
  showSidebarChat(channel);
}

function closeLive(channel) {
  // Remover apenas da lista de lives abertas
  openLives = openLives.filter(c => c !== channel);
  
  // Remover apenas a janela da live
  removeLiveWindow(channel);
  
  // Ajustar tamanho das lives restantes
  adjustLiveSizes();
  
  // Atualizar apenas os botões de chat (não afeta a lista lateral)
  updateChatButtons();
  
  // Se não há mais lives abertas, limpar o chat lateral
  if (openLives.length === 0) {
    const sidebarContainer = document.getElementById('sidebar-chat-container');
    if (sidebarContainer) {
      sidebarContainer.innerHTML = '';
    }
  } else {
    // Mostrar o chat da primeira live restante
    showSidebarChat(openLives[0]);
  }
}

// Função para adicionar apenas uma janela específica
function addLiveWindow(channel) {
  const container = document.getElementById('lives-container');
  const liveDiv = document.createElement('div');
  let liveClass = openLives.length === 1 ? 'w-full h-full' : 'w-full md:w-1/2';
  liveDiv.className = `${liveClass} bg-gray-900 rounded-lg shadow-lg p-2 flex flex-col items-center relative animate-fade-in`;
  liveDiv.id = `live-${channel}`;
  liveDiv.innerHTML = `
    <button onclick="closeLive('${channel}')" class="absolute top-1 right-1 text-gray-400 hover:text-red-500 text-xl font-bold z-10">&times;</button>
    <div class="mb-2 text-center text-sm text-gray-300">Canal: <span class="font-semibold">${twitchChannels[channel] ? twitchChannels[channel].name : channel}</span></div>
    <div class='w-full aspect-w-16 aspect-h-9'>
      <iframe
        src="https://player.twitch.tv/?channel=${channel}&parent=localhost&parent=127.0.0.1"
        allowfullscreen
        frameborder="0"
        class="rounded-lg w-full h-full"
      ></iframe>
    </div>
  `;
  container.appendChild(liveDiv);
  
  // Adicionar iframe do chat correspondente
  addChatIframe(channel);
}
// Função para adicionar iframe do chat
function addChatIframe(channel) {
  const sidebarContainer = document.getElementById('sidebar-chat-container');
  const channelName = twitchChannels[channel] ? twitchChannels[channel].name : channel;
  
  // Criar container do chat
  const chatContainer = document.createElement('div');
  chatContainer.className = 'chat-iframe-container';
  chatContainer.id = `chat-iframe-${channel}`;
  chatContainer.style.display = 'none'; // Inicialmente oculto
  
  chatContainer.innerHTML = `
    <div class='flex-1 bg-gray-800 rounded-lg mt-1 overflow-hidden shadow-lg flex flex-col' style='height: 96.5%;'>
      <div class="mb-2 text-center text-sm text-gray-300">
        CHAT DE <span class="font-semibold">${channelName}</span>
      </div>
      <iframe
        src='https://www.twitch.tv/embed/${channel}/chat?parent=localhost&parent=127.0.0.1&darkpopout'
        frameborder='0'
        scrolling='no'
        class='w-full h-full flex-1'
        style='border: none;'
      ></iframe>
    </div>
  `;
  
  sidebarContainer.appendChild(chatContainer);
}

// Função para ajustar o tamanho das lives baseado na quantidade
function adjustLiveSizes() {
  const liveElements = document.querySelectorAll('[id^="live-"]');
  liveElements.forEach(element => {
    const newClass = openLives.length === 1 ? 'w-full h-full' : 'w-full md:w-1/2';
    element.className = element.className.replace(/w-full h-full|w-full md:w-1\/2/g, newClass);
  });
}

// Função para remover apenas uma janela específica
function removeLiveWindow(channel) {
  const liveElement = document.getElementById(`live-${channel}`);
  if (liveElement) {
    liveElement.remove();
  }
  
  // Remover iframe do chat correspondente
  const chatIframe = document.getElementById(`chat-iframe-${channel}`);
  if (chatIframe) {
    chatIframe.remove();
  }
}

// Função para atualizar os botões de chat baseado nas lives abertas
function updateChatButtons() {
  const chatButtonsContainer = document.getElementById('chat-buttons');
  
  if (!chatButtonsContainer) {
    return;
  }
  
  // Limpar apenas o container dos botões de chat
  chatButtonsContainer.innerHTML = '';
  
  if (openLives.length === 0) {
    chatButtonsContainer.innerHTML = '<div class="text-gray-400 text-sm">Nenhuma live aberta</div>';
    return;
  }
  
  openLives.forEach(async (channel, index) => {
    const button = document.createElement('button');
    const channelConfig = twitchChannels[channel];
    const colorClass = channelConfig ? channelConfig.color : 'bg-gray-600';
    
    button.className = `chat-btn px-2 py-1 rounded ${colorClass} text-white font-bold hover:opacity-80 transition-all duration-200 transform hover:scale-105 flex items-center justify-center w-8 h-8`;
    button.onclick = () => showSidebarChat(channel);
    button.title = `Chat de ${channel}`;
    
    // Adicionar animação de entrada
    button.style.opacity = '0';
    button.style.transform = 'scale(0.8)';
    
    chatButtonsContainer.appendChild(button);
    
    // Buscar e exibir o avatar do canal
    const avatarUrl = await fetchTwitchAvatar(channel);
    if (avatarUrl) {
      button.innerHTML = `<img src="${avatarUrl}" alt="avatar" class="w-6 h-6 rounded-full object-cover border border-white" />`;
    } else {
      // Fallback para primeira letra se não conseguir o avatar
      const firstLetter = channel.charAt(0).toUpperCase();
      button.textContent = firstLetter;
    }
    
    // Animar entrada do botão
    setTimeout(() => {
      button.style.transition = 'all 0.3s ease';
      button.style.opacity = '1';
      button.style.transform = 'scale(1)';
    }, index * 100);
  });
}

// Função para destacar o botão do chat ativo
function highlightActiveChatButton(activeChannel) {
  // Remover destaque de todos os botões de chat
  const allChatButtons = document.querySelectorAll('.chat-btn');
  allChatButtons.forEach(button => {
    button.classList.remove('ring-2', 'ring-white', 'ring-opacity-50');
  });
  
  // Destacar o botão ativo
  const activeButton = document.querySelector(`.chat-btn[onclick*="${activeChannel}"]`);
  if (activeButton) {
    activeButton.classList.add('ring-2', 'ring-white', 'ring-opacity-50');
  }
}

// Função para mostrar apenas 1 chat na lateral
function showSidebarChat(channel) {
  const container = document.getElementById('sidebar-chat-container');
  
  // Ocultar todos os chats primeiro
  const allChats = container.querySelectorAll('.chat-iframe-container');
  allChats.forEach(chat => {
    chat.style.display = 'none';
  });
  
  // Mostrar o chat selecionado
  const selectedChat = document.getElementById(`chat-iframe-${channel}`);
  if (selectedChat) {
    selectedChat.style.display = 'block';
  }
  
  // Destacar o botão do chat ativo
  highlightActiveChatButton(channel);
}

// ================= AVATAR TWITCH =====================
// Usando API pública da Twitch (não requer autenticação)
async function fetchTwitchAvatar(channel) {
  try {
    // Usando a API pública do GQL da Twitch
    const response = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko'
      },
      body: JSON.stringify({
        query: `
          query {
            user(login: "${channel}") {
              profileImageURL(width: 300)
            }
          }
        `
      })
    });
    
    const data = await response.json();
    if (data.data && data.data.user && data.data.user.profileImageURL) {
      return data.data.user.profileImageURL;
    }
    return null;
  } catch (e) {
    console.log('Erro ao buscar avatar:', e);
    return null;
  }
}

async function updateAllAvatars() {
  for (const channel of Object.keys(twitchChannels)) {
    const avatarUrl = await fetchTwitchAvatar(channel);
    const avatarDiv = document.getElementById(`avatar-${channel}`);
    if (avatarDiv && avatarUrl) {
      avatarDiv.innerHTML = `<img src="${avatarUrl}" alt="avatar" class="w-8 h-8 rounded-full object-cover border-2" />`;
      avatarDiv.style.background = 'none';
      avatarDiv.style.color = 'transparent';
      
      // Aplicar borda baseada no status atual
      updateAvatarBorder(channel);
    }
  }
}

// Função para atualizar a borda do avatar baseada no status
function updateAvatarBorder(channel) {
  const avatarDiv = document.getElementById(`avatar-${channel}`);
  if (!avatarDiv) return;
  
  const img = avatarDiv.querySelector('img');
  if (!img) return;
  
  // Verificar se o canal está online
  const statusElement = document.getElementById(`status-${channel}`);
  const isOnline = statusElement && statusElement.classList.contains('bg-red-500');
  
  if (isOnline) {
    img.className = 'w-8 h-8 rounded-full object-cover border-2 border-green-500';
  } else {
    img.className = 'w-8 h-8 rounded-full object-cover border-2 border-gray-500';
  }
}

// Função para gerar dinamicamente os botões dos canais
function generateChannelButtons() {
  const container = document.getElementById('channels-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  Object.keys(twitchChannels).forEach(channel => {
    const channelConfig = twitchChannels[channel];
    const firstLetter = channelConfig.name.charAt(0).toUpperCase();
    
    const button = document.createElement('button');
    button.onclick = () => toggleLive(channel);
    button.id = `btn-${channel}`;
    button.className = getChannelButtonClasses(channelConfig);
    
    button.innerHTML = `
      <div class="relative">
        <div class="w-8 h-8 ${channelConfig.color} rounded-full flex items-center justify-center font-bold border-2 border-transparent transition-all duration-200" id="avatar-${channel}">${firstLetter}</div>
      </div>
      <div class="flex-1 relative overflow-hidden text-left flex items-center">
        <div>${channelConfig.name}</div>
      </div>
              <div id="status-${channel}" class="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 rounded-full border-2 border-gray-850"></div>
        ${channelConfig.type === 'premium' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-yellow-300 text-yellow-900 rounded-full text-xs font-bold flex items-center justify-center border border-yellow-500" title="Este usuário é um membro Premium e recebeu uma faixa exclusiva por fazer +350h de live no Infinity">?</span></span>` : ''}
        ${channelConfig.type === 'plus' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-purple-300 text-purple-900 rounded-full text-xs font-bold flex items-center justify-center border border-purple-500" title="Este usuário é um membro Plus e recebeu uma faixa exclusiva por fazer +100h de live no Infinity">?</span></span>` : ''}
        ${channelConfig.type === 'normal' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-blue-300 text-blue-900 rounded-full text-xs font-bold flex items-center justify-center border border-blue-500" title="Este usuário é um membro Normal e recebeu uma faixa exclusiva por fazer +50h de live no Infinity">?</span></span>` : ''}
        ${channelConfig.type === 'iniciante' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-gray-300 text-gray-800 rounded-full text-xs font-bold flex items-center justify-center border border-gray-400" title="Canal iniciante">?</span></span>` : ''}
    `;
    
    container.appendChild(button);
  });
}

// Função para exibir todos os canais, online no topo e offline abaixo
async function updateAllChannelsList() {
  const container = document.getElementById('channels-container');
  if (!container) return;
  container.innerHTML = '';

  // Arrays para separar online e offline
  const onlineChannels = [];
  const offlineChannels = [];

  // Checa status de todos os canais
  for (const channel of Object.keys(twitchChannels)) {
    const isOnline = await checkStreamerStatus(channel);
    // Detecta transição offline -> online
    if (previousStatus[channel] === false && isOnline === true) {
      showOnlineNowCard(channel);
    }
    previousStatus[channel] = isOnline;
    if (isOnline) {
      onlineChannels.push(channel);
    } else {
      offlineChannels.push(channel);
    }
  }

  // Função para criar botão
  function createChannelButton(channel, isOnline) {
    const channelConfig = twitchChannels[channel];
    const firstLetter = channelConfig.name.charAt(0).toUpperCase();
    
    const button = document.createElement('button');
    button.onclick = () => toggleLive(channel);
    button.id = `btn-${channel}`;
    button.className = getChannelButtonClasses(channelConfig);
    button.innerHTML = `
      <div class="relative">
        <div class="w-8 h-8 ${channelConfig.color} rounded-full flex items-center justify-center font-bold border-2 border-transparent transition-all duration-200" id="avatar-${channel}">${firstLetter}</div>
      </div>
      <div class="flex-1 relative overflow-hidden text-left flex items-center">
        <div>${channelConfig.name}</div>
      </div>
      <div id="status-${channel}" class="absolute bottom-0 right-0 w-3 h-3 ${isOnline ? 'bg-red-500 animate-pulse' : 'bg-gray-500'} rounded-full border-2 border-gray-850"></div>
      ${channelConfig.type === 'premium' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-yellow-300 text-yellow-900 rounded-full text-xs font-bold flex items-center justify-center border border-yellow-500" title="Este usuário é um membro Premium e recebeu uma faixa exclusiva por fazer +350h de live no Infinity">?</span></span>` : ''}
    `;
    container.appendChild(button);
    // Atualiza avatar
    fetchTwitchAvatar(channel).then(avatarUrl => {
      const avatarDiv = document.getElementById(`avatar-${channel}`);
      if (avatarDiv && avatarUrl) {
        avatarDiv.innerHTML = `<img src="${avatarUrl}" alt="avatar" class="w-8 h-8 rounded-full object-cover border-2" />`;
        avatarDiv.style.background = 'none';
        avatarDiv.style.color = 'transparent';
      }
    });
    // Atualiza borda
    updateAvatarBorder(channel);
  }

  // Adiciona online primeiro, depois offline
  onlineChannels.forEach(channel => createChannelButton(channel, true));
  offlineChannels.forEach(channel => createChannelButton(channel, false));
}

// Função para atualizar canais de forma suave
async function updateAllChannelsListSmooth() {
  const container = document.getElementById('channels-container');
  if (!container) return;

  // Arrays para separar online e offline
  const onlineChannels = [];
  const offlineChannels = [];

  // Checa status de todos os canais
  for (const channel of Object.keys(twitchChannels)) {
    const isOnline = await checkStreamerStatus(channel);
    if (previousStatus[channel] === false && isOnline === true) {
      showOnlineNowCard(channel);
    }
    previousStatus[channel] = isOnline;
    if (isOnline) {
      onlineChannels.push(channel);
    } else {
      offlineChannels.push(channel);
    }
  }

  // Função para criar ou atualizar botão
  function createOrUpdateChannelButton(channel, isOnline) {
    const channelConfig = twitchChannels[channel];
    const firstLetter = channelConfig.name.charAt(0).toUpperCase();
    let button = document.getElementById(`btn-${channel}`);
    
    if (!button) {
      button = document.createElement('button');
      button.id = `btn-${channel}`;
      button.className = getChannelButtonClasses(channelConfig);
      button.onclick = () => toggleLive(channel);
      button.innerHTML = `
        <div class="relative">
          <div class="w-8 h-8 ${channelConfig.color} rounded-full flex items-center justify-center font-bold border-2 border-transparent transition-all duration-200" id="avatar-${channel}">${firstLetter}</div>
        </div>
        <div class="flex-1 relative overflow-hidden text-left flex items-center">
          <div>${channelConfig.name}</div>
        </div>
        <div id="status-${channel}" class="absolute bottom-0 right-0 w-3 h-3 ${isOnline ? 'bg-red-500 animate-pulse' : 'bg-gray-500'} rounded-full border-2 border-gray-850"></div>
        ${channelConfig.type === 'premium' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-yellow-300 text-yellow-900 rounded-full text-xs font-bold flex items-center justify-center border border-yellow-500" title="Este usuário é um membro Premium e recebeu uma faixa exclusiva por fazer +350h de live no Infinity">?</span></span>` : ''}
        ${channelConfig.type === 'plus' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-purple-300 text-purple-900 rounded-full text-xs font-bold flex items-center justify-center border border-purple-500" title="Este usuário é um membro Plus e recebeu uma faixa exclusiva por fazer +100h de live no Infinity">?</span></span>` : ''}
        ${channelConfig.type === 'normal' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-blue-300 text-blue-900 rounded-full text-xs font-bold flex items-center justify-center border border-blue-500" title="Este usuário é um membro Normal e recebeu uma faixa exclusiva por fazer +50h de live no Infinity">?</span></span>` : ''}
        ${channelConfig.type === 'iniciante' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-gray-300 text-gray-800 rounded-full text-xs font-bold flex items-center justify-center border border-gray-400" title="Canal iniciante">?</span></span>` : ''}
      `;
      container.appendChild(button);
      // Avatar inicial
      fetchTwitchAvatar(channel).then(avatarUrl => {
        const avatarDiv = document.getElementById(`avatar-${channel}`);
        if (avatarDiv && avatarUrl) {
          avatarDiv.innerHTML = `<img src="${avatarUrl}" alt="avatar" class="w-8 h-8 rounded-full object-cover border-2" />`;
          avatarDiv.style.background = 'none';
          avatarDiv.style.color = 'transparent';
        }
      });
    } else {
      // Atualiza status do ponto
      const statusDiv = button.querySelector(`#status-${channel}`);
      if (statusDiv) {
        statusDiv.className = `absolute bottom-0 right-0 w-3 h-3 ${isOnline ? 'bg-red-500 animate-pulse' : 'bg-gray-500'} rounded-full border-2 border-gray-850`;
      }
      // Atualiza borda do avatar
      updateAvatarBorder(channel);
      // Atualiza classe mantendo a estrutura base
      button.className = getChannelButtonClasses(channelConfig);
      // Atualiza ou adiciona o ícone ?
      if (channelConfig.type === 'premium') {
        if (!button.querySelector('.premium-info')) {
          const info = document.createElement('span');
          info.className = 'absolute top-0 right-0 cursor-pointer premium-info';
          info.innerHTML = `<span class="inline-block w-5 h-5 bg-yellow-300 text-yellow-900 rounded-full text-xs font-bold flex items-center justify-center border border-yellow-500" title="Este usuário é um membro Premium e recebeu uma faixa exclusiva por fazer +350h de live no Infinity">?</span>`;
          button.appendChild(info);
        }
      } else {
        const info = button.querySelector('.premium-info');
        if (info) info.remove();
      }
      // Atualiza nome premium (garante classes)
      const nameDiv = button.querySelector('div:not([id^="avatar-"]):not([id^="status-"])');
      if (nameDiv) {
        nameDiv.className = '';
      }
    }
    // Atualiza ordem visual
    container.appendChild(button);
  }

  // Adiciona/atualiza online primeiro, depois offline
  onlineChannels.forEach(channel => createOrUpdateChannelButton(channel, true));
  offlineChannels.forEach(channel => createOrUpdateChannelButton(channel, false));

  // Remove botões de canais que não existem mais
  Array.from(container.children).forEach(child => {
    const id = child.id?.replace('btn-', '');
    if (id && !twitchChannels[id]) {
      child.remove();
    }
  });
}

// Substituir chamada antiga pela nova suave
window.addEventListener('DOMContentLoaded', function() {
  updateAllChannelsListSmooth();
  setInterval(updateAllChannelsListSmooth, 60000); // Atualiza a cada 60s
  updateChatButtons();
  updateAllAvatars();
});

// Inicializar verificações de status
window.addEventListener('DOMContentLoaded', async function() {
  // Verificar status inicial
  await checkAllStreamersStatus();
  
  // Abrir automaticamente as primeiras 4 lives que estiverem online
  await openOnlineLives();
  
  // Verificar status a cada 60 segundos
  setInterval(checkAllStreamersStatus, 60000);
});

// Função para abrir automaticamente as lives online
async function openOnlineLives() {
  const channels = Object.keys(twitchChannels);
  let openedCount = 0;
  
  for (const channel of channels) {
    if (openedCount >= MAX_LIVES) break;
    
    const isOnline = await checkStreamerStatus(channel);
    if (isOnline) {
      toggleLive(channel);
      openedCount++;
      
      // Pequeno delay entre aberturas para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
} 
