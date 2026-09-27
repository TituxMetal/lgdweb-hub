/**
 * The 2025 chess app's own story, transcribed from the archived content: the
 * chapter index its navigation read (`src/stories/index.json`) and the metadata
 * each chapter carried in its frontmatter — the question, and the position it is
 * played from. The chapter text itself lives next to this file, in
 * `../stories/<storyId>/<chapterId>.md`, loaded on demand.
 *
 * Pure TS: no DOM, no bundler. The navigation, the screens and the specs read the
 * same truth.
 */

export type ChessQuestionType = 'multiple-choice' | 'move-based'

export type ChessQuestion = {
  type: ChessQuestionType
  prompt: string
  /** The choices, for a `multiple-choice` question. */
  options?: string[]
  /**
   * Every answer the original accepted: an option's text, or a move written as
   * its `from` square followed by its `to` square (`e2e4`).
   */
  correctAnswer: string[]
  explanation: string
  /**
   * The position the question is played from; `start` and a missing value both
   * mean the starting position.
   */
  initialPosition?: string
}

export type ChessChapter = {
  id: string
  /** The position the chapter shows: a FEN, or the original's `startpos`. */
  chessPosition?: string
  question?: ChessQuestion
}

export type ChessStory = {
  id: string
  title: string
  chapters: ChessChapter[]
  /** The stories the completion screen steps to, in the original's reading order. */
  previousStory?: string
  nextStory?: string
}

export const CHESS_STORIES: readonly ChessStory[] = [
  {
    id: '01-introduction',
    title: 'Introduction aux échecs',
    chapters: [
      {
        id: '01-what-is-chess',
        question: {
          type: 'multiple-choice',
          prompt: "Combien de joueurs participent à une partie d'échecs ?",
          options: ['Un', 'Deux', 'Quatre'],
          correctAnswer: ['Deux'],
          explanation:
            "Les échecs se jouent toujours entre deux joueurs, un avec les pièces blanches et l'autre avec les pièces noires."
        }
      },
      {
        id: '02-the-chessboard',
        question: {
          type: 'multiple-choice',
          prompt: 'Combien de cases possède un échiquier ?',
          options: ['32', '64', '100'],
          correctAnswer: ['64'],
          explanation: 'Un échiquier est composé de 8 rangées et 8 colonnes, soit 64 cases.'
        },
        chessPosition: 'startpos'
      },
      {
        id: '03-the-pieces-overview',
        question: {
          type: 'multiple-choice',
          prompt: 'Combien de pièces chaque joueur possède-t-il au début de la partie ?',
          options: ['8', '16', '32'],
          correctAnswer: ['16'],
          explanation:
            'Chaque joueur commence avec 16 pièces : 8 pions, 2 cavaliers, 2 fous, 2 tours, 1 dame et 1 roi.'
        },
        chessPosition: 'startpos'
      }
    ],
    nextStory: '02-piece-moves'
  },
  {
    id: '02-piece-moves',
    title: 'Comment les pièces bougent',
    chapters: [
      {
        id: '01-pawn',
        question: {
          type: 'move-based',
          prompt: "Déplacez le pion blanc devant le roi (e2) de deux cases vers l'avant.",
          correctAnswer: ['e2e4'],
          explanation:
            'Parfait ! Le pion peut avancer de deux cases lors de son premier mouvement.',
          initialPosition: 'start'
        }
      },
      {
        id: '02-knight',
        question: {
          type: 'move-based',
          prompt:
            'Déplacez le cavalier blanc (côté roi) en forme de L pour attaquer une case devant les pions noirs.',
          correctAnswer: ['g1f3', 'g1e2', 'b1c3', 'b1d2'],
          explanation:
            'Excellent ! Le cavalier se déplace en L et peut sauter par-dessus les pions.',
          initialPosition: 'start'
        }
      },
      {
        id: '03-bishop',
        question: {
          type: 'multiple-choice',
          prompt: 'Sur quelles cases le fou se déplace-t-il ?',
          options: [
            'Seulement les cases claires',
            'Seulement les cases foncées',
            'Toujours sur la même couleur'
          ],
          correctAnswer: ['Toujours sur la même couleur'],
          explanation: 'Chaque fou reste sur la couleur de case où il commence la partie.'
        }
      },
      {
        id: '04-rook',
        question: {
          type: 'move-based',
          prompt: 'Déplacez la tour blanche pour attaquer directement le cavalier noir sur f6.',
          correctAnswer: ['f1f6'],
          explanation:
            'Parfait ! La tour se déplace en ligne droite et peut attaquer sur toute sa trajectoire.',
          initialPosition: '4k3/8/5n2/8/8/8/8/5R1K w - - 0 1'
        }
      },
      {
        id: '05-queen',
        question: {
          type: 'multiple-choice',
          prompt: 'Pourquoi la dame est-elle la pièce la plus puissante ?',
          options: [
            'Elle saute par-dessus les pièces',
            'Elle se déplace dans toutes les directions',
            'Elle ne peut pas être capturée'
          ],
          correctAnswer: ['Elle se déplace dans toutes les directions'],
          explanation:
            "La dame se déplace horizontalement, verticalement et en diagonale, sur autant de cases qu'elle le souhaite."
        }
      },
      {
        id: '06-king',
        question: {
          type: 'multiple-choice',
          prompt: 'Combien de cases le roi peut-il parcourir à chaque tour ?',
          options: ['Une', 'Deux', 'Toutes'],
          correctAnswer: ['Une'],
          explanation: "Le roi se déplace d'une case dans n'importe quelle direction."
        }
      }
    ],
    previousStory: '01-introduction',
    nextStory: '03-basic-rules'
  },
  {
    id: '03-basic-rules',
    title: 'Règles et stratégies de base',
    chapters: [
      {
        id: '01-turn-order',
        question: {
          type: 'multiple-choice',
          prompt: "Qui commence toujours la partie d'échecs ?",
          options: ['Les noirs', 'Les blancs', 'Celui qui veut'],
          correctAnswer: ['Les blancs'],
          explanation: 'Aux échecs, ce sont toujours les blancs qui jouent le premier coup.'
        }
      },
      {
        id: '02-capturing',
        question: {
          type: 'move-based',
          prompt: 'Capturez le pion noir sur d5 avec votre fou blanc.',
          correctAnswer: ['c4d5'],
          explanation: 'Excellent ! Vous avez capturé le pion en déplaçant votre fou sur sa case.',
          initialPosition: 'rnbqkb1r/pppp1ppp/8/3p4/2B5/8/PPPP1PPP/RNBQK1NR w KQkq - 0 1'
        },
        chessPosition: 'rnbqkb1r/pppp1ppp/8/3p4/2B5/8/PPPP1PPP/RNBQK1NR w KQkq - 0 1'
      },
      {
        id: '03-special-moves',
        question: {
          type: 'multiple-choice',
          prompt: 'Quel coup spécial permet au roi et à la tour de bouger ensemble ?',
          options: ['La promotion', 'Le roque', 'La prise en passant'],
          correctAnswer: ['Le roque'],
          explanation: 'Le roque est un coup spécial où le roi et la tour bougent en même temps.'
        }
      },
      {
        id: '04-check-checkmate',
        question: {
          type: 'multiple-choice',
          prompt: 'Que signifie échec et mat ?',
          options: [
            'Le roi est capturé',
            "Le roi ne peut pas éviter l'attaque",
            'La partie continue'
          ],
          correctAnswer: ["Le roi ne peut pas éviter l'attaque"],
          explanation:
            "Échec et mat signifie que le roi est attaqué et ne peut pas s'échapper, la partie est terminée."
        }
      },
      {
        id: '05-opening-principles',
        question: {
          type: 'multiple-choice',
          prompt: "Quel est un bon principe d'ouverture aux échecs ?",
          options: ['Bouger le roi', 'Contrôler le centre', 'Ne pas développer les pièces'],
          correctAnswer: ['Contrôler le centre'],
          explanation:
            'Il est important de contrôler le centre, développer ses pièces et protéger son roi dès le début de la partie.'
        }
      }
    ],
    previousStory: '02-piece-moves',
    nextStory: '04-essential-tactics'
  },
  {
    id: '04-essential-tactics',
    title: 'Tactiques essentielles',
    chapters: [
      {
        id: '01-fork-attack',
        question: {
          type: 'move-based',
          prompt: 'Le cavalier blanc peut créer une fourchette royale ! Trouvez le bon coup.',
          correctAnswer: ['c3d5'],
          explanation:
            'Bravo ! Cd5+ fait une fourchette royale : le cavalier attaque le roi en e7 et gagne la tour en a8 !',
          initialPosition: 'r3kb1r/ppppkppp/8/8/8/2N5/PPPPPPPP/R1BQKB1R w KQq - 0 1'
        }
      },
      {
        id: '02-pin-skewer',
        question: {
          type: 'move-based',
          prompt:
            'Clouez le cavalier noir qui protège la dame ! Placez votre fou sur la bonne diagonale.',
          correctAnswer: ['f1b5'],
          explanation:
            "Parfait ! Le fou en b5 cloue le cavalier en c6 : s'il bouge, la dame en d7 sera prise !",
          initialPosition: 'r1b1kb1r/pppqpppp/2n5/8/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 1'
        }
      },
      {
        id: '03-discovered-attack',
        question: {
          type: 'move-based',
          prompt:
            'Bougez le cavalier pour révéler une attaque dévastatrice de votre fou sur le roi noir !',
          correctAnswer: ['e4d6'],
          explanation:
            "Formidable ! Cd6+ révèle l'attaque du fou sur le roi ET le cavalier attaque la dame en b7 !",
          initialPosition: 'r3kb1r/1q2pppp/8/8/4N3/8/PPPP1PPP/R1BQKB1R w KQkq - 0 1'
        }
      },
      {
        id: '04-double-attack',
        question: {
          type: 'move-based',
          prompt: 'Placez votre dame pour attaquer à la fois le roi et la tour noirs.',
          correctAnswer: ['d1d5'],
          explanation:
            'Excellent ! La dame attaque le roi en e8 et menace aussi de capturer la tour en a8 !',
          initialPosition: 'r1bqkb1r/pppp1ppp/2n5/8/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 4'
        }
      },
      {
        id: '05-tactical-puzzles',
        question: {
          type: 'move-based',
          prompt: 'Trouvez la combinaison tactique qui gagne du matériel.',
          correctAnswer: ['f3d4'],
          explanation:
            'Bravo ! Cette combinaison utilise plusieurs tactiques que vous avez apprises !',
          initialPosition: 'r1bq1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQ - 0 6'
        }
      }
    ],
    previousStory: '03-basic-rules',
    nextStory: '05-basic-endgames'
  },
  {
    id: '05-basic-endgames',
    title: 'Finales de base',
    chapters: [
      {
        id: '01-king-queen-vs-king',
        question: {
          type: 'move-based',
          prompt: 'Donnez échec et mat avec la dame et le roi blancs.',
          correctAnswer: ['e2e8'],
          explanation:
            "Parfait ! La dame donne échec et mat car le roi noir ne peut s'échapper nulle part !",
          initialPosition: '8/8/8/8/8/8/4Q3/6K1 b - - 0 1'
        }
      },
      {
        id: '02-king-rook-vs-king',
        question: {
          type: 'move-based',
          prompt: 'Utilisez votre tour pour donner échec et mat au roi noir.',
          correctAnswer: ['e2e8'],
          explanation:
            "Excellent ! La tour contrôle toute la rangée et donne mat avec l'aide du roi blanc !",
          initialPosition: '8/8/8/8/8/8/4R3/6K1 b - - 0 1'
        },
        chessPosition: '8/8/8/8/8/8/4R3/6K1 b - - 0 1'
      },
      {
        id: '03-king-pawn-endgame',
        question: {
          type: 'move-based',
          prompt: 'Avancez votre pion vers la promotion.',
          correctAnswer: ['e4e5'],
          explanation: 'Bien joué ! Le pion avance vers la transformation en dame !',
          initialPosition: '8/8/8/8/4P3/8/8/4K2k w - - 0 1'
        },
        chessPosition: '8/8/8/8/4P3/8/8/4K2k w - - 0 1'
      },
      {
        id: '04-opposition',
        question: {
          type: 'move-based',
          prompt: "Prenez l'opposition en plaçant votre roi face au roi adverse.",
          correctAnswer: ['d3d4'],
          explanation:
            "Parfait ! Maintenant les rois se font face avec une case entre eux. Vous avez l'opposition !",
          initialPosition: '8/8/8/3k4/8/3K4/8/8 w - - 0 1'
        },
        chessPosition: '8/8/8/3k4/8/3K4/8/8 w - - 0 1'
      },
      {
        id: '05-stalemate-traps',
        question: {
          type: 'move-based',
          prompt: 'Donnez mat sans faire pat au roi noir.',
          correctAnswer: ['b1b2'],
          explanation:
            'Excellent ! La dame en b2 donne mat tout en laissant une case libre au roi noir.',
          initialPosition: '8/8/8/8/8/8/k1K5/1Q6 w - - 0 1'
        },
        chessPosition: '8/8/8/8/8/8/k1K5/1Q6 w - - 0 1'
      }
    ],
    previousStory: '04-essential-tactics',
    nextStory: '06-opening-fundamentals'
  },
  {
    id: '06-opening-fundamentals',
    title: "Principes d'ouverture",
    chapters: [
      {
        id: '01-center-control',
        question: {
          type: 'move-based',
          prompt: "Jouez un coup qui contrôle le centre de l'échiquier.",
          correctAnswer: ['e2e4'],
          explanation:
            "Parfait ! e4 contrôle les cases centrales d5 et f5, c'est un excellent premier coup !",
          initialPosition: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        },
        chessPosition: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      },
      {
        id: '02-piece-development',
        question: {
          type: 'move-based',
          prompt: 'Développez une pièce vers le centre.',
          correctAnswer: ['g1f3'],
          explanation:
            'Parfait ! Le cavalier en f3 attaque le centre et se développe rapidement. Cavaliers avant fous !',
          initialPosition: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
        },
        chessPosition: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
      },
      {
        id: '03-king-safety',
        question: {
          type: 'move-based',
          prompt: 'Mettez votre roi en sécurité avec le roque.',
          correctAnswer: ['e1g1'],
          explanation:
            "Excellent ! Le petit roque met le roi à l'abri et active la tour. Sécurité avant tout !",
          initialPosition: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 4'
        },
        chessPosition: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 4'
      },
      {
        id: '04-common-mistakes',
        question: {
          type: 'multiple-choice',
          prompt: 'Que ne faut-il PAS faire en ouverture ?',
          options: ['Développer les pièces', 'Sortir la dame tôt', 'Contrôler le centre'],
          correctAnswer: ['Sortir la dame tôt'],
          explanation:
            "Correct ! Sortir la dame trop tôt la met en danger. Développez d'abord les petites pièces !"
        },
        chessPosition: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2'
      },
      {
        id: '05-simple-openings',
        question: {
          type: 'move-based',
          prompt: "Commencez l'ouverture italienne avec e4.",
          correctAnswer: ['e2e4'],
          explanation:
            "Parfait ! e4 commence l'ouverture italienne : 1.e4 e5 2.Cf3 Cc6 3.Fc4. Une ouverture classique !",
          initialPosition: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        },
        chessPosition: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      }
    ],
    previousStory: '05-basic-endgames'
  }
]
