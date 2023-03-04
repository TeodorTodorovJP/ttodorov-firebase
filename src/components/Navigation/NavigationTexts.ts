export interface Langs {
  bg: Lang;
  en: Lang;
}

interface Lang {
  main: Main;
  themeModal: ТhemeModal;
}

interface Main {
  login: string;
  logout: string;
  themes: string;
  button: string;
  profile: string;
}

interface ТhemeModal {
  header: string;
  agree: string;
  deny: string;
  message: string;
  messageDone: string;
  agreeDone: string;
}

export const langs: Langs = {
  en: {
    main: {
      login: "Login",
      logout: "Logout",
      themes: "Themes",
      button: "English",
      profile: "Profile",
    },

    themeModal: {
      header: "Theme Option",
      agree: "Yes",
      deny: "No",
      message: "Change the default theme to '${}'? Will be saved in Local Storage!",
      messageDone: "Your theme is already saved!",
      agreeDone: "OK",
    },
  },

  bg: {
    main: {
      login: "Влез",
      logout: "Излез",
      themes: "Теми",
      button: "Български",
      profile: "Профил",
    },

    themeModal: {
      header: "Теми",
      agree: "Да",
      deny: "Не",
      message: "Запазете тази тема '${}'? Ще бъде запазена във вашият браузър!",
      messageDone: "Вашата тема е вече запазена!",
      agreeDone: "Добре",
    },
  },
};
