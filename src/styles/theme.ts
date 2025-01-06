// site tailwindcss : https://tailwindcss.com/docs et aide avec https://flowbite.com/docs/typography/text/#font-size

export const colors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  danger: '#e74c3c',
  warning: '#f1c40f',
  background: '#f5f5f5',
  text: '#333333',
  heurtierColor: '#058F95', //récupéré du logo
  // ...autres couleurs
};

export const effects = {
    panding:'p-4',
    rounded:'rounded-lg ',
    shadow:'shadow-md ',
    cursor:'cursor-pointer ',
    hover:'hover:shadow-lg ',
    scale:'hover:scale-105 ',
    transitionTransform:'transition-transform ',
    duration:'duration-550 '
  // ...autres effets
};
export const effectsOnclic = {
    effect1: `${effects.panding} ${effects.rounded} ${effects.shadow} ${effects.cursor} ${effects.hover} ${effects.scale} ${effects.transitionTransform} ${effects.duration}`,
  // ...autres effets
};
export const effectsIcon = {
    taille: "w-6 h-6 m-2", // Taille icon
  // ...autres effets
};

export const effectsDiv = {
    marginLeft: "ml-4", // Ajout de la marge à gauche

  // ...autres effets
};
export const effectsH3 = {
    title: "text-lg font-semibold", // Taille et style du titre
};
export const effectsP = {
    value: "text-2xl font-bold",
};