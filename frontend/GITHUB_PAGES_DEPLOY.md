# Östra Squad - GitHub Pages Deployment

En fotbollsplanerings-app för Östra Almby FK.

## Snabb-deploy till GitHub Pages

### 1. Skapa ett GitHub-repo

1. Gå till [github.com/new](https://github.com/new)
2. Namnge repot (t.ex. `ostra-squad`)
3. Välj **Public**
4. Klicka **Create repository**

### 2. Ladda upp koden

```bash
# I frontend-mappen
cd frontend

# Initiera git (om inte redan gjort)
git init

# Lägg till ditt repo som remote
git remote add origin https://github.com/DITT-ANVÄNDARNAMN/ostra-squad.git

# Lägg till alla filer
git add .

# Commit
git commit -m "Initial commit"

# Push till GitHub
git push -u origin main
```

### 3. Deploy till GitHub Pages

```bash
# Kör deploy-scriptet
npm run deploy
```

Detta bygger appen och pushar till `gh-pages`-branchen automatiskt.

### 4. Aktivera GitHub Pages

1. Gå till ditt repo på GitHub
2. Klicka **Settings** → **Pages**
3. Under **Source**, välj `gh-pages` branch
4. Klicka **Save**

Din app finns nu på: `https://DITT-ANVÄNDARNAMN.github.io/ostra-squad/`

---

## Alternativ: Manuell deployment

Om du vill deploya manuellt:

```bash
# Bygg appen
npm run build

# Innehållet i /build-mappen kan laddas upp till valfri statisk hosting
```

---

## Funktioner på GitHub Pages

✅ **Fungerar utan backend:**
- Drag-and-drop spelare på planen
- Spara uppställningar (lokalt i webbläsaren)
- Exportera som bild
- Installera som app (PWA)
- Spelarredigering (lokalt)

⚠️ **Begränsningar utan backend:**
- Delade länkar fungerar endast på samma enhet
- Spelarändringar sparas endast lokalt

---

## Fullständig version med backend

För global delning och spelarhantering behövs backend:

1. Deploy backend till t.ex. Railway, Render eller Heroku
2. Konfigurera MongoDB (t.ex. MongoDB Atlas)
3. Sätt `REACT_APP_BACKEND_URL` i `.env` före build

---

## Teknisk info

- **Frontend:** React + Tailwind CSS
- **Drag & Drop:** @dnd-kit
- **Build:** Create React App (CRACO)
- **Deployment:** gh-pages

## Licens

MIT
