// The venue's painted slogan letters, grouped into words for the scrolling
// ticker (components/home/slogan-ticker.tsx). Each glyph is an SVG in
// public/slogans/<slug>/; add a word by dropping its letters there + an entry.

interface SloganGlyph {
  src: string
  width: number
  height: number
  letter: string
}

export interface Slogan {
  word: string
  glyphs: SloganGlyph[]
}

export const SLOGANS: Slogan[] = [
  {
    word: "KEEP ON ROLLING",
    glyphs: [
      {
        src: "/slogans/keep-on-rolling/01_K.svg",
        width: 461,
        height: 483,
        letter: "K",
      },
      {
        src: "/slogans/keep-on-rolling/02_E.svg",
        width: 360,
        height: 476,
        letter: "E",
      },
      {
        src: "/slogans/keep-on-rolling/03_E.svg",
        width: 346,
        height: 457,
        letter: "E",
      },
      {
        src: "/slogans/keep-on-rolling/04_P.svg",
        width: 365,
        height: 456,
        letter: "P",
      },
      {
        src: "/slogans/keep-on-rolling/05_O.svg",
        width: 498,
        height: 494,
        letter: "O",
      },
      {
        src: "/slogans/keep-on-rolling/06_N.svg",
        width: 414,
        height: 460,
        letter: "N",
      },
      {
        src: "/slogans/keep-on-rolling/07_R.svg",
        width: 471,
        height: 508,
        letter: "R",
      },
      {
        src: "/slogans/keep-on-rolling/08_O.svg",
        width: 447,
        height: 442,
        letter: "O",
      },
      {
        src: "/slogans/keep-on-rolling/09_L.svg",
        width: 367,
        height: 500,
        letter: "L",
      },
      {
        src: "/slogans/keep-on-rolling/10_L.svg",
        width: 330,
        height: 446,
        letter: "L",
      },
      {
        src: "/slogans/keep-on-rolling/11_I.svg",
        width: 175,
        height: 448,
        letter: "I",
      },
      {
        src: "/slogans/keep-on-rolling/12_N.svg",
        width: 406,
        height: 450,
        letter: "N",
      },
      {
        src: "/slogans/keep-on-rolling/13_G.svg",
        width: 421,
        height: 462,
        letter: "G",
      },
    ],
  },
  {
    word: "STRIKE IT",
    glyphs: [
      {
        src: "/slogans/strike-it/01_S.svg",
        width: 277,
        height: 356,
        letter: "S",
      },
      {
        src: "/slogans/strike-it/02_T.svg",
        width: 247,
        height: 304,
        letter: "T",
      },
      {
        src: "/slogans/strike-it/03_R.svg",
        width: 291,
        height: 305,
        letter: "R",
      },
      {
        src: "/slogans/strike-it/04_I.svg",
        width: 128,
        height: 300,
        letter: "I",
      },
      {
        src: "/slogans/strike-it/05_K.svg",
        width: 301,
        height: 309,
        letter: "K",
      },
      {
        src: "/slogans/strike-it/06_E.svg",
        width: 238,
        height: 306,
        letter: "E",
      },
      {
        src: "/slogans/strike-it/07_I.svg",
        width: 128,
        height: 300,
        letter: "I",
      },
      {
        src: "/slogans/strike-it/08_T.svg",
        width: 288,
        height: 354,
        letter: "T",
      },
    ],
  },
  {
    word: "EYES ON THE BALL",
    glyphs: [
      {
        src: "/slogans/eyes-on-the-ball/01_E.svg",
        width: 377,
        height: 484,
        letter: "E",
      },
      {
        src: "/slogans/eyes-on-the-ball/02_Y.svg",
        width: 409,
        height: 426,
        letter: "Y",
      },
      {
        src: "/slogans/eyes-on-the-ball/03_E.svg",
        width: 334,
        height: 427,
        letter: "E",
      },
      {
        src: "/slogans/eyes-on-the-ball/04_S.svg",
        width: 338,
        height: 432,
        letter: "S",
      },
      {
        src: "/slogans/eyes-on-the-ball/05_O.svg",
        width: 490,
        height: 477,
        letter: "O",
      },
      {
        src: "/slogans/eyes-on-the-ball/06_N.svg",
        width: 397,
        height: 431,
        letter: "N",
      },
      {
        src: "/slogans/eyes-on-the-ball/07_T.svg",
        width: 360,
        height: 445,
        letter: "T",
      },
      {
        src: "/slogans/eyes-on-the-ball/08_H.svg",
        width: 397,
        height: 450,
        letter: "H",
      },
      {
        src: "/slogans/eyes-on-the-ball/09_E.svg",
        width: 343,
        height: 448,
        letter: "E",
      },
      {
        src: "/slogans/eyes-on-the-ball/10_B.svg",
        width: 373,
        height: 447,
        letter: "B",
      },
      {
        src: "/slogans/eyes-on-the-ball/11_A.svg",
        width: 464,
        height: 449,
        letter: "A",
      },
      {
        src: "/slogans/eyes-on-the-ball/12_L.svg",
        width: 335,
        height: 441,
        letter: "L",
      },
      {
        src: "/slogans/eyes-on-the-ball/13_L.svg",
        width: 355,
        height: 469,
        letter: "L",
      },
    ],
  },
  {
    word: "WORK HARD",
    glyphs: [
      {
        src: "/slogans/work-hard/01_W.svg",
        width: 418,
        height: 317,
        letter: "W",
      },
      {
        src: "/slogans/work-hard/02_O.svg",
        width: 320,
        height: 314,
        letter: "O",
      },
      {
        src: "/slogans/work-hard/03_R.svg",
        width: 310,
        height: 329,
        letter: "R",
      },
      {
        src: "/slogans/work-hard/04_K.svg",
        width: 299,
        height: 309,
        letter: "K",
      },
      {
        src: "/slogans/work-hard/05_H.svg",
        width: 316,
        height: 357,
        letter: "H",
      },
      {
        src: "/slogans/work-hard/06_A.svg",
        width: 319,
        height: 307,
        letter: "A",
      },
      {
        src: "/slogans/work-hard/07_R.svg",
        width: 303,
        height: 322,
        letter: "R",
      },
      {
        src: "/slogans/work-hard/08_D.svg",
        width: 290,
        height: 321,
        letter: "D",
      },
    ],
  },
  {
    word: "PLAY HARD",
    glyphs: [
      {
        src: "/slogans/play-hard/01_P.svg",
        width: 276,
        height: 337,
        letter: "P",
      },
      {
        src: "/slogans/play-hard/02_L.svg",
        width: 230,
        height: 302,
        letter: "L",
      },
      {
        src: "/slogans/play-hard/03_A.svg",
        width: 325,
        height: 305,
        letter: "A",
      },
      {
        src: "/slogans/play-hard/04_Y.svg",
        width: 294,
        height: 305,
        letter: "Y",
      },
      {
        src: "/slogans/play-hard/05_H.svg",
        width: 309,
        height: 346,
        letter: "H",
      },
      {
        src: "/slogans/play-hard/06_A.svg",
        width: 340,
        height: 320,
        letter: "A",
      },
      {
        src: "/slogans/play-hard/07_R.svg",
        width: 289,
        height: 305,
        letter: "R",
      },
      {
        src: "/slogans/play-hard/08_D.svg",
        width: 297,
        height: 328,
        letter: "D",
      },
    ],
  },
]
