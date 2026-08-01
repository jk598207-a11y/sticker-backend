# Sticker Backend

NestJS backend for generating LINE sticker ZIP files from one uploaded image.

## What It Does

- Accepts an image from the frontend.
- Accepts grid settings: `rows`, `cols`, `vLines`, `hLines`.
- Cuts the image into 8, 16, 24, 32, or 40 sticker images.
- Generates `main.png`, `tab.png`, and numbered sticker images.
- Returns `sticker-pack.zip`.

## Start

```powershell
npm.cmd install
npm.cmd run dev
```

The API runs at:

```txt
http://localhost:4000
```

## Scripts

```txt
npm.cmd run dev          Start NestJS in watch mode
npm.cmd run start:dev    Same as dev
npm.cmd run build        Build the backend
npm.cmd run test:cutter  Run the local cutter test
```

## Main API

```txt
POST /stickers/generate-pack
Content-Type: multipart/form-data
```

Fields:

```txt
image   Image file
rows    Number of rows
cols    Number of columns
vLines  JSON array of vertical cut lines, normalized from 0 to 1
hLines  JSON array of horizontal cut lines, normalized from 0 to 1
```

Example:

```txt
rows=2
cols=4
vLines=[0.25,0.5,0.75]
hLines=[0.5]
```

## Important Files

```txt
src/main.ts
  Starts the NestJS app on port 4000.

src/stickers/stickers.controller.ts
  Receives upload requests and returns the ZIP stream.

src/stickers/stickers.service.ts
  Coordinates validation, image cutting, main/tab generation, and ZIP creation.

src/stickers/dto/generate-sticker-pack.dto.ts
  Validates request fields.

src/stickers/utils/image-cutter.ts
  Uses sharp to crop and resize sticker images.

src/stickers/utils/zip-builder.ts
  Uses archiver to package generated images into a ZIP.

src/print/
  Reserved structure for future POD / print provider integration.
```
