# Demo with Better Testing with Vue app

## Create project with Vite

```
$npm create vite@latest
$npm install
$npm install vue-router@4
$npm install -D tailwindcss postcss autoprefixer
```

## Format code

```
$npm install --save-dev --save-exact prettier

$npm run format:check
$npm run format
```

## Install Vitest

```
$npm install -D vitest
```

## Run e2e test with playwright

```
$npm install -D @playwright/test@latest
$npx playwright install --with-deps
```

Run

```
$npm run dev
$npm run test:e2e:playwright
```

## Run Component test

```
$npm run test:unit
```
