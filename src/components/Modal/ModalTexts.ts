export interface Langs {
  bg: Lang
  en: Lang
}

interface Lang {
  defaultModal: DefaultModal
  loader: Loader
}

interface DefaultModal {
  title: string
  text: string
  ok: string
  cancel: string
}

interface Loader {
  message: string
}

export const langs: Langs = {
  en: {
    defaultModal: {
      title: "Message",
      text: "Something is not right",
      ok: "OK",
      cancel: "Cancel",
    },
    loader: {
      message: "Loading...",
    },
  },
  bg: {
    defaultModal: {
      title: "Съобщение",
      text: "Нещо не е наред",
      ok: "OK",
      cancel: "Затвори",
    },
    loader: {
      message: "Зареждане...",
    },
  },
}
