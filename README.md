# Sign scripts

## Commands

```bash
yarn cli swap USDT 0.1 GET
```

4 subcommands are available:

- `add` | `remove` | `swap`: create DEX tx, then sign & submit
- `sign`: given cbor and txId, sign and submit tx
  - Used when you create DEX tx yourself (in Postman for example) and want to
    sign it
