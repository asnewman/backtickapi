# Backtick API

<img src="https://github.com/asnewman/backtickapi/blob/main/backtickAPI.png?raw=true" alt="backtick logo" width="200"/>
An unofficial https://tildes.net API.

## Background
The Backtick API powers the [Backtick](https://tildes.net/~tildes/15xb/looking_for_beta_testers_for_my_tildes_net_ios_app) mobile app, though it is built in a generic fashion to be available for any client to use. Currently, all endpoints scrape publicly available data and do not require any user credentials as inputs. Calls to Tildes are [cached](https://github.com/asnewman/backtickapi/blob/718e938ea50b172f7db3d2830ba856583e29a668/src/http.ts#L13) for a short period of time to prevent overloading of the Tildes server(s). If you have any questions, please check out the [Backtick Discord server](https://discord.gg/uKzFN9HRV). Contributions are welcomed and appreciated!

## Usage

Docs and usage can be found [here](https://rapidapi.com/asnewman/api/backtick-api).

## Development

You will need [pnpm](https://pnpm.io/installation).

1. `pnpm i`
2. Create environment file `env.ts` at the root

    ```ts
    export default {
      PORT: "3000",
    };
    ```
3. `pnpm dev`
