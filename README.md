# Samin Akbarizahmati: Academic Portfolio

Static portfolio for **https://SaminAkbariz.github.io/** (HTML5, CSS3, vanilla JavaScript, Bootstrap 5, JSON content). No server, database or paid service is needed.

## Structure
- `index.html` (home) plus one page per section: `about.html`, `education.html`, `research.html`, `grades.html`, `skills.html`, `projects.html`, `training.html`, `publications.html`, `cv.html`, `contact.html`. Content is filled from JSON and the menu is built by `assets/js/main.js`, so a new menu item is added in one place (`PAGES` in main.js)
- `assets/css/style.css`, `assets/js/main.js`, `assets/js/theme.js`
- `data/*.json`: all editable content (profile, projects, education, skills, certificates)
- `data/fa/*.json` and `data/it/*.json`: Persian and Italian translations (only translated fields; photo, links and repo URLs come from the English files)
- `404.html`, `sitemap.xml`, `robots.txt`: error page and search-engine files
- `docs/project-readme-templates/`: README starting points for your project repositories
- `admin/`: local content editor (works in your browser only; it is not an online admin panel)
- `assets/images/`, `assets/cv/`: images and CV PDF
- `.nojekyll`: tells GitHub Pages to serve files as they are

All paths are relative, so the site works at the root URL `https://SaminAkbariz.github.io/`.

## Deploy on GitHub Pages
1. Sign in at github.com and click **New repository**. Name it exactly `SaminAkbariz.github.io`, set it to **Public**, and create it (no template needed).
2. Click **uploading an existing file**, drag in *everything inside this folder* (including the `.nojekyll` file and the `assets`, `data` and `admin` folders), then **Commit changes**. Do not upload a folder that contains the site folder; `index.html` must be at the top level.
3. Open **Settings > Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select branch `main` and folder `/ (root)`, then **Save**.
4. Open the **Actions** tab to watch the "pages build and deployment" run. A green check means it is live (usually 1 to 3 minutes).
5. Visit https://SaminAkbariz.github.io/ (hard refresh with Ctrl+Shift+R if you see an old version).

## Update content
1. Open the editor locally: in this folder run `python3 -m http.server` and visit `http://localhost:8000/admin/`.
2. Edit fields, press **Save draft and refresh preview**, then **Download JSON** for each tab you changed.
3. Replace the matching file in `data/` on GitHub (open the file, use the pencil or **Add file > Upload files**) and commit. The site updates after the Pages build finishes.

You can also edit `data/*.json` directly on GitHub.

## Replace the profile photo and CV
- Photo: add `assets/images/profile.jpg` (about 800x1000 px), then change `"photo"` in `data/profile.json` to `assets/images/profile.jpg`.
- CV: upload your PDF as `assets/cv/Samin-Akbarizahmati-CV.pdf`. **Make a public version without your date of birth, phone number and home address first.**
- Project images and links: set `"image"` and `"repo"` for each project in `data/projects.json`.

## Privacy
The site publishes only an official email address and phone number (see `phone` and `email` in `data/profile.json`). Date of birth, postal code, street address and national IDs are never published, and the CV PDF must not contain them either. Never commit passwords, API keys or tokens.

## Add certificate documents
1. Put the PDF or image in `assets/certificates/` (for example `django-course.pdf`).
2. In `data/certificates.json`, fill `documents` for that card: `{"label": "Django course", "file": "assets/certificates/django-course.pdf"}`. Add more objects for more files. Entries with an empty `file` are hidden.
3. Optionally fill `issuer` and `year`. Check each document for personal details (ID number, address) before publishing, because everything in the repository is public.

## Language switch
The "فا / EN" button in the menu switches between English and Persian and remembers the choice. Edit Persian text in `data/fa/*.json` (or the `fa/...` tabs in the editor). If you prefer a Persian spelling of your name, add `"name"` to `data/fa/profile.json`.

## Link preview (LinkedIn, WhatsApp, email)
`assets/images/og-image.png` (1200x630) is the preview image. After publishing, test the link at LinkedIn Post Inspector. Platforms cache previews, so changes may take a while to appear.

## Search engines
Submit `https://SaminAkbariz.github.io/` in Google Search Console and add `https://SaminAkbariz.github.io/sitemap.xml`.

## Project repositories
Copy a template from `docs/project-readme-templates/` into each project's repository as `README.md`, fill the bracketed parts with real information, then put the repository URL in `repo` in `data/projects.json`.

## Academic record (grades)
- Edit `data/transcript.json`: `courses` (one object per course: `name`, `name_fa`, `grade` as a number out of 20, optional `term` and `credits`), `gpa`, and `document`.
- Put the transcript PDF at `assets/transcripts/transcript.pdf`. **Remove your student ID, national ID and any other personal data before uploading**, because everything in the repository is public.
- Canadian and Italian values are calculated automatically in the browser from each Iranian grade. They are unofficial estimates. The Canadian bands are editable in `canadaBands`; Italy uses the Universitaly linear formula (pass 10 to 18/30, max 20 to 30/30).

## Rank and transcript data
- `data/transcript.json` holds all 37 courses (82 credits, GPA 18.91) copied from the certified English transcript, with the term, credits and grade for each course.
- `assets/transcripts/transcript.pdf` is a clean summary without national ID or other personal numbers. Do not upload the original scanned transcript or rank certificate; they contain your national ID.
- The 1st-rank statement appears in the hero badge (`badge` in `data/profile.json` and `data/fa/profile.json`) and in the B.Sc. entry of `data/education.json`.

## Grade scales
`data/transcript.json` > `canadaScales` lists three Canadian scales (WES-style, OMSAS Ontario, UBC/SFU 4.33). Each has `basis` (`iran` = bands on the 0-20 grade, `percent` = bands on grade x 5) and editable `bands`. `italy` holds the /30 (18-30) and /110 (66-110) ranges. The page and the transcript PDF are computed from the same numbers.

## Languages
The menu has an EN / FA / IT selector. UI strings are in `assets/js/i18n.js`; content translations are in `data/fa/` and `data/it/` (only translated fields; photo, links and repo URLs come from the English files). Course names and terms in `data/transcript.json` use `name_fa`, `name_it`, `term_fa`, `term_it`.

## 3D letter scenes
`assets/js/scenes.js` draws every 3D object (heart, books, magnifier, ball, A+, wrench, brain, gear, iris, phone, mail) on a canvas with no libraries. Add a canvas with `data-scene="name"`. The big "A+" on the grades page is fixed text in `scenes.js`; change `textShape("A+")` if your grade letter changes.

## Loading screen
The first page of a browser session shows a progress bar with the heart that turns white at 100%. It is skipped for later pages in the same session (`sessionStorage`).

## v4 changes
- **Home:** the duplicate 3D heart section was removed. The loading-screen heart (fine particles, soft glow, slow sway and breathing) stays.
- **Feature flags:** `assets/js/config.js` has `features.research` and `features.publications` (both `false` for now). Set a flag to `true` to bring that page back into the menu, the home page and every language. Hidden pages are not deleted; if opened directly they show a short "not available" notice and `noindex`. When you enable them, also add `research.html` / `publications.html` back to `sitemap.xml`.
- **Click to scatter and reform:** ball, books, A+, magnifier, wrench, flower and mail. Mouse click, touch tap or Enter/Space. Dragging only rotates. Overlapping clicks are ignored. With "reduce motion" the effect is shorter and smaller. Tune distance with `explode` in `CFG` in `assets/js/scenes.js`.
- **Contact:** phone, email, GitHub and LinkedIn cards in `data/profile.json` (`phone`, `phoneHref`, `email`, `links`, `location`). Set `location` to `""` to hide the city. The postal code and street address are intentionally not published.
- **Honors:** `honors` in `data/profile.json` (and the `fa`/`it` copies) is shown on the Education page.

## Adding certificates (Training page)
Edit `data/certificates.json`. `subjects` are the course topics from your CV. `categories` has three groups (official, institute, online); a group with no items stays hidden. Add an item to the matching `items` list:

```json
{
  "title": "Course or certificate title",
  "issuer": "Name exactly as printed on the certificate",
  "date": "2025",
  "topics": ["Python", "Django"],
  "credentialId": "optional",
  "verifyUrl": "https://optional-verification-link",
  "image": "assets/certificates/my-cert.jpg",
  "pdf": "assets/certificates/my-cert.pdf"
}
```
Put files in `assets/certificates/`. `View Certificate` appears only if `image`, `pdf` or `verifyUrl` is set (image opens in a lightbox, PDF in a new tab). Leave a field out if you do not have it. Before uploading scans, cover or crop national ID numbers, signatures and other private details. For Persian and Italian, add the same item at the same position in `data/fa/certificates.json` and `data/it/certificates.json` with translated `title`, `topics` and (if you want) `issuer`.
