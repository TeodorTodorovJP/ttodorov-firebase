export interface Langs {
  bg: Lang
  en: Lang
}

interface Lang {
  main: Main
  themeModal: ТhemeModal
  leftMenu: LeftMenu
}

interface Main {
  login: string
  logout: string
  themes: string
  button: string
  profile: string
  lang: string
}

interface ТhemeModal {
  header: string
  agree: string
  deny: string
  message: string
  messageDone: string
  agreeDone: string
}

interface LeftMenu {
  home: string
  authenticate: string
  chat: string
  projects: string
}

export const langs: Langs = {
  en: {
    main: {
      login: "Login",
      logout: "Logout",
      themes: "Themes",
      button: "English",
      profile: "Profile",
      lang: "БГ",
    },

    themeModal: {
      header: "Theme Option",
      agree: "Yes",
      deny: "No",
      message: "Change the default theme to '${}'? Will be saved in Local Storage!",
      messageDone: "Your theme is already saved!",
      agreeDone: "OK",
    },
    leftMenu: {
      home: "Home",
      authenticate: "Authenticate",
      chat: "Chat",
      projects: "Projects",
    },
  },

  bg: {
    main: {
      login: "Влез",
      logout: "Излез",
      themes: "Теми",
      button: "Български",
      profile: "Профил",
      lang: "EN",
    },

    themeModal: {
      header: "Теми",
      agree: "Да",
      deny: "Не",
      message: "Запазете тази тема '${}'? Ще бъде запазена във вашият браузър!",
      messageDone: "Вашата тема е вече запазена!",
      agreeDone: "Добре",
    },
    leftMenu: {
      home: "Начална страница",
      authenticate: "Удостоверяване",
      chat: "Чат",
      projects: "Проекти",
    },
  },
}
