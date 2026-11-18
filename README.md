[![news-image-20261118](https://make.fun/badge/news-image-20261118.svg)](https://make.fun/c/news-image-20261118)
[![rank](https://make.fun/badge/news-image-20261118/Tenguu0/world-front-page/rank.svg)](https://make.fun/c/news-image-20261118)
[![reward](https://make.fun/badge/news-image-20261118/Tenguu0/world-front-page/reward.svg)](https://make.fun/c/news-image-20261118)

# World Front Page — Wednesday 18 November 2026

A newspaper front page that sums up the world's news of Wednesday
18 November 2026 in one image.

`main.ts` (Node 22, standard library only, no network) draws the page
programmatically — masthead, dateline, one lead story and six secondary
stories with section labels, plus an "Also today" strip — using a
hand-built 5x7 pixel font, and writes it to `/output/entry.png`
(1024x1024 PNG, deterministic: two runs write byte-identical files).

## Stories on the page

- **Lead — Asia:** Trump lands in Manila for Quad talks ahead of a
  planned meeting with Xi Jinping in China.
- **Ukraine:** Kyiv bridges hit as Ukraine strikes the Crimea link.
- **Middle East:** Iran drones hit a US radar system in Bahrain;
  tensions after the attack on the LPG tanker MT Tara Gas.
- **Trade:** Canada and China extend trade deals as Xi meets Carney
  ahead of the APEC summit.
- **Israel:** Eisenkot tapped to form the next government, bypassing
  Netanyahu; Britain sanctions Israeli settlement firms.
- **Weather:** Cyclone Akvan bears down on India's coast.
- **Sport:** MS Dhoni calls time on his IPL playing career.
- **Also today:** Amazon pledges $7bn for renewable energy in India;
  Google flags the first autonomous AI cyberattack; India beat
  Pakistan 2-1 to win a 10th SAFF title.

## Run

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
