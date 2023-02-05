export interface Langs {
  bg: string;
  en: string;
}

interface Grouped {
  [key: string]: Langs;
}
interface Main {
  login: Langs;
}

interface Translates {
  main: Grouped;
  themeModal: Grouped;
}

export const langs = {
  main: {
    login: {
      bg: "Влез",
      en: "Login",
    },
    logout: {
      bg: "Излез",
      en: "Logout",
    },
    themes: {
      bg: "Теми",
      en: "Themes",
    },
    button: {
      bg: "Български",
      en: "English",
    },
  },

  themeModal: {
    header: {
      bg: "Теми",
      en: "Theme Option",
    },
    agree: {
      bg: "Да",
      en: "Yes",
    },
    deny: {
      bg: "Не",
      en: "No",
    },
    message: {
      bg: "Запазете тази тема '${}'? Ще бъде запазена във вашият браузър!",
      en: "Change the default theme to '${}'? Will be saved in Local Storage!",
    },
    messageDone: {
      bg: "Вашата тема е вече запазена!",
      en: "Your theme is already saved!",
    },
    agreeDone: {
      bg: "Добре",
      en: "OK",
    },
  },
};
