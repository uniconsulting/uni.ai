# ЮНИ — landing foundation (Next.js + Tailwind v4 + GH Pages)

Что уже сделано:
- Next.js (App Router) со статическим экспортом (`output: 'export'`) под GitHub Pages.
- Tailwind CSS v4, но тема жёстко ограничена: 5 цветов + прозрачности, шаг сетки 4px, брейкпоинты 1440/768/360.
- Подключены библиотеки: framer-motion, lucide-react, react-hook-form + zod.
- Базовые UI-компоненты: Container, BentoTile, SectionTitle, Header.

## 1) Установка

```bash
pnpm i
pnpm dev
```

Откроется `http://localhost:3000`.

## 2) Шрифт Garet

Я не добавляю файлы шрифта в репозиторий (лицензия).

Сложи файлы сюда:
- `public/fonts/Garet-Book.woff2`
- `public/fonts/Garet-Heavy.woff2`

Пока файлов нет — будет системный fallback.

## 3) Деплой на GitHub Pages

Этот проект уже настроен так, чтобы **сам** подхватывать basePath вида `/<repo>` в CI (через `GITHUB_REPOSITORY`).

Шаги:
1) Создай репозиторий на GitHub и запушь код.
2) В репозитории: Settings → Pages → Source = **GitHub Actions**.
3) Actions → запустится workflow `Deploy to GitHub Pages` (после первого пуша в `main`).

Если репозиторий будет не `main`, поправь ветку в workflow.

## 4) Принципы, которые держим дальше

- Цвета: **только** 5 токенов из `src/styles/globals.css` (блок `@theme`).
- Отступы: только кратно 4px (тоже в `@theme`, блок `--spacing-*`).
- Радиусы: вложенность делаем через формулу `inner = outer - inset` (см. `src/lib/radius.ts`).
- Адаптив: ориентируемся на 1440/768/360.

