export interface Langs {
  bg: Lang;
  en: Lang;
}

interface Lang {
  defaultNotif: DefaultNotif;
}

interface DefaultNotif {
  agree: string;
  messageOnline: string;
  messageOffline: string;
}

export const langs: Langs = {
  en: {
    defaultNotif: {
      agree: "OK",
      messageOnline: "Your internet connection is restored!",
      messageOffline: "You have lost internet connection!",
    },
  },
  bg: {
    defaultNotif: {
      agree: "OK",
      messageOnline: "Вашата интернет връзка е възобновена!",
      messageOffline: "В момента нямате интернет връзка!",
    },
  },
};
