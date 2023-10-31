/**
 * Exports the translated texts needed for Chat in Bulgarian and English
 */
export interface Langs {
  bg: Lang
  en: Lang
}

interface Lang {
  main: Main
}

interface Main {
  offline: string
  onlyImages: string
  closeChats: string
}

export const langs: Langs = {
  en: {
    main: {
      offline: "You are currently offline!",
      onlyImages: "You can only share images!",
      closeChats: "Close Chats",
    },
  },
  bg: {
    main: {
      offline: "Нямате интернет връзка!",
      onlyImages: "Може да качите само снимки!",
      closeChats: "Затвори Чата",
    },
  },
}
