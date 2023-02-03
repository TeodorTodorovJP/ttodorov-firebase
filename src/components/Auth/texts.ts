export interface Langs {
  bg: string;
  en: string;
}

interface Grouped {
  [key: string]: Langs;
}
interface Main {
  login: Langs;
}

interface Translates {
  main: Grouped;
  themeModal: Grouped;
}

export const langs = {
  main: {
    login: {
      bg: "Влез",
      en: "Login",
    },
    createAccount: {
      bg: "Създай профил",
      en: "Create Account",
    },
    goToLogin: {
      bg: "Влез в профил",
      en: "Go to Login",
    },
    yourEmail: {
      bg: "Вашата поща",
      en: "Your Email",
    },
    yourPassword: {
      bg: "Вашата парола",
      en: "Your Password",
    },
  },

  errorModal: {
    header: {
      bg: "Грешка",
      en: "Error",
    },
    agree: {
      bg: "Добре",
      en: "OK",
    },
  },
};
