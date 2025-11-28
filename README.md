# 🍽️ Le Gourmet - Application Restaurant

Application React Native/Expo pour kiosque de commande de restaurant avec interface moderne et suivi en temps réel.

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Configuration Base de Données](#-configuration-base-de-données)
- [Démarrage](#-démarrage)
- [Structure du Projet](#-structure-du-projet)
- [API](#-api)
- [Build](#-build)
- [Contribuer](#-contribuer)

## ✨ Fonctionnalités

- 🏠 **Accueil** avec catégories et promotions
- 📱 **Navigation fluide** entre les écrans
- 🍔 **Menu interactif** avec personnalisation des plats
- 🛒 **Panier dynamique** avec gestion des quantités
- 💳 **Passage de commande** avec informations client
- 📊 **Suivi en temps réel** des commandes
- 🎨 **Interface moderne** avec support dark/light mode
- 🗄️ **Base de données** Supabase pour le backend

## 🚀 Installation

### Prérequis

- Node.js 16+ 
- npm ou yarn
- Expo CLI
- Compte Supabase

### 1. Cloner le projet

```bash
git clone https://github.com/beenmoov/kiosque-numerique.git
cd kiosque-numerique
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

Créez un fichier `.env` à la racine :

```env
EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
EXPO_PUBLIC_SUPABASE_KEY=votre_clé_anon_supabase
```

## 🗄️ Configuration Base de Données

### 1. Créer un projet Supabase

- Allez sur [supabase.com](https://supabase.com)
- Créez un nouveau projet
- Notez l'URL et la clé anon dans les paramètres

### 2. Exécuter le script SQL

Dans l'éditeur SQL de Supabase, exécutez :

```sql
-- Création des tables
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  sort_order INTEGER DEFAULT 99
);

CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE order_status AS ENUM ('paid', 'preparing', 'ready', 'completed');

CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number INTEGER,
  guest_name TEXT,
  guest_phone TEXT,
  customer_id UUID REFERENCES customers(id),
  status order_status DEFAULT 'paid',
  total_price NUMERIC NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  options_config JSONB
);

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  selected_options JSONB
);

-- Configuration RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true);

-- Données exemple
INSERT INTO categories (name, image_url, sort_order) VALUES
('Entrées', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 1),
('Plats Principaux', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38', 2),
('Desserts', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', 3),
('Boissons', 'https://images.unsplash.com/photo-1544145945-f90425340c7e', 4);

INSERT INTO products (category_id, name, description, price, image_url, options_config) VALUES
(
  (SELECT id FROM categories WHERE name = 'Plats Principaux'),
  'Burger Classique',
  'Steak haché frais de bœuf, cheddar fondant, sauce secrète et frites croustillantes',
  14.50,
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
  '[{"type": "radio", "title": "Cuisson de la viande", "values": [{"label": "À point", "price_extra": 0}, {"label": "Saignant", "price_extra": 0}, {"label": "Bien cuit", "price_extra": 0}], "required": true}, {"type": "checkbox", "title": "Ajouter un supplément", "values": [{"label": "Bacon (tranche)", "price_extra": 1.50}, {"label": "Fromage extra", "price_extra": 1.00}, {"label": "Oignons caramélisés", "price_extra": 0.50}], "required": false}]'
);
```

### 3. Vérifier la configuration RLS

Dans l'interface Supabase :
- Allez dans **Authentication** → **Policies**
- Vérifiez que toutes les tables ont les politiques activées

## 🏃‍♂️ Démarrage

### Développement

```bash
# Démarrer Expo
npx expo start

# Options de démarrage
npx expo start --android    # Émulateur Android
npx expo start --ios        # Simulateur iOS
npx expo start --web        # Navigateur web
```

### Utilisation

1. **Scanner le QR code** avec l'application Expo Go
2. **Naviguer** dans les catégories
3. **Personnaliser** les plats
4. **Commander** et suivre en temps réel

## 📁 Structure du Projet

```
le-gourmet-app/
├── assets/                 # Images et icônes
├── components/             # Composants réutilisables
├── context/               # Contextes React (CartContext)
├── screens/               # Écrans de l'application
│   ├── HomeScreen.js
│   ├── CategoryProductsScreen.js
│   ├── ProductCustomizationScreen.js
│   ├── OrderSummaryScreen.js
│   └── OrderTrackingScreen.js
├── services/              # Services API
│   ├── categoryService.js
│   ├── productService.js
│   └── orderService.js
├── utils/                 # Utilitaires
│   └── supabase.js
├── App.js                 # Point d'entrée
└── app.json              # Configuration Expo
```

## 🔌 API

### Services Disponibles

- `categoryService` - Gestion des catégories
- `productService` - Gestion des produits
- `orderService` - Gestion des commandes

### Exemple d'utilisation

```javascript
import { categoryService } from './services/categoryService';

// Récupérer toutes les catégories
const categories = await categoryService.getAllCategories();
```

## 📦 Build

### Build Android APK

```bash
# Installer EAS CLI
npm install -g @expo/eas-cli

# Se connecter
npx expo login

# Builder l'APK
eas build --platform android --profile preview
```

### Configuration EAS

Créez `eas.json` :

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajouter ma fonctionnalité'`)
4. Push sur la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🐛 Dépannage

### Problèmes courants

**Erreur RLS Supabase**
```sql
-- Désactiver temporairement RLS pour le développement
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

**Erreur de dépendances**
```bash
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

**Problème de build**
```bash
eas build --platform android --profile preview --clear-cache
```

## 📞 Support

Pour toute question :
- 📧 Email : votre-email@example.com
- 🐛 Issues : [GitHub Issues](https://github.com/votre-username/le-gourmet-app/issues)
- 💬 Discussions : [GitHub Discussions](https://github.com/votre-username/le-gourmet-app/discussions)

---

**Développé avec ❤️ pour les restaurants modernes**
