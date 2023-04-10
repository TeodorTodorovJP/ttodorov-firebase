export interface Langs {
  bg: Lang;
  en: Lang;
}

interface Lang {
  main: Main;
}

interface Main {
  offline: string;
}

export const langs: Langs = {
  en: {
    main: {
      offline: "You are currently offline!",
    },
  },
  bg: {
    main: {
      offline: "Нямате интернет връзка!",
    },
  },
};
