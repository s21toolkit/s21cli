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

s21cli использует переменные окружения для настройки:

- `S21_USERNAME` - Логин (с почтой) от платформы
- `S21_PASSWORD` - Пароль от платформы
- `S21_PR_DIRECTORY` - Папка для клонирования репозиториев пир ревью

## Использование

```sh
s21 <...commands> [...args]
```

## Команды

Для всех команд доступен флаг `-h` для получения справки.

- `s21`
  - `pr`
    - `ssh` - Получает ссылки на репозиторий текущего пир ревью
    - `clone` - Клонирует проект текущего пир ревью в новую папку
  - `test` - Отправляет тестовый запрос к платформе
    kek
