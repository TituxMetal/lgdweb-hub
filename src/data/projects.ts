/**
 * Project manifest — single source of truth, consumed by client and server.
 * Discriminated by `kind`: `old` projects are archive entries (repo only),
 * `recent` projects can carry a `liveUrl`. Order is chronological, newest first.
 * Pure TS: no DOM, no Node — safe to import anywhere.
 */
type ProjectBase = {
  slug: string
  title: string
  date: string
  description: string
  tech: string[]
  repoUrl: string
}

export type OldProject = ProjectBase & {
  kind: 'old'
}

export type RecentProject = ProjectBase & {
  kind: 'recent'
  liveUrl?: string
}

export type Project = OldProject | RecentProject

export const projects: Project[] = [
  {
    kind: 'recent',
    slug: 'pif',
    title: 'Prime Au PIF',
    date: '2026-05',
    description: `Générateur satirique de primes mensuelles. À partir d'un prénom, l'application attribue une rémunération fictive selon des règles totalement arbitraires — la blague exhibe l'absurdité des vrais systèmes d'attribution où certains empilent les bonus pour avoir coupé les coins, d'autres rien.`,
    tech: ['TypeScript', 'React', 'Tailwind', 'Hono'],
    liveUrl: 'https://pif.tuxlab.fr',
    repoUrl: 'https://github.com/TituxMetal/pif-is-fake'
  },
  {
    kind: 'recent',
    slug: 'cubemaster',
    title: 'Cube Master',
    date: '2026-04',
    description: `Compagnon Rubik's cube qui réunit trois modes complémentaires. Solveur : on saisit l'état du cube, on récupère une solution étape par étape. Coach : on apprend une méthode de résolution du débutant à l'avancé. Timer : chronomètre speedcube avec mélanges aléatoires et statistiques.`,
    tech: ['TypeScript', 'React', 'Tailwind', 'Hono'],
    liveUrl: 'https://cube-master.fly.dev',
    repoUrl: 'https://github.com/TituxMetal/cube-master'
  },
  {
    kind: 'recent',
    slug: 'costlog',
    title: 'Cost Log',
    date: '2026-02',
    description: `Journal de bord d'une voiture, pensé pour que la mécanique parle avant que la facture ne s'envole. Profil véhicule à jour, contrôles à anticiper, dépenses suivies au centime, budget en temps réel, historique daté.`,
    tech: ['TypeScript', 'React', 'Tailwind', 'NestJS', 'Astro'],
    liveUrl: 'https://cost-log.tuxlab.fr',
    repoUrl: 'https://github.com/TituxMetal/car-cost-tracker'
  },
  {
    kind: 'old',
    slug: 'chess',
    title: 'Chess Game',
    date: '2025-09',
    description:
      'Apprendre les échecs depuis zéro, leçon par leçon. Chaque chapitre raconte une histoire courte pour introduire une règle, une pièce, ou une combinaison — et se termine par une situation à jouer. Pas de prérequis, juste de la curiosité.',
    tech: ['TypeScript', 'React', 'Tailwind'],
    repoUrl: 'https://github.com/TituxMetal/react-chess-game-learning'
  },
  {
    kind: 'old',
    slug: 'game-of-life',
    title: 'Game of Life',
    date: '2019-02',
    description: `Visualisation en direct du jeu de la vie. On dessine un schéma sur la grille, on lance la simulation, et on regarde les générations s'enchaîner : clignotants, planeurs et oscillateurs apparaissent au fil des cycles. Mode tore disponible pour faire boucler les bords.`,
    tech: ['TypeScript', 'React', 'Tailwind', 'Canvas'],
    repoUrl: 'https://github.com/TituxMetal/tuximetal-game-of-life'
  },
  {
    kind: 'old',
    slug: 'memory',
    title: 'Memory Game',
    date: '2018-09',
    description:
      'Trouver les paires en retournant les cartes deux par deux. Le plateau se mélange à chaque partie et un compteur de coups suit la performance — adapté à une partie rapide entre deux choses.',
    tech: ['TypeScript', 'React', 'Tailwind'],
    repoUrl: 'https://github.com/TituxMetal/memory-game'
  },
  {
    kind: 'old',
    slug: 'tetris',
    title: 'Tetris Game',
    date: '2018-06',
    description: `Implémentation web du Tetris original avec un mode 1 contre 1. Les pièces tombent, se posent, les lignes pleines disparaissent — et en duel, l'écran se sépare pour afficher la partie de l'adversaire en simultané.`,
    tech: ['TypeScript', 'React', 'Tailwind', 'Canvas', 'WebSocket'],
    repoUrl: 'https://github.com/TituxMetal/tetrisGame'
  },
  {
    kind: 'old',
    slug: 'snake',
    title: 'Snake Game',
    date: '2018-04',
    description: `Reprise du Snake d'arcade. Le serpent se déplace en continu, on le dirige aux flèches, et chaque fruit avalé l'allonge d'une case. Le défi : tenir le plus longtemps possible sans se mordre.`,
    tech: ['TypeScript', 'React', 'Tailwind', 'Canvas'],
    repoUrl: 'https://github.com/TituxMetal'
  },
  {
    kind: 'old',
    slug: 'portfolio',
    title: 'Portfolio',
    date: '2017-05',
    description:
      'Portfolio de fin de formation, dans sa troisième vie. Première version en PHP/Silex/Twig, deuxième en JavaScript et build statique, version actuelle en TypeScript et React. Toujours le même but : présenter le parcours.',
    tech: ['TypeScript', 'React', 'Tailwind'],
    repoUrl: 'https://github.com/TituxMetal/portfolio'
  },
  {
    kind: 'old',
    slug: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    date: '2017-05',
    description: `Morpion réécrit en TypeScript et React. Interface minimale, détection automatique du gagnant, un bouton pour rejouer. Rien de plus que les règles d'origine.`,
    tech: ['TypeScript', 'React', 'Tailwind'],
    repoUrl: 'https://github.com/TituxMetal/ticTacToe'
  }
]
