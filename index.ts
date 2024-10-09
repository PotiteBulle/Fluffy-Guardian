import { Client, GatewayIntentBits, Events, GuildMember } from 'discord.js';
import * as fs from 'node:fs/promises';
import { watch } from 'node:fs'; // Importer la fonction `watch` pour surveiller les modifications
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

// Déclaration de la liste des bans
let banList: Set<string> = new Set();

// Fonction exécutée lorsque le client Discord est prêt
client.once(Events.ClientReady, async () => {
    console.log(`Connecté en tant que ${client.user?.tag}`);
    
    // Charger la liste des IDs à bannir et bannir immédiatement les membres déjà dans le serveur
    await refreshBanListAndBanMembers();

    // Surveiller les modifications du fichier banlist.txt
    watchBanListFile();

    console.log(`Liste de bannissement chargée avec ${banList.size} ID(s).`);
});

// Écouter l'événement quand un nouveau membre rejoint le serveur
client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    console.log(`Nouveau membre détecté : ${member.user.tag} (ID: ${member.id})`);

    if (banList.has(member.id)) {
        try {
            await member.ban({ reason: '[GuardianSystem] - Banni automatiquement.' });
            console.log(`Membre ${member.user.tag} banni automatiquement.`);
        } catch (error) {
            console.error(`Erreur en bannissant ${member.user.tag}: ${error instanceof Error ? error.message : error}`);
        }
    } else {
        console.log(`Membre ${member.user.tag} est autorisé à rester.`);
    }
});

// Fonction pour charger la liste des IDs à bannir depuis le fichier 'banlist.txt' et bannir les membres correspondants
async function refreshBanListAndBanMembers(): Promise<void> {
    try {
        const data = await fs.readFile(BAN_LIST_FILE!, 'utf8');
        const ids = data.split('\n').map(id => id.trim()).filter(id => id.length > 0);
        const newBanList = new Set(ids);

        // Bannir tous les membres du serveur qui sont présents dans la banlist
        const guild = await client.guilds.fetch(GUILD_ID!);
        const members = await guild.members.fetch();

        for (const member of members.values()) {
            if (newBanList.has(member.id) && !banList.has(member.id)) {
                try {
                    await member.ban({ reason: '[GuardianSystem] - Banni automatiquement.' }); //CHANGE THIS
                    console.log(`Membre ${member.user.tag} banni automatiquement au démarrage.`);
                } catch (error) {
                    console.error(`Erreur en bannissant ${member.user.tag} lors du démarrage: ${error}`);
                }
            }
        }

        banList = newBanList;
        console.log(`Liste de bannissement mise à jour : ${banList.size} ID(s).`);
    } catch (error) {
        console.error(`Erreur lors de la lecture du fichier de bannissement : ${error instanceof Error ? error.message : error}`);
    }
}

// Fonction pour surveiller les modifications du fichier 'banlist.txt'
function watchBanListFile() {
    watch(BAN_LIST_FILE!, async (eventType) => {
        if (eventType === 'change') {
            console.log('Modification détectée dans le fichier de bannissement.');
            await refreshBanListAndBanMembers();
        }
    });
}

// Connexion du client Discord avec le Bot via le Token
client.login(DISCORD_TOKEN);