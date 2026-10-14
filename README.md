# Marcus Lin — portfolio

A static, recruiter-friendly portfolio with responsive electric micro-interactions. The content is ordinary HTML so the experience and project details remain readable without JavaScript.

## Local preview

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Checks

```sh
node --test
```

## GitHub Pages

The site uses relative asset paths, so it works at either a user site (`username.github.io`) or a project site (`username.github.io/repository`). The included workflow publishes the repository root on pushes to `main`. In repository **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**.

Update experience, open source, and project copy in `index.html`. Replace `assets/marcus-headshot.jpg` and `assets/Marcus_Lin_Resume.pdf` when those materials change.
