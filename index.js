// Lista de canais disponíveis
const twitchChannels = {
  moldador:      { name: 'Moldador',      color: 'bg-indigo-600', type: 'premium' },
  lucyjapinha:   { name: 'Lucyjapinha',   color: 'bg-pink-500',   type: 'premium' },
  galvinoo:      { name: 'Galvinoo',      color: 'bg-green-500',  type: 'premium' },
  amandinhalsls: { name: 'AmandinhaLsLs', color: 'bg-blue-500',   type: 'plus' },
  barbasirius:   { name: 'Obarbasirius',  color: 'bg-yellow-500', type: 'plus' },
  lobinhopelud:  { name: 'LobinhoPeludo',  color: 'bg-pink-500',   type: 'plus' },
  bhaaskara:     { name: 'Bhaaskara',     color: 'bg-green-500',  type: 'plus' },
  lordrebechi:   { name: 'LordRebechi',   color: 'bg-yellow-500', type: 'plus' },
  sauletagames:  { name: 'Sauletagames',  color: 'bg-yellow-500', type: 'normal' },
  deedobr:       { name: 'DeedoBR',       color: 'bg-yellow-500', type: 'normal' },
  arondesu0:     { name: 'AronDesu0',     color: 'bg-blue-500',   type: 'normal' },
  tsdesert:      { name: 'TsDesert',      color: 'bg-pink-500',   type: 'iniciante' },
  ofirofiro:     { name: 'OfirOfiro',     color: 'bg-pink-500',   type: 'iniciante' },
  wansinhoo:     { name: 'Wansinhoo',     color: 'bg-pink-500',   type: 'desertor' },
};

//const URL = 'robsomchatmanager.netlify.app';
//Mantenha este comentario
const URL = 'localhost&parent=127.0.0.1';

// Função auxiliar para obter classes CSS padronizadas dos botões de canal
function getChannelButtonClasses(channelConfig) {
  const baseClasses = 'flex items-center space-x-2 mt-1 w-full hover:bg-gray-700 rounded px-2 py-1 transition relative min-h-[56px]';
  let typeClasses = '';
  if (channelConfig.type === 'premium') {
    typeClasses = 'bg-gradient-to-r from-yellow-900 via-yellow-800 to-yellow-700 shadow-lg';
  } else if (channelConfig.type === 'plus') {
    typeClasses = 'bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 shadow-lg';
  } else if (channelConfig.type === 'normal') {
    typeClasses = 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 shadow-lg';
  } else if (channelConfig.type === 'iniciante') {
    typeClasses = 'bg-gray-400 bg-opacity-40 border border-gray-500 shadow';
  } else if (channelConfig.type === 'desertor') {
    typeClasses = 'bg-gray-200 bg-opacity-10 backdrop-blur-md shadow';
  } else {
    typeClasses = 'shadow-lg';
  }
  return `${baseClasses} ${typeClasses}`;
}

// Lista de lives abertas (ordem importa)
let openLives = [];
const MAX_LIVES = 4;
const previousStatus = {};

// Função para tocar som de alerta
function playAlertSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar o som
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Frequência do beep
    oscillator.type = 'sine';
    
    // Configurar volume e envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // Tocar o som
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    // Repetir o beep após 200ms
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator2.type = 'sine';
      
      gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.3);
    }, 200);
    
  } catch (error) {
    console.log('Erro ao tocar som de alerta:', error);
  }
}

// Função para exibir card animado de 'Online agora'
function showOnlineNowCard(channel) {
  const container = document.getElementById('channels-container');
  if (!container) return;
  
  const channelConfig = twitchChannels[channel];
  const avatarUrl = document.getElementById(`avatar-${channel}`)?.querySelector('img')?.src;
  
  // Tocar som de alerta
  playAlertSound();
  
  // Criar card de notificação
  const notificationCard = document.createElement('div');
  notificationCard.id = `notification-${channel}`;
  notificationCard.className = getChannelButtonClasses(channelConfig).replace('hover:bg-gray-700', 'hover:bg-green-700') + ' bg-green-600 animate-pulse';
  notificationCard.style.animation = 'pulse 2s infinite';
  
  notificationCard.innerHTML = `
    <div class="relative">
      <div class="w-8 h-8 ${channelConfig.color} rounded-full flex items-center justify-center font-bold border-2 border-transparent transition-all duration-200" id="notification-avatar-${channel}">${channelConfig.name.charAt(0)}</div>
    </div>
    <div class="flex-1 relative overflow-hidden text-left flex flex-col items-start justify-center">
      <div class="text-white font-semibold">${channelConfig.name}</div>
      <div class="text-green-200 text-xs font-bold">🟢 ONLINE AGORA!</div>
    </div>
    <div id="notification-status-${channel}" class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-850 animate-pulse"></div>
  `;
  
  // Adicionar evento de clique para abrir a live
  notificationCard.onclick = () => {
    toggleLive(channel);
    removeNotificationCard(channel);
  };
  
  // Adicionar no topo da lista
  container.insertBefore(notificationCard, container.firstChild);
  
  // Carregar avatar do canal na notificação
  if (avatarUrl) {
    const notificationAvatarDiv = document.getElementById(`notification-avatar-${channel}`);
    if (notificationAvatarDiv) {
      notificationAvatarDiv.innerHTML = `<img src="${avatarUrl}" alt="avatar" class="w-8 h-8 rounded-full object-cover border-2 border-green-400" />`;
      notificationAvatarDiv.style.background = 'none';
      notificationAvatarDiv.style.color = 'transparent';
    }
  }
  
  // Remover após 10 segundos
  setTimeout(() => {
    removeNotificationCard(channel);
  }, 10000);
}

// Função para remover o card de notificação
function removeNotificationCard(channel) {
  const notificationCard = document.getElementById(`notification-${channel}`);
  if (notificationCard) {
    notificationCard.style.animation = 'fadeOut 0.5s ease-out';
    setTimeout(() => {
      if (notificationCard.parentNode) {
        notificationCard.parentNode.removeChild(notificationCard);
      }
    }, 500);
  }
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

    // Se só tem 1 live, aplica o estilo de altura
    if (openLives.length === 1) {
      liveDiv.style.height = '99vh';
    }

    liveDiv.innerHTML = `
      <button onclick="closeLive('${channel}')" class="absolute top-1 right-1 text-gray-400 hover:text-red-500 text-xl font-bold z-10">&times;</button>
      <div class="mb-2 text-center text-sm text-gray-300">Canal: <span class="font-semibold">${twitchChannels[channel] ? twitchChannels[channel].name : channel}</span></div>
      <div class='w-full aspect-w-16 aspect-h-9'>
        <iframe
          src="https://player.twitch.tv/?channel=${channel}&parent=${URL}"
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
        src="https://player.twitch.tv/?channel=${channel}&parent=${URL}"
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
    <div class='flex-1 bg-gray-800 rounded-lg mt-1 overflow-hidden shadow-lg flex flex-col' style='height: 99%;'>
      <div class="mb-2 text-center text-sm text-gray-300">
        CHAT DE <span class="font-semibold">${channelName}</span>
      </div>
      <iframe
        src='https://www.twitch.tv/embed/${channel}/chat?parent=${URL}&darkpopout'
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
    
    // Estilo simples apenas com avatar
    button.className = 'flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-700 transition-all duration-200 p-1';
    button.onclick = () => showSidebarChat(channel);
    button.title = `Chat de ${channelConfig ? channelConfig.name : channel}`;
    
    // Criar apenas o avatar
    const firstLetter = channelConfig ? channelConfig.name.charAt(0).toUpperCase() : channel.charAt(0).toUpperCase();
    
    button.innerHTML = `
      <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center font-bold border-2 border-transparent transition-all duration-200" id="chat-avatar-${channel}">${firstLetter}</div>
    `;
    
    chatButtonsContainer.appendChild(button);
    
    // Buscar e exibir o avatar do canal
    const avatarUrl = await fetchTwitchAvatar(channel);
    if (avatarUrl) {
      const avatarDiv = button.querySelector(`#chat-avatar-${channel}`);
      if (avatarDiv) {
        avatarDiv.innerHTML = `<img src="${avatarUrl}" alt="avatar" class="w-8 h-8 rounded-full object-cover border-2" />`;
        avatarDiv.style.background = 'none';
        avatarDiv.style.color = 'transparent';
      }
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
  // Remover borda verde de todos os avatares
  const allChatAvatars = document.querySelectorAll('[id^="chat-avatar-"] img');
  allChatAvatars.forEach(img => {
    img.classList.remove('border-green-500');
    img.classList.add('border-gray-500');
  });

  // Adicionar borda verde ao avatar do chat ativo
  const activeAvatar = document.querySelector(`#chat-avatar-${activeChannel} img`);
  if (activeAvatar) {
    activeAvatar.classList.remove('border-gray-500');
    activeAvatar.classList.add('border-green-500');
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

// Variável global para armazenar jogadores online do Minecraft
let minecraftPlayersOnline = [];

// Função para buscar lista de jogadores online do servidor Minecraft
async function fetchMinecraftPlayers() {
  const ip = 'jogar.infinitynexus.com.br';
  try {
    const response = await fetch(`https://api.mcsrvstat.us/2/${ip}`);
    const data = await response.json();
    if (data.players && data.players.list) {
      minecraftPlayersOnline = data.players.list.map(p => p.toLowerCase());
      console.log('Jogadores online:', minecraftPlayersOnline);
      return minecraftPlayersOnline;
    } else {
      minecraftPlayersOnline = [];
      console.log('Nenhum jogador online ou servidor offline.');
      return [];
    }
  } catch (e) {
    minecraftPlayersOnline = [];
    console.log('Erro ao buscar jogadores do Minecraft:', e);
    return [];
  }
}
// Atualizar lista a cada 60s
setInterval(fetchMinecraftPlayers, 60000);
fetchMinecraftPlayers();

// Função para aplicar borda RGB
function applyRGBBorder(img) {
  img.style.boxShadow = '0 0 0 3px #fff, 0 0 10px 2px #00f, 0 0 20px 4px #0ff, 0 0 15px 3px #0f0, 0 0 20px 4px #ff0, 0 0 25px 5px #f00';
  img.style.animation = 'rgb-border 2s linear infinite';
}
// Adicionar keyframes RGB se não existir
(function ensureRGBStyle(){
  if (!document.getElementById('rgb-border-style')) {
    const style = document.createElement('style');
    style.id = 'rgb-border-style';
    style.innerHTML = `@keyframes rgb-border {
      0% { box-shadow: 0 0 0 3px #fff, 0 0 10px 2px #00f, 0 0 20px 4px #0ff, 0 0 30px 6px #0f0, 0 0 40px 8px #ff0, 0 0 50px 10px #f00; }
      20% { box-shadow: 0 0 0 3px #fff, 0 0 10px 2px #0ff, 0 0 20px 4px #0f0, 0 0 30px 6px #ff0, 0 0 40px 8px #f00, 0 0 50px 10px #00f; }
      40% { box-shadow: 0 0 0 3px #fff, 0 0 10px 2px #0f0, 0 0 20px 4px #ff0, 0 0 30px 6px #f00, 0 0 40px 8px #00f, 0 0 50px 10px #0ff; }
      60% { box-shadow: 0 0 0 3px #fff, 0 0 10px 2px #ff0, 0 0 20px 4px #f00, 0 0 30px 6px #00f, 0 0 40px 8px #0ff, 0 0 50px 10px #0f0; }
      80% { box-shadow: 0 0 0 3px #fff, 0 0 10px 2px #f00, 0 0 20px 4px #00f, 0 0 30px 6px #0ff, 0 0 40px 8px #0f0, 0 0 50px 10px #ff0; }
      100% { box-shadow: 0 0 0 3px #fff, 0 0 10px 2px #00f, 0 0 20px 4px #0ff, 0 0 30px 6px #0f0, 0 0 40px 8px #ff0, 0 0 50px 10px #f00; }
    }`;
    document.head.appendChild(style);
  }
})();

// ========== EFEITO RGB GLOBAL (fora do container) =============
function createOrUpdateGlobalRGBEffect(channel) {
  // Remove se já existir
  removeGlobalRGBEffect(channel);
  
  // Delay adicional para garantir que o DOM esteja estável
  setTimeout(() => {
    const avatarDiv = document.getElementById(`avatar-${channel}`);
    if (!avatarDiv) return;
    const img = avatarDiv.querySelector('img');
    if (!img) return;
    
    // Pega posição absoluta do avatar na tela
    const rect = img.getBoundingClientRect();
    
    // Verifica se o avatar está visível na tela
    if (rect.width === 0 || rect.height === 0) {
      console.log(`Avatar do canal ${channel} não está visível, tentando novamente...`);
      // Tenta novamente após um delay maior
      setTimeout(() => createOrUpdateGlobalRGBEffect(channel), 1000);
      return;
    }
    
    // Pega o border-radius real do avatar
    const computedStyle = window.getComputedStyle(img);
    const borderRadius = computedStyle.borderRadius;
    
    // Cria o elemento RGB
    const rgbDiv = document.createElement('div');
    rgbDiv.id = `global-rgb-${channel}`;
    rgbDiv.style.position = 'fixed';
    rgbDiv.style.left = `${rect.left}px`;
    rgbDiv.style.top = `${rect.top}px`;
    rgbDiv.style.width = `${rect.width}px`;
    rgbDiv.style.height = `${rect.height}px`;
    rgbDiv.style.pointerEvents = 'none';
    rgbDiv.style.zIndex = 9999;
    rgbDiv.style.borderRadius = borderRadius;
    rgbDiv.style.boxShadow = '0 0 0 3px #fff, 0 0 10px 2px #00f, 0 0 20px 4px #0ff, 0 0 15px 3px #0f0, 0 0 20px 4px #ff0, 0 0 25px 5px #f00';
    rgbDiv.style.animation = 'rgb-border 2s linear infinite';
    document.body.appendChild(rgbDiv);
  }, 100); // 100ms de delay adicional
}
function removeGlobalRGBEffect(channel) {
  const rgbDiv = document.getElementById(`global-rgb-${channel}`);
  if (rgbDiv) rgbDiv.remove();
}
function updateAllGlobalRGBEffects() {
  // Atualiza posição de todos os efeitos RGB globais
  document.querySelectorAll('[id^="global-rgb-"]').forEach(div => {
    const channel = div.id.replace('global-rgb-', '');
    const avatarDiv = document.getElementById(`avatar-${channel}`);
    if (!avatarDiv) { div.remove(); return; }
    const img = avatarDiv.querySelector('img');
    if (!img) { div.remove(); return; }
    const rect = img.getBoundingClientRect();
    // Pega o border-radius real do avatar
    const computedStyle = window.getComputedStyle(img);
    const borderRadius = computedStyle.borderRadius;
    // Verifica se está visível dentro do container
    const container = document.getElementById('channels-container');
    if (container) {
      const containerRect = container.getBoundingClientRect();
      if (rect.bottom < containerRect.top || rect.top > containerRect.bottom) {
        // Fora da área visível, remove o RGB
        div.remove();
        return;
      }
      if (rect.top < containerRect.top) {
        // Se o topo do avatar está acima do topo do container, remove o RGB
        div.remove();
        return;
      }
    }
    div.style.left = `${rect.left}px`;
    div.style.top = `${rect.top}px`;
    div.style.width = `${rect.width}px`;
    div.style.height = `${rect.height}px`;
    div.style.borderRadius = borderRadius;
  });
}
window.addEventListener('scroll', updateAllGlobalRGBEffects, true);
window.addEventListener('resize', updateAllGlobalRGBEffects);
// ========== FIM EFEITO RGB GLOBAL =============

// Modificar updateAvatarBorder para aplicar borda RGB se for o caso
function updateAvatarBorder(channel) {
  const avatarDiv = document.getElementById(`avatar-${channel}`);
  if (!avatarDiv) return;
  const img = avatarDiv.querySelector('img');
  if (!img) return;
  // Verificar se o canal está online
  const statusElement = document.getElementById(`status-${channel}`);
  const isOnline = statusElement && statusElement.classList.contains('bg-red-500');

  // Buscar dados do canal
  const channelConfig = twitchChannels[channel];
  // Buscar nome do streamer (name) e normalizar
  const streamerName = channelConfig && channelConfig.name ? channelConfig.name.toLowerCase() : '';
  // Buscar dados do allData se disponível
  let isMinecraft = false;
  let isOnServer = false;
  if (window.allData && window.allData[channel] && window.allData[channel].stream) {
    const stream = window.allData[channel].stream;
    isMinecraft = stream.game && stream.game.name && stream.game.name.toLowerCase().includes('minecraft');
    isOnServer = minecraftPlayersOnline.includes(streamerName);
  }
  if (isOnline && isMinecraft && isOnServer) {
    // Delay para garantir que o canal esteja na posição correta antes de aplicar RGB
    setTimeout(() => {
      // Efeito RGB global
      createOrUpdateGlobalRGBEffect(channel);
      avatarDiv.style.overflow = 'visible';
      avatarDiv.classList.add('avatar-rgb');
      img.title = 'Este canal pode estár com drop de chaves ativo';
    }, 500); // 500ms de delay
  } else {
    removeGlobalRGBEffect(channel);
    if (isOnline) {
      img.className = 'w-8 h-8 rounded-full object-cover border-2 border-green-500';
    } else {
      img.className = 'w-8 h-8 rounded-full object-cover border-2 border-gray-500';
    }
    img.style.boxShadow = '';
    img.style.animation = '';
    avatarDiv.style.overflow = '';
    avatarDiv.classList.remove('avatar-rgb');
    img.title = '';
  }
}

// Função para buscar o nome do jogo atual do streamer
async function fetchTwitchGame(channel) {
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
                game {
                  name
                }
              }
            }
          }
        `
      })
    });
    const data = await response.json();
    if (data.data && data.data.user && data.data.user.stream && data.data.user.stream.game && data.data.user.stream.game.name) {
      return data.data.user.stream.game.name;
    }
    return null;
  } catch (e) {
    console.log('Erro ao buscar jogo:', e);
    return null;
  }
}

// Função utilitária para aplicar marquee se o texto for maior que o container
function applyMarqueeIfNeeded(span) {
  if (!span) return;
  // Remove marquee anterior
  const marquee = span.querySelector('.marquee-inner');
  if (marquee) {
    span.innerHTML = marquee.textContent;
  }
  // Só aplica se o texto for maior que o container
  setTimeout(() => {
    if (span.scrollWidth > span.clientWidth) {
      const text = span.textContent;
      span.innerHTML = `<span class='marquee-inner' style="display:inline-block;white-space:nowrap;animation:marquee 6s linear infinite;">${text}&nbsp;&nbsp;&nbsp;${text}</span>`;
    }
  }, 100);
}

// Adicionar keyframes do marquee no head se não existir
(function ensureMarqueeStyle(){
  if (!document.getElementById('marquee-style')) {
    const style = document.createElement('style');
    style.id = 'marquee-style';
    style.innerHTML = `
      @keyframes marquee { 
        0% { transform: translateX(0); } 
        100% { transform: translateX(-50%); } 
      }
      @keyframes fadeOut {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.95); }
      }
    `;
    document.head.appendChild(style);
  }
})();

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
        ${channelConfig.type === 'desertor' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-white text-gray-800 rounded-full text-xs font-bold flex items-center justify-center border border-gray-300" title="Este canal não faz mais parte dos streamers do Infinity Nexus mas deixou saudades">?</span></span>` : ''}
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

// Função para buscar dados de todos os canais em um único fetch
async function fetchAllTwitchChannelData(channels) {
  const queryBlocks = Object.keys(channels).map(
    channel => `
      ${channel}: user(login: "${channel}") {
        profileImageURL(width: 300)
        stream {
          id
          viewersCount
          game { name }
        }
      }
    `
  ).join('\n');
  const query = `query {\n${queryBlocks}\n}`;
  try {
    const response = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko'
      },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    return data.data;
  } catch (e) {
    console.log('Erro ao buscar dados dos canais:', e);
    return {};
  }
}

// Substituir updateAllChannelsListSmooth para usar o fetch único
async function updateAllChannelsListSmooth() {
  const container = document.getElementById('channels-container');
  if (!container) return;

  // Buscar todos os dados de uma vez
  const allData = await fetchAllTwitchChannelData(twitchChannels);
  window.allData = allData; // Armazena os dados para uso posterior

  // Arrays para separar online e offline
  const onlineChannels = [];
  const offlineChannels = [];

  for (const channel of Object.keys(twitchChannels)) {
    const userData = allData[channel];
    const isOnline = userData && userData.stream && userData.stream.id;
    
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

  function createOrUpdateChannelButton(channel, isOnline) {
    const channelConfig = twitchChannels[channel];
    const firstLetter = channelConfig.name.charAt(0).toUpperCase();
    let button = document.getElementById(`btn-${channel}`);
    const userData = allData[channel];
    const avatarUrl = userData && userData.profileImageURL;
    let gameText = 'Offline';
    if (isOnline && userData.stream && userData.stream.game && userData.stream.game.name) {
      const gameName = userData.stream.game.name;
      const viewers = userData.stream.viewersCount;
      gameText = viewers ? `${gameName} - ${viewers}` : gameName;
    }
    if (!button) {
      button = document.createElement('button');
      button.id = `btn-${channel}`;
      button.className = getChannelButtonClasses(channelConfig);
      button.onclick = () => toggleLive(channel);
      button.innerHTML = `
        <div class="relative">
          <div class="w-8 h-8 ${channelConfig.color} rounded-full flex items-center justify-center font-bold border-2 border-transparent transition-all duration-200" id="avatar-${channel}">${firstLetter}</div>
        </div>
        <div class="flex-1 relative overflow-hidden text-left flex flex-col items-start justify-center">
          <div>${channelConfig.name}</div>
          <div id="game-${channel}" class="text-xs text-gray-400 w-full flex flex-row items-center justify-between">
            <span id="game-name-${channel}" style="max-width:80%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;display:inline-block;vertical-align:middle;"></span>
            <span id="viewers-${channel}" style="margin-left:auto;margin-right:10px;text-align:right;"></span>
          </div>
        </div>
        <div id="status-${channel}" class="absolute bottom-0 right-0 w-3 h-3 ${isOnline ? 'bg-red-500 animate-pulse' : 'bg-gray-500'} rounded-full border-2 border-gray-850"></div>
        ${channelConfig.type === 'premium' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-yellow-300 text-yellow-900 rounded-full text-xs font-bold flex items-center justify-center border border-yellow-500" title="Este usuário é um membro Premium e recebeu uma faixa exclusiva por fazer +350h de live no Infinity">?</span></span>` : ''}
        ${channelConfig.type === 'plus' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-purple-300 text-purple-900 rounded-full text-xs font-bold flex items-center justify-center border border-purple-500" title="Este usuário é um membro Plus e recebeu uma faixa exclusiva por fazer +100h de live no Infinity">?</span></span>` : ''}
        ${channelConfig.type === 'normal' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-blue-300 text-blue-900 rounded-full text-xs font-bold flex items-center justify-center border border-blue-500" title="Este usuário é um membro Normal e recebeu uma faixa exclusiva por fazer +50h de live no Infinity">?</span></span>` : ''}
        ${channelConfig.type === 'iniciante' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-gray-300 text-gray-800 rounded-full text-xs font-bold flex items-center justify-center border border-gray-400" title="Canal iniciante">?</span></span>` : ''}
        ${channelConfig.type === 'desertor' ? `<span class="absolute top-0 right-0 cursor-pointer group"><span class="inline-block w-5 h-5 bg-white text-gray-800 rounded-full text-xs font-bold flex items-center justify-center border border-gray-300" title="Este canal não faz mais parte dos streamers do Infinity Nexus">?</span></span>` : ''}
      `;
      container.appendChild(button);
    }
    // Avatar
    const avatarDiv = document.getElementById(`avatar-${channel}`);
    if (avatarDiv && avatarUrl) {
      avatarDiv.innerHTML = `<img src="${avatarUrl}" alt="avatar" class="w-8 h-8 rounded-full object-cover border-2" />`;
      avatarDiv.style.background = 'none';
      avatarDiv.style.color = 'transparent';
    }
    // Game e viewers
    const gameDiv = button.querySelector(`#game-${channel}`);
    const gameNameSpan = button.querySelector(`#game-name-${channel}`);
    const viewersSpan = button.querySelector(`#viewers-${channel}`);
    if (isOnline && userData.stream && userData.stream.game && userData.stream.game.name) {
      const gameName = userData.stream.game.name;
      const viewers = userData.stream.viewersCount;
      if (gameNameSpan) gameNameSpan.textContent = gameName;
      if (viewersSpan) viewersSpan.textContent = viewers ? viewers : '';
      applyMarqueeIfNeeded(gameNameSpan);
    } else {
      if (gameNameSpan) gameNameSpan.textContent = 'Offline';
      if (viewersSpan) viewersSpan.textContent = '';
      applyMarqueeIfNeeded(gameNameSpan);
    }
    // Status
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
    // Atualiza ordem visual
    container.appendChild(button);
  }

  onlineChannels.forEach(channel => createOrUpdateChannelButton(channel, true));
  offlineChannels.forEach(channel => createOrUpdateChannelButton(channel, false));

  // Remove botões de canais que não existem mais
  Array.from(container.children).forEach(child => {
    const id = child.id?.replace('btn-', '');
    if (id && !twitchChannels[id]) {
      child.remove();
    }
  });

  // Fazer scroll para o topo após atualizar a lista
  container.scrollTo({
    top: 0,
    behavior: 'smooth'
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
    
    const isOnline = previousStatus[channel];
    if (isOnline) {
      toggleLive(channel);
      openedCount++;
      
      // Pequeno delay entre aberturas para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}

// Função para testar o aviso de canal online (para desenvolvimento)
function testOnlineNotification(channel = 'moldador') {
  console.log(`Testando aviso de canal online para: ${channel}`);
  showOnlineNowCard(channel);
}

// Função para simular transição offline -> online (para desenvolvimento)
function simulateChannelGoingOnline(channel = 'moldador') {
  console.log(`Simulando canal ${channel} ficando online...`);
  // Simula que o canal estava offline
  previousStatus[channel] = false;
  // Simula que agora está online
  const isOnline = true;
  previousStatus[channel] = isOnline;
  // Dispara o aviso
  showOnlineNowCard(channel);
}

// Função para testar apenas o som de alerta
function testAlertSound() {
  console.log('Testando som de alerta...');
  playAlertSound();
} 

// ===== FUNCIONALIDADE DE REDIMENSIONAMENTO =====

// Variáveis para controle do redimensionamento
let isResizing = false;
let currentResizeHandle = null;
let startX = 0;
let startWidth = 0;

// Função para inicializar o redimensionamento
function initializeResizeHandles() {
  const resizeHandle1 = document.getElementById('resize-handle-1');
  const resizeHandle2 = document.getElementById('resize-handle-2');
  const channelsColumn = document.getElementById('channels-column');
  const chatColumn = document.getElementById('chat-column');

  // Configurar primeiro handle (entre canais e lives)
  resizeHandle1.addEventListener('mousedown', (e) => {
    startResize(e, channelsColumn, 'left');
  });

  // Configurar segundo handle (entre lives e chat)
  resizeHandle2.addEventListener('mousedown', (e) => {
    startResize(e, chatColumn, 'right');
  });

  // Eventos globais para o redimensionamento
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopResize);
}

// Função para iniciar o redimensionamento
function startResize(e, column, side) {
  isResizing = true;
  currentResizeHandle = side;
  startX = e.clientX;
  startWidth = column.offsetWidth;
  document.body.classList.add('resizing');
  // Ativar overlay
  const overlay = document.getElementById('resize-overlay');
  if (overlay) overlay.style.display = 'block';
  e.preventDefault();
}

// Função utilitária para converter px para vw
function pxToVw(px) {
  return (px / window.innerWidth) * 100;
}
// Função utilitária para converter vw para px
function vwToPx(vw) {
  return (vw / 100) * window.innerWidth;
}

// Função para lidar com o movimento do mouse durante redimensionamento
function handleMouseMove(e) {
  if (!isResizing) return;

  const deltaX = e.clientX - startX;
  const viewportWidth = window.innerWidth;
  const resizeIndicator = document.getElementById('resize-indicator');

  if (currentResizeHandle === 'left') {
    // Redimensionar coluna de canais
    const channelsColumn = document.getElementById('channels-column');
    const newWidthPx = Math.max(vwToPx(5), Math.min(vwToPx(15), startWidth + deltaX));
    const newWidthVw = (newWidthPx / viewportWidth) * 100;
    channelsColumn.style.width = `${newWidthVw}vw`;
    
    // Mostrar indicador de largura
    resizeIndicator.textContent = `${newWidthVw.toFixed(1)}vw`;
    
    // Adiciona classe minimal se largura for <= 5vw
    if (newWidthVw <= 5.1) {
      channelsColumn.classList.add('minimal');
    } else {
      channelsColumn.classList.remove('minimal');
    }
  } else if (currentResizeHandle === 'right') {
    // Redimensionar coluna de chat
    const chatColumn = document.getElementById('chat-column');
    const newWidthPx = Math.max(vwToPx(1), Math.min(vwToPx(50), startWidth - deltaX));
    const newWidthVw = (newWidthPx / viewportWidth) * 100;
    chatColumn.style.width = `${newWidthVw}vw`;
    
    // Mostrar indicador de largura
    resizeIndicator.textContent = `${newWidthVw.toFixed(1)}vw`;
  }
}

// Função para parar o redimensionamento
function stopResize() {
  if (!isResizing) return;
  
  isResizing = false;
  currentResizeHandle = null;
  document.body.classList.remove('resizing');
  
  // Esconder indicador de largura
  const resizeIndicator = document.getElementById('resize-indicator');
  if (resizeIndicator) {
    resizeIndicator.style.display = 'none';
  }
  // Desativar overlay
  const overlay = document.getElementById('resize-overlay');
  if (overlay) overlay.style.display = 'none';
}

// Função para salvar as larguras no localStorage
function saveColumnWidths() {
  const channelsColumn = document.getElementById('channels-column');
  const chatColumn = document.getElementById('chat-column');
  
  if (channelsColumn && chatColumn) {
    localStorage.setItem('channelsColumnWidth', channelsColumn.style.width);
    localStorage.setItem('chatColumnWidth', chatColumn.style.width);
  }
}

// Função para carregar as larguras do localStorage
function loadColumnWidths() {
  const channelsColumn = document.getElementById('channels-column');
  const chatColumn = document.getElementById('chat-column');

  if (channelsColumn && chatColumn) {
    const savedChannelsWidth = localStorage.getItem('channelsColumnWidth');
    const savedChatWidth = localStorage.getItem('chatColumnWidth');

    if (savedChannelsWidth) {
      channelsColumn.style.width = savedChannelsWidth;
      // Aplica classe minimal se necessário
      const widthNum = parseFloat(savedChannelsWidth);
      if (savedChannelsWidth.endsWith('vw') && widthNum <= 5.1) {
        channelsColumn.classList.add('minimal');
      } else {
        channelsColumn.classList.remove('minimal');
      }
    }

    if (savedChatWidth) {
      chatColumn.style.width = savedChatWidth;
    }
  }
}

// Adicionar evento para salvar larguras quando a página for fechada
window.addEventListener('beforeunload', saveColumnWidths);

// Inicializar redimensionamento quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  initializeResizeHandles();
  loadColumnWidths();
});

// Inicializar redimensionamento se o DOM já estiver carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeResizeHandles();
    loadColumnWidths();
  });
} else {
  initializeResizeHandles();
  loadColumnWidths();
} 
