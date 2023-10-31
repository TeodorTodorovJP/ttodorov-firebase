export interface Langs {
  bg: Lang
  en: Lang
}

interface Lang {
  main: Main
}

interface Main {
  header: string
  userId: string
  userNames: string
  userEmail: string
  offline: string
  onlyImages: string
  uploadImage: string
}

export const langs: Langs = {
  en: {
    main: {
      header: "Profile page",
      userId: "User Id:",
      userNames: "User names:",
      userEmail: "User email:",
      offline: "You are currently offline!",
      onlyImages: "You can only share images!",
      uploadImage: "Upload Image",
    },
  },
  bg: {
    main: {
      header: "Профилна страница",
      userId: "Потребителски номер:",
      userNames: "Имена:",
      userEmail: "Ел. Поща:",
      offline: "Нямате интернет връзка!",
      onlyImages: "Може да качите само снимки!",
      uploadImage: "Качете снимка",
    },
  },
}
