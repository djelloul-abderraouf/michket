# Spécifications fonctionnelles — CRM 3D Lamp (système cible)

**Version** : 1.1
**Périmètre** : Refonte du CRM Airtable en application web sur mesure (Next.js + Supabase)

> **Changelog v1.1** : Le module Stock (matières premières / produits finis) est retiré du périmètre pour cette version. Les statuts de production sont désormais changés manuellement par la Fabrication, sans vérification ni déduction automatique de stock. Le module pourra être réintroduit dans une phase ultérieure si besoin.

---

## 1. Introduction

### 1.1 Objectif du document
Ce document décrit précisément ce que le système cible doit faire : les fonctionnalités, les règles de gestion, les droits par rôle et les cas d'utilisation. Il sert de référence pour le développement et la recette (tests d'acceptation).

### 1.2 Contexte
Mickket gère la vente et la production de lampes imprimées en 3D. L'activité actuelle repose sur Airtable, réparti en plusieurs bases (CRM ventes, suivi de commandes, atelier, livraison). Le système cible remplace cet ensemble par une application unique, avec des droits d'accès réels par rôle et des fonctionnalités que le no-code ne permet pas facilement (statistiques croisées, historique fiable, automatisations ciblées).

### 1.3 Objectifs du système cible
- Centraliser le cycle complet : contact → affaire → commande → fabrication → livraison
- Donner à chaque rôle uniquement les écrans et actions dont il a besoin
- Garder le suivi de fabrication simple et manuel pour cette version (pas de gestion de stock pour le moment)
- Fournir des statistiques fiables par pôle (vente, confirmation, fabrication, livraison)
- Tracer l'historique de chaque commande (qui a fait quoi, quand)

---

## 2. Acteurs du système

| Acteur | Description |
|---|---|
| **Admin** | Supervise l'ensemble, gère les utilisateurs et les paramètres |
| **Commercial** | Gère les contacts, entreprises, affaires et devis |
| **Confirmation** | Appelle les clients pour valider les nouvelles commandes |
| **Atelier / Design** | Conçoit et fait évoluer le catalogue de produits |
| **Fabrication** | Produit les lampes, met à jour manuellement l'avancement |
| **Préparation** | Emballe les commandes prêtes, contrôle qualité |
| **Livraison** | Expédie et suit les colis jusqu'à leur remise |

Un même compte peut cumuler plusieurs rôles si nécessaire (ex. une petite équipe où une personne fait Confirmation + Préparation) ; le système doit permettre l'attribution de plusieurs rôles à un utilisateur (voir RF-U03).

---

## 3. Exigences fonctionnelles par module

Chaque exigence est identifiée par un code (RF-XXX) pour être tracée jusqu'aux tests de recette.

### 3.1 Authentification & utilisateurs

| Code | Exigence |
|---|---|
| RF-U01 | Le système doit permettre la connexion par email + mot de passe. |
| RF-U02 | Un utilisateur désactivé ne doit plus pouvoir se connecter, sans suppression de ses données historiques. |
| RF-U03 | Un Admin doit pouvoir créer un utilisateur, lui attribuer un ou plusieurs rôles, et le désactiver. |
| RF-U04 | Chaque utilisateur doit pouvoir modifier son mot de passe et ses informations de profil. |
| RF-U05 | Le système doit journaliser les connexions (date, utilisateur) à des fins d'audit. |

### 3.2 Contacts & Entreprises

| Code | Exigence |
|---|---|
| RF-C01 | Le Commercial et l'Admin doivent pouvoir créer, modifier et rechercher un contact (nom, prénom, téléphone, email, wilaya, type particulier/professionnel). |
| RF-C02 | Le système doit empêcher la création d'un doublon strict (même numéro de téléphone) et proposer de fusionner ou d'ouvrir la fiche existante. |
| RF-C03 | Un contact professionnel doit pouvoir être rattaché à une fiche Entreprise. |
| RF-C04 | La fiche contact doit afficher l'historique de ses commandes et de ses activités commerciales. |
| RF-C05 | Le Commercial et l'Admin doivent pouvoir créer et modifier une fiche Entreprise (nom, secteur, conditions commerciales). |

### 3.3 Affaires & Propositions (pipeline de vente)

| Code | Exigence |
|---|---|
| RF-A01 | Le Commercial doit pouvoir créer une Affaire liée à un Contact ou une Entreprise, avec un montant estimé et une étape (Prospection, Qualification, Devis envoyé, Négociation, Gagnée, Perdue). |
| RF-A02 | Le système doit permettre de faire glisser une Affaire d'une étape à l'autre (vue Kanban) ou de changer l'étape depuis la fiche. |
| RF-A03 | Le Commercial doit pouvoir créer une Proposition (devis) liée à une Affaire, avec une liste de produits, quantités et un montant total calculé automatiquement. |
| RF-A04 | Lorsqu'une Affaire passe à l'étape "Gagnée", le système doit proposer de générer automatiquement une ou plusieurs Commandes à partir de la Proposition acceptée, avec le statut initial "Confirmé" (pas de re-confirmation nécessaire, la vente est déjà actée). |
| RF-A05 | Le Commercial doit pouvoir enregistrer une Activité commerciale (appel, message, visite) liée à un Contact ou une Affaire, avec date et description. |
| RF-A06 | Le tableau de bord des ventes doit afficher : nombre d'affaires par étape, montant total du pipeline, taux de conversion devis → commande, sur une période choisie. |

### 3.4 Commandes

| Code | Exigence |
|---|---|
| RF-CM01 | Le Commercial, la Confirmation et l'Admin doivent pouvoir créer une commande directement (sans passer par une Affaire), avec nom client, téléphone, wilaya, produit(s), quantité, notes. |
| RF-CM02 | Une commande créée directement doit démarrer au statut "Pas confirmé". |
| RF-CM03 | Le système doit présenter les commandes sous forme de tableau Kanban, colonnes = statuts (Pas confirmé, Confirmé, En fabrication, En préparation, En livraison, Livré), avec le nombre de commandes par colonne. |
| RF-CM04 | Chaque changement de statut doit être enregistré dans un historique horodaté avec l'auteur du changement. |
| RF-CM05 | Le système doit interdire un changement de statut non autorisé pour le rôle de l'utilisateur connecté (voir matrice des droits, section 4) et afficher un message explicite en cas de tentative refusée. |
| RF-CM06 | La fiche commande doit afficher : informations client, produit(s), statut actuel, notes, historique complet des changements de statut. |
| RF-CM07 | Le système doit permettre de rechercher/filtrer les commandes par wilaya, statut, période, ou nom client. |

### 3.5 Confirmation

| Code | Exigence |
|---|---|
| RF-CF01 | La Confirmation doit disposer d'une vue dédiée listant uniquement les commandes au statut "Pas confirmé". |
| RF-CF02 | La Confirmation doit pouvoir faire passer une commande à "Confirmé" ou la laisser "Pas confirmé" avec un motif (injoignable, refus, à rappeler). |
| RF-CF03 | Le système doit calculer et afficher le taux de confirmation (commandes confirmées / total) sur une période donnée. |

### 3.6 Atelier & Fabrication

> Simplifié pour cette version : pas de gestion de stock, pas de vérification automatique. La Fabrication avance les commandes manuellement, à sa propre discrétion.

| Code | Exigence |
|---|---|
| RF-F01 | Une commande passée au statut "En fabrication" doit générer automatiquement une entrée dans la file de production, statut "En attente". |
| RF-F02 | La Fabrication doit pouvoir démarrer une production en un clic ("En attente" → "En cours"), sans aucune vérification de stock. |
| RF-F03 | La Fabrication doit pouvoir marquer une production comme terminée ("En cours" → "Terminé") ; le système fait alors passer automatiquement la commande liée au statut "En préparation". |
| RF-F04 | L'Atelier/Design doit pouvoir créer et modifier une fiche produit du catalogue (nom, prix, photo, temps de fabrication moyen). |
| RF-F05 | Un produit doit pouvoir être désactivé du catalogue sans être supprimé (conserve l'historique des commandes passées). |

### 3.7 Stock — hors périmètre (phase future)

Le suivi des matières premières et des produits finis n'est **pas inclus** dans cette version. La Fabrication gère l'avancement des commandes sans que le système ne vérifie ou ne déduise quoi que ce soit automatiquement. Ce module pourra être ajouté ultérieurement si le besoin se confirme, sans remettre en cause le reste de l'architecture (le champ `recette_produit` du modèle de données peut rester en réserve mais n'est utilisé par aucune fonctionnalité active).

### 3.8 Préparation

| Code | Exigence |
|---|---|
| RF-P01 | La Préparation doit disposer d'une vue listant les commandes au statut "En préparation". |
| RF-P02 | La Préparation doit pouvoir marquer une commande comme emballée et contrôlée, avec une case de contrôle qualité obligatoire avant validation. |
| RF-P03 | Une commande validée en Préparation doit passer au statut "En livraison" et devenir visible pour le rôle Livraison. |

### 3.9 Livraison

| Code | Exigence |
|---|---|
| RF-L01 | La Livraison doit disposer d'une vue listant les commandes au statut "En livraison". |
| RF-L02 | Le système doit permettre de créer un colis auprès du transporteur (Yalidine) depuis la fiche commande, et de récupérer un numéro de suivi. |
| RF-L03 | Le système doit afficher le statut de livraison en temps réel (ou quasi temps réel) remonté par Yalidine sur la fiche commande. |
| RF-L04 | La Livraison doit pouvoir marquer une commande "Livrée" ou "Retour/Échec" avec un motif. |
| RF-L05 | Le système doit calculer le délai moyen entre expédition et livraison, et le taux de retour par wilaya. |

### 3.10 Projets & Tâches

| Code | Exigence |
|---|---|
| RF-T01 | Tout utilisateur doit pouvoir créer une tâche, l'assigner à un collègue, lui donner une échéance et une priorité. |
| RF-T02 | Une tâche doit pouvoir être rattachée à un projet (regroupement de tâches liées à un même objectif) ou rester isolée. |
| RF-T03 | Chaque utilisateur doit voir une liste de "mes tâches" filtrée sur les tâches qui lui sont assignées. |

### 3.11 Statistiques

| Code | Exigence |
|---|---|
| RF-ST01 | Le système doit afficher un tableau de bord global (Admin) : commandes par statut, CA, taux de confirmation, délai moyen bout en bout, top wilayas, produits les plus vendus. |
| RF-ST02 | Chaque rôle doit avoir accès à un sous-ensemble de statistiques pertinent pour son activité (voir section 4). |
| RF-ST03 | Les statistiques doivent pouvoir être filtrées par période (jour, semaine, mois, personnalisée). |

---

## 4. Matrice des droits par rôle

| Fonction | Admin | Commercial | Confirmation | Atelier/Design | Fabrication | Préparation | Livraison |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Gérer les contacts/affaires | ✔ | ✔ | Lecture | — | — | — | — |
| Créer une commande | ✔ | ✔ | ✔ | — | — | — | — |
| Confirmer/rejeter une commande | ✔ | — | ✔ | — | — | — | — |
| Gérer le catalogue produit | ✔ | Lecture | — | ✔ | Lecture | — | — |
| Démarrer/terminer une production | ✔ | — | — | — | ✔ | — | — |
| Valider une préparation | ✔ | — | — | — | — | ✔ | — |
| Suivre/mettre à jour une livraison | ✔ | — | — | — | — | Lecture | ✔ |
| Voir les statistiques globales | ✔ | — | — | — | — | — | — |
| Voir ses propres statistiques | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Gérer les utilisateurs | ✔ | — | — | — | — | — | — |

*(La ligne "Gérer le stock" est retirée, ce module étant hors périmètre pour cette version.)*

---

## 5. Règles de gestion

- **RG-01** — Une commande ne peut avoir qu'un seul statut actif à la fois ; tout changement passe par la transition définie dans la matrice des droits (section 4).
- **RG-02** — Le changement de statut de production ("En attente" → "En cours" → "Terminé") est entièrement manuel, à la discrétion de la Fabrication ; aucune vérification de stock n'est appliquée.
- **RG-03** — Une commande ne peut être marquée "Livrée" que si elle est passée par "En livraison" au préalable (pas de saut d'étape).
- **RG-04** — Une Affaire "Gagnée" doit obligatoirement être liée à au moins une Proposition acceptée avant de pouvoir générer une commande.
- **RG-05** — Un produit désactivé du catalogue ne peut plus être sélectionné dans une nouvelle commande, mais reste visible dans les commandes existantes.
- **RG-06** — Toute action de changement de statut doit être horodatée et attribuée à un utilisateur (pas d'action anonyme).

---

## 6. Cas d'utilisation principaux

### UC-01 — Confirmer une commande
**Acteur** : Confirmation
**Déclencheur** : Une nouvelle commande apparaît au statut "Pas confirmé"
**Scénario nominal** :
1. La Confirmation ouvre la vue "À confirmer"
2. Sélectionne une commande, appelle le client
3. Marque la commande "Confirmé"
**Scénario alternatif** : client injoignable → la commande reste "Pas confirmé" avec un motif et une date de rappel

### UC-02 — Produire une commande
**Acteur** : Fabrication
**Déclencheur** : Commande passée à "En fabrication"
**Scénario nominal** :
1. La Fabrication ouvre la file de production
2. Démarre la production ("En attente" → "En cours") d'un clic
3. Termine la production ("En cours" → "Terminé") → la commande passe automatiquement à "En préparation"

*(Plus de vérification ni de déduction de stock à cette étape.)*

### UC-03 — Expédier une commande
**Acteur** : Livraison
**Déclencheur** : Commande passée à "En livraison" par la Préparation
**Scénario nominal** :
1. La Livraison ouvre la commande, crée le colis Yalidine
2. Le numéro de suivi est enregistré, le statut Yalidine est affiché
3. À réception de la confirmation de livraison, la commande passe "Livré"
**Scénario alternatif** : échec de livraison → statut "Retour" avec motif

### UC-04 — Convertir une affaire en commande
**Acteur** : Commercial
**Déclencheur** : Une affaire passe à l'étape "Gagnée"
**Scénario nominal** :
1. Le Commercial confirme la conversion
2. Le système génère une commande à partir de la proposition acceptée, statut "Confirmé"
3. La commande est visible dans le Kanban commandes, prête pour la fabrication

---

## 7. Exigences non fonctionnelles

| Catégorie | Exigence |
|---|---|
| Performance | Le Kanban commandes doit s'afficher en moins de 2 secondes pour un volume de 1000 commandes actives. |
| Disponibilité | Le système doit être accessible 99% du temps hors maintenance planifiée. |
| Sécurité | Chaque appel à la base de données doit être filtré par les règles de sécurité au niveau ligne (RLS) selon le rôle, indépendamment du frontend. |
| Traçabilité | Toute modification de statut de commande doit être conservée sans possibilité de suppression (log en écriture seule). |
| Ergonomie | L'interface doit rester utilisable sur tablette pour les rôles Fabrication/Préparation qui travaillent debout à l'atelier. |
| Compatibilité | L'application doit fonctionner sur les navigateurs Chrome et Safari récents, desktop et mobile. |
| Sauvegarde | La base de données doit être sauvegardée quotidiennement (géré par Supabase). |

---

## 8. Glossaire

| Terme | Définition |
|---|---|
| Affaire | Opportunité de vente en cours de négociation, surtout pour le B2B |
| Wilaya | Division administrative en Algérie (équivalent d'une région/province) |
| Yalidine | Service de livraison utilisé pour l'expédition des commandes |
| Statut | État d'avancement d'une commande dans le processus (Pas confirmé → ... → Livré) |
| RLS | Row Level Security — mécanisme Supabase de restriction d'accès aux données par ligne |

---

## Points à valider avec toi

1. Confirmer si le pipeline Affaires/Propositions doit être obligatoire aussi pour les commandes B2C, ou rester réservé au B2B (impacte RF-A04).
2. Confirmer la disponibilité d'un accès API Yalidine (impacte RF-L02/RF-L03).
3. Confirmer si plusieurs rôles peuvent être cumulés par un même utilisateur (RF-U03) ou si un compte = un seul rôle.
