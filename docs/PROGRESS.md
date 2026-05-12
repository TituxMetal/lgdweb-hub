# Progress

Master tracker for `lgdweb-hub` slices.

A slice is checked when it ships (PR opened and ready to merge into `develop`). The
branch column shows where the work lives; `–` means not started yet.

**Merge target**: `develop` (PR per slice). `main` only receives the integration PR
`develop → main` at the **slice 6 checkpoint** (first prod deploy).

## Slices

| # | Slice                    | Issue | Branch                   | Done |
| - | ------------------------ | ----- | ------------------------ | ---- |
| 1 | Foundations + CI         | #1    | `feature/foundations-ci` | [x]  |
| 2 | Snake                    | –     | –                        | [ ]  |
| 3 | Tic-Tac-Toe + Memory     | –     | –                        | [ ]  |
| 4 | Portfolio                | –     | –                        | [ ]  |
| 5 | Game of Life             | –     | –                        | [ ]  |
| 6 | Go-live + project images | –     | –                        | [ ]  |
| 7 | Chess                    | –     | –                        | [ ]  |
| 8 | Tetris solo              | –     | –                        | [ ]  |
| 9 | Tetris multi             | –     | –                        | [ ]  |

## References

- [Spec](./SPECS.md)
- [CI workflow source of truth](https://github.com/TituxMetal/car-cost-tracker)
- [Issue/slice format reference](https://github.com/TituxMetal/pif-is-fake)
