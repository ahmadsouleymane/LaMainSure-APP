// Mock data for design prototype screens.
// Ported from the design handoff bundle (chats/chat1.md).

export type Category = { slug: string; name: string; icon: IconName };

export type Service = { title: string; desc: string; price: number; durationMin: number | null };

export type Pro = {
  id: string;
  name: string;
  fullName: string;
  avatar: string;
  city: string;
  neighborhood: string;
  lat: number;
  lng: number;
  bio: string;
  yearsExperience: number;
  tags: string[];
  rating: number;
  reviews: number;
  distance: string;
  verified: boolean;
  accent: boolean;
  responseTime: string;
  completedJobs: number;
  services: Service[];
  availability: string[];
  portfolio: number;
};

// Centroids approximatifs par quartier (utilisés pour la carte de la recherche).
export const CITY_CENTERS = {
  abidjan: { lat: 5.345317, lng: -4.024429 },
  dakar:   { lat: 14.6928,  lng: -17.4467 },
} as const;

// Villes majeures du continent africain — utilisé pour le zoom carte et fallbacks régionaux.
// Couvre l'ensemble du continent : Afrique de l'Ouest, Centrale, Nord, Est, Sud, îles.
export type AfricanCity = { slug: string; name: string; country: string; lat: number; lng: number };

export const AFRICAN_CITIES: AfricanCity[] = [
  // Afrique de l'Ouest
  { slug: 'abidjan',     name: 'Abidjan',      country: 'Côte d\'Ivoire',         lat: 5.3453,  lng: -4.0244 },
  { slug: 'yamoussoukro',name: 'Yamoussoukro', country: 'Côte d\'Ivoire',         lat: 6.8276,  lng: -5.2893 },
  { slug: 'bouake',      name: 'Bouaké',       country: 'Côte d\'Ivoire',         lat: 7.6906,  lng: -5.0301 },
  { slug: 'dakar',       name: 'Dakar',        country: 'Sénégal',                lat: 14.6928, lng: -17.4467 },
  { slug: 'thies',       name: 'Thiès',        country: 'Sénégal',                lat: 14.7886, lng: -16.9260 },
  { slug: 'saint-louis', name: 'Saint-Louis',  country: 'Sénégal',                lat: 16.0179, lng: -16.4896 },
  { slug: 'bamako',      name: 'Bamako',       country: 'Mali',                   lat: 12.6392, lng: -8.0029 },
  { slug: 'conakry',     name: 'Conakry',      country: 'Guinée',                 lat: 9.6412,  lng: -13.5784 },
  { slug: 'lome',        name: 'Lomé',         country: 'Togo',                   lat: 6.1725,  lng: 1.2314 },
  { slug: 'cotonou',     name: 'Cotonou',      country: 'Bénin',                  lat: 6.3654,  lng: 2.4183 },
  { slug: 'porto-novo',  name: 'Porto-Novo',   country: 'Bénin',                  lat: 6.4969,  lng: 2.6289 },
  { slug: 'ouagadougou', name: 'Ouagadougou',  country: 'Burkina Faso',           lat: 12.3714, lng: -1.5197 },
  { slug: 'niamey',      name: 'Niamey',       country: 'Niger',                  lat: 13.5117, lng: 2.1251 },
  { slug: 'nouakchott',  name: 'Nouakchott',   country: 'Mauritanie',             lat: 18.0735, lng: -15.9582 },
  { slug: 'banjul',      name: 'Banjul',       country: 'Gambie',                 lat: 13.4549, lng: -16.5790 },
  { slug: 'bissau',      name: 'Bissau',       country: 'Guinée-Bissau',          lat: 11.8636, lng: -15.5977 },
  { slug: 'freetown',    name: 'Freetown',     country: 'Sierra Leone',           lat: 8.4844,  lng: -13.2299 },
  { slug: 'monrovia',    name: 'Monrovia',     country: 'Libéria',                lat: 6.3007,  lng: -10.7969 },
  { slug: 'lagos',       name: 'Lagos',        country: 'Nigéria',                lat: 6.5244,  lng: 3.3792 },
  { slug: 'abuja',       name: 'Abuja',        country: 'Nigéria',                lat: 9.0765,  lng: 7.3986 },
  { slug: 'kano',        name: 'Kano',         country: 'Nigéria',                lat: 12.0022, lng: 8.5920 },
  { slug: 'accra',       name: 'Accra',        country: 'Ghana',                  lat: 5.6037,  lng: -0.1870 },
  { slug: 'kumasi',      name: 'Kumasi',       country: 'Ghana',                  lat: 6.6885,  lng: -1.6244 },
  { slug: 'praia',       name: 'Praia',        country: 'Cabo Verde',             lat: 14.9333, lng: -23.5133 },
  // Afrique Centrale
  { slug: 'yaounde',     name: 'Yaoundé',      country: 'Cameroun',               lat: 3.8480,  lng: 11.5021 },
  { slug: 'douala',      name: 'Douala',       country: 'Cameroun',               lat: 4.0511,  lng: 9.7679 },
  { slug: 'libreville',  name: 'Libreville',   country: 'Gabon',                  lat: 0.4162,  lng: 9.4673 },
  { slug: 'brazzaville', name: 'Brazzaville',  country: 'Congo',                  lat: -4.2634, lng: 15.2429 },
  { slug: 'kinshasa',    name: 'Kinshasa',     country: 'RD Congo',               lat: -4.4419, lng: 15.2663 },
  { slug: 'lubumbashi',  name: 'Lubumbashi',   country: 'RD Congo',               lat: -11.6876,lng: 27.5026 },
  { slug: 'bangui',      name: 'Bangui',       country: 'Centrafrique',           lat: 4.3947,  lng: 18.5582 },
  { slug: 'ndjamena',    name: 'N\'Djamena',   country: 'Tchad',                  lat: 12.1348, lng: 15.0557 },
  { slug: 'malabo',      name: 'Malabo',       country: 'Guinée équatoriale',     lat: 3.7521,  lng: 8.7740 },
  { slug: 'sao-tome',    name: 'São Tomé',     country: 'São Tomé-et-Príncipe',   lat: 0.1864,  lng: 6.6131 },
  // Afrique du Nord
  { slug: 'casablanca',  name: 'Casablanca',   country: 'Maroc',                  lat: 33.5731, lng: -7.5898 },
  { slug: 'rabat',       name: 'Rabat',        country: 'Maroc',                  lat: 34.0209, lng: -6.8416 },
  { slug: 'marrakech',   name: 'Marrakech',    country: 'Maroc',                  lat: 31.6295, lng: -7.9811 },
  { slug: 'tanger',      name: 'Tanger',       country: 'Maroc',                  lat: 35.7595, lng: -5.8340 },
  { slug: 'fes',         name: 'Fès',          country: 'Maroc',                  lat: 34.0181, lng: -5.0078 },
  { slug: 'alger',       name: 'Alger',        country: 'Algérie',                lat: 36.7538, lng: 3.0588 },
  { slug: 'oran',        name: 'Oran',         country: 'Algérie',                lat: 35.6911, lng: -0.6417 },
  { slug: 'tunis',       name: 'Tunis',        country: 'Tunisie',                lat: 36.8065, lng: 10.1815 },
  { slug: 'sfax',        name: 'Sfax',         country: 'Tunisie',                lat: 34.7406, lng: 10.7603 },
  { slug: 'tripoli',     name: 'Tripoli',      country: 'Libye',                  lat: 32.8872, lng: 13.1913 },
  { slug: 'benghazi',    name: 'Benghazi',     country: 'Libye',                  lat: 32.1167, lng: 20.0667 },
  { slug: 'le-caire',    name: 'Le Caire',     country: 'Égypte',                 lat: 30.0444, lng: 31.2357 },
  { slug: 'alexandrie',  name: 'Alexandrie',   country: 'Égypte',                 lat: 31.2001, lng: 29.9187 },
  { slug: 'khartoum',    name: 'Khartoum',     country: 'Soudan',                 lat: 15.5007, lng: 32.5599 },
  // Afrique de l'Est
  { slug: 'addis-abeba', name: 'Addis-Abeba',  country: 'Éthiopie',               lat: 9.0320,  lng: 38.7469 },
  { slug: 'nairobi',     name: 'Nairobi',      country: 'Kenya',                  lat: -1.2921, lng: 36.8219 },
  { slug: 'mombasa',     name: 'Mombasa',      country: 'Kenya',                  lat: -4.0435, lng: 39.6682 },
  { slug: 'kampala',     name: 'Kampala',      country: 'Ouganda',                lat: 0.3476,  lng: 32.5825 },
  { slug: 'kigali',      name: 'Kigali',       country: 'Rwanda',                 lat: -1.9441, lng: 30.0619 },
  { slug: 'bujumbura',   name: 'Bujumbura',    country: 'Burundi',                lat: -3.3614, lng: 29.3599 },
  { slug: 'dar-es-salaam', name: 'Dar es Salaam', country: 'Tanzanie',            lat: -6.7924, lng: 39.2083 },
  { slug: 'dodoma',      name: 'Dodoma',       country: 'Tanzanie',               lat: -6.1630, lng: 35.7516 },
  { slug: 'mogadiscio',  name: 'Mogadiscio',   country: 'Somalie',                lat: 2.0469,  lng: 45.3182 },
  { slug: 'djibouti',    name: 'Djibouti',     country: 'Djibouti',               lat: 11.5886, lng: 43.1453 },
  { slug: 'asmara',      name: 'Asmara',       country: 'Érythrée',               lat: 15.3229, lng: 38.9251 },
  { slug: 'juba',        name: 'Juba',         country: 'Soudan du Sud',          lat: 4.8594,  lng: 31.5713 },
  // Afrique Australe
  { slug: 'johannesburg', name: 'Johannesburg', country: 'Afrique du Sud',        lat: -26.2041,lng: 28.0473 },
  { slug: 'le-cap',      name: 'Le Cap',       country: 'Afrique du Sud',         lat: -33.9249,lng: 18.4241 },
  { slug: 'durban',      name: 'Durban',       country: 'Afrique du Sud',         lat: -29.8587,lng: 31.0218 },
  { slug: 'pretoria',    name: 'Pretoria',     country: 'Afrique du Sud',         lat: -25.7479,lng: 28.2293 },
  { slug: 'gaborone',    name: 'Gaborone',     country: 'Botswana',               lat: -24.6282,lng: 25.9231 },
  { slug: 'windhoek',    name: 'Windhoek',     country: 'Namibie',                lat: -22.5609,lng: 17.0658 },
  { slug: 'harare',      name: 'Harare',       country: 'Zimbabwe',               lat: -17.8252,lng: 31.0335 },
  { slug: 'lusaka',      name: 'Lusaka',       country: 'Zambie',                 lat: -15.3875,lng: 28.3228 },
  { slug: 'lilongwe',    name: 'Lilongwe',     country: 'Malawi',                 lat: -13.9626,lng: 33.7741 },
  { slug: 'maputo',      name: 'Maputo',       country: 'Mozambique',             lat: -25.9692,lng: 32.5732 },
  { slug: 'maseru',      name: 'Maseru',       country: 'Lesotho',                lat: -29.3142,lng: 27.4833 },
  { slug: 'mbabane',     name: 'Mbabane',      country: 'Eswatini',               lat: -26.3054,lng: 31.1367 },
  { slug: 'luanda',      name: 'Luanda',       country: 'Angola',                 lat: -8.8390, lng: 13.2894 },
  // Îles
  { slug: 'antananarivo',name: 'Antananarivo', country: 'Madagascar',             lat: -18.8792,lng: 47.5079 },
  { slug: 'port-louis',  name: 'Port-Louis',   country: 'Maurice',                lat: -20.1609,lng: 57.5012 },
  { slug: 'victoria',    name: 'Victoria',     country: 'Seychelles',             lat: -4.6796, lng: 55.4920 },
  { slug: 'moroni',      name: 'Moroni',       country: 'Comores',                lat: -11.7172,lng: 43.2473 },
];

export type IconName = string;

export const CATEGORIES: Category[] = [
  { slug: 'all', name: 'Toutes', icon: 'grid' },
  { slug: 'plomberie', name: 'Plomberie', icon: 'wrench' },
  { slug: 'electricite', name: 'Électricité', icon: 'zap' },
  { slug: 'menuiserie', name: 'Menuiserie', icon: 'hammer' },
  { slug: 'peinture', name: 'Peinture', icon: 'paint' },
  { slug: 'couture', name: 'Couture', icon: 'scissors' },
  { slug: 'coiffure', name: 'Coiffure', icon: 'sparkles' },
  { slug: 'design', name: 'Design', icon: 'palette' },
  { slug: 'dev-web', name: 'Développement', icon: 'code' },
  { slug: 'beatmaking', name: 'Beatmaking', icon: 'music' },
  { slug: 'photographie', name: 'Photographie', icon: 'camera' },
];

export const PROS: Pro[] = [
  {
    id: 'p1', name: 'Plomberie Moussa', fullName: 'Moussa Diallo',
    avatar: 'https://i.pravatar.cc/300?img=12',
    city: 'Abidjan', neighborhood: 'Cocody', lat: 5.3597, lng: -3.9853,
    bio: "Plombier certifié, interventions rapides à Abidjan. 12 ans d'expérience, équipe de 3 personnes, devis gratuit.",
    yearsExperience: 12, tags: ['Plomberie', 'Électricité'],
    rating: 4.7, reviews: 23, distance: '1,2', verified: true, accent: false,
    responseTime: '15 min', completedJobs: 142,
    services: [
      { title: 'Dépannage fuite urgent', desc: "Intervention sous 2h pour fuite d'eau", price: 15000, durationMin: 90 },
      { title: 'Installation chauffe-eau', desc: 'Pose + raccordement complet, garantie 1 an', price: 45000, durationMin: 180 },
      { title: 'Débouchage canalisation', desc: 'Furet pro, sans casse', price: 18000, durationMin: 60 },
    ],
    availability: ["Aujourd'hui · 14:00", "Aujourd'hui · 16:30", 'Demain · 09:00', 'Demain · 11:00'],
    portfolio: 6,
  },
  {
    id: 'p2', name: 'Studio Nadia', fullName: 'Nadia Mbaye',
    avatar: 'https://i.pravatar.cc/300?img=47',
    city: 'Dakar', neighborhood: 'Almadies', lat: 14.7382, lng: -17.5204,
    bio: 'Designer UI/UX et créatrice de marques. Identités visuelles, logos, sites vitrine. 7 ans sur des marques africaines.',
    yearsExperience: 7, tags: ['Design', 'Dev'],
    rating: 4.9, reviews: 11, distance: '0,8', verified: true, accent: true,
    responseTime: '1 h', completedJobs: 38,
    services: [
      { title: 'Logo + charte graphique', desc: 'Identité visuelle complète en 7 jours', price: 150000, durationMin: null },
      { title: 'Site vitrine 5 pages', desc: 'Design + dev React, responsive', price: 350000, durationMin: null },
    ],
    availability: ['Demain · 10:00', 'Vendredi · 14:00', 'Lundi · 09:00'],
    portfolio: 12,
  },
  {
    id: 'p3', name: 'Atelier Kouadio', fullName: 'Kouadio Yao',
    avatar: 'https://i.pravatar.cc/300?img=15',
    city: 'Abidjan', neighborhood: 'Yopougon', lat: 5.3367, lng: -4.0826,
    bio: 'Menuisier ébéniste. Meubles sur mesure, réparations, restauration de meubles anciens.',
    yearsExperience: 18, tags: ['Menuiserie'],
    rating: 4.8, reviews: 34, distance: '2,4', verified: true, accent: false,
    responseTime: '2 h', completedJobs: 96,
    services: [
      { title: 'Meuble sur mesure', desc: 'Étagère, table basse, bureau — bois local', price: 80000, durationMin: null },
      { title: 'Réparation meuble', desc: 'Charnières, pieds, finitions', price: 12000, durationMin: 120 },
    ],
    availability: ['Demain · 09:00', 'Demain · 14:00', 'Samedi · 10:00'],
    portfolio: 9,
  },
  {
    id: 'p4', name: 'Aminata Couture', fullName: 'Aminata Touré',
    avatar: 'https://i.pravatar.cc/300?img=44',
    city: 'Abidjan', neighborhood: 'Treichville', lat: 5.2935, lng: -4.0131,
    bio: 'Couturière, retouches et créations sur mesure. Spécialiste wax et bazin.',
    yearsExperience: 9, tags: ['Couture'],
    rating: 4.6, reviews: 18, distance: '3,1', verified: true, accent: true,
    responseTime: '30 min', completedJobs: 74,
    services: [
      { title: 'Retouche pantalon', desc: 'Ourlet, taille, fermeture éclair', price: 3500, durationMin: 30 },
      { title: 'Robe wax sur mesure', desc: '4 essayages, finitions main', price: 35000, durationMin: null },
    ],
    availability: ['Demain · 11:00', 'Samedi · 10:00'],
    portfolio: 14,
  },
  {
    id: 'p5', name: 'Élec Fatou', fullName: 'Fatou Sow',
    avatar: 'https://i.pravatar.cc/300?img=49',
    city: 'Dakar', neighborhood: 'Plateau', lat: 14.6680, lng: -17.4371,
    bio: 'Électricienne indépendante. Installations, dépannages, mise aux normes.',
    yearsExperience: 6, tags: ['Électricité'],
    rating: 4.5, reviews: 9, distance: '4,7', verified: false, accent: false,
    responseTime: '45 min', completedJobs: 22,
    services: [
      { title: 'Tableau électrique', desc: 'Diagnostic + mise aux normes', price: 60000, durationMin: 240 },
      { title: 'Pose prises / interrupteurs', desc: 'Par point, fournitures incluses', price: 6000, durationMin: 45 },
    ],
    availability: ['Vendredi · 09:00', 'Samedi · 14:00'],
    portfolio: 3,
  },
  {
    id: 'p6', name: 'Peintres Konaté', fullName: 'Ibrahim Konaté',
    avatar: 'https://i.pravatar.cc/300?img=68',
    city: 'Abidjan', neighborhood: 'Marcory', lat: 5.2912, lng: -3.9870,
    bio: 'Peinture intérieur / extérieur, enduits décoratifs. Équipe de 4, devis sous 24 h.',
    yearsExperience: 14, tags: ['Peinture'],
    rating: 4.7, reviews: 27, distance: '5,2', verified: true, accent: false,
    responseTime: '1 h', completedJobs: 88,
    services: [
      { title: 'Peinture pièce 20 m²', desc: '2 couches, préparation murs', price: 45000, durationMin: 300 },
      { title: 'Façade maison', desc: 'Devis sur visite', price: 250000, durationMin: null },
    ],
    availability: ['Lundi · 08:00', 'Mardi · 08:00'],
    portfolio: 11,
  },
  {
    id: 'p7', name: 'Salon Awa', fullName: 'Awa Camara',
    avatar: 'https://i.pravatar.cc/300?img=45',
    city: 'Dakar', neighborhood: 'Mermoz', lat: 14.7174, lng: -17.4886,
    bio: 'Coiffeuse à domicile. Tresses, lissages, mèches, soins capillaires naturels.',
    yearsExperience: 11, tags: ['Coiffure'],
    rating: 4.9, reviews: 56, distance: '1,9', verified: true, accent: true,
    responseTime: '20 min', completedJobs: 211,
    services: [
      { title: 'Tresses africaines', desc: 'Au choix : box braids, cornrows, twists', price: 12000, durationMin: 240 },
      { title: 'Soin capillaire complet', desc: 'Diagnostic + masque + brushing', price: 8000, durationMin: 90 },
    ],
    availability: ["Aujourd'hui · 16:00", 'Demain · 10:00'],
    portfolio: 18,
  },
  {
    id: 'p8', name: 'Lens Mamadou', fullName: 'Mamadou Bâ',
    avatar: 'https://i.pravatar.cc/300?img=33',
    city: 'Dakar', neighborhood: 'Ngor', lat: 14.7492, lng: -17.5142,
    bio: 'Photographe mariages, portraits, événements corporate. Studio + extérieur.',
    yearsExperience: 8, tags: ['Photographie'],
    rating: 4.8, reviews: 41, distance: '6,4', verified: true, accent: false,
    responseTime: '3 h', completedJobs: 67,
    services: [
      { title: 'Portrait studio', desc: '1h, 10 photos retouchées livrées', price: 25000, durationMin: 60 },
      { title: 'Mariage demi-journée', desc: '5h, 200 photos, album numérique', price: 180000, durationMin: 300 },
    ],
    availability: ['Samedi · 09:00', 'Dimanche · 14:00'],
    portfolio: 22,
  },
];

export type Conversation = {
  id: string; proId: string; proName: string; lastMessage: string; time: string; unread: number;
};

export const CONVERSATIONS: Conversation[] = [
  { id: 'c1', proId: 'p1', proName: 'Plomberie Moussa', lastMessage: "Je peux passer à 14h aujourd'hui, ça te va ?", time: '11:42', unread: 2 },
  { id: 'c2', proId: 'p2', proName: 'Studio Nadia', lastMessage: 'Voici 3 pistes de logo pour ton retour.', time: 'Hier', unread: 0 },
  { id: 'c3', proId: 'p4', proName: 'Aminata Couture', lastMessage: 'Parfait, on garde le rendez-vous samedi.', time: 'Lun.', unread: 0 },
  { id: 'c4', proId: 'p7', proName: 'Salon Awa', lastMessage: "D'accord, je prévois 4h pour les tresses.", time: 'Lun.', unread: 0 },
];

export type ChatMessage = { id: number; from: 'me' | 'pro'; text: string; time: string };

// Conversations côté pro (clients qui écrivent au pro Moussa).
export type ProConversation = {
  id: string; clientId: string; clientName: string; clientInitials: string; clientAvatar: string;
  service: string; lastMessage: string; time: string; unread: number;
};

export const PRO_CONVERSATIONS: ProConversation[] = [
  { id: 'pc1', clientId: 'i1', clientName: 'Aminata Touré', clientInitials: 'AT', clientAvatar: 'https://i.pravatar.cc/300?img=44', service: 'Dépannage fuite urgent', lastMessage: 'Merci ! Tu peux venir à 14h ?', time: '11:42', unread: 3 },
  { id: 'pc2', clientId: 'i2', clientName: 'Jean-Marc Koffi', clientInitials: 'JK', clientAvatar: 'https://i.pravatar.cc/300?img=52', service: 'Installation chauffe-eau', lastMessage: 'Je viens d\'acheter le ballon, il fait 80L.', time: '10:08', unread: 1 },
  { id: 'pc3', clientId: 'i3', clientName: 'Mariam Diabaté', clientInitials: 'MD', clientAvatar: 'https://i.pravatar.cc/300?img=23', service: 'Débouchage canalisation', lastMessage: 'Top, à demain alors.', time: 'Hier', unread: 0 },
  { id: 'pc4', clientId: 'i4', clientName: 'Serge Brou', clientInitials: 'SB', clientAvatar: 'https://i.pravatar.cc/300?img=60', service: 'Devis salle de bain', lastMessage: 'Je t\'envoie les plans demain matin.', time: 'Lun.', unread: 0 },
  { id: 'pc5', clientId: 'cc5', clientName: 'Fanta Camara', clientInitials: 'FC', clientAvatar: 'https://i.pravatar.cc/300?img=26', service: 'Fuite robinet', lastMessage: 'Parfait, merci beaucoup pour l\'intervention !', time: '5 mai', unread: 0 },
];

export const MESSAGES_C1: ChatMessage[] = [
  { id: 1, from: 'me', text: "Bonjour Moussa, j'ai une fuite sous l'évier de la cuisine.", time: '11:30' },
  { id: 2, from: 'me', text: 'Tu peux passer aujourd’hui ?', time: '11:30' },
  { id: 3, from: 'pro', text: 'Salut ! Oui je peux passer dans l’après-midi.', time: '11:38' },
  { id: 4, from: 'pro', text: 'Tu es à quelle adresse exactement ?', time: '11:38' },
  { id: 5, from: 'me', text: "Cocody, près de la pharmacie Riviera 2. Je t'envoie la localisation.", time: '11:40' },
  { id: 6, from: 'pro', text: "Je peux passer à 14h aujourd'hui, ça te va ?", time: '11:42' },
];

export type Tone = 'success' | 'warning' | 'info' | 'neutral' | 'danger' | 'accent';

export type MyRequest = {
  id: string; proId: string; service: string;
  status: 'confirmed' | 'pending' | 'in-progress' | 'done';
  statusLabel: string; tone: Tone;
  date: string; address: string; price: number; createdAt: string;
};

export const MY_REQUESTS: MyRequest[] = [
  { id: 'r1', proId: 'p1', service: 'Dépannage fuite urgent', status: 'confirmed', statusLabel: 'Confirmée', tone: 'success', date: "Aujourd'hui · 14:00", address: 'Cocody, Riviera 2', price: 15000, createdAt: 'Il y a 2 h' },
  { id: 'r2', proId: 'p2', service: 'Logo + charte graphique', status: 'pending', statusLabel: 'En attente', tone: 'warning', date: 'Devis demandé', address: 'À distance', price: 150000, createdAt: 'Hier' },
  { id: 'r3', proId: 'p4', service: 'Robe wax sur mesure', status: 'in-progress', statusLabel: 'En cours', tone: 'info', date: 'Samedi · 10:00', address: 'Treichville', price: 35000, createdAt: 'Il y a 4 jours' },
  { id: 'r4', proId: 'p3', service: 'Meuble sur mesure', status: 'done', statusLabel: 'Terminée', tone: 'neutral', date: '12 mai 2026', address: 'Yopougon', price: 80000, createdAt: 'Il y a 1 semaine' },
  { id: 'r5', proId: 'p7', service: 'Tresses africaines', status: 'done', statusLabel: 'Terminée', tone: 'neutral', date: '5 mai 2026', address: 'Mermoz', price: 12000, createdAt: 'Il y a 2 semaines' },
];

export type ProInboxItem = {
  id: string; clientName: string; clientInitials: string; clientAvatar: string;
  service: string; urgency?: string; address: string;
  description: string; photos: number; budget: string; createdAt: string;
  status: 'new' | 'pending';
};

export const PRO_INBOX: ProInboxItem[] = [
  { id: 'i1', clientName: 'Aminata Touré', clientInitials: 'AT', clientAvatar: 'https://i.pravatar.cc/300?img=44', service: 'Dépannage fuite urgent', urgency: 'Urgent', address: 'Cocody, Riviera 2 · 1,2 km', description: "Fuite sous l'évier de la cuisine. L'eau coule depuis ce matin, j'ai fermé le robinet général.", photos: 2, budget: '15 000 – 25 000 FCFA', createdAt: 'Il y a 8 min', status: 'new' },
  { id: 'i2', clientName: 'Jean-Marc Koffi', clientInitials: 'JK', clientAvatar: 'https://i.pravatar.cc/300?img=52', service: 'Installation chauffe-eau', address: 'Marcory, Zone 4 · 4,8 km', description: "Remplacement d'un chauffe-eau 80L. Le ballon actuel a 15 ans, je viens d'acheter le neuf.", photos: 3, budget: '40 000 – 55 000 FCFA', createdAt: 'Il y a 1 h', status: 'new' },
  { id: 'i3', clientName: 'Mariam Diabaté', clientInitials: 'MD', clientAvatar: 'https://i.pravatar.cc/300?img=23', service: 'Débouchage canalisation', address: 'Yopougon, Niangon · 6,1 km', description: "Évier de la cuisine bouché, je n'arrive pas à le déboucher avec une ventouse.", photos: 1, budget: 'À discuter', createdAt: 'Hier', status: 'pending' },
  { id: 'i4', clientName: 'Serge Brou', clientInitials: 'SB', clientAvatar: 'https://i.pravatar.cc/300?img=60', service: 'Devis salle de bain complète', address: 'Cocody, Angré · 2,8 km', description: "Refonte complète d'une salle de bain (5 m²). Plomberie, robinetterie, douche italienne.", photos: 6, budget: '350 000 – 500 000 FCFA', createdAt: 'Hier', status: 'pending' },
];

export type Review = { id: string; clientName: string; rating: number; date: string; service: string; text: string; proReply: string | null };

export const REVIEWS_RECEIVED: Review[] = [
  { id: 'rv1', clientName: 'Aminata T.', rating: 5, date: 'il y a 3 jours', service: 'Dépannage fuite urgent', text: 'Très réactif et propre. Fuite réparée en 1h, je recommande.', proReply: null },
  { id: 'rv2', clientName: 'Kouadio Y.', rating: 4, date: 'il y a 2 semaines', service: 'Installation chauffe-eau', text: 'Bon travail, prix correct. Reviendra pour la chaudière.', proReply: 'Merci Kouadio !' },
  { id: 'rv3', clientName: 'Mariam D.', rating: 5, date: 'il y a 3 semaines', service: 'Débouchage canalisation', text: "Pro à l'heure, prix exactement comme annoncé. Parfait.", proReply: null },
  { id: 'rv4', clientName: 'Serge B.', rating: 5, date: 'il y a 1 mois', service: 'Dépannage fuite urgent', text: 'Service rapide même un dimanche soir. Sauvé la mise.', proReply: null },
  { id: 'rv5', clientName: 'Awa C.', rating: 3, date: 'il y a 1 mois', service: 'Pose prises', text: "Travail correct mais a fini avec 1h de retard sur l'horaire annoncé.", proReply: 'Désolé pour le retard Awa, embouteillage imprévu. Merci de ta patience.' },
];

export const PRO_STATS = {
  monthRevenue: 487000,
  monthRevenueDelta: 18,
  acceptedRequests: 14,
  pendingRequests: 4,
  responseRate: 96,
  averageRating: 4.7,
  totalReviews: 23,
};

export const ONBOARDING = [
  { icon: 'search', title: 'Trouve un artisan de confiance', body: 'Plombier, électricien, designer ou couturière — tous vérifiés et près de chez toi.' },
  { icon: 'message', title: 'Discute, réserve, paie', body: 'Un échange direct, un créneau réservé, un acompte sécurisé. Pas de mauvaise surprise.' },
  { icon: 'shield', title: 'Travail garanti', body: 'Si quelque chose cloche, on règle ça ensemble. Avis, signalement, support en français.' },
];

export const ICON_FOR_TAG: Record<string, IconName> = {
  Plomberie: 'wrench', Électricité: 'zap', Menuiserie: 'hammer',
  Peinture: 'paint', Couture: 'scissors', Coiffure: 'sparkles',
  Design: 'palette', Dev: 'code', Beatmaking: 'music', Photographie: 'camera',
};

export function fmtFcfa(n: number): string {
  return n.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' FCFA';
}

export function fmtFcfaShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',') + 'M FCFA';
  if (n >= 1000) return Math.round(n / 1000) + 'k FCFA';
  return n + ' FCFA';
}
