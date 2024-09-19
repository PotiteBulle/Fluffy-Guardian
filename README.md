# Fluffy-Guardian

Un bot Discord basé sur Bun qui vérifie les utilisateurices contre une liste de bannissements et les bannit automatiquement avec le motif '[GuardianSystem]'. 

Si les utilisateurices sont présent·es dans la liste des bannissements et sur le serveur Discord.

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
Si vous n'utilisez pas Docker, vous devez avoir Bun installé. Installez les dépendances nécessaires avec Bun 
```
bun install
```

## Démarrer le bot
Lancez le bot avec la commande suivante
```
bun run index.ts
```

## Démarrer le bot avec Docker
Lancez le bot avec la commande suivante
```
docker-compose up --build
```



## Utilisation
Une fois le bot démarré, il se connectera à votre serveur Discord et commencera à vérifier les utilisateurices présents dans le fichier banlist.txt. Les utilisateurices trouvés seront bannis automatiquement avec le motif "[GuardianSystem]".


## Arborescence
`index.ts` : Code principal du bot.

`.env `: Fichier de configuration des variables d'environnement.

`banlist.txt` : Fichier contenant les IDs des utilisateurices à bannir.

`Dockerfile` : Configuration pour créer l'image Docker du bot.

`docker-compose.yml` : Fichier Docker Compose pour gérer les services Docker.

`.gitignore` : Liste des fichiers à ignorer dans le contrôle de version.

`.dockerignore` : Liste des fichiers à ignorer lors de la construction de l'image Docker.


## Test & fonctionnement
![alt text](/104515.png)