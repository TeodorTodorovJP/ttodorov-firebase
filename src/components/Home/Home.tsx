import classes from "./Home.module.css";

import Card from "../UI/Card";
import { Langs, langs } from "./homeTexts"
import { useAppSelector } from "../../app/hooks"
import { selectUserPreferences } from "../Auth/userSlice"

/**
 * The Home component returns a Card component with a div containing the text "Home Page".
 * returns a functional component named `Home` is being returned. It renders a `Card` component with
 * an additional class of "home" and a child `div` element with a class of `classes.home` and the text
 * "Home Page". The value of `classes.home` is not provided in the code snippet.
 */
export const Home = () => {
  const { lang: currentLang } = useAppSelector(selectUserPreferences)

  const DATA = {
    email: "ttodorov.jp@gmail.com",
    linkedIn: "www.linkedin.com/in/ttodorovjp",
    phone: "0882 59 19 90",
    repo: "https://github.com/TeodorTodorovJP/",
  }

  const { main } = langs[currentLang as keyof Langs]

  return (
    <Card additionalClass="home">
      <div className={classes.home}>
        <h1 className={classes.header}>{main.header}</h1>
        <div className={classes.data}>
          <div>
            <div>
              <div>{main.email}</div>
            </div>
            <div>
              <div>{main.linkedIn}</div>
            </div>
            <div>
              <div>{main.phone}</div>
            </div>
            <div>
              <div>{main.repo}</div>
            </div>
          </div>

          <div>
            <div>
              <div>{DATA.email}</div>
            </div>
            <div>
              <a href={DATA.linkedIn} target="_blank">
                {DATA.linkedIn}
              </a>
            </div>
            <div>
              <div>{DATA.phone}</div>
            </div>
            <div>
              <a href={DATA.repo} target="_blank">
                {DATA.repo}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default Home;
