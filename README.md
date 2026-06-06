# 🛸 Simhastha Ujjain Predictive Transit Command Center

An enterprise-grade real-time crowd dynamics and traffic routing dashboard built for the multi-million scale Ujjain Simhastha Mahakumbh. The application shifts transit management from reactive observation to proactive algorithmic mitigation.

## 🌟 Core Technical Highlights

* **Live Traffic Telemetry Integration:** Mounts an active vector-based `google.maps.TrafficLayer` over a customized, high-contrast dark municipal command canvas to monitor vehicular friction grids in real time.
* **Historical Matrix Parsing Engine:** Features a dedicated data pipe (`compile_dataset.py`) that preprocesses and digests 6 discrete sub-sections of historical crowd records across multiple transit cycles.
* **Domain-Aware Algorithmic Rerouting:** Leverages on-ground geographic constraints—specifically tracking the narrow bottleneck of the Harsiddhi Mata Temple Square and the physical displacement between the Mahakal Corridor and the Kshipra River banks.
* **Cognitive SLM Evaluation Feed:** Evaluates localized Volume-to-Capacity Ratios (VFR) and Time-To-Decline (TTD) metrics to override traditional short-path mapping, automatically throwing neon-red pulsing bypass vectors (`b1_outer_ring_diversion`) onto the live map when gridlock thresholds breach 1.25 VFR.

## 🛠️ The Tech Stack

* **Frontend:** React (Vite), TypeScript, Tailwind CSS
* **Geospatial SDK:** Google Maps JavaScript API via `@googlemaps/react-wrapper`
* **Data Processing:** Python (Pandas), JSON Schema Compilation
* **Deployment System:** Fully compiled production asset optimized for immediate cloud hosting

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
