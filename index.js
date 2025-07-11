// Lista de canais disponíveis
const twitchChannels = {
  moldador:      { name: 'Moldador',      color: 'bg-indigo-600', type: 'premium' },
  lucyjapinha:   { name: 'Lucyjapinha',   color: 'bg-pink-500',   type: 'premium' },
  galvinoo:      { name: 'Galvinoo',      color: 'bg-green-500',  type: 'premium' },
  amandinhalsls: { name: 'AmandinhaLsLs', color: 'bg-blue-500',   type: 'plus' },
  barbasirius:   { name: 'Obarbasirius',  color: 'bg-yellow-500', type: 'plus' },
  lobinhopelud:  { name: 'LobinhoPeludo',  color: 'bg-pink-500',   type: 'plus' },
  bhaaskara:     { name: 'Bhaaskara',     color: 'bg-green-500',  type: 'plus' },
  lordrebechi:   { name: 'Lordrebechi',   color: 'bg-yellow-500', type: 'plus' },
  sauletagames:  { name: 'Sauletagames',  color: 'bg-yellow-500', type: 'normal' },
  deedobr:       { name: 'DeedoBR',       color: 'bg-yellow-500', type: 'normal' },
  arondesu0:     { name: 'AronDesu0',     color: 'bg-blue-500',   type: 'normal' },
  tsdesert:      { name: 'TsDesert',      color: 'bg-pink-500',   type: 'iniciante' },
  ofirofiro:     { name: 'OfirOfiro',     color: 'bg-pink-500',   type: 'iniciante' },
};

//const URL = 'robsomchatmanager.netlify.app';
const URL = 'localhost&parent=127.0.0.1';

// Função auxiliar para obter classes CSS padronizadas dos botões de canal
function getChannelButtonClasses(channelConfig) {
  const baseClasses = 'flex items-center space-x-2 mt-1 w-full hover:bg-gray-700 rounded px-2 py-1 transition relative min-h-[56px]'; // min-h-[56px] para altura igual
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
  img.style.boxShadow = '0 0 0 3px #fff, 0 0 10px 2px #00f, 0 0 20px 4px #0ff, 0 0 30px 6px #0f0, 0 0 40px 8px #ff0, 0 0 50px 10px #f00';
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
    isMinecraft = stream.game && stream.game.name && stream.game.name.toLowerCase().includes('elder');
    isOnServer = true;
  }
  /*
    if (window.allData && window.allData[channel] && window.allData[channel].stream) {
    const stream = window.allData[channel].stream;
    isMinecraft = stream.game && stream.game.name && stream.game.name.toLowerCase().includes('minecraft');
    isOnServer = minecraftPlayersOnline.includes(streamerName);
  }
  */
  if (isOnline && isMinecraft && isOnServer) {
    applyRGBBorder(img);
    avatarDiv.style.overflow = 'visible';
  } else if (isOnline) {
    img.className = 'w-8 h-8 rounded-full object-cover border-2 border-green-500';
    img.style.boxShadow = '';
    img.style.animation = '';
    avatarDiv.style.overflow = '';
  } else {
    img.className = 'w-8 h-8 rounded-full object-cover border-2 border-gray-500';
    img.style.boxShadow = '';
    img.style.animation = '';
    avatarDiv.style.overflow = '';
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
    style.innerHTML = `@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`;
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
