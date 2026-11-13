/**
 * AUTO3D — base de connaissances des composants.
 *
 * `patterns` sert uniquement à associer les maillages RÉELLEMENT présents
 * dans le GLB à une fiche. Les pièces absentes du modèle gardent une fiche
 * pédagogique (`available: false`) mais n'ont volontairement aucun pattern :
 * on ne fait jamais semblant de sélectionner une géométrie qui n'existe pas.
 *
 * Les textes techniques décrivent des principes généraux ou des observations
 * faites dans le fichier. Aucune puissance, aucun couple et aucune dimension
 * propre à une version réelle ne sont inventés.
 */

export const CATEGORIES = [
  {
    id: 'all',
    label: 'Tous les composants',
    short: 'Tous',
    icon: 'layers',
    description: 'Toutes les pièces et fiches du projet.',
  },
  {
    id: 'exterior',
    label: 'Extérieur',
    short: 'Extérieur',
    icon: 'car',
    description: 'Carrosserie, ouvrants, vitrages et roues.',
  },
  {
    id: 'powertrain',
    label: 'Motorisation & transmission',
    short: 'Motorisation',
    icon: 'engine',
    description: 'Moteur, transmission et circuits annexes.',
  },
  {
    id: 'chassis',
    label: 'Châssis',
    short: 'Châssis',
    icon: 'chassis',
    description: 'Structure porteuse et éléments de coque.',
  },
  {
    id: 'suspension',
    label: 'Suspension',
    short: 'Suspension',
    icon: 'suspension',
    description: 'Liaisons au sol et contrôle du contact pneu-route.',
  },
  {
    id: 'braking',
    label: 'Freinage',
    short: 'Freinage',
    icon: 'brake',
    description: 'Ralentir, stabiliser et arrêter le véhicule.',
  },
  {
    id: 'interior',
    label: 'Habitacle',
    short: 'Habitacle',
    icon: 'seat',
    description: 'Poste de conduite, sécurité et télémétrie.',
  },
  {
    id: 'lighting',
    label: 'Éclairage',
    short: 'Éclairage',
    icon: 'light',
    description: 'Voir, être vu et signaler les intentions.',
  },
]

export const COMPONENTS = [
  {
    id: 'carrosserie',
    name: 'Carrosserie',
    category: 'exterior',
    icon: 'car',
    tagline: 'La peau aérodynamique et protectrice du prototype.',
    description:
      "La carrosserie regroupe les panneaux extérieurs, les passages de roue, les appendices aérodynamiques et les éléments de finition. Sur une voiture de course, elle protège les occupants et les organes mécaniques tout en guidant l'air autour du véhicule.",
    function:
      "Protéger l'habitacle et les organes internes, participer à la rigidité de la coque et produire l'appui aérodynamique nécessaire à haute vitesse.",
    location: "Sur toute la périphérie du véhicule : capot avant, ailes, flancs, pavillon et arrière.",
    technical: [
      ['Rôle structurel', 'Certains panneaux participent à la rigidité ; ils ne sont pas de simples habillages.'],
      ['Aérodynamique', 'Les formes, extracteurs et ailerons orientent le flux d’air et créent de l’appui.'],
      ['Dans le GLB', 'La peinture, les grilles, les finitions et les éléments mécaniques sont répartis en sous-maillages distincts.'],
    ],
    geometryNote:
      "La coque peinte est le maillage le plus dense du modèle. Les détails, grilles et fixations sont des sous-maillages séparés, regroupés ici comme carrosserie.",
    keywords: 'coque peinture panneau aero aileron capot aile carrosserie',
    available: true,
    matchPriority: 0,
    patterns: [], // fallback : tout ce qui n'est pas revendiqué par une fiche plus précise
    statsMeshes: 1,
    didYouKnow:
      "En compétition, la carrosserie est souvent réalisée en composites légers. Une pièce peut être changée rapidement après un contact.",
  },
  {
    id: 'portieres',
    name: 'Portières',
    category: 'exterior',
    icon: 'door',
    tagline: 'Accès à bord et protection latérale.',
    description:
      "Les portières sont des ouvrants montés sur charnières. Elles donnent accès à l'habitacle et intègrent des renforts, des vitrages, des poignées et parfois des éléments de sécurité.",
    function:
      "Permettre l'accès au poste de conduite, fermer la structure latérale et contribuer à la protection en cas de choc.",
    location: "De chaque côté de l'habitacle, entre les passages de roue avant et arrière.",
    technical: [
      ['Cinématique', 'Charnière verticale à l’avant de l’ouvrant ; le mouvement est une rotation autour de l’axe Y.'],
      ['Dans le GLB', 'Les groupes DOOR_L et DOOR_R sont indépendants et contiennent la peinture, les vitres, les panneaux intérieurs et les rétroviseurs.'],
      ['Animation', 'Une rotation autour d’un pivot placé sur la charnière évite de faire tourner la porte autour du centre du véhicule.'],
    ],
    geometryNote:
      "Les deux portières sont des groupes réellement séparés. Le bouton « Portières » anime leurs pivots de charnière ; l’état ouvert ou fermé est réversible.",
    keywords: 'porte ouvrant charniere lateral door',
    available: true,
    matchPriority: 70,
    patterns: [/DOOR_[LR]\b/i],
    didYouKnow:
      "Les vitrages de portière font partie du groupe de la porte : ils suivent donc l’ouverture et l’animation.",
  },
  {
    id: 'vitres',
    name: 'Vitres et vitrage',
    category: 'exterior',
    icon: 'glass',
    tagline: 'Visibilité, aérodynamique et sécurité.',
    description:
      "Le vitrage ferme l'habitacle tout en laissant passer la lumière. Les surfaces vitrées sont calculées pour offrir un champ de vision suffisant sans créer de turbulences excessives.",
    function:
      "Protéger les occupants des projections, assurer la visibilité et participer à la forme aérodynamique de la voiture.",
    location: "Pare-brise, vitres latérales, lunette arrière et vitres de portière.",
    technical: [
      ['Matériaux', 'Verre de sécurité ou polycarbonate selon l’usage ; les voitures de course privilégient la légèreté.'],
      ['Dans le GLB', 'Les vitrages extérieurs et intérieurs utilisent des matériaux transparents distincts.'],
      ['Rendu', 'Les matériaux de verre conservent leurs propriétés d’origine ; le mode transparence ne les altère pas.'],
    ],
    geometryNote:
      "Le pare-brise, les vitres latérales et les vitrages de portière sont identifiables. Cliquer sur une vitre de portière met en évidence le composant vitrage, tandis que la géométrie reste attachée à la porte pour l’animation.",
    keywords: 'vitre vitrage pare-brise windshield window verre glass lunette',
    available: true,
    matchPriority: 80,
    patterns: [/WINDOWS|WINDOW|WINDSHIELD|GLASS_DOOR/i],
    didYouKnow:
      "Le mode transparence de la carrosserie permet d’observer le cockpit sans retirer les vitrages, ce qui aide à comprendre la structure de l’habitacle.",
  },
  {
    id: 'retroviseurs',
    name: 'Rétroviseurs',
    category: 'exterior',
    icon: 'mirror',
    tagline: 'Le champ de vision arrière et latéral.',
    description:
      "Les rétroviseurs placent un miroir à l'extérieur de la carrosserie pour surveiller les véhicules situés derrière et sur les côtés. En course, leur forme est optimisée pour réduire la traînée.",
    function:
      "Offrir au pilote une vision arrière et latérale sans tourner la tête, tout en limitant la perturbation aérodynamique.",
    location: "À l’avant des vitres de portière, de chaque côté du véhicule.",
    technical: [
      ['Dans le GLB', 'Les rétroviseurs gauche et droit sont rattachés aux groupes de portière et possèdent leur propre maillage de miroir.'],
      ['Réglage', 'La surface réfléchissante est matérialisée par une texture dédiée ; aucun réglage dynamique n’est simulé.'],
      ['Aérodynamique', 'Le pied du rétroviseur est profilé pour limiter les turbulences.'],
    ],
    geometryNote:
      "Les deux rétroviseurs extérieurs et le rétroviseur central sont présents. Les rétroviseurs extérieurs suivent l’ouverture des portières.",
    keywords: 'retroviseur miroir mirror lateral',
    available: true,
    matchPriority: 79,
    patterns: [/MIRROR_[LR]\b/i],
  },
  {
    id: 'jantes',
    name: 'Jantes',
    category: 'exterior',
    icon: 'wheel',
    tagline: 'La liaison rigide entre le moyeu et le pneu.',
    description:
      "Les jantes sont les roues métalliques qui supportent les pneus. Elles transmettent les efforts de propulsion, de freinage et de direction, et évacuent une partie de la chaleur dégagée par les freins.",
    function:
      "Maintenir le pneu, transmettre les efforts au sol et participer au refroidissement du système de freinage.",
    location: "Aux quatre coins du véhicule, sur les moyeux de roue.",
    technical: [
      ['Dans le GLB', 'Quatre jantes détaillées sont présentes, avec un maillage de roue et des variantes de rendu.'],
      ['Cinématique', 'Chaque jante tourne autour de l’axe X local de la roue pendant la simulation de roulage.'],
      ['Personnalisation', 'La couleur des jantes est modifiable sans toucher aux pneus, aux vitres ou à la carrosserie.'],
    ],
    geometryNote:
      "Les jantes sont des groupes distincts des disques et des étriers. Elles tournent donc sans entraîner les étriers fixes.",
    keywords: 'jante roue rim alloy wheel',
    available: true,
    matchPriority: 95,
    patterns: [/_RIM_/i],
    didYouKnow:
      "Le modèle contient aussi un maillage de « flou de rotation » de la jante. AUTO3D masque ce doublon pour éviter un empilement visuel inutile.",
  },
  {
    id: 'pneus',
    name: 'Pneus',
    category: 'exterior',
    icon: 'tire',
    tagline: 'Le seul contact entre la voiture et la route.',
    description:
      "Les pneus transmettent au sol toutes les forces qui accélèrent, freinent ou font tourner le véhicule. Leur gomme, leur structure et leur pression déterminent une grande partie du comportement dynamique.",
    function:
      "Créer un contact contrôlé avec la route, transmettre les efforts et absorber une partie des irrégularités de la piste.",
    location: "Autour de chaque jante, aux quatre coins du véhicule.",
    technical: [
      ['Texture du modèle', 'Le matériau de pneu est associé à une texture de type pneu slick sec.'],
      ['Contact', 'L’adhérence dépend de la gomme, de la température, de la charge et de l’état de la piste.'],
      ['Pression', 'Aucune pression ni dimension réelle n’est renseignée dans le fichier GLB ; elles ne sont donc pas inventées ici.'],
    ],
    geometryNote:
      "Les quatre pneus sont des maillages séparés, identifiables et animés avec les jantes. Leur texture d’origine est conservée.",
    keywords: 'pneu tire gomme slick roue adherence',
    available: true,
    matchPriority: 100,
    patterns: [/TIRE_/i],
  },
  {
    id: 'moteur',
    name: 'Moteur',
    category: 'powertrain',
    icon: 'engine',
    tagline: 'Transformer l’énergie en mouvement.',
    description:
      "Le moteur convertit l'énergie chimique du carburant en énergie mécanique. Sur une voiture de course, cette énergie est disponible sur une plage de régime précise et doit être transmise au sol avec le moins de pertes possible.",
    function:
      "Produire la puissance nécessaire à la propulsion du véhicule et alimenter les accessoires.",
    location: "Dans une architecture 911, le moteur est placé à l’arrière, derrière le poste de conduite.",
    technical: [
      ['Principe', 'La combustion d’un mélange air-carburant repousse le piston ; le mouvement est converti en rotation par le vilebrequin.'],
      ['Refroidissement', 'Le liquide et l’air échangent de la chaleur avec les échangeurs et le radiateur.'],
      ['Dans le GLB', 'AUCUN maillage dédié au moteur n’est présent. Cette fiche est pédagogique et ne peut pas être sélectionnée dans la scène 3D.'],
    ],
    geometryNote:
      "Géométrie non disponible : le modèle 3D ne contient pas de moteur isolé. AUTO3D ne fabrique pas de faux bloc moteur et le signale clairement dans l’interface.",
    keywords: 'moteur engine combustion puissance mecanique',
    available: false,
    matchPriority: -1,
    patterns: [],
    didYouKnow:
      "Les dimensions, la puissance et le couple du moteur ne sont pas déduits d’un modèle 3D. C’est pourquoi aucune valeur chiffrée n’est affichée ici.",
  },
  {
    id: 'transmission',
    name: 'Transmission',
    category: 'powertrain',
    icon: 'transmission',
    tagline: 'Acheminer la puissance jusqu’aux roues.',
    description:
      "La transmission adapte le régime et le couple du moteur aux besoins des roues. Elle comprend la boîte de vitesses, l'embrayage ou la commande de boîte, les arbres et le différentiel.",
    function:
      "Transmettre la puissance du moteur aux roues avec le bon rapport et permettre au véhicule de rouler à des vitesses très différentes.",
    location: "Entre le moteur et les roues motrices, à l’arrière de la voiture sur une architecture 911.",
    technical: [
      ['Démultiplication', 'Chaque rapport transforme un régime élevé en couple plus important ou en vitesse plus élevée.'],
      ['Différentiel', 'Il permet aux roues motrices de tourner à des vitesses différentes dans les virages.'],
      ['Dans le GLB', 'AUCUNE boîte de vitesses ni transmission n’est modélisée. La fiche est donc exclusivement pédagogique.'],
    ],
    geometryNote:
      "Géométrie non disponible dans le GLB. Les animations de roues sont purement visuelles et ne simulent pas une chaîne de traction réelle.",
    keywords: 'transmission boite vitesse gearbox differentiel arbre',
    available: false,
    matchPriority: -1,
    patterns: [],
  },
  {
    id: 'radiateur',
    name: 'Radiateur',
    category: 'powertrain',
    icon: 'cooling',
    tagline: 'Évacuer la chaleur du groupe motopropulseur.',
    description:
      "Le radiateur est un échangeur thermique. Le liquide de refroidissement chaud circule dans ses tubes, tandis que l'air extérieur évacue la chaleur vers l'atmosphère.",
    function:
      "Maintenir le moteur et les circuits annexes à une température de fonctionnement compatible avec leurs performances.",
    location: "À l’avant du véhicule, derrière les grilles d’entrée d’air.",
    technical: [
      ['Dans le GLB', 'Un maillage de radiateur est présent (GEO_CHASSIS_RADIATOR) avec le matériau EXT_RADIATOR.'],
      ['Échange thermique', 'La surface d’échange est augmentée par de nombreux tubes et ailettes.'],
      ['Aérodynamique', 'L’entrée d’air doit être suffisante pour refroidir sans créer trop de traînée.'],
    ],
    geometryNote:
      "Le radiateur est présent dans le modèle et peut être mis en évidence dans la vue éclatée. Sa géométrie est volontairement simplifiée par rapport à un échangeur réel.",
    keywords: 'radiateur cooling refroidissement echangeur',
    available: true,
    matchPriority: 40,
    patterns: [/RADIATOR/i],
  },
  {
    id: 'echappement',
    name: 'Échappement',
    category: 'powertrain',
    icon: 'exhaust',
    tagline: 'Évacuer les gaz et façonner le son.',
    description:
      "Le système d'échappement transporte les gaz brûlés du moteur vers l'arrière. Il participe aussi à la gestion du bruit, au refroidissement et, sur certaines voitures de course, à l'organisation du flux sous la carrosserie.",
    function:
      "Évacuer les gaz d’échappement, réduire le bruit et guider les gaz chauds loin des éléments sensibles.",
    location: "Sous le plancher, du compartiment moteur vers la sortie arrière.",
    technical: [
      ['Dans le GLB', 'Le système est identifié par le maillage GEO_EXALST et le matériau EXT_EXALTS.'],
      ['Matériaux', 'Les lignes de course utilisent souvent des aciers spéciaux ou de l’Inconel pour résister aux hautes températures.'],
      ['Rendu', 'Le matériau métallique est amélioré par clone de matériau ; le maillage et les textures d’origine restent inchangés.'],
    ],
    geometryNote:
      "L’échappement est présent comme maillage unique et se sépare avec la vue éclatée. Les détails internes du silencieux ne sont pas visibles.",
    keywords: 'echappement exhaust ligne gaz silencieux',
    available: true,
    matchPriority: 39,
    patterns: [/EXALST|EXHAUST/i],
  },
  {
    id: 'chassis',
    name: 'Châssis',
    category: 'chassis',
    icon: 'chassis',
    tagline: 'La structure qui tient toutes les pièces ensemble.',
    description:
      "Le châssis est la structure porteuse du véhicule. Il relie les points d'ancrage de la suspension, du moteur et de la carrosserie, et protège les occupants en cas d'impact.",
    function:
      "Assurer la rigidité, la géométrie des points d’ancrage et la sécurité passive de la structure.",
    location: "Sous le plancher et autour de l’habitacle, du berceau avant à la structure arrière.",
    technical: [
      ['Dans le GLB', 'Un maillage de châssis revêtu de Kevlar est présent : GEO_CHASSIS_KEVLAR.'],
      ['Rigidité', 'Une structure rigide permet de mieux contrôler la géométrie de suspension et la charge aérodynamique.'],
      ['Sécurité', 'Les zones déformables absorbent l’énergie, tandis que la cellule de survie doit rester intacte.'],
    ],
    geometryNote:
      "Le maillage de châssis présent porte le matériau CHASSIS_KEVLAR. Le plancher complet, les longerons et les points d’ancrage ne sont pas tous détaillés séparément dans le fichier.",
    keywords: 'chassis coque structure kevlar plancher longeron',
    available: true,
    matchPriority: 38,
    patterns: [/CHASSIS_KEVLAR/i],
    didYouKnow:
      "Le nom du matériau (« KEVLAR ») est une information du fichier d’origine, pas une conclusion tirée de la seule couleur du maillage.",
  },
  {
    id: 'suspension',
    name: 'Suspension',
    category: 'suspension',
    icon: 'suspension',
    tagline: 'Garder les roues en contact avec la route.',
    description:
      "La suspension relie les roues à la structure. Elle absorbe les bosses, contrôle les mouvements de caisse et maintient la surface de contact du pneu dans les conditions les plus stables possible.",
    function:
      "Filtrer les irrégularités de la piste, contrôler la charge sur chaque roue et transmettre les efforts entre le sol et le châssis.",
    location: "Entre le châssis et chaque moyeu de roue.",
    technical: [
      ['Principe', 'Ressorts, amortisseurs et bras de liaison travaillent ensemble pour contrôler le mouvement vertical et les angles de roue.'],
      ['Géométrie', 'Les points d’ancrage déterminent l’angle de carrossage, la chasse et la variation de voie pendant le débattement.'],
      ['Dans le GLB', 'AUCUN bras de suspension, ressort ou amortisseur n’est présent. Les groupes nommés SUSP_* contiennent uniquement les étriers et leurs marquages.'],
    ],
    geometryNote:
      "Fiche pédagogique uniquement. Le nom « SUSP_* » du fichier pourrait laisser croire que la suspension est modélisée, mais l’audit de la hiérarchie montre qu’il s’agit des ensembles d’étriers. AUTO3D ne sélectionne donc aucune fausse géométrie.",
    keywords: 'suspension amortisseur ressort bras triangle carrossage',
    available: false,
    matchPriority: -1,
    patterns: [],
    didYouKnow:
      "Cette confusion de nommage est un excellent exemple de la différence entre le nom d’un groupe dans un export 3D et la pièce qu’il contient réellement.",
  },
  {
    id: 'freins',
    name: 'Système de freinage',
    category: 'braking',
    icon: 'brake',
    tagline: 'Convertir le mouvement en chaleur.',
    description:
      "Le système de freinage utilise la friction pour convertir l'énergie cinétique du véhicule en chaleur. Les disques tournent avec les roues ; les étriers viennent presser les plaquettes contre eux.",
    function:
      "Ralentir et arrêter le véhicule, stabiliser sa trajectoire et répartir l’effort de freinage entre les roues.",
    location: "À l’intérieur de chaque jante, sur les quatre roues.",
    technical: [
      ['Principe', 'La pression hydraulique pousse les pistons de l’étrier, qui serrent les plaquettes contre le disque.'],
      ['Énergie', 'L’énergie cinétique est dissipée sous forme de chaleur ; les disques ventilés évacuent cette chaleur.'],
      ['Dans le GLB', 'Les disques et les étriers sont modélisés. Cette fiche met en évidence les deux familles de pièces.'],
    ],
    geometryNote:
      "Sélectionner « Système de freinage » met en évidence les disques et les étriers des quatre roues. Les deux sous-fiches permettent d’isoler chaque famille.",
    keywords: 'frein freinage disque etrier plaquette friction',
    available: true,
    matchPriority: -2,
    patterns: [],
    highlightPatterns: [/DISC_/i, /CALIPER/i],
    didYouKnow:
      "Les étriers sont fixes : dans AUTO3D, ils ne tournent pas avec les jantes et les disques pendant l’animation de roulage.",
  },
  {
    id: 'disques',
    name: 'Disques de frein',
    category: 'braking',
    icon: 'disc',
    tagline: 'La piste de friction qui tourne avec la roue.',
    description:
      "Le disque est la pièce circulaire sur laquelle les plaquettes viennent frotter. Il tourne avec la roue et doit évacuer une grande quantité de chaleur sans se déformer.",
    function:
      "Fournir une surface de friction régulière et dissiper l’énergie thermique produite par le freinage.",
    location: "Derrière les rayons de chaque jante, sur les quatre roues.",
    technical: [
      ['Ventilation', 'Les disques ventilés comportent des canaux internes qui font circuler l’air et limitent la surchauffe.'],
      ['Dans le GLB', 'Quatre disques distincts sont présents, un par roue.'],
      ['Matériau', 'Le fichier ne précise pas si les disques sont en fonte ou en carbone-céramique ; cette information n’est pas inventée.'],
    ],
    geometryNote:
      "Les quatre disques sont des maillages séparés et restent visibles à travers les jantes. Leur matériau d’origine (texture et normal map) est conservé.",
    keywords: 'disque frein brake disc rotor',
    available: true,
    matchPriority: 90,
    patterns: [/DISC_/i],
  },
  {
    id: 'etriers',
    name: 'Étriers',
    category: 'braking',
    icon: 'caliper',
    tagline: 'Les pinces qui transforment la pression en friction.',
    description:
      "L'étrier est la pince fixée au porte-moyeu. Il contient un ou plusieurs pistons qui poussent les plaquettes contre le disque lorsque le pilote appuie sur la pédale.",
    function:
      "Transformer la pression du circuit hydraulique en force de serrage sur les plaquettes et le disque.",
    location: "Sur le bord du disque, à l’intérieur de chaque roue.",
    technical: [
      ['Architecture', 'Un étrier fixe à plusieurs pistons répartit l’effort sur les deux faces du disque.'],
      ['Refroidissement', 'La chaleur passe du disque aux plaquettes puis à l’étrier ; le liquide de frein doit rester stable.'],
      ['Dans le GLB', 'Quatre étriers et quatre marquages sont présents. Ils ne tournent pas avec la roue.'],
    ],
    geometryNote:
      "Les groupes SUSP_LF, SUSP_LR, SUSP_RF et SUSP_RR contiennent ces étriers. Les vrais éléments de suspension ne sont pas présents dans ces groupes.",
    keywords: 'etrier caliper frein piston plaquette',
    available: true,
    matchPriority: 89,
    patterns: [/CALIPER/i],
  },
  {
    id: 'habitacle',
    name: 'Habitacle',
    category: 'interior',
    icon: 'seat',
    tagline: 'Le poste de travail du pilote.',
    description:
      "L'habitacle rassemble le siège, le volant, le tableau de bord, les écrans de télémétrie, les harnais et les éléments de sécurité. En compétition, il est épuré pour réduire le poids et faciliter l'accès aux commandes.",
    function:
      "Offrir au pilote un environnement de conduite sûr, ergonomique et informatif pendant la course.",
    location: "Au centre du véhicule, sous le pavillon et derrière le pare-brise.",
    technical: [
      ['Dans le GLB', 'Le groupe COCKPIT_HR rassemble un très grand nombre de sous-maillages : sièges, volant, écrans, câblage, mousses et éléments en carbone.'],
      ['Ergonomie', 'Toutes les commandes doivent être accessibles sans lâcher le volant ou quitter la route des yeux.'],
      ['Sécurité', 'Le baquet, le harnais et l’arceau maintiennent le corps et protègent le pilote.'],
    ],
    geometryNote:
      "L’habitacle est détaillé et peut être révélé par le mode transparence. Il existe des sous-fiches pour les sièges, le volant, les écrans, le harnais et les protections d’arceau.",
    keywords: 'habitacle cockpit interieur sieges volant tableau bord',
    available: true,
    matchPriority: 50,
    patterns: [/COCKPIT_HR/i],
    didYouKnow:
      "Le mode transparence est particulièrement utile ici : il permet de voir la structure intérieure sans cacher le cockpit derrière les panneaux peints.",
  },
  {
    id: 'sieges',
    name: 'Sièges baquets',
    category: 'interior',
    icon: 'seat',
    tagline: 'Maintenir le pilote pendant les manœuvres.',
    description:
      "Les baquets de compétition maintiennent le bassin et les épaules du pilote. Leur structure rigide et leurs mousses latérales limitent les mouvements du corps lorsque la voiture freine, accélère ou tourne.",
    function:
      "Maintenir le pilote en position, transmettre les informations de mouvement et réduire la fatigue.",
    location: "Au centre de l’habitacle, derrière le volant ; le modèle montre également un baquet passager.",
    technical: [
      ['Matériaux', 'Coque rigide, mousses de confort et revêtement alcantara pour maintenir le corps.'],
      ['Dans le GLB', 'Les maillages de siège et de mousse Sparco sont identifiables.'],
      ['Interaction', 'La sélection met en évidence les éléments de siège sans déplacer le reste du cockpit.'],
    ],
    geometryNote:
      "Les sièges sont présents dans l’habitacle. Leurs mousses et revêtements sont des maillages séparés ; AUTO3D les regroupe comme ensemble de sièges.",
    keywords: 'siege baquet seat sparco alcantara',
    available: true,
    matchPriority: 59,
    patterns: [/SEAT_ALCANTARA|SPARCO_FOAM|COCKPIT_SUB1/i],
  },
  {
    id: 'volant',
    name: 'Volant',
    category: 'interior',
    icon: 'steering',
    tagline: 'La commande principale du pilote.',
    description:
      "Le volant transmet l'angle de braquage aux roues avant. En course, il intègre aussi des boutons, des molettes et parfois des afficheurs pour changer de cartographie ou ajuster les aides.",
    function:
      "Permettre au pilote de diriger le véhicule et d’accéder aux commandes essentielles sans lâcher la jante.",
    location: "Sur la colonne de direction, face au siège du pilote.",
    technical: [
      ['Dans le GLB', 'Le volant, son afficheur central et ses éléments en carbone sont modélisés.'],
      ['Commande', 'Les boutons visibles sont des détails géométriques ; aucune fonction électronique n’est simulée.'],
      ['Matériaux', 'Carbone, plastique et revêtement de préhension composent les différents maillages.'],
    ],
    geometryNote:
      "Le volant est présent et détaillé. Il est regroupé avec le tableau de bord, mais reste sélectionnable via cette fiche.",
    keywords: 'volant steering direction carbone',
    available: true,
    matchPriority: 60,
    patterns: [/STEER/i],
  },
  {
    id: 'arceau',
    name: 'Protections d’arceau',
    category: 'interior',
    icon: 'cage',
    tagline: 'La sécurité passive autour du pilote.',
    description:
      "L'arceau est une structure tubulaire qui protège l'habitacle en cas de retournement. Les mousses de protection limitent les chocs entre le casque ou les membres du pilote et les tubes.",
    function:
      "Maintenir un volume de survie autour des occupants et absorber les contacts avec la structure rigide.",
    location: "Autour et au-dessus de l’habitacle.",
    technical: [
      ['Dans le GLB', 'Les mousses de protection (SPARCO_FOAM_ROLLCAGE) sont identifiables. La structure tubulaire complète n’est pas isolée comme objet unique.'],
      ['Sécurité', 'L’arceau travaille avec le baquet et le harnais pour maintenir le pilote et préserver l’espace vital.'],
      ['Interaction', 'La fiche met en évidence les mousses présentes dans le modèle, sans prétendre que toute la structure est modélisée.'],
    ],
    geometryNote:
      "Géométrie partielle : les protections en mousse sont présentes ; les tubes de l’arceau ne sont pas exposés comme un groupe dédié dans la hiérarchie glTF.",
    keywords: 'arceau rollcage cage securite mousse sparco',
    available: true,
    matchPriority: 56,
    patterns: [/FOAM_ROLLCAGE/i],
  },
  {
    id: 'harnais',
    name: 'Harnais',
    category: 'interior',
    icon: 'harness',
    tagline: 'Garder le corps solidaire du siège.',
    description:
      "Le harnais est un ensemble de sangles qui maintient le pilote contre le baquet. Il répartit les efforts sur le bassin et les épaules pour limiter les mouvements lors des décélérations et des virages.",
    function:
      "Maintenir le pilote en position et transmettre les efforts de décélération au siège sans qu’il puisse glisser.",
    location: "Sur le siège du pilote, passant par les épaules et le bassin.",
    technical: [
      ['Dans le GLB', 'Les sangles et le filet de protection sont modélisés avec des textures dédiées.'],
      ['Réglage', 'Le harnais doit être ajusté au corps du pilote ; aucun mécanisme de tension n’est animé ici.'],
      ['Sécurité', 'Il doit être compatible avec le siège, l’arceau et le dispositif de retenue de tête.'],
    ],
    geometryNote:
      "Les sangles et le filet sont présents dans le cockpit. Cette fiche les met en évidence sans déplacer les sièges.",
    keywords: 'harnais ceinture belt schroth filet net',
    available: true,
    matchPriority: 58,
    patterns: [/INT_NET|BELT_|belt_on|CINTURE/i],
  },
  {
    id: 'ecrans',
    name: 'Écrans & télémétrie',
    category: 'interior',
    icon: 'display',
    tagline: 'Lire les données de la voiture en temps réel.',
    description:
      "Les écrans du cockpit affichent les informations utiles au pilote : vitesse, rapport, temps au tour, températures, freinage ou état des systèmes. Un boîtier de télémétrie enregistre ces données pour l'ingénieur.",
    function:
      "Donner au pilote une lecture immédiate des paramètres critiques et permettre l’analyse des performances après la séance.",
    location: "Derrière le volant et sur la planche de bord.",
    technical: [
      ['Dans le GLB', 'Le modèle contient de nombreux éléments d’affichage et de télémétrie : Racelogic, LEDs de régime, pages de chronométrage.'],
      ['Contenu simulé', 'Les écrans sont des textures fixes ; AUTO3D n’invente aucune valeur de vitesse ou de chrono.'],
      ['Éclairage', 'Les LEDs du volant sont des maillages séparés qui restent visibles avec le mode transparence.'],
    ],
    geometryNote:
      "Les écrans et les LED sont présents. La fiche met en évidence l’ensemble des afficheurs, sans modifier leur contenu.",
    keywords: 'ecran display telemetrie racelogic led vitesse chrono',
    available: true,
    matchPriority: 57,
    patterns: [
      /DISPLAY|SPEED_|LAPCONT|LAPTIME|DELTA_|LASTLAP|BRAKEBIAS|TRF_|TLF_|TLR_|TRR_|ABS_|FAKE|WATERTEMP|FUEL_|GEAR_|LEDRPM|LED_[0-9]|LED_PIT|lumirank|racelogic|sas_driver|SUPORTE_LED/i,
    ],
  },
  {
    id: 'phares',
    name: 'Phares',
    category: 'lighting',
    icon: 'headlight',
    tagline: 'Voir la piste et être identifié.',
    description:
      "Les phares éclairent la route devant le véhicule. En course, les feux avant servent aussi de signature visuelle et peuvent être allumés même en plein jour pour être repéré.",
    function:
      "Éclairer la zone située devant la voiture et signaler sa présence aux autres usagers.",
    location: "À l’avant, dans les optiques intégrées aux ailes et au bouclier.",
    technical: [
      ['Dans le GLB', 'Les optiques avant, leurs vitrages émissifs et les feux auxiliaires sont des maillages séparés.'],
      ['Commande', 'Le bouton d’éclairage active les matériaux émissifs et deux projecteurs réels dans la scène.'],
      ['Rendu', 'Les projecteurs n’éclairent que la scène 3D ; aucune donnée de puissance lumineuse réelle n’est fournie.'],
    ],
    geometryNote:
      "Les optiques avant sont présentes et sélectionnables. Le matériau des feux est éclairci ou assombri sans être remplacé.",
    keywords: 'phare headlight avant optique feu led eclairage',
    available: true,
    matchPriority: 88,
    patterns: [/Emissive_Light_Front|ST_FRONT|L0_EXT|L1_EXT|Glass_Emissive_Front|AUXLIGHT_G/i],
  },
  {
    id: 'feux_arriere',
    name: 'Feux arrière',
    category: 'lighting',
    icon: 'taillight',
    tagline: 'Signaler la position et les intentions.',
    description:
      "Les feux arrière indiquent la présence et la largeur du véhicule. Ils comprennent généralement des feux de position, des feux stop et parfois un feu de pluie ou des marquages spécifiques à la compétition.",
    function:
      "Signaler le véhicule aux autres pilotes, en particulier dans les zones peu éclairées ou sous la pluie.",
    location: "Sur la face arrière, de part et d’autre du capot moteur et au centre.",
    technical: [
      ['Dans le GLB', 'Les feux arrière, le feu de pluie central et les petits marquages sont des maillages séparés.'],
      ['Commande', 'Le bouton des feux arrière active les matériaux émissifs rouges et deux sources lumineuses de faible portée.'],
      ['Sécurité', 'Sur une voiture de course, le feu de pluie est utilisé pour améliorer la visibilité du véhicule.'],
    ],
    geometryNote:
      "Les feux arrière sont présents et sélectionnables. Les maillages RAIN_LIGHTS et ST_REAR font partie de cette fiche.",
    keywords: 'feux arriere taillight stop pluie rain light rouge',
    available: true,
    matchPriority: 87,
    patterns: [/Emissive_Light_Rear|ST_REAR|B0_EXT|RAIN_LIGHTS|Glass_Emissive_Rear/i],
  },
]

export const COMPONENT_BY_ID = Object.fromEntries(COMPONENTS.map((c) => [c.id, c]))

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

/** Components in panel order, with unavailable entries kept visible. */
export const COMPONENTS_BY_CATEGORY = CATEGORIES.filter((c) => c.id !== 'all').map((category) => ({
  ...category,
  components: COMPONENTS.filter((component) => component.category === category.id),
}))

/** Only actually mapped geometry can be picked in the 3D scene. */
export const MATCHABLE_COMPONENTS = [...COMPONENTS]
  .filter((component) => component.available && component.patterns.length > 0)
  .sort((a, b) => (b.matchPriority ?? 0) - (a.matchPriority ?? 0))

export const FALLBACK_COMPONENT = 'carrosserie'

export const MODEL_SUMMARY = {
  brand: 'PORSCHE',
  model: '992 GT3 R',
  subtitle: 'Visualiseur 3D pédagogique',
  sourceAuthor: 'MattDoesBlender',
  sourcePlatform: 'Sketchfab',
  license: 'CC BY-NC-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  sourceUrl: 'https://sketchfab.com/3d-models/porsche-992-gt3-r-03ea07f7972648aa9350853b2a1a942a',
  note:
    "Projet étudiant WebGL. Le modèle est utilisé à des fins pédagogiques, avec attribution et sans usage commercial.",
}
