# s21cli

Консольный интерфейс для работы с платформой школы 21.

## Установка

> [!WARNING]
> Так как Bun для Windows пока в разработке, сборок для Windows не предусмотрено.

Установка через скрипт:

```sh
curl -fsSL https://raw.githubusercontent.com/s21toolkit/s21cli/master/scripts/install_binary.sh | sh
```

Установка бинарного релиза вручную: [[Релизы](https://github.com/s21toolkit/s21cli/releases)]

<details>

<summary>
Установка через Bun
</summary>

> [!IMPORTANT]
> Для работы необходимо установить <a href="https://bun.sh">Bun</a>
>
> ```sh
> curl -fsSL https://bun.sh/install | bash
> ```

```sh
bun add -g github:s21toolkit/s21cli-ts
```

</details>

## Настройка

Поддерживаемые настройки:

- `username` - Логин (с почтой) от платформы
- `password` - Пароль от платформы
- `token` - Токен API
- `schoolId` - SchoolID пользователя
- `prDirectory` - Папка для клонирования репозиториев пир ревью
- `debugRawErrors` - Включает отображение детальной информации об ошибках

> [!NOTE]
> Аутентификация производится либо через логин/пароль, либо через токен (дополнительно можно указать SchoolID).
>
> Если в конфигурации указан токен, использоваться будет он. При использовании готового токена он не будет обновляться автоматически.
> Если при аутентификации через токен не указан SchoolID, он будет запрошен.
>
> Если токен не указан, будет использоваться логин/пароль.
> Если не указано ничего из вышеперечисленного произойдёт ошибка.

s21cli загружает настройки через из локального/глобального файлов конфигурации и из окружения. Локальный конфиг берётся из рабочей директории, глобальный из `$HOME`.

Файлы конфигурации должны называться `.s21` и могут быть в формате YAML (`.yml`, `.yaml`), JS (`.js`, `.cjs`, `.mjs`) и TS (`.ts`, `.cts`, `.mts`).

Пример заполнения `.s21.yaml`:

```yaml
username: example@student.21-school.ru
password: qwerty123
```

Пример заполнения `.s21.mjs`:

```mjs
export default {
  username: "example@student.21-school.ru",
  password: "qwerty123",
  prDirectory: `${process.env.HOME}/school21/peer_reviews`
}
```

Переменные окружения должны иметь формат `S21_<настройка>`, например:

```sh
export S21_prDirectory=$HOME/school21/peer_reviews
```

Приоритет загрузки: Глобальные настройки < Локальные настройки < Окружение

То есть настройки из окружения перезаписывают настройки из файлов и тд.

## Использование

```sh
s21 <...commands> [...args]
```

## Команды

Для всех команд доступен флаг `-h` для получения справки.

- `s21`
  - `pr`
    - `link` - Получает ссылки на репозиторий текущего пир ревью
    - `clone` - Клонирует проект текущего пир ревью в новую папку
    - `list` - Отображает список текущих пир ревью
  - `test` - Отправляет тестовый запрос к платформе
  - `api` - Выполняет указанный метод API, возвращает данные в формате JSON (см. [s21docs/api-operations](https://github.com/s21toolkit/s21docs/blob/master/operations.md))
  - `gql` - Выполняет указанный GQL запрос, возвращает данные в формате JSON
  - `auth` - Выполняет аутентификацию по логину и паролю, возвращает токен и schoolId
