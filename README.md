# lameserver.net

A personal board in the ANSI/BBS tradition — Renegade menus, Phrack-style
philes, ACiD-flavored art — rendered in Dracula colors with modern glow.
Written in org-mode, built by a single Emacs Lisp file, served as static
HTML from `docs/` via GitHub Pages.

```
org/posts/NNNN-slug.org  →  lameserver.net/phile/0xNN/
org/pages/about.org      →  lameserver.net/about/
org/media/               →  lameserver.net/media/   (images become ANSI art)
```

## How it works

- **`publish.el`** is the whole build: manifest scan → derived ox-html
  backend → chafa-to-ANSI image conversion (SGR parsed to HTML by elisp) →
  GPG signing → board/category/feed/search generation. Batch-capable:
  `emacs --batch -l publish.el -f lameserver-publish-batch`
- **Every phile is signed.** Each post ships its org source and a detached
  armor signature: `gpg --verify source.org.asc source.org`. Public key at
  `/pubkey.asc`.
- **Images render as colored ANSI** (half-block, or braille via
  `#+ATTR_LAMESERVER: :symbols braille`). Click to toggle the real image.
- **Keyboard-driven**: `?` on any page shows the hotkeys. j/k/enter drive
  the board like a proper file listing.
- Splash gate at `/`, PRESS ANY KEY to enter.

## Writing

From Emacs (module `grim-lameserver.el` in the owner's config): `C-c L n`
new phile, `C-c L p` local preview, `C-c L d` build + commit + push.
Drag/drop images into org buffers via org-download → `org/media/`.

## Type & credits

Monaspace Argon (body), Px437 IBM VGA 8x16 from the Ultimate Oldschool PC
Font Pack (CC BY-SA 4.0, int10h.org), GNU FreeMono (braille glyphs),
TeX Gyre Pagella (splash). Palette: Dracula. Tools: chafa, figlet, gpg,
htmlize.
