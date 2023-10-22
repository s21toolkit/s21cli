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
- `prDirectory` - Папка для клонирования репозиториев пир ревью

s21cli загружает настройки через из локального/глобального файлов конфигурации и из окружения.

Файлы конфигурации должны называться `.s21.yaml` (Не `.yml`!) и располагаться в рабочей директории процесса или в `$HOME`.

Пример заполнения:

```yaml
username: example@student.21-school.ru
password: qwerty123
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
    - `ssh` - Получает ссылки на репозиторий текущего пир ревью
    - `clone` - Клонирует проект текущего пир ревью в новую папку
  - `test` - Отправляет тестовый запрос к платформе
    kek
