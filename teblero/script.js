document.addEventListener('DOMContentLoaded', () => {

    // --- BASE DE DATOS DE CARTAS (SIN CAMBIOS) ---
    const cardDatabase = [
        {id:1,name:"Dragón Blanco de Ojos Azules",type:"Monstruo",atk:8,def:7,voluntadMaldita:1.5,description:"Un legendario y poderoso dragón.",image:"https://i.imgur.com/MSZ1sCj.jpg"},
        {id:2,name:"Mago Oscuro",type:"Monstruo",atk:7,def:6,voluntadMaldita:2,description:"El más grande de los magos.",image:"https://i.imgur.com/aCmMb7q.jpg"},
        {id:3,name:"Agujero Oscuro",type:"Magia",description:"Destruye todos los monstruos.",image:"https://i.imgur.com/gOVqS1A.jpg"}
    ];

    // --- ESTADO DEL JUEGO (SIN CAMBIOS) ---
    const gameState = {
        playerMaxLP: 20, playerLP: 20, opponentMaxLP: 20, opponentLP: 20, currentPhaseIndex: 0,
        phases: ["Draw", "Standby", "Main 1", "Battle", "Main 2", "End"],
        playerDeck: [], playerHand: [], opponentDeck: [], opponentHand: [], selectedCard: null
    };

    // --- ELEMENTOS DEL DOM ---
    const playerDeckEl = document.getElementById('player-deck');
    const playerHandEl = document.getElementById('player-hand');
    const playerLPEl = document.getElementById('player-lp');
    const playerLPBarEl = document.getElementById('player-lp-bar');
    const opponentLPEl = document.getElementById('opponent-lp');
    const opponentLPBarEl = document.getElementById('opponent-lp-bar');
    const nextPhaseBtn = document.getElementById('next-phase-btn');
    
    const cardInfoPanel = {
        name:document.getElementById('card-name'),type:document.getElementById('card-type'),image:document.getElementById('card-image-preview'),stats:document.getElementById('card-stats'),atk:document.getElementById('card-atk'),def:document.getElementById('card-def'),willContainer:document.getElementById('card-will-container'),will:document.getElementById('card-will'),description:document.getElementById('card-description'),
    };

    // --- FUNCIONES DEL JUEGO (LA MAYORÍA SIN CAMBIOS) ---

    function shuffleDeck(deck){for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}}
    function createCardElement(cardData){const cardEl=document.createElement('div');cardEl.classList.add('card');cardEl.style.backgroundImage=`url(${cardData.image})`;cardEl.dataset.cardId=cardData.id;return cardEl;}
    function drawCard(deck,hand,handEl){if(deck.length>0){const cardData=deck.pop();hand.push(cardData);const cardEl=createCardElement(cardData);handEl.appendChild(cardEl);}}
    function updateCardInfo(cardData){if(!cardData){cardInfoPanel.name.textContent="Nombre de la Carta";cardInfoPanel.type.textContent="[Tipo]";cardInfoPanel.image.src="";cardInfoPanel.stats.style.display='none';cardInfoPanel.willContainer.style.display='none';cardInfoPanel.description.textContent="Pasa el cursor sobre una carta para ver sus detalles.";return;}
    cardInfoPanel.name.textContent=cardData.name;cardInfoPanel.type.textContent=`[ ${cardData.type} ]`;cardInfoPanel.image.src=cardData.image;cardInfoPanel.description.textContent=cardData.description;if(cardData.type==="Monstruo"){cardInfoPanel.stats.style.display='flex';cardInfoPanel.willContainer.style.display='block';cardInfoPanel.atk.textContent=cardData.atk;cardInfoPanel.def.textContent=cardData.def;cardInfoPanel.will.textContent=cardData.voluntadMaldita;}else{cardInfoPanel.stats.style.display='none';cardInfoPanel.willContainer.style.display='none';}}
    function selectCard(cardEl){if(gameState.selectedCard){gameState.selectedCard.element.classList.remove('selected');}
    if(gameState.selectedCard&&gameState.selectedCard.element===cardEl){gameState.selectedCard=null;return;}
    cardEl.classList.add('selected');const cardId=parseInt(cardEl.dataset.cardId);const cardData=cardDatabase.find(c=>c.id===cardId);gameState.selectedCard={element:cardEl,data:cardData};}
    
    // Lógica de juego simplificada para las nuevas zonas
    function playSelectedCard(targetZoneEl) {
        if (!gameState.selectedCard) return;

        const cardData = gameState.selectedCard.data;
        // Permite colocar monstruos en zonas de monstruo o extra
        const isMonsterZone = targetZoneEl.classList.contains('monster-zone');
        // Permite colocar magias/trampas en sus zonas o en las de péndulo
        const isSpellTrapZone = targetZoneEl.classList.contains('spell-trap-zone');

        if ((cardData.type === 'Monstruo' && !isMonsterZone) || 
            (cardData.type !== 'Monstruo' && !isSpellTrapZone)) {
            alert("No puedes colocar esa carta en esta zona.");
            return;
        }

        if (targetZoneEl.childElementCount === 0) {
            targetZoneEl.appendChild(gameState.selectedCard.element);
            gameState.selectedCard.element.classList.remove('selected');
            
            const cardIndex = gameState.playerHand.findIndex(c => c.id === cardData.id);
            if (cardIndex > -1) {
                gameState.playerHand.splice(cardIndex, 1);
            }
            gameState.selectedCard = null;
        }
    }

    function startGame() {
        gameState.playerDeck = [...cardDatabase];
        shuffleDeck(gameState.playerDeck);
        for (let i = 0; i < 5; i++) {
            drawCard(gameState.playerDeck, gameState.playerHand, playerHandEl);
        }
        playerLPEl.textContent = `${gameState.playerLP} / ${gameState.playerMaxLP}`;
        opponentLPEl.textContent = `${gameState.opponentLP} / ${gameState.opponentMaxLP}`;
        playerLPBarEl.style.width = `${(gameState.playerLP/gameState.playerMaxLP)*100}%`;
        opponentLPBarEl.style.width = `${(gameState.opponentLP/gameState.opponentMaxLP)*100}%`;
        nextPhaseBtn.textContent = gameState.phases[gameState.currentPhaseIndex];
    }

    // --- EVENT LISTENERS ---
    playerDeckEl.addEventListener('click', () => {
        if (gameState.phases[gameState.currentPhaseIndex] === 'Draw') {
            drawCard(gameState.playerDeck, gameState.playerHand, playerHandEl);
        } else {
            alert("Solo puedes robar en la Draw Phase.");
        }
    });

    nextPhaseBtn.addEventListener('click', () => {
        gameState.currentPhaseIndex = (gameState.currentPhaseIndex + 1) % gameState.phases.length;
        nextPhaseBtn.textContent = gameState.phases[gameState.currentPhaseIndex];
    });
    
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('card') && target.parentElement === playerHandEl) {
            selectCard(target);
        }
        // Lógica de click actualizada para cualquier zona del jugador
        else if (target.classList.contains('card-zone') && target.closest('#game-board')) {
            // Simplificado: permite jugar en cualquier zona del jugador o zona extra vacía
             if (target.closest('#player-side') || target.classList.contains('extra-monster-zone')) {
                playSelectedCard(target);
             }
        }
    });

    document.body.addEventListener('mouseover', (e) => {
        const cardEl = e.target.closest('.card');
        if (cardEl && cardEl.dataset.cardId) {
            const cardId = parseInt(cardEl.dataset.cardId);
            const cardData = cardDatabase.find(c => c.id === cardId);
            updateCardInfo(cardData);
        }
    });
    
    document.body.addEventListener('mouseout', (e) => {
        const cardEl = e.target.closest('.card');
        if(cardEl) {
            updateCardInfo(null);
        }
    });

    startGame();
});