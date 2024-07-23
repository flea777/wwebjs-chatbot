const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('message_create', message => {
    if (message.isStatus) {
        return;
    } else if (message.from.includes('@g.us')) {
        return;
    }

    console.log(message.body);
    
    const user = message.from;
    const response = messageSender(user, message.body);

    if (response) {
        client.sendMessage(user, response);
    }
});

// Messages
const initialMessage = 'Olá, seja bem vindo a Pesquisa Eleitoral 2024!';
const askName = 'Qual o seu nome?';
const askEmail = 'Qual o seu email?';
const askVote = 'Qual sua intenção de voto?\nCandidato 1: Alex Green\nCandidata 2: Maria Brown';
const voted = 'Obrigado por votar!';
const alreadyVoted = 'O voto é único, obrigado por sua participação anterior.';

// DB
let userStates = {};
let alexGreenVotes = 0;
let mariaBrownVotes = 0;

function messageSender(user, message) {
    switch (userStates[user]) {
        case 'ASK_NAME':
            userStates[user] = 'ASK_EMAIL';
            return askEmail;
        case 'ASK_EMAIL':
            userStates[user] = 'ASK_VOTE';
            return askVote;
        case 'ASK_VOTE':
            if (message === '1' || message === '2') {
                userStates[user] = 'WAITING_VOTE';
            }
            return askVote;
        case 'WAITING_VOTE':
            if (message === '1') {
                alexGreenVotes++;
                userStates[user] = 'VOTED';
                return voted;
            } else if (message === '2') {
                mariaBrownVotes++;
                userStates[user] = 'VOTED';
                return voted;
            }
            return 'Resposta inválida. Por favor, vote 1 ou 2.';
        case 'VOTED':
            return alreadyVoted;
        default:
            userStates[user] = 'ASK_NAME';
            return initialMessage;
    }
}

client.initialize();
