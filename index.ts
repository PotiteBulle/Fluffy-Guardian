import { Client, GatewayIntentBits, Events, GuildMember } from 'discord.js';
import * as fs from 'node:fs/promises';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Vérifier que toutes les variables d'environnement nécessaires sont définies dès le début
const { BAN_LIST_FILE, GUILD_ID, DISCORD_TOKEN } = process.env;
if (!BAN_LIST_FILE || !GUILD_ID || !DISCORD_TOKEN) {
    throw new Error('Les variables d\'environnement DISCORD_TOKEN, GUILD_ID et BAN_LIST_FILE doivent être définies.');
}

// Créer une instance du client Discord avec les intents nécessaires pour le fonctionnement du bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // Nécessaire pour l'événement GuildMemberAdd
    ],
});

let banList: Set<string> = new Set();

// Fonction exécutée lorsque le client Discord est prêt
client.once(Events.ClientReady, async () => {
    console.log(`Connecté en tant que ${client.user?.tag}`);

    // Charger la liste des IDs à bannir depuis le fichier
    banList = new Set(await loadBanList());

    if (banList.size === 0) {
        console.log('La liste de bannissement est vide.');
    } else {
        console.log(`Liste de bannissement chargée avec ${banList.size} ID(s).`);
    }
});

// Écouter l'événement quand un nouveau membre rejoint le serveur
client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    if (banList.has(member.id)) {
        try {
            await member.ban({ reason: '[GuardianSystem]' });
            console.log(`Membre ${member.user.tag} banni automatiquement.`);
        } catch (error) {
            console.error(`Erreur en bannissant ${member.user.tag}: ${error}`);
        }
    } else {
        console.log(`Membre ${member.user.tag} est autorisé à rester.`);
    }
});

// Fonction pour charger la liste des IDs à bannir depuis le fichier 'banlist.txt'
async function loadBanList(): Promise<string[]> {
    try {
        // Lire le contenu du fichier de bannissement
        const data = await fs.readFile(BAN_LIST_FILE!, 'utf8');
        // Convertir le contenu en tableau d'IDs, en filtrant les lignes vides
        return data.split('\n').map(id => id.trim()).filter(id => id.length > 0);
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier de bannissement : ${error}`);
        return [];
    }
}

// Connexion du client Discord avec le Bot via le Token
client.login(DISCORD_TOKEN);