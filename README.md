# Portfolio Russo Vittorio

Portfolio website per Creative Technologist & Motion Designer con gallery orizzontali infinite scroll.

## Struttura del Progetto

```
portfolio-russo/
├── index.html              # Homepage con gallery orizzontali
├── css/
│   └── style.css           # Stylesheet principale
├── js/
│   ├── data.js             # ⭐ FILE DATI - Modifica qui progetti e tool
│   ├── main.js             # JavaScript (infinite scroll + interazioni)
│   └── fluid-effect.js     # WebGL shader effetto fluido
├── pages/
│   ├── project.html        # Template pagina progetto singolo
│   ├── about.html          # Pagina About Me
│   ├── contact.html        # Pagina Contatti
│   └── privacy.html        # Privacy Policy
├── images/                 # Inserisci qui le tue immagini
└── videos/                 # Inserisci qui i tuoi video
```

## ⚠️ IMPORTANTE: Differenza tra PROJECT e TOOL

### PROJECT (Sezione "PROJECT")
- I tuoi **progetti di lavoro** (video, animazioni, installazioni, ecc.)
- Ogni progetto ha una **pagina dedicata**
- Click sulla card → apre pagina progetto
- Mostra i software usati (Blender, Cinema4D, ecc.)

### TOOL (Sezione "TOOL")  
- **Strumenti/web app che HAI CREATO tu**
- Solo immagine + video hover + titolo
- Click sulla card → **apre link esterno** al tool
- NON hanno pagina dedicata

---

## Come Modificare i Dati

### 1. Apri `js/data.js`

### 2. Aggiungi un PROGETTO (sezione PROJECT)

```javascript
// In PROJECTS array:
{
    id: "nome-progetto",
    title: "NOME PROGETTO",
    slug: "nome-progetto",
    tools: ["blender", "aftereffect"],  // Software usati (chiavi da SOFTWARE)
    thumbnail: "images/progetto.jpg",
    video: "videos/progetto.mp4",
    images: ["images/progetto-1.jpg", "images/progetto-2.jpg"],
    description: "Descrizione...",
    year: "2024",
    height: "tall"  // tall, medium, short, square
}
```

### 3. Aggiungi un TOOL (sezione TOOL)

```javascript
// In USER_TOOLS array:
{
    id: "mio-tool",
    title: "NOME DEL MIO TOOL",
    thumbnail: "images/tool-screenshot.jpg",
    video: "videos/tool-preview.mp4",
    url: "https://mio-tool.com"  // Link esterno al tool
}
```

### 4. Aggiungi un SOFTWARE (usato nei progetti)

```javascript
// In SOFTWARE object:
nuovosoftware: {
    name: "NOME SOFTWARE",
    url: "https://sito-ufficiale.com"
}
```

---

## Comportamento Click

| Sezione | Click sulla Card | Click sui Software |
|---------|------------------|-------------------|
| PROJECT | Apre pagina progetto | Apre sito software |
| TOOL | Apre link esterno tool | - |

---

## ✨ EFFETTO WEBGL FLUID CHROMATIC

Al passaggio del mouse sulle card, viene attivato un effetto WebGL che include:

### Componenti dell'Effetto

1. **Distorsione Tessuto (Fabric Displacement)**
   - Noise simplex multi-layer per movimento organico
   - Effetto "stoffa che ondeggia"
   - Si intensifica vicino al cursore

2. **Chromatic Aberration**
   - Separazione dei canali RGB
   - Effetto prisma/olografico
   - Segue la direzione della distorsione

3. **Iridescenza**
   - Overlay di colori cangianti
   - Shift cromatico basato su posizione e tempo

4. **Interazione Mouse**
   - Onde ripple che si propagano dal cursore
   - Intensità variabile in base alla distanza

### Comportamento

- **Stato normale**: Immagine statica
- **Hover IN**: Video parte + effetto WebGL si attiva
- **Durante hover**: Distorsione segue il mouse
- **Hover OUT**: Effetto dissolve, torna all'immagine

### Fallback

Se WebGL non è supportato, funziona normalmente con hover standard.

---

## Responsive Design

| Breakpoint | Descrizione |
|------------|-------------|
| > 1200px | Desktop — Card full size |
| 768-1200px | Tablet — Card ridotte |
| < 768px | Mobile — Card compatte |
| < 480px | Small Mobile — Card minime |

---

## Deploy

Il sito è completamente statico. Puoi hostarlo su:
- GitHub Pages
- Netlify
- Vercel
- Qualsiasi hosting statico

Basta caricare tutti i file così come sono.

---

## Risoluzione Problemi

### Le immagini non appaiono
1. Verifica che il path in `data.js` sia corretto
2. Verifica che i file esistano nella cartella `images/`
3. Controlla la console browser per errori

### Il video non parte in hover
1. Verifica che il formato sia MP4 o WebM
2. I browser bloccano autoplay con audio — assicurati che il video sia muto

### Loop infinito scatta
- Questo può accadere se ci sono pochi progetti
- Aggiungi più progetti per un loop più fluido

---

## Note Tecniche

- **Font**: Source Code Pro (Google Fonts)
- **CSS**: Vanilla CSS con variabili custom
- **JS**: Vanilla JavaScript (no framework)
- **WebGL**: Shader GLSL custom per effetti fluidi
- **Compatibilità**: Chrome, Firefox, Safari, Edge (ultimi 2 anni)

---

Creato con ❤️ per Russo Vittorio
