export interface Langs {
  bg: Lang;
  en: Lang;
}

interface Lang {
  main: Main;
  errorModal: ErrorModal;
}

interface Main {
  login: string;
  createAccount: string;
  goToLogin: string;
  yourEmail: string;
  yourPassword: string;
  googleSignIn: string;
}

interface ErrorModal {
  header: string;
  agree: string;
}

export const langs: Langs = {
  en: {
    main: {
      login: "Login",
      createAccount: "Create Account",
      goToLogin: "Go to Login",
      yourEmail: "Your Email",
      yourPassword: "Your Password",
      googleSignIn: "Sign In With Google",
    },

    errorModal: {
      header: "Error",
      agree: "OK",
    },
  },
  bg: {
    main: {
      login: "Влез",
      createAccount: "Създай профил",
      goToLogin: "Влез в профил",
      yourEmail: "Вашата поща",
      yourPassword: "Вашата парола",
      googleSignIn: "Влезте с Google",
    },

    errorModal: {
      header: "Грешка",
      agree: "Добре",
    },
  },
};
