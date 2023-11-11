export interface Langs {
  bg: Lang
  en: Lang
}

interface Lang {
  main: Main
  error: Error
  onDeleteNote: OnDeleteNote
  onDeleteTag: OnDeleteTag
}

interface Error {
  title: string
  tags: string
  body: string
  noTags: string
  noNotes: string
}

interface OnDeleteNote {
  title: string
  cancel: string
  ok: string
  text: string
}

interface OnDeleteTag {
  title: string
  cancel: string
  ok: string
  text: string
}

interface Main {
  notes: string
  newNote: string
  title: string
  tags: string
  body: string
  save: string
  edit: string
  editTags: string
  editTagsDesc: string
  cancel: string
  delete: string
  success: string
}

export const langs: Langs = {
  en: {
    main: {
      notes: "Notes",
      newNote: "New Note",
      title: "Title",
      tags: "Tags",
      body: "Text",
      save: "Save",
      edit: "Edit",
      editTags: "Edit Tags",
      editTagsDesc: "Delete any tag you don't want to see in your tag suggestions.",
      cancel: "Cancel",
      delete: "Delete",
      success: "Success!",
    },
    error: {
      title: "Please enter a title between 3 and 70 symbols.",
      tags: "Please enter between 1 and 6 tags.",
      body: "Please enter a body text between 5 and 5000 symbols.",
      noTags: "You have no saved tags. Please make at least one note to change that.",
      noNotes: "You have no saved Notes. Please make at least one note to change that.",
    },
    onDeleteNote: {
      title: "Delete",
      cancel: "Cancel",
      ok: "OK",
      text: "Do you want to delete this note?",
    },
    onDeleteTag: {
      title: "Delete",
      cancel: "Cancel",
      ok: "OK",
      text: "Do you want to delete this tag?",
    },
  },

  bg: {
    main: {
      notes: "Записки",
      newNote: "Нова записка",
      title: "Заглавие",
      tags: "Групи",
      body: "Текст",
      save: "Запази",
      edit: "Промени",
      editTags: "Групи",
      editTagsDesc: "Изтриите групите които не желаете да бъдат предлагани.",
      cancel: "Назад",
      delete: "Изтрий",
      success: "Успешно!",
    },
    error: {
      title: "Моля въведете заглавие с дължина между 3 и 70 символа.",
      tags: "Моля въведете от 1 до 6 групи.",
      body: "Моля въведете текст с дължина между 5 и 5000 символа.",
      noTags: "Нямате запазени групи. Направете поне една записка за да промените това.",
      noNotes: "Нямате запазени записки. Направете поне една записка за да промените това.",
    },
    onDeleteNote: {
      title: "Изтриване",
      cancel: "Не",
      ok: "Да",
      text: "Желаете ли да изтриете тази записка?",
    },
    onDeleteTag: {
      title: "Изтриване",
      cancel: "Не",
      ok: "Да",
      text: "Желаете ли да изтриете тази категория?",
    },
  },
}
