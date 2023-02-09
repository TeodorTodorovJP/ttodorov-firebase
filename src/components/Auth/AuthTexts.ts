export interface Langs {
  bg: Lang;
  en: Lang;
}

interface Lang {
  main: Main;
  errorModal: ErrorModal;
  browserErrorModal: BrowserErrorModal;
  successModal: SuccessModal;
}

interface Main {
  login: string;
  createAccount: string;
  goToLogin: string;
  yourEmail: string;
  yourPassword: string;
  googleSignIn: string;
  anonymousSignIn: string;
}

interface ErrorModal {
  header: string;
  agree: string;
}

interface BrowserErrorModal {
  header: string;
  message: string;
  agree: string;
}

interface SuccessModal {
  header: string;
  agree: string;
  google: string;
  anonymous: string;
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
      anonymousSignIn: "Anonymous Login",
    },

    errorModal: {
      header: "Error",
      agree: "OK",
    },

    browserErrorModal: {
      header: "Error",
      message: "Please update your browser with a new version of Chrome or try other Login method!",
      agree: "OK",
    },

    successModal: {
      header: "Successful Login",
      agree: "OK",
      google: "LoggedIn with Google",
      anonymous: "LoggedIn as Anonymous",
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
      anonymousSignIn: "Влезте като анонимен потребител",
    },

    errorModal: {
      header: "Грешка",
      agree: "Добре",
    },

    browserErrorModal: {
      header: "Грешка",
      message: "Моля обновете вашият браузър с нова версия на Хром или опитайте друг метод за влизане!",
      agree: "Добре",
    },

    successModal: {
      header: "Успешно влизане",
      agree: "Добре",
      google: "Влезнахте чрез Google",
      anonymous: "Влезнахте като Анонимен",
    },
  },
};
