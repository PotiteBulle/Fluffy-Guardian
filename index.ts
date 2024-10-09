import { Client, GatewayIntentBits, Events, GuildMember } from 'discord.js';
import * as fs from 'node:fs/promises';
import { watch } from 'node:fs'; // Importer la fonction `watch` pour surveiller les modifications
import * as path from 'node:path';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Vérifier que toutes les variables d'environnement nécessaires sont définies dès le début
const { BANNISSEMENTS_DIR, GUILD_ID, DISCORD_TOKEN } = process.env;
if (!BANNISSEMENTS_DIR || !GUILD_ID || !DISCORD_TOKEN) {
    throw new Error('Les variables d\'environnement DISCORD_TOKEN, GUILD_ID et BANNISSEMENTS_DIR doivent être définies.');
}

// Créer une instance du client Discord avec les intents nécessaires pour le fonctionnement du bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // Nécessaire pour l'événement GuildMemberAdd
    ],
});

// Stocker les listes de bannissement
let banLists: Map<string, Set<string>> = new Map();

// Fonction exécutée lorsque le client Discord est prêt
client.once(Events.ClientReady, async () => {
    console.log(`Connecté en tant que ${client.user?.tag}`);
    
    // Charger les listes de bannissement et bannir immédiatement les membres déjà dans le serveur
    await refreshBanListsAndBanMembers();

    // Surveiller les modifications dans le dossier de bannissement
    watchBanListsDirectory();

    console.log(`Listes de bannissement chargées.`);
});

// Écouter l'événement quand un nouveau membre rejoint le serveur
client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    console.log(`Nouveau membre détecté : ${member.user.tag} (ID: ${member.id})`);

    for (const [reason, ids] of banLists.entries()) {
        if (ids.has(member.id)) {
            try {
                await member.ban({ reason: `[GuardianSystem] - ${reason}` });
                console.log(`Membre ${member.user.tag} banni automatiquement pour la raison : ${reason}.`);
                return;
            } catch (error) {
                console.error(`Erreur en bannissant ${member.user.tag}: ${error instanceof Error ? error.message : error}`);
            }
        }
    }

    console.log(`Membre ${member.user.tag} est autorisé à rester.`);
});

// Fonction pour charger toutes les listes de bannissement depuis le dossier 'bannissements/'
async function refreshBanListsAndBanMembers(): Promise<void> {
    try {
        const files = await fs.readdir(BANNISSEMENTS_DIR!);
        const newBanLists: Map<string, Set<string>> = new Map();

        for (const file of files) {
            const filePath = path.join(BANNISSEMENTS_DIR!, file);
            const data = await fs.readFile(filePath, 'utf8');
            const ids = data.split('\n').map(id => id.trim()).filter(id => id.length > 0);
            newBanLists.set(file, new Set(ids));
        }

        // Bannir les membres du serveur qui sont dans une des listes
        const guild = await client.guilds.fetch(GUILD_ID!);
        const members = await guild.members.fetch();

        for (const member of members.values()) {
            for (const [reason, ids] of newBanLists.entries()) {
                if (ids.has(member.id) && (!banLists.get(reason)?.has(member.id))) {
                    try {
                        await member.ban({ reason: `[GuardianSystem] - ${reason}` });
                        console.log(`Membre ${member.user.tag} banni automatiquement au démarrage pour la raison : ${reason}.`);
                    } catch (error) {
                        console.error(`Erreur en bannissant ${member.user.tag} lors du démarrage: ${error}`);
                    }
                }
            }
        }

        banLists = newBanLists;
        console.log(`Listes de bannissement mises à jour.`);
    } catch (error) {
        console.error(`Erreur lors de la lecture des fichiers de bannissement : ${error instanceof Error ? error.message : error}`);
    }
}

// Fonction pour surveiller les modifications dans le dossier 'bannissements/'
function watchBanListsDirectory() {
    watch(BANNISSEMENTS_DIR!, { recursive: true }, async (eventType, filename) => {
        if (eventType === 'change' && filename) {
            console.log(`Modification détectée dans le fichier de bannissement : ${filename}`);
            await refreshBanListsAndBanMembers();
        }
    });
}

// Connexion du client Discord avec le Bot via le Token
client.login(DISCORD_TOKEN);