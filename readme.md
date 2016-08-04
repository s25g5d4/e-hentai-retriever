[e-hentai retriever](https://github.com/s25g5d4/e-hentai-retriever)
===========================================

## Features

- Retrieve all images and scroll down to view, as auto pager do
- See two images in left and right
- Set retrieving range

This user script is tested under [Mozilla Firefox](https://www.mozilla.org/)
. To run user scripts, you have to install [Greasemonkey](https://addons.mozilla.org/zh-tw/firefox/addon/greasemonkey/)
first.

Might be able to run under [Google Chrome](http://www.google.com/chrome/) with [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).

## Installation

drag `build/e-hentai-retriever.user.js` into Firefox and click "install" button,
or simply open [build/ehr.user.js](raw/master/build/ehr.user.js).

## Usage

Open an image in any e-hentai gallery, you will see some buttons below the
title:

-   `Double Frame` will double the viewing image frame, allows two images showing
    left and right.
-   `Retrieve!` will retrieve all images (or user-defined range) in the gallery.
-   `Set Range` can set image retreveing range, including end.

## Build

Requirement:

- [Node.js](https://nodejs.org/en/) for building only

First clone this repository:

`git clone https://github.com/s25g5d4/e-hentai-retriever`

Install dependencies:

`npm install`

Run build:

`npm run build` or (with webpack installed globaly) `webpack`
