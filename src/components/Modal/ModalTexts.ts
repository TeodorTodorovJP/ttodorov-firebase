export interface Langs {
  bg: Lang;
  en: Lang;
}

interface Lang {
  defaultModal: DefaultModal;
  loader: Loader;
  defaultError: DefaultError;
}

interface DefaultModal {
  agree: string;
}

interface Loader {
  message: string;
}

interface DefaultError {
  message: string;
  agree: string;
}

export const langs: Langs = {
  en: {
    defaultModal: {
      agree: "OK",
    },
    loader: {
      message: "Loading...",
    },
    defaultError: {
      message: "Error",
      agree: "OK",
    },
  },
  bg: {
    defaultModal: {
      agree: "OK",
    },
    loader: {
      message: "Зареждане...",
    },
    defaultError: {
      message: "Грешка",
      agree: "OK",
    },
  },
};
