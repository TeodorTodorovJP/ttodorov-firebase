export interface Langs {
  bg: Lang
  en: Lang
}

interface Lang {
  main: Main
}

interface Main {
  title: string
  tags: string
  body: string
  save: string
  cancel: string
}

export const langs: Langs = {
  en: {
    main: {
      title: "Title",
      tags: "Tags",
      body: "Body",
      save: "Save",
      cancel: "Cancel",
    },
  },

  bg: {
    main: {
      title: "Заглавие",
      tags: "Категории",
      body: "Текст",
      save: "Запази",
      cancel: "Cancel",
    },
  },
}
