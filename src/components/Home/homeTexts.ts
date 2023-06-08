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
  header: string
  email: string
  linkedIn: string
  phone: string
  repo: string
}

export const langs: Langs = {
  en: {
    main: {
      header: "Hello, my name is Teodor Todorov and this is my website.",
      email: "Gmail:",
      linkedIn: "LinkedIn:",
      phone: "Phone:",
      repo: "gitHub",
    },
  },
  bg: {
    main: {
      header: "Здравейте, казвам се Теодор Тодоров и това е моят уебсайт.",
      email: "Gmail:",
      linkedIn: "LinkedIn:",
      phone: "Телефон:",
      repo: "gitHub",
    },
  },
}
