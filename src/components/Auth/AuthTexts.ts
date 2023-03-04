export interface Langs {
  bg: Lang;
  en: Lang;
}

interface Lang {
  main: Main;
  loaderModal: LoaderModal;
  errorModal: ErrorModal;
  browserErrorModal: BrowserErrorModal;
  successModal: SuccessModal;
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

interface ErrorModal {
  header: string;
  agree: string;
  email: string;
  password: string;
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
  email: string;
  anonymous: string;
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

    errorModal: {
      header: "Error",
      agree: "OK",
      email: "Invalid email",
      password: "Invalid password",
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
      email: "LoggedIn with Email",
      anonymous: "LoggedIn as Anonymous",
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

    errorModal: {
      header: "Грешка",
      agree: "Добре",
      email: "Грешен Email",
      password: "Грешна парола",
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
      email: "Влезнахте чрез Email",
      anonymous: "Влезнахте като Анонимен",
    },
  },
};
