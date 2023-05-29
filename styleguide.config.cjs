/*
Using var because if file is .ts Styleguide get's confused
and if .js has const, after tsconfig conversion to "target": "es5", const would not change to var

Every time before you run the script, go to tsconfig.json and remove "src/firebase-config.ts" from "include"
after the run return it.
This is because Styleguide can't handle that

This type of warning:
Warning: src\components\Auth\AuthForm.tsx matches a pattern defined in “components” or “sections” options in your style guide config but doesn’t export a component.

Is generated because the component does not have any props which confuses the "react-docgen-typescript" propsParser
*/
var merge = require("webpack-merge")
var path = require("path")
var glob = require("glob")

module.exports = {
  title: "TTodorov Documentation",
  pagePerSection: true,
  // "src/**/*.{js,jsx,ts,tsx}"
  // src/**/*.tsx
  // src/components/**/*.{js,jsx,ts,tsx}
  sections: [
    {
      name: "Source",
      description: "The main Source directory.",
      sectionDepth: 2,
      components: function () {
        return glob.sync(path.resolve(__dirname, "src/**/*.tsx")).filter(function (module) {
          return /\/[A-Z]\w*\.tsx$/.test(module)
        })
      },
      sections: [
        {
          name: "App",
          description: "The main app files.",
          sectionDepth: 2,
          components: function () {
            return glob.sync(path.resolve(__dirname, "src/app/*.tsx")).filter(function (module) {
              return /\/[A-Z]\w*\.tsx$/.test(module)
            })
          },
        },
        {
          name: "Components",
          description: "All components used by the app.",
          sectionDepth: 2,
          components: function () {
            return glob.sync(path.resolve(__dirname, "src/components/*.tsx")).filter(function (module) {
              return /\/[A-Z]\w*\.tsx$/.test(module)
            })
          },
          sections: [
            {
              name: "Home",
              description: "The main Home directory.",
              sectionDepth: 2,
              components: function () {
                return glob.sync(path.resolve(__dirname, "src/components/Home/*.tsx")).filter(function (module) {
                  return /\/[A-Z]\w*\.tsx$/.test(module)
                })
              },
            },
            {
              name: "Authentication",
              description: "The main Authentication directory.",
              sectionDepth: 2,
              components: function () {
                return glob.sync(path.resolve(__dirname, "src/components/Auth/*.tsx")).filter(function (module) {
                  return /\/[A-Z]\w*\.tsx$/.test(module)
                })
              },
            },
            {
              name: "Chat",
              description: "The main Chat directory.",
              sectionDepth: 2,
              components: function () {
                return glob.sync(path.resolve(__dirname, "src/components/Chat/**/*.tsx")).filter(function (module) {
                  return /\/[A-Z]\w*\.tsx$/.test(module)
                })
              },
            },
            {
              name: "Modal",
              description: "The Modal directory.",
              sectionDepth: 2,
              components: function () {
                return glob.sync(path.resolve(__dirname, "src/components/Modal/*.tsx")).filter(function (module) {
                  return /\/[A-Z]\w*\.tsx$/.test(module)
                })
              },
            },
            {
              name: "Navigation",
              description: "The Navigation directory.",
              sectionDepth: 2,
              components: function () {
                return glob.sync(path.resolve(__dirname, "src/components/Navigation/*.tsx")).filter(function (module) {
                  return /\/[A-Z]\w*\.tsx$/.test(module)
                })
              },
            },
            {
              name: "Notification",
              description: "The Notification directory.",
              sectionDepth: 2,
              components: function () {
                return glob.sync(path.resolve(__dirname, "src/components/Notif/*.tsx")).filter(function (module) {
                  return /\/[A-Z]\w*\.tsx$/.test(module)
                })
              },
            },
            {
              name: "Profile",
              description: "The Profile directory.",
              sectionDepth: 2,
              components: function () {
                return glob.sync(path.resolve(__dirname, "src/components/Profile/*.tsx")).filter(function (module) {
                  return /\/[A-Z]\w*\.tsx$/.test(module)
                })
              },
            },
            {
              name: "UI",
              description: "The UI directory.",
              sectionDepth: 2,
              components: function () {
                return glob.sync(path.resolve(__dirname, "src/components/UI/*.tsx")).filter(function (module) {
                  return /\/[A-Z]\w*\.tsx$/.test(module)
                })
              },
            },
          ],
        },
      ],
    },
  ],
  resolver: require("react-docgen").resolver.findAllComponentDefinitions,
  propsParser: require("react-docgen-typescript").withDefaultConfig({ propFilter: { skipPropsWithoutDoc: true } })
    .parse,
  // propsParser(filePath, source, resolver, handlers) {
  //   return require('react-docgen').parse(source, resolver, handlers)
  // },
  webpackConfig: merge(require("./webpack.config.cjs"), require("./node_modules/react-scripts/config/webpack.config")),
}
