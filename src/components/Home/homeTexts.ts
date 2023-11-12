/**
 * Exports the translated texts needed for Chat in Bulgarian and English
 */
export interface Langs {
  bg: Lang
  en: Lang
}

interface Lang {
  main: Main
  aboutMe: AboutMe
  skills: Skills
  experience: Experience
}

interface AboutMe {
  header: string
  one: string
  two: string
  three: string
}

interface Skills {
  header: string
  one: string
  two: string
}

interface Experience {
  header: string
  one: string
}

interface Main {
  headerOne: string
  headerTwo: string
  subHead: string
  projectsButtonLeft: string
  projectsButtonRight: string
  email: string
  linkedIn: string
  phone: string
  repo: string
  aboutButton: string
  skillsButton: string
  expButton: string
}

export const langs: Langs = {
  en: {
    main: {
      headerOne: "I am Teodor Todorov",
      headerTwo: "A Web Developer",
      subHead: "Hard-working Driven Innovative and a bit Creative",
      projectsButtonLeft: "VIEW MY PROJECTS",
      projectsButtonRight: "OR VISIT:",
      email: "Gmail",
      linkedIn: "LinkedIn",
      phone: "Phone",
      repo: "gitHub",
      aboutButton: "ABOUT ME",
      skillsButton: "SKILLS",
      expButton: "EXPERIENCE",
    },
    aboutMe: {
      header: "About Me",
      one: "If we get to know each other, you will see that I'm a hard-working individual, constantly setting new goals to achieve. I want to know how everything works, which is the main drive of my creativity. I know how to deliver value to my team by doing quality and thoughtful work, which would be a valuable asset for you in the future.",
      two: "During my free time, I do not stop learning. I developed this website using React, Redux and RTK, MUI, all in TypeScript.",
      three: "I have a great desire to grow and constantly improve. That applies to myself and the work that I do.",
    },
    skills: {
      header: "My Skills",
      one: "I write, extend and optimize, efficient, maintainable, and reusable code in a reliable way.",
      two: "In addition to my technical skills below, my education at UNWE and my previous marketing skills would be of great benefit when it comes to understanding the client and the business logic when collaborating.",
    },
    experience: {
      header: "My experience",
      one: "My 2 years experience, includes work with a large code base that maintains the financial needs of millions of users. The work included building several projects while reusing a lot of the existing systems and components and created new ones in the same style while maintaining other parts of the code base. Of course, I did not do that alone, often, the business logic is so intricate and complex that communication and feedback with my peers are regular.",
    },
  },
  bg: {
    main: {
      headerOne: "Аз съм Теодор Тодоров",
      headerTwo: "Уеб Програмист",
      subHead: "Трудолюбив Мотивиран Иновативен и леко Креативен",
      projectsButtonLeft: "ВИЖТЕ МОИТЕ ПРОЕКТИ",
      projectsButtonRight: "ИЛИ ПОСЕТЕТЕ:",
      email: "Gmail:",
      linkedIn: "LinkedIn:",
      phone: "Телефон:",
      repo: "gitHub",
      aboutButton: "ЗА МЕН",
      skillsButton: "УМЕНИЯ",
      expButton: "ОПИТ",
    },
    aboutMe: {
      header: "За Мен",
      one: "Ако се опознаем, ще видите, че съм трудолюбив човек, който постоянно си поставя нови цели за постигане. Искам да знам как работи всичко, което е основният двигател на моето творчество. Знам как да добавя стойност на екипа си, като върша качествена и обмислена работа, което би било ценен актив за вас в бъдеще.",
      two: "През свободното си време не спирам да уча. Разработих този уебсайт с помощта на React, Redux и RTK, MUI всичко чрез TypeScript.",
      three:
        "Имам голямо желание да се развивам и постоянно да се усъвършенствам. Това се отнася за мен самия, както и за работата, която върша.",
    },
    skills: {
      header: "Умения",
      one: "Пиша, разширявам и оптимизирам ефективен, лесен за поддръжка и преизползваем код по надежден начин.",
      two: "В допълнение към техническите ми умения по-долу, образованието ми в УНСС и предишният ми маркетинг опит биха били от голяма полза, когато става въпрос за разбиране на клиента и бизнес логиката при сътрудничество.",
    },
    experience: {
      header: "Опит",
      one: "Моите 2 години опит включват работа с голяма кодова база, която поддържа финансовите нужди на милиони потребители. Работата включва изграждане на няколко проекта при повторно използване на много от съществуващите системи и компоненти и създаване на нови в същия стил, като същевременно поддържах други части от кодовата база. Разбира се, не го правя сам, често бизнес логиката е толкова сложна, че комуникацията и обратната връзка с колегите ми са редовни.",
    },
  },
}
