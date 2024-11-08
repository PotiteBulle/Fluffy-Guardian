# Fluffy-Guardian

Un bot Discord basé sur Bun qui vérifie les utilisateur·ice·s d'après une liste de bannissements et les bannit automatiquement avec plusieurs motif en fonction des l'infractions. 

Bot à usage de vérification d'ID via la banlist.

Sur la base du projet & des fichiers : [HopperWatcher](https://github.com/busybox11/hopperwatcher) de @busybox11


## Prérequis

- Docker
- Bun
- Discord Bot

## Installation

1. Cloner le dépôt.
2. Créer un fichier `.env` avec les informations suivantes :

```plaintext
DISCORD_TOKEN=ton_token_discord # Contient la clé Token du bot.
GUILD_ID=ton_id_de_serveur # Contient les IDs du serveur Discord où le bot est présent.
BAN_LIST_FILE=./banlist.txt # Contient les IDs des utilisateurices Discord.
```

## Installer les dépendances
Installez les dépendances nécessaires avec Bun 
```
bun install
```

## Démarrer le bot
Lancez le bot avec la commande suivante
```
bun run index.ts
```



## Utilisation
Refonte du bot de modération pour gérer plusieurs listes de bannissement:

- Ajout de la prise en charge de plusieurs fichiers de bannissement basés sur des motifs spécifiques.
- Utilisation du motif de la liste comme raison lors du bannissement des membres.
- Mise à jour de la logique de chargement et de vérification des utilisateurices bannis à partir des fichiers.
- Implémentation de la surveillance des fichiers pour détecter les modifications et actualiser les listes de bannissement automatiquement.


## Licence

[MIT Licence](https://github.com/PotiteBulle/Fluffy-Guardian/blob/main/LICENSE)