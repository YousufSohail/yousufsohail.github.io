# Repository Guidelines

## Project Structure & Module Organization
The site uses Jekyll with the default `minima` theme. Top-level Markdown pages such as `index.md` and `about.md` define the home and about sections. Long-form pages live in `pages/` and are linked via their front matter `permalink`. Blog posts belong in `_posts/` with dated filenames (`YYYY-MM-DD-title.md`); Jekyll pulls metadata from their YAML front matter. `_config.yml` centralises global settings, while `_site/` is a generated artefact and must stay untouched.

## Build, Test, and Development Commands
- `bundle install` — install Ruby gems listed in `Gemfile`.
- `bundle exec jekyll serve --livereload` — run the site locally at http://127.0.0.1:4000 with auto-reload.
- `JEKYLL_ENV=production bundle exec jekyll build` — produce a production-ready site in `_site/`.
- `bundle exec jekyll doctor` — surface configuration issues before shipping.

## Coding Style & Naming Conventions
Write content in Markdown with YAML front matter. Use two-space indentation in YAML and kebab-case for slugs. Posts must keep dates accurate in both the filename and `date:` field to avoid duplicate URLs. Example front matter:
```yaml
---
layout: post
title: "Example Title"
date: 2025-01-01
categories: reflections
---
```
Pages under `pages/` should set `layout: page` and a unique `permalink` that matches navigation updates.

## Testing Guidelines
Always run `bundle exec jekyll build` (or `serve`) before committing to ensure Liquid templates render. Review the generated `_site/` output for broken links, and spot-check new pages for metadata completeness (`title`, `description`, social cards). When adding posts, verify internally linked resources resolve.

## Commit & Pull Request Guidelines
Commit messages should be short, imperative statements, mirroring the existing history ("move out of /docs folder"). Group related content edits together; configuration changes deserve their own commit. Each PR should summarise the reader-facing change, link any GitHub issue, and note the local build command you ran. Include screenshots or a screencast when altering layout or styling.

## Deployment Notes
Pushing to the default branch triggers GitHub Pages to rebuild using `github-pages` gem versions pinned in `Gemfile.lock`. Do not bypass Bundler; locking dependencies keeps the Pages build reproducible. If you add plugins, ensure they are supported by GitHub Pages or provide a fallback.
