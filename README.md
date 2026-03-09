# Projekt Yarrrrrr - Back API

API Express.js pour la gestion des utilisateurs avec MongoDB et authentification.

## 📋 Table des matières

- [Installation](#installation)
- [Configuration MongoDB Compass](#configuration-mongodb-compass)
- [Structure des données](#structure-des-données)
- [Routes disponibles](#routes-disponibles)
- [Utilisation](#utilisation)

---

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm i
```

### 2. Vérifier les dépendances requises

```bash
npm list
```

Vous devriez avoir:

- `express` - Framework web
- `mongoose` - ODM MongoDB
- `bcryptjs` - Chiffrement des passwords
- `swagger-jsdoc` & `swagger-ui-express` - Documentation API
- `cors` - Gestion des requêtes cross-origin

### 3. Démarrer le serveur

```bash
# Mode développement (avec auto-refresh)
npm run dev

```

Le serveur démarre sur `http://localhost:3001`

---

## 🗄️ Configuration MongoDB Compass

### Créer la base de données

1. **Ouvrir MongoDB Compass**
   - Adresse: `mongodb://localhost:27017`
   - Cliquer sur "Connect"

2. **Créer une nouvelle base**
   - Clic droit dans le volet gauche ou bouton "+"
   - Nom de la base: `Yarrrrrr`
   - Nom de la collection: `users`

3. **Insérer les données initiales**

Si vous voulez pré-charger l'utilisateur admin, vous pouvez:

- Cliquer sur la collection `users`
- Bouton `ADD DATA`
- Coller le JSON: ou importer /data/user.json

```json
{
  "id": 1,
  "username": "admin",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36CHqZ66",
  "genre": "autre",
  "niveau": 6,
  "photoProfil": [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=admin-1",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=admin-2",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=admin-3"
  ]
}
```

> Password: `admin` (hashé avec bcrypt)

---

## 📊 Structure des données

### Collection: `users`

```javascript
{
  "_id": ObjectId,           // ID MongoDB (auto-généré)
  "id": Number,              // ID utilisateur (auto-increment: 1, 2, 3...)
  "username": String,        // Nom d'utilisateur (UNIQUE)
  "password": String,        // Password hashé avec bcrypt
  "genre": String,           // Genre/Sexe (ex: "autre", "homme", "femme")
  "niveau": Number,          // Niveau de joueur (ex: 1, 6)
  "photoProfil": [String]    // Array des URLs de photos
}
```

### Exemples de données valides

#### Utilisateur basique

```json
{
  "id": 2,
  "username": "player1",
  "password": "$2a$10$...",
  "genre": "homme",
  "niveau": 3,
  "photoProfil": ["http://localhost:3000/assets/avatar/1"]
}
```

#### Utilisateur avec plusieurs photos

```json
{
  "id": 3,
  "username": "player2",
  "password": "$2a$10$...",
  "genre": "femme",
  "niveau": 5,
  "photoProfil": [
    "http://localhost:3000/assets/avatar/1",
    "http://localhost:3000/assets/avatar/2",
    "http://localhost:3000/assets/avatar/3"
  ]
}
```

---

## 🔌 Routes disponibles

### 📝 Authentification

#### Créer un utilisateur

```
POST /api/auth/register
```

**Body:**

```json
{
  "username": "newuser",
  "password": "password123",
  "genre": "autre",
  "photoIndex": 1
}
```

**Réponse (201):**

```json
{
  "message": "Utilisateur créé avec succès",
  "userId": "507f1f77bcf86cd799439011"
}
```

---

#### Connexion utilisateur

```
POST /api/auth/login
```

**Body:**

```json
{
  "username": "admin",
  "password": "admin"
}
```

**Réponse (200):**

```json
{
  "message": "Connexion réussie",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "genre": "autre",
    "niveau": 6,
    "photoProfil": [...]
  }
}
```

---

### 👥 Gestion des utilisateurs

#### Recuperer tous les utilisateurs

```
GET /api/users
```

**Réponse (200):**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "id": 1,
    "username": "admin",
    "genre": "autre",
    "niveau": 6,
    "photoProfil": [...]
  },
  ...
]
```

---

#### Récupérer un utilisateur par username

```
GET /api/users/:username
```

**Exemple:** `GET /api/users/admin`

**Réponse (200):**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": 1,
  "username": "admin",
  "password": "$2a$10$...",
  "genre": "autre",
  "niveau": 6,
  "photoProfil": [...]
}
```

---

#### Mettre à jour un utilisateur

```
PUT /api/users/:username
```

**Exemple:** `PUT /api/users/admin`

**Body** (tous les champs sont optionnels):

```json
{
  "genre": "homme",
  "niveau": 10,
  "photoProfil": [
    "http://localhost:3000/assets/avatar/2",
    "http://localhost:3000/assets/avatar/3"
  ]
}
```

**Réponse (200):**

```json
{
  "message": "Utilisateur mis à jour avec succès",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "id": 1,
    "username": "admin",
    "genre": "homme",
    "niveau": 10,
    "photoProfil": [...]
  }
}
```

---

#### Supprimer un utilisateur

```
DELETE /api/users/:username
```

**Exemple:** `DELETE /api/users/admin`

**Réponse (200):**

```json
{
  "message": "Utilisateur supprimé avec succès",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "id": 1,
    "username": "admin",
    "genre": "autre",
    "niveau": 6,
    "photoProfil": [...]
  }
}
```

---

## 💡 Utilisation

### Tester avec Swagger UI

1. Démarrer le serveur: `npm run dev`
2. Ouvrir: `http://localhost:3001/api-docs`
3. Utiliser l'interface pour tester toutes les routes

### Tester avec Postman/Insomnia

1. **Créer un utilisateur:**

   ```
   POST http://localhost:3001/api/auth/register
   Content-Type: application/json

   {
     "username": "test",
     "password": "test123",
     "genre": "autre",
     "photoIndex": 1
   }
   ```

2. **Se connecter:**

   ```
   POST http://localhost:3001/api/auth/login
   Content-Type: application/json

   {
     "username": "test",
     "password": "test123"
   }
   ```

3. **Récupérer l'utilisateur:**

   ```
   GET http://localhost:3001/api/users/test
   ```

4. **Mettre à jour:**

   ```
   PUT http://localhost:3001/api/users/test
   Content-Type: application/json

   {
     "niveau": 10
   }
   ```

---

## 🔐 Sécurité

- Les passwords sont hashés avec **bcrypt** (salt: 10)
- Le username est **unique** dans la BDD
- Les erreurs ne révèlent pas d'infos sensibles

---

## 📂 Structure du projet

```
projet-final-back-yarrrrrr/
├── index.js              # Point d'entrée principal
├── connect.js            # Configuration MongoDB
├── package.json
├── routes/
│   ├── auth.js          # Routes d'authentification (login/register)
│   └── user.js          # Routes CRUD utilisateurs
├── schema/
│   └── user.js          # Schéma Mongoose User
├── data/
│   └── user.json        # Données initiales
└── assets/
    └── avatar/          # Photos de profil
```

---

## 🐛 Dépannage

### "Connect ECONNREFUSED 127.0.0.1:27017"

❌ MongoDB n'est pas démarré
✅ Lancez MongoDB: `mongod` ou ouvrez MongoDB Compass

### "Username già esistente"

❌ Le username existe déjà
✅ Utilisez un username unique

### "Password incorrect"

❌ Le password n'est pas bon
✅ Vérifiez le mot de passe

### Les données ne s'affichent pas dans Compass

❌ Vous devez rafraîchir
✅ Appuyez sur F5 ou cliquez le bouton refresh dans Compass

---

## 📚 Ressources

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [Swagger/OpenAPI](https://swagger.io/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)

---

**Créé le 24 février 2026** 🚀
