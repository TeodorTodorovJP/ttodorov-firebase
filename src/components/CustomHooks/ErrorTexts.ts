export interface ErrorsType {
  "code-expired": string;
  "cors-unsupported": string;
  "requires-recent-login": string;
  "email-already-in-use": string;
  "expired-action-code": string;
  "cancelled-popup-request": string;
  "internal-error": string;
  "invalid-app-credential": string;
  "invalid-auth-event": string;
  "invalid-verification-code": string;
  "invalid-email": string;
  "wrong-password": string;
  "invalid-phone-number": string;
  "invalid-recipient-email": string;
  "missing-iframe-start": string;
  "account-exists-with-different-credential": string;
  "network-request-failed": string;
  "no-auth-event": string;
  "popup-blocked": string;
  "popup-closed-by-user": string;
  "quota-exceeded": string;
  "redirect-cancelled-by-user": string;
  "redirect-operation-pending": string;
  timeout: string;
  "user-token-expired": string;
  "too-many-requests": string;
  "unverified-email": string;
  "user-not-found": string;
  "user-disabled": string;
  "weak-password": string;
  "web-storage-unsupported": string;
  "error-not-found": string;
  "disallowed-useragent": string;
}

const en = {
  "code-expired": "The SMS code has expired. Please re-send the verification code to try again.",
  "cors-unsupported": "This browser is not supported.",
  "requires-recent-login":
    "This operation is sensitive and requires recent authentication. Log in again before retrying this request.",
  "email-already-in-use": "The email address is already in use by another account.",
  "expired-action-code": "The action code has expired.",
  "cancelled-popup-request": "This operation has been cancelled due to another conflicting popup being opened.",
  "internal-error": "An internal AuthError has occurred.",
  "invalid-app-credential":
    "The phone verification request contains an invalid application verifier. The reCAPTCHA token response is either invalid or expired.",
  "invalid-auth-event": "An internal AuthError has occurred.",
  "invalid-verification-code":
    "The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and be sure to use the   verification code provided by the user.",
  "invalid-email": "The email address is badly formatted.",
  "wrong-password": "The password is invalid or the user does not have a password.",
  "invalid-phone-number":
    "The format of the phone number provided is incorrect. Please enter the phone number in a format that can be parsed into E.164 format. E.164 phone numbers are written in the format [country code[subscriber number]] including area code.",
  "invalid-recipient-email":
    "The email corresponding to this action failed to send as the provided recipient email address is invalid.",
  "missing-iframe-start": "An internal AuthError has occurred.",
  "account-exists-with-different-credential":
    "An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.",
  "network-request-failed":
    "A network AuthError (such as timeout, interrupted connection or unreachable host) has occurred.",
  "no-auth-event": "An internal AuthError has occurred.",
  "popup-blocked": "Unable to establish a connection with the popup. It may have been blocked by the browser.",
  "popup-closed-by-user": "The popup has been closed by the user before finalizing the operation.",
  "quota-exceeded": "The project's quota for this operation has been exceeded.",
  "redirect-cancelled-by-user": "The redirect operation has been cancelled by the user before finalizing.",
  "redirect-operation-pending": "A redirect sign-in operation is already pending.",
  timeout: "The operation has timed out.",
  "user-token-expired": "The user's credential is no longer valid. The user must sign in again.",
  "too-many-requests": "We have blocked all requests from this device due to unusual activity. Try again later.",
  "unverified-email": "The operation requires a verified email.",
  "user-not-found": "There is no user record corresponding to this identifier. The user may have been deleted.",
  "user-disabled": "The user account has been disabled by an administrator.",
  "weak-password": "The password must be 6 characters long or more.",
  "web-storage-unsupported": "This browser is not supported or 3rd party cookies and data may be disabled.",
  "error-not-found": "Error",
  "disallowed-useragent": "This browser is not supported.",
};

const bg = {
  "code-expired": "SMS кодът е изтекъл. Моля, изпратете отново кода за потвърждение, за да опитате отново.",
  "cors-unsupported": "Този браузър не се поддържа.",
  "requires-recent-login":
    "Тази операция е чувствителна и изисква скорошно удостоверяване. Влезте отново, преди да опитате отново тази заявка.",
  "email-already-in-use": "Имейл адресът вече се използва от друг акаунт.",
  "expired-action-code": "Кодът за действие е изтекъл.",
  "cancelled-popup-request": "Тази операция е отменена поради отваряне на друг конфликтен изскачащ прозорец.",
  "internal-error": "Възникна вътрешна AuthError.",
  "invalid-app-credential":
    "Заявката за проверка на телефона съдържа невалиден верификатор на приложение. Отговорът на токена reCAPTCHA е или невалиден, или е изтекъл.",
  "invalid-auth-event": "Възникна вътрешна AuthError.",
  "invalid-verification-code":
    "SMS кодът за потвърждение, използван за създаване на идентификационните данни за телефон, е невалиден. Моля, изпратете отново SMS с кода за потвърждение и не забравяйте да използвате кода за потвърждение, предоставен от потребителя.",
  "invalid-email": "Имейл адресът е неправилно форматиран.",
  "wrong-password": "Паролата е невалидна или потребителят няма парола.",
  "invalid-phone-number":
    "Форматът на предоставения телефонен номер е неправилен. Моля, въведете телефонния номер във формат, който може да бъде анализиран във формат E.164. Телефонните номера E.164 се изписват във формат [код на държава[номер на абонат]], включително код на област.",
  "invalid-recipient-email":
    "Имейлът, съответстващ на това действие, не успя да бъде изпратен, тъй като предоставеният имейл адрес на получателя е невалиден.",
  "missing-iframe-start": "Възникна вътрешна AuthError.",
  "account-exists-with-different-credential":
    "Вече съществува акаунт със същия имейл адрес, но различни идентификационни данни за вход. Влезте с помощта на доставчик, свързан с този имейл адрес.",
  "network-request-failed": "Възникна мрежова AuthError (като изчакване, прекъсната връзка или недостъпен хост).",
  "no-auth-event": "Възникна вътрешна AuthError.",
  "popup-blocked": "Не може да се установи връзка с изскачащия прозорец. Възможно е да е блокиран от браузъра.",
  "popup-closed-by-user": "Изскачащият прозорец е затворен от потребителя преди финализиране на операцията.",
  "quota-exceeded": "Квотата на проекта за тази операция е надвишена.",
  "redirect-cancelled-by-user": "Операцията за пренасочване е отменена от потребителя преди финализиране.",
  "redirect-operation-pending": "Вече предстои операция за пренасочване на влизане.",
  timeout: "Операцията изтече.",
  "user-token-expired":
    "Идентификационните данни на потребителя вече не са валидни. Потребителят трябва да влезе отново.",
  "too-many-requests":
    "Блокирахме всички заявки от това устройство поради необичайна дейност. Опитайте отново по-късно.",
  "unverified-email": "Операцията изисква потвърден имейл.",
  "user-not-found": "Няма потребителски запис, съответстващ на този идентификатор. Потребителят може да е изтрит.",
  "user-disabled": "Потребителският акаунт е деактивиран от администратор.",
  "weak-password": "Паролата трябва да е с дължина 6 знака или повече.",
  "web-storage-unsupported":
    "Този браузър не се поддържа или бисквитките и данните на трети страни може да са деактивирани.",
  "error-not-found": "Грешка",
  "disallowed-useragent": "Този браузър не се поддържа.",
};

export default { en, bg };
