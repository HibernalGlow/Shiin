# Gamepad Line Art Pack

Nine game controllers drawn as clean single-colour line art, in SVG and PNG. Made for controller
pickers, "controller connected" indicators, options screens, tutorials and button-prompt pages.

![Preview](preview.png)

## What's inside

| File name        | Controller                         |
| ---------------- | ---------------------------------- |
| `xbox-series`    | Xbox Series X\|S controller        |
| `xbox-one`       | Xbox One controller                |
| `xbox-elite-2`   | Xbox Elite Series 2                |
| `dualshock-4`    | DualShock 4 (PlayStation 4)        |
| `dualsense`      | DualSense (PlayStation 5)          |
| `dualsense-edge` | DualSense Edge                     |
| `switch-pro`     | Nintendo Switch Pro Controller     |
| `joy-con`        | Joy-Con pair (Nintendo Switch)     |
| `joy-con-2`      | Joy-Con 2 pair (Nintendo Switch 2) |

```
svg/regular/        thin line, best at large sizes
svg/bold/           thicker line, best at small sizes (under ~250 px wide)
png/regular/dark/   1024 px wide, dark line on transparent (for light backgrounds)
png/regular/light/  1024 px wide, white line on transparent (for dark backgrounds)
png/bold/dark/      512 px wide, dark line
png/bold/light/     512 px wide, white line
```

## Using the SVGs

Every shape is painted with `currentColor`, so the drawing takes the text colour of wherever you
put it:

```html
<span style="color: #226779"><!-- inline the svg here --></span>
```

As an image file it renders black. To tint it without inlining, use it as a CSS mask:

```css
.pad {
  width: 160px;
  aspect-ratio: 3 / 2;
  background: currentColor;
  mask: url("svg/bold/dualsense.svg") center / contain no-repeat;
}
```

Each file is cropped to its drawing with a small margin, and has a `viewBox` but no fixed size.

## Brand logos

The console makers' logos are **not** in these drawings: the Xbox button is an empty ring and the
PlayStation button is an empty circle. Controller names are used only to say which device each
drawing depicts.

This pack is not affiliated with, sponsored by or endorsed by Microsoft, Sony Interactive
Entertainment or Nintendo. Xbox, PlayStation, DualShock, DualSense, Nintendo Switch and Joy-Con are
trademarks of their respective owners.

## License

[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) — public domain
dedication. Use it in free or commercial projects, modify it, redistribute it. No credit required
(a mention is always appreciated).

---

## Português

Nove controles desenhados em traço único, de uma cor só, em SVG e PNG. Servem para tela de opções,
indicador de controle ligado, tutoriais e páginas de botões.

- `svg/regular` e `png/regular` (1024 px): traço fino, para tamanhos grandes.
- `svg/bold` e `png/bold` (512 px): traço mais grosso, para tamanhos pequenos.
- `dark`: traço escuro, para fundo claro. `light`: traço branco, para fundo escuro.
- Os SVG usam `currentColor`: assumem a cor do texto de onde forem colocados.

Os logos das fabricantes não estão nos desenhos. O pacote não é afiliado à Microsoft, à Sony nem à
Nintendo. Licença CC0 1.0: uso livre, inclusive comercial, sem crédito obrigatório.
