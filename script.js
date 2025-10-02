document.addEventListener('DOMContentLoaded', () => {

    const cardDatabase = [
        {id:1, name:"Dragón Blanco de Ojos Azules", type:"Monstruo", atk:8, def:7, description:"Un legendario y poderoso dragón de poder destructivo.", image:"https://tse3.mm.bing.net/th/id/OIP.d_g_4jRjNisw4BUruxKQMgAAAA?rs=1&pid=ImgDetMain&o=7&rm=3"},
        {id:2, name:"Mago Oscuro", type:"Monstruo", atk:7, def:6, description:"El más grande de los magos en cuanto a ataque y defensa.", image:"https://tse1.mm.bing.net/th/id/OIP.EhJtl4R5w5WACl_1j_lBOAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3"},
        {id:3, name:"Agujero Negro", type:"Magia", description:"Destruye todos los monstruos en el campo.", image:"https://tse1.mm.bing.net/th/id/OIP.LscT2nNP6kda2vOcW_WRiQHaKy?rs=1&pid=ImgDetMain&o=7&rm=3"}
    ];

    const gameState = {
        playerMaxLP: 20, playerLP: 20, opponentMaxLP: 20, opponentLP: 20, currentPhaseIndex: 0,
        phases: ["Draw", "Standby", "Main 1", "Battle", "Main 2", "End"],
        playerDeck: [], playerHand: [], opponentDeck: [], opponentHand: [], selectedCard: null
    };

    const playerHandEl = document.getElementById('player-hand');
    const opponentHandEl = document.getElementById('opponent-hand'); 
    const playerLPBoxTextEl = document.getElementById('player-lp-box-text');
    const playerLPBoxBarEl = document.getElementById('player-lp-box-bar'); 
    const opponentLPBoxTextEl = document.getElementById('opponent-lp-box-text');
    const opponentLPBoxBarEl = document.getElementById('opponent-lp-box-bar'); 
    const nextPhaseBtn = document.getElementById('next-phase-btn');
    
    const cardInfoPanel = {
        name:document.getElementById('card-name'),type:document.getElementById('card-type'),image:document.getElementById('card-image-preview'),
        stats:document.getElementById('card-stats'),atk:document.getElementById('card-atk'),def:document.getElementById('card-def'),description:document.getElementById('card-description'),
    };
    
    function shuffleDeck(deck){for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}}
    function createCardElement(cardData){const cardEl=document.createElement('div');cardEl.classList.add('card');cardEl.style.backgroundImage=`url(${cardData.image})`;cardEl.dataset.cardId=cardData.id;return cardEl;}
    function drawCard(deck,hand,handEl){if(deck.length>0){const cardData=deck.pop();hand.push(cardData);const cardEl=createCardElement(cardData);handEl.appendChild(cardEl);}}
    
    function updateCardInfo(cardData) {
        if (!cardData) {
            cardInfoPanel.name.textContent = "CARTA DESCONOCIDA";
            cardInfoPanel.type.textContent = "[Tipo de Héroe]";
            cardInfoPanel.image.src = "";
            cardInfoPanel.stats.style.display = 'none';
            cardInfoPanel.description.textContent = "Pasa el cursor sobre una carta para ver su habilidad.";
            return;
        }
        cardInfoPanel.name.textContent = cardData.name;
        cardInfoPanel.type.textContent = `[ ${cardData.type} ]`;
        cardInfoPanel.image.src = cardData.image;
        cardInfoPanel.description.textContent = cardData.description;
        if (cardData.type === "Monstruo") {
            cardInfoPanel.stats.style.display = 'flex';
            cardInfoPanel.atk.textContent = cardData.atk;
            cardInfoPanel.def.textContent = cardData.def;
        } else {
            cardInfoPanel.stats.style.display = 'none';
        }
    }

    function selectCard(cardEl) {
        if (gameState.selectedCard) {
            gameState.selectedCard.element.classList.remove('selected');
        }
        if (gameState.selectedCard && gameState.selectedCard.element === cardEl) {
            gameState.selectedCard = null;
            return;
        }
        cardEl.classList.add('selected');
        const cardId = parseInt(cardEl.dataset.cardId);
        const cardData = cardDatabase.find(c => c.id === cardId);
        gameState.selectedCard = { element: cardEl, data: cardData };
    }

    function playSelectedCard(targetZoneEl) {
        if (!gameState.selectedCard) return;

        const cardData = gameState.selectedCard.data;
        const isMonsterZone = targetZoneEl.classList.contains('monster-zone');
        const isSpellTrapZone = targetZoneEl.classList.contains('spell-trap-zone');

        if ((cardData.type === 'Monstruo' && !isMonsterZone) || 
            (cardData.type !== 'Monstruo' && !isSpellTrapZone)) {
            alert("¡No puedes jugar esa carta en esta zona!");
            return;
        }

        if (targetZoneEl.childElementCount === 0) {
            const cardInZone = createCardElement(gameState.selectedCard.data);
            targetZoneEl.appendChild(cardInZone);
            
            gameState.selectedCard.element.remove();
            
            const cardIndex = gameState.playerHand.findIndex(c => c.id === cardData.id);
            if (cardIndex > -1) {
                gameState.playerHand.splice(cardIndex, 1);
            }
            gameState.selectedCard = null;
        }
    }

    function updateLP() {
        playerLPBoxTextEl.textContent = gameState.playerLP;
        opponentLPBoxTextEl.textContent = gameState.opponentLP;
        playerLPBoxBarEl.style.width = `${(gameState.playerLP / gameState.playerMaxLP) * 100}%`;
        opponentLPBoxBarEl.style.width = `${(gameState.opponentLP / gameState.opponentMaxLP) * 100}%`;
    }

    function startGame() {
        const fullDeck = [...cardDatabase, ...cardDatabase, ...cardDatabase, ...cardDatabase, ...cardDatabase];
        shuffleDeck(fullDeck);
        
        gameState.playerDeck = fullDeck.slice(0, Math.floor(fullDeck.length / 2));
        gameState.opponentDeck = fullDeck.slice(Math.floor(fullDeck.length / 2));

        for (let i = 0; i < 5; i++) {
            drawCard(gameState.playerDeck, gameState.playerHand, playerHandEl);
        }
        
        for (let i = 0; i < 5; i++) {
            if(gameState.opponentDeck.length > 0) {
                gameState.opponentHand.push(gameState.opponentDeck.pop());
                const cardEl = document.createElement('div');
                cardEl.classList.add('card');
                const cardBack = document.createElement('div');
                cardBack.classList.add('card-back');
                cardEl.appendChild(cardBack);
                opponentHandEl.appendChild(cardEl);
            }
        }
        
        updateLP();
        nextPhaseBtn.textContent = gameState.phases[gameState.currentPhaseIndex];
        updateCardInfo(null);
    }

    // --- EVENT LISTENERS ---
    nextPhaseBtn.addEventListener('click', () => {
        const currentPhase = gameState.phases[gameState.currentPhaseIndex];
        if (currentPhase === 'Draw') {
             drawCard(gameState.playerDeck, gameState.playerHand, playerHandEl);
        }
        gameState.currentPhaseIndex = (gameState.currentPhaseIndex + 1) % gameState.phases.length;
        nextPhaseBtn.textContent = gameState.phases[gameState.currentPhaseIndex];
    });
    
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('card') && target.parentElement === playerHandEl) {
            selectCard(target);
        }
        else if (target.classList.contains('card-zone') && (target.closest('#player-field') || target.closest('#center-field'))) {
             playSelectedCard(target);
        }
    });

    document.body.addEventListener('mouseover', (e) => {
        const cardEl = e.target.closest('.card');
        if (cardEl && cardEl.dataset.cardId && cardEl.closest('#player-hand, #player-field, #center-field')) {
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
