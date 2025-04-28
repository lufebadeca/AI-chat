# Message Chat: Chat Interactivo con IA Personalizada 🤖💬

Aplicación web interactiva desarrollada con Next.js y React que permite a los usuarios crear perfiles de personajes (con nombre, foto, descripción, etc.) y entablar conversaciones con ellos. Cada personaje cobra vida gracias a la inteligencia artificial de Google Gemini, que adapta sus respuestas basándose en el perfil y el historial de la conversación.

La aplicación utiliza Firebase para la gestión de la base de datos (Firestore) y el almacenamiento de archivos (Firebase Storage), asegurando la persistencia de los datos de usuario y las conversaciones.

## ✨ Características Principales

* **Creación de Usuarios:** Define personajes únicos con:
    * Nombre y Apellido
    * Foto de Perfil (subida y almacenada en Firebase Storage)
    * Edad
    * Teléfono
    * Fecha de Nacimiento
    * Descripción (clave para la personalidad de la IA)
* **Chat Interactivo:** Conversa individualmente con cada usuario creado.
* **IA Personalizada (Gemini):** Las respuestas son generadas por el modelo `gemini-2.0-flash` de Google, parametrizado con el nombre y la descripción del perfil para simular una conversación con ese personaje específico.
* **Memoria Conversacional:** Mantiene el contexto de la conversación guardando y reutilizando los últimos 20 mensajes del historial, lo que permite diálogos más coherentes y fluidos.
* **Persistencia de Datos:** Toda la información de los usuarios y las conversaciones se almacena de forma segura en Firebase (Firestore y Storage).
* **Interfaz Moderna:** Construida con Next.js, React y estilizada con Tailwind CSS. Incluye selector de emojis y íconos.

## 🚀 Tecnologías Utilizadas

* **Framework:** Next.js 15+
* **Librería Frontend:** React 19+
* **Inteligencia Artificial:** Google Gemini API (`@google/genai`, modelo `gemini-2.0-flash`)
* **Base de Datos:** Firebase Firestore
* **Almacenamiento:** Firebase Storage
* **Estilos:** Tailwind CSS 4+, styled-component (*Nota: verificar si es `styled-components`*), react-icons
* **UI/UX:** emoji-picker-react, react-hot-toast (para notificaciones)
* **Lenguaje:** JavaScript/TypeScript (implícito con Next.js)

## 🛠️ Instalación y Configuración Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/lufebadeca/AI-chat
    cd message-chat
    ```

2.  **Instalar dependencias:**
    Se recomienda usar `npm` o `yarn`.
    ```bash
    npm install
    # o
    yarn install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto. Necesitarás obtener tus credenciales de configuración de Firebase y tu API Key de Google AI Studio para Gemini. Añade las siguientes variables (reemplaza los valores de ejemplo):

    ```env
    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXX
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
    NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:XXXXXXXXXXXXXXXXXXXXXX

    # Google Gemini API Key
    GEMINI_API_KEY=AIzaSyYYYYYYYYYYYYYYYYYYYYYY
    ```
    *Asegúrate de tener un proyecto Firebase creado y configurado con Firestore y Storage habilitados.*