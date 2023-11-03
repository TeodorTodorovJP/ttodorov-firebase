export interface Langs {
  bg: Lang
  en: Lang
}

interface Lang {
  main: Main
  chat: Chat
  notes: Notes
}

interface Main {
  header: string
  description: string
}

interface Chat {
  header: string
  description: string
}

interface Notes {
  header: string
  description: string
}

export const langs: Langs = {
  en: {
    main: {
      header: "My projects",
      description: "Currently there is only one project!",
    },

    chat: {
      header: "Chat",
      description: "A chat app for chatting with your friends.",
    },
    notes: {
      header: "Notes",
      description: "In progress! A notes app for taking notes.",
    },
  },

  bg: {
    main: {
      header: "Моите проекти",
      description: "В момента имам 1 проект!",
    },

    chat: {
      header: "Чат",
      description: "Чат приложение за чат с твоите приятели.",
    },
    notes: {
      header: "Записки",
      description: "В разработка! Приложение за записки.",
    },
  },
}
