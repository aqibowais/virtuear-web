# EasyAR setup (what you need to do)

There are **two** EasyAR paths. Do **A** first so the page works today.
Do **B** only if Aymen wants official EasyAR Cloud Recognition in the comparison.

---

## A. Local tracker (no EasyAR account, no extra download)

This matches the printed `imagesAR` files in the app. It does **not** download OpenCV.js.

1. From `virtuear-web` run `npm run dev` (HTTPS).
2. On the phone open `https://<your-pc-ip>:5173/alpharas?engine=easyar`
3. Allow camera. Wait for **Point camera at a target image**.
4. Scan prints from `src/ar-alpharas/assets/image-targets/imagesAR/`.

---

## B. Official EasyAR WebAR (CRS) — required for a true EasyAR column

EasyAR’s **web** product does **not** ship Sense ImageTracker. It only does **cloud image recognition**. You must create a CRS library.

### 1. Create an EasyAR developer account

1. Open [https://www.easyar.com/](https://www.easyar.com/)
2. Sign up / log in (Sense / CRS enabled).
3. Open the **Developer / CRS** console.

### 2. Create API credentials

1. In the console create (or open) an **API Key** that includes **Cloud Recognition**.
2. Copy:
   - **API Key**
   - **API Secret**
3. Create a **CRS token** from Key + Secret (EasyAR console → Token / Cloud Token).

### 3. Create a Cloud Recognition image library

1. Create a **CRS image library**.
2. Copy these three values:
   - **CRS AppId**
   - **Client-end URL** (looks like `https://xxxx.cn1.crs.easyar.com:8443`)
   - **Cloud Token** (from step 2)

### 4. Upload the same 12 targets

Upload from:

`G:\mitacs project\virtuear-web\src\ar-alpharas\assets\image-targets\imagesAR\`

| File | Target name in CRS (must match) |
|------|----------------------------------|
| 1.png | `1` |
| 2.png | `2` |
| … | … |
| 12.png | `12` |

Use the **resized** files in that folder (already ≥ 480×640). Do not upload the tiny Android originals.

Optional Meta (base64 JSON is fine too): `{"video":"1.mp4"}` for target `1`, etc.

### 5. Put the three values in our code

Edit `src/ar-easyar/config.ts`:

```ts
export const EASYAR_CRS = {
  clientendUrl: 'https://YOUR-ID.cn1.crs.easyar.com:8443',
  token: 'YOUR_CLOUD_TOKEN',
  appId: 'YOUR_CRS_APP_ID',
}
```

### 6. Rebuild and test

```bash
npm run build:easyar
npm run dev
```

Open `/alpharas?engine=easyar` on the phone again.

If the browser console shows a **CORS** error on `/search`, EasyAR is blocking the web origin. Then either:

- add your HTTPS domain / `localhost` in the CRS library allowed origins (if the console has that), or
- tell me and we add a tiny local proxy so `/search` is called from the Vite server.

### 7. How to tell which mode is running

- Badge / footer **EasyAR local tracker** = path A (no account)
- **EasyAR CRS + local track** = path B (credentials filled in)

---

## Same assets as 8th Wall

- Images: `src/ar-alpharas/assets/image-targets/imagesAR/`
- Videos: `src/ar-alpharas/assets/videos/`
