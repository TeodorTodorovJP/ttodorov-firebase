export interface Langs {
  bg: Lang;
  en: Lang;
}

interface Lang {
  main: Main;
  loaderModal: LoaderModal;
}

interface Main {
  login: string;
  email: string;
  goBack: string;
  options: string;
  createAccount: string;
  goToLogin: string;
  yourEmail: string;
  yourPassword: string;
  googleSignIn: string;
  anonymousSignIn: string;
}

interface LoaderModal {
  header: string;
}

export const langs: Langs = {
  en: {
    main: {
      login: "Login",
      email: "Email",
      goBack: "back",
      options: "Choose a Login method",
      createAccount: "Create Account",
      goToLogin: "Go to Login",
      yourEmail: "Your Email",
      yourPassword: "Your Password",
      googleSignIn: "Sign In With Google",
      anonymousSignIn: "Anonymous Login",
    },

    loaderModal: {
      header: "Loading",
    },
  },
  bg: {
    main: {
      login: "Влез",
      email: "Email",
      goBack: "назад",
      options: "Изберете начин на влизане",
      createAccount: "Създай профил",
      goToLogin: "Влез в профил",
      yourEmail: "Вашата поща",
      yourPassword: "Вашата парола",
      googleSignIn: "Влезте с Google",
      anonymousSignIn: "Влезте като анонимен потребител",
    },

    loaderModal: {
      header: "Зареждане",
    },
  },
};
