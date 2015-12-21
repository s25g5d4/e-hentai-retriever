[e-hentai retriever](https://github.com/s25g5d4/e-hentai-retriever)
===========================================

## Features

- Retrieve next image link per 1 second
- Stop at specified page
- Show all images without loading next page
- Double image frame

## Installation

This script is intended to work and tested under [Mozilla Firefox](https://www.mozilla.org/)
. To run user scripts, [Greasemonkey](https://addons.mozilla.org/zh-tw/firefox/addon/greasemonkey/)
is also required.

After checking Mozilla Firefox and Greasemonkey installed correctly, simply
drag [e-hentai-retriever.user.js](https://raw.githubusercontent.com/s25g5d4/e-hentai-retriever/latest/e-hentai-retriever.user.js) into Firefox,
click "install" button and it's done.

E-hentai retriever also supports [Google Chrome](http://www.google.com/chrome/)
with [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).

## Usage

Open an image in any e-hentai gallery, you will see some buttons below the
title:

-   `Enlarge` button will double the image frame, allow two images showing
    together horizontally.
-   `Generate img Link` for retrieve links only.
-   `Unlimited Scroll!` is an auto-pager that loads and puts next image
    on the screen.
-   `Stop At` button is only available when generating images/links. It stops
    the ongoing fetching at specified index.
