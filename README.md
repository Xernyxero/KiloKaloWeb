# FitApp 🍏 — Calculador Nutricional Inteligente & Asistente de Última Comida

> 🚀 **Despliegue en vivo:** ¡Prueba la aplicación ya mismo en [Netlify] (https://kilokalokalc.netlify.app/)!

FitApp es una aplicación web interactiva, moderna y centrada en la privacidad (100% basada en almacenamiento local) diseñada para el control diario de calorías y macronutrientes. 

El proyecto destaca no solo por su interfaz limpia y reactiva, sino por la inclusión de un **algoritmo de optimización inversa por tanteo** capaz de recalcular los gramos exactos de los ingredientes de una receta para rellenar de forma perfecta las barras de macronutrientes restantes del día.

---

## 🚀 Características Clave

* **Cálculo de TMB y GET Automatizado:** Implementación matemática de la fórmula de **Harris-Benedict** ajustada dinámicamente según el sexo, edad, peso, altura, nivel de actividad física y objetivos del usuario (pérdida, mantenimiento o ganancia de peso).
* **Reparto de Macros Inteligente:** Distribución automatizada basada en requerimientos de rendimiento deportivo:
    * Proteína fija a $2\text{g}$ por kg de peso.
    * Grasas fijas a $1\text{g}$ por kg de peso.
    * Carbohidratos asignados dinámicamente con las calorías restantes.
* **Interfaz Visual en Tiempo Real (RGB):** Panel de progreso interactivo con un anillo circular en SVG para las calorías totales y barras de progreso horizontales codificadas por colores para monitorizar proteínas, grasas y carbohidratos al instante.
* **Constructor de Platos Avanzado:** Permite añadir ingredientes crudos basándose en valores nutricionales por cada $100\text{g}$ y combinarlos de forma proporcional para crear y bautizar recetas personalizadas.
* **⚡ Algoritmo Asistente de Última Comida (Optimización Inversa):** La joya de la corona. Un motor de simulación matemática (límite de 1500 iteraciones virtuales) que evalúa el déficit nutricional del día actual y calibra gramo a gramo los componentes de una receta guardada para alcanzar el objetivo diario sin sobrepasar los límites establecidos.
* **Zero Backend & Máxima Privacidad:** Todo el estado de la aplicación, el historial del diario nutricional y el perfil del usuario se gestionan de manera persistente directamente en el navegador a través de `localStorage`.

---

## 🧠 Filosofía del Proyecto: Código 100% IA, Arquitectura 100% Humana

Este proyecto ha sido desarrollado bajo un paradigma avanzado de ingeniería de software: el **Desarrollo Dirigido por Inteligencia Artificial (AIGD)**. Rompe con la idea tradicional de programación para demostrar cómo la sinergia entre la dirección humana y la ejecución de la IA puede dar lugar a un producto de software complejo, funcional y optimizado.

### 🤖 El Rol de la IA: La Fuerza de Ejecución
El **100% de las líneas de código** de este repositorio (HTML, CSS y JavaScript) han sido escritas de forma automatizada por modelos de Inteligencia Artificial de última generación. La IA actuó como el "Socio de Código" (Coding Partner), encargándose de las tareas mecánicas y sintácticas:
* Escritura de lógica pura en JavaScript y manipulación limpia del DOM.
* Traducción matemática exacta de fórmulas nutricionales como la de *Harris-Benedict*.
* Maquetación del diseño adaptativo (Responsive Design) con CSS3 nativo.

### 👨‍💻 El Rol del Autor (O sea, Yo): Dirección de Producto & Prompt Engineering
Que el código haya sido generado por una IA no resta un ápice de valor técnico; al contrario, traslada el mérito al componente más crítico: **la capacidad estratégica y la arquitectura humana**. Mi rol en este proyecto ha sido el de *Product Owner*, *Arquitecto de Software* e *Ingeniero de Prompts*:

1.  **Concepción de la Idea y Diseño de Producto:** La idea original de crear una herramienta con enfoque de privacidad (sin servidores ni bases de datos externas) mediante un uso estricto de `localStorage` es una decisión de diseño puramente humana.
2.  **Arquitectura del Algoritmo de Tanteo:** La IA no inventó el algoritmo de optimización inversa para ajustar la última comida del día. Fui yo quien estructuró la lógica matemática del bucle por simulación (tanteo), definió el límite estricto de 1500 iteraciones para no colapsar el navegador del usuario y estableció los criterios de penalización para balancear proteínas, grasas y carbohidratos de forma eficiente.
3.  **Ingeniería de Prompts Avanzada:** Conseguir que la IA mantuviera el código desacoplado en cuatro archivos independientes (`index.html`, `diario.js`, `calculos.js`, `profile.js`) requirió mantener un contexto técnico impecable, pasar instrucciones modulares y controlar la coherencia de los datos compartidos.
4.  **Control de Calidad (QA) y Refactorización Dinámica:** Actué como el supervisor técnico riguroso. Identifiqué errores lógicos de la IA durante las fases de desarrollo (como duplicaciones de alimentos en el buscador mixto o desbordamientos visuales en las barras SVG), forzándola a corregir errores de sintaxis y a optimizar las funciones hasta lograr la estabilidad actual.

> **Nota para Reclutadores:** Este repositorio demuestra mi habilidad para conceptualizar proyectos complejos, estructurar código modular y dominar la IA no como una simple ayuda de autocompletado, sino como una herramienta de producción masiva bajo una estricta dirección técnica humana.