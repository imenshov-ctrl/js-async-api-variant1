/**
 * @fileoverview Практична робота 10.2 — Async/Await та робота з API
 * Варіант 1: GitHub User Explorer
 *
 * Сервісний шар для роботи з GitHub API.
 * Всі функції використовують async/await.
 */

const BASE_URL = 'https://api.github.com';

// ── Утиліта: fetch з обробкою помилок ────────────────────────

/**
 * Обгортка над fetch з async/await та валідацією відповіді
 * @param {string} url
 * @returns {Promise<any>}
 * @throws {Error} з деталями про помилку API
 */
async function apiFetch(url) {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/vnd.github.v3+json' },
  });

  // Rate limit
  if (response.status === 403) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    const resetTime = reset
      ? new Date(parseInt(reset) * 1000).toLocaleTimeString('uk-UA')
      : 'невідомо';
    throw new Error(`GitHub API rate limit вичерпано. Скидається о ${resetTime}. Залишок: ${remaining}`);
  }

  // Користувача не знайдено
  if (response.status === 404) {
    throw new Error('Користувача не знайдено');
  }

  if (!response.ok) {
    throw new Error(`HTTP помилка: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ═══════════════════════════════════════════════════════════════
//  API функції
// ═══════════════════════════════════════════════════════════════

/**
 * Отримати профіль користувача GitHub
 * @param {string} username
 * @returns {Promise<Object>} профіль користувача
 */
async function fetchUser(username) {
  if (!username?.trim()) throw new Error('Введіть username');
  return apiFetch(`${BASE_URL}/users/${username.trim()}`);
}

/**
 * Отримати репозиторії користувача
 * @param {string} username
 * @param {'stars'|'forks'|'updated'} sort
 * @returns {Promise<Array>}
 */
async function fetchUserRepos(username, sort = 'updated') {
  const sortParam = sort === 'stars' ? 'stargazers_count'
    : sort === 'forks' ? 'forks_count' : 'pushed_at';

  const repos = await apiFetch(
    `${BASE_URL}/users/${username}/repos?per_page=100&sort=pushed`
  );

  // Сортування на клієнті для гнучкості
  return repos.sort((a, b) => {
    if (sort === 'stars')   return b.stargazers_count - a.stargazers_count;
    if (sort === 'forks')   return b.forks_count - a.forks_count;
    return new Date(b.pushed_at) - new Date(a.pushed_at);
  });
}

/**
 * Отримати деталі репозиторію
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<Object>}
 */
async function fetchRepoDetails(owner, repo) {
  return apiFetch(`${BASE_URL}/repos/${owner}/${repo}`);
}

/**
 * Отримати мови репозиторію
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<Object>} { JavaScript: 12345, ... }
 */
async function fetchRepoLanguages(owner, repo) {
  return apiFetch(`${BASE_URL}/repos/${owner}/${repo}/languages`);
}

/**
 * Отримати профіль і репозиторії ПАРАЛЕЛЬНО через Promise.all
 * @param {string} username
 * @returns {Promise<{ user, repos }>}
 */
async function fetchUserAndRepos(username, sort = 'updated') {
  // Паралельне завантаження — обидва запити йдуть одночасно
  const [user, repos] = await Promise.all([
    fetchUser(username),
    fetchUserRepos(username, sort),
  ]);
  return { user, repos };
}

export {
  fetchUser,
  fetchUserRepos,
  fetchRepoDetails,
  fetchRepoLanguages,
  fetchUserAndRepos,
};
