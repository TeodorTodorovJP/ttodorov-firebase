export interface Langs {
  bg: Lang
  en: Lang
}

interface Lang {
  main: Main
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

interface LeftMenu {
  home: string
  authenticate: string
  chat: string
  notes: string
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
    leftMenu: {
      home: "Home",
      authenticate: "Authenticate",
      chat: "Chat",
      notes: "Notes",
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
    leftMenu: {
      home: "Начална страница",
      authenticate: "Удостоверяване",
      chat: "Чат",
      notes: "Записки",
      projects: "Проекти",
    },
  },
}
