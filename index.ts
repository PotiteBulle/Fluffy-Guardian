import { Client, GatewayIntentBits, Events, GuildMember } from 'discord.js';
import * as fs from 'node:fs/promises';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement depuis le ficher .env
dotenv.config();

// Créer une instance du client Discord avec les intents nécessaires pour le fonctionnement du bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,

    ],
});

// Lire les variables d'environnements
const BAN_LIST_FILE = process.env.BAN_LIST_FILE;
const GUILD_ID = process.env.GUILD_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// Vérifier que toutes les variables d'environnement nécessaires sont définies
if (!BAN_LIST_FILE || !GUILD_ID || !DISCORD_TOKEN) {
    throw new Error('Les variables d\'environnement DISCORD_TOKEN, GUILD_ID et BAN_LIST_FILE doivent être définies.');
}

// Fonction qui est appel lorsque le client Discord est prêt
client.once(Events.ClientReady, async () => {
    console.log(`Connecté en tant que ${client.user?.tag}`);

    // Charger la liste des IDs à bannir depuis le fichier
    const banList = await loadBanList();

    if (banList.length === 0) {
        console.log('La liste de bannissement est vide.');
        return;
    }

    // Obtenir le serveur Discord avec l'ID fourni
    const guild = await client.guilds.fetch(GUILD_ID);
    if (!guild) {
        console.error('Serveur non trouvé.');
        return;
    }
    // Récupérer tous les membres du serveur
    const members = await guild.members.fetch();

    // Parcourir chaque membre et le bannir si son ID est dans la liste de bannissement 'bannissements/banlist.txt'
    members.forEach((member: GuildMember) => {
        if (banList.includes(member.id)) {
            member.ban({ reason: '[GuardianSystem]' })
                .then(() => console.log(`Membre ${member.user.tag} banni.`))
                .catch(console.error);
        }
    });
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