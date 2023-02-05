export interface Langs {
  bg: Lang;
  en: Lang;
}

interface Lang {
  main: Main;
  errorModal: ErrorModal;
}

interface Main {
  login: string;
  createAccount: string;
  goToLogin: string;
  yourEmail: string;
  yourPassword: string;
  googleSignIn: string;
}

interface ErrorModal {
  header: string;
  agree: string;
}

export const langs = {
  en: {
    main: {
      login: "Login",
      logout: "Logout",
      themes: "Themes",
      button: "English",
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
