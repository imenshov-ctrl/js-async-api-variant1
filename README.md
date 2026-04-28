# GitHub Explorer — Async/Await

> Практична робота 10.2 · Варіант 1 · Async/Await та робота з API

## Опис

Додаток для перегляду профілів GitHub користувачів та їх репозиторіїв. Використовує реальний GitHub API, async/await для всіх запитів, Promise.all для паралельного завантаження.

## Запуск

```bash
start index.html   # Windows
open index.html    # macOS
```

> Відкривається прямо у браузері — не потребує сервера.

---

## Функціональність

- **Пошук** за username (Enter або кнопка)
- **Профіль** — аватар, ім'я, bio, repos/followers/following/gists
- **Репозиторії** — список з сортуванням (нещодавні / stars / forks)
- **Деталі репо** — статистика, мови програмування з відсотками, посилання
- **Паралельне завантаження** — профіль + репозиторії через `Promise.all`
- **Rate limit** — відображається у хедері (залишилось запитів)
- **Skeleton loaders** — під час завантаження
- **Error handling** — неіснуючі користувачі, rate limit, мережеві помилки

---

## API

```
GET https://api.github.com/users/{username}
GET https://api.github.com/users/{username}/repos
GET https://api.github.com/repos/{owner}/{repo}
GET https://api.github.com/repos/{owner}/{repo}/languages
```

---

## Async/Await приклади

### Паралельне завантаження

```js
// Профіль і репозиторії завантажуються ОДНОЧАСНО
const [user, repos] = await Promise.all([
  fetchUser(username),
  fetchUserRepos(username, sort),
]);
```

### Обробка помилок

```js
async function search() {
  try {
    const [user, repos] = await Promise.all([...]);
    renderProfile(user);
    renderRepos(repos);
  } catch (err) {
    showError(err.message); // rate limit, 404, мережева помилка
  } finally {
    setLoading(false);      // завжди скидає spinner
  }
}
```

### apiFetch з валідацією

```js
async function apiFetch(url) {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } });

  if (res.status === 403) throw new Error(`Rate limit вичерпано`);
  if (res.status === 404) throw new Error('Користувача не знайдено');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.json();
}
```

---

## Demo відео

> https://github.com/imenshov-ctrl/js-async-api-variant1/blob/main/GitHub%20Explorer%20%E2%80%94%20Async_Await%20-%20Google%20Chrome%202026-04-28%2020-32-28.mp4

---

## Критерії оцінювання

| Критерій | Бали | Статус |
|----------|------|--------|
| Async/Await використання | 2 | ✅ async/await скрізь, без .then() |
| Робота з API | 2 | ✅ реальний GitHub API, 4 ендпоінти |
| Error Handling | 2 | ✅ try/catch, rate limit, 404, finally |
| UX/UI | 2 | ✅ skeleton, spinner, error messages |
| Якість коду та демо | 2 | ✅ README, структура, коментарі |
| **Всього** | **10** | |
