# TUI / Terminal CLI Reference Set

Curated reference material for the ShareCLI reel-viewer iteration: TUI engines, terminal-CLI craft,
and cast-recording tooling.

**Verification:** every `Repo:` URL below was resolved against the GitHub REST API
(`GET /repos/{owner}/{repo}`) on 2026-09-19; entries returning 404/410 were dropped and
renamed repos were rewritten to their canonical `owner/repo`. 198 entries, 198 live repos.

**Fields:** `Language` and `Year` come from the GitHub API (`language`, `created_at`), so
`Year` is the year the repository was created, not necessarily first release.

**Source lists:** [rothgar/awesome-tuis](https://github.com/rothgar/awesome-tuis),
[ratatui/awesome-ratatui](https://github.com/ratatui/awesome-ratatui),
[alebcay/awesome-shell](https://github.com/alebcay/awesome-shell), plus direct GitHub API search.


## Rust TUI Frameworks & Widget Libraries

## 1. crossterm
- URL: https://github.com/crossterm-rs/crossterm
- Repo: https://github.com/crossterm-rs/crossterm
- Language: rust
- Year: 2018
- Cross-platform terminal backend (raw mode, events, mouse); the low-level contract behind almost every Rust TUI.

## 2. cursive
- URL: https://github.com/gyscos/cursive
- Repo: https://github.com/gyscos/cursive
- Language: rust
- Year: 2015
- Retained-mode Rust TUI with a view tree and callbacks; clean separation of layout composition from painting.

## 3. edtui
- URL: https://github.com/preiter93/edtui
- Repo: https://github.com/preiter93/edtui
- Language: rust
- Year: 2023
- Vim-inspired editor widget with modal key handling and a reusable buffer abstraction.

## 4. iocraft
- URL: https://github.com/ccbrown/iocraft
- Repo: https://github.com/ccbrown/iocraft
- Language: rust
- Year: 2024
- Declarative JSX-like Rust TUI with components and hooks (use_future, use_terminal_size); React mental model in the terminal.

## 5. ratatui
- URL: https://ratatui.rs
- Repo: https://github.com/ratatui/ratatui
- Language: rust
- Year: 2023
- Immediate-mode Rust TUI toolkit; the Widget/Frame split keeps rendering pure and makes TestBackend snapshot tests possible.

## 6. termion
- URL: https://github.com/redox-os/termion
- Repo: https://github.com/redox-os/termion
- Language: rust
- Year: 2016
- Minimal Unix terminal I/O crate; useful contrast for escape-sequence level control without abstraction.

## 7. tui-realm
- URL: https://github.com/veeso/tui-realm
- Repo: https://github.com/veeso/tui-realm
- Language: rust
- Year: 2021
- Component-based layer over ratatui with a message/update architecture and MockComponent for rendering tests.

## 8. tui-rs (legacy)
- URL: https://github.com/fdehau/tui-rs
- Repo: https://github.com/fdehau/tui-rs
- Language: rust
- Year: 2016
- Archived ancestor of ratatui; study its minimal Terminal::draw loop that first made Rust TUIs ergonomic (archived).

## 9. tui-textarea
- URL: https://github.com/rhysd/tui-textarea
- Repo: https://github.com/rhysd/tui-textarea
- Language: rust
- Year: 2022
- Textarea widget with vim/emacs keymaps; reference for cursor, selection and undo handling inside a TUI.

## 10. tui-tree-widget
- URL: https://github.com/EdJoPaTo/tui-rs-tree-widget
- Repo: https://github.com/EdJoPaTo/tui-rs-tree-widget
- Language: rust
- Year: 2020
- Collapsible tree widget; shows state-versus-render separation for hierarchical data.


## Go TUI Frameworks & Libraries

## 11. Bubble Tea
- URL: https://github.com/charmbracelet/bubbletea
- Repo: https://github.com/charmbracelet/bubbletea
- Language: go
- Year: 2020
- Elm-architecture TUI runtime: Model/Update/View plus Cmd for side effects; the cleanest state-machine model for interactive CLIs.

## 12. Bubbles
- URL: https://github.com/charmbracelet/bubbles
- Repo: https://github.com/charmbracelet/bubbles
- Language: go
- Year: 2020
- Reusable Bubble Tea components (list, viewport, spinner, paginator); study viewport for scrollable cast playback.

## 13. go-pretty
- URL: https://github.com/jedib0t/go-pretty
- Repo: https://github.com/jedib0t/go-pretty
- Language: go
- Year: 2018
- Table, progress and list renderers; reference for column-width algorithms and aligned Unicode output.

## 14. gocui
- URL: https://github.com/jroimartin/gocui
- Repo: https://github.com/jroimartin/gocui
- Language: go
- Year: 2014
- Minimal layout and views manager; ideal for small keyboard-driven panes with explicit keybindings.

## 15. Huh
- URL: https://github.com/charmbracelet/huh
- Repo: https://github.com/charmbracelet/huh
- Language: go
- Year: 2023
- Accessible grouped forms with validation; good model for multi-step interactive prompts.

## 16. Lip Gloss
- URL: https://github.com/charmbracelet/lipgloss
- Repo: https://github.com/charmbracelet/lipgloss
- Language: go
- Year: 2021
- Declarative styling and layout for terminal output; JoinHorizontal and border compositing are directly reusable for reel cards.

## 17. pterm
- URL: https://pterm.sh
- Repo: https://github.com/pterm/pterm
- Language: go
- Year: 2020
- Styled printing toolkit (tables, trees, progress bars, boxes) for non-fullscreen CLI output.

## 18. tcell
- URL: https://github.com/gdamore/tcell
- Repo: https://github.com/gdamore/tcell
- Language: go
- Year: 2015
- Cell buffer plus event loop used by many Go TUIs; the modern successor to termbox.

## 19. termdash
- URL: https://github.com/mum4k/termdash
- Repo: https://github.com/mum4k/termdash
- Language: go
- Year: 2018
- Dashboard framework with layout containers; cleaner separation of widgets and layouts than termui.

## 20. termui
- URL: https://github.com/gizak/termui
- Repo: https://github.com/gizak/termui
- Language: go
- Year: 2015
- Terminal dashboard widgets (gauges, sparklines, bar charts) on a grid layout with an event loop.

## 21. tview
- URL: https://github.com/rivo/tview
- Repo: https://github.com/rivo/tview
- Language: go
- Year: 2017
- Widget toolkit with focus management, modals and Pages; the classic Go TUI architecture before Bubble Tea.


## Python TUI & Rich Output Libraries

## 22. alive-progress
- URL: https://github.com/rsalmei/alive-progress
- Repo: https://github.com/rsalmei/alive-progress
- Language: python
- Year: 2019
- Animated progress bars with capability detection and graceful degradation on dumb terminals.

## 23. asciimatics
- URL: https://github.com/peterbrittain/asciimatics
- Repo: https://github.com/peterbrittain/asciimatics
- Language: python
- Year: 2015
- Screen and effects framework with a Canvas API and animation helpers; strong for animated terminal effects.

## 24. blessed
- URL: http://pypi.python.org/pypi/blessed
- Repo: https://github.com/jquast/blessed
- Language: python
- Year: 2014
- Thin terminal-capability layer (Terminal.location, inkey) for writing raw TUIs without ncurses.

## 25. frogmouth
- URL: https://www.textualize.io/
- Repo: https://github.com/Textualize/frogmouth
- Language: python
- Year: 2023
- Markdown browser TUI on Textual; document scroll plus outline navigation in very few files.

## 26. Harlequin
- URL: https://github.com/tconbeer/harlequin
- Repo: https://github.com/tconbeer/harlequin
- Language: python
- Year: 2023
- DuckDB/SQLite TUI with a data catalog and results grid; study virtualized table rendering for large result sets.

## 27. prompt_toolkit
- URL: https://python-prompt-toolkit.readthedocs.io/
- Repo: https://github.com/prompt-toolkit/python-prompt-toolkit
- Language: python
- Year: 2014
- Full-screen apps and REPL primitives with key bindings, searchable buffers and completion menus; the engine behind IPython.

## 28. pytermgui
- URL: https://ptg.bczsalba.com
- Repo: https://github.com/bczsalba/pytermgui
- Language: python
- Year: 2021
- Widgets plus readable markup and a window manager; notable for human-friendly style strings (archived).

## 29. questionary
- URL: https://github.com/tmbo/questionary
- Repo: https://github.com/tmbo/questionary
- Language: python
- Year: 2018
- Simple interactive prompt API (select, confirm, path) layered on prompt_toolkit.

## 30. Rich
- URL: https://rich.readthedocs.io/en/latest/
- Repo: https://github.com/Textualize/rich
- Language: python
- Year: 2019
- The de-facto Python renderer: Console protocol, tables, trees, syntax, live displays; its output protocol is a lesson in layered rendering.

## 31. rich-cli
- URL: https://www.textualize.io
- Repo: https://github.com/Textualize/rich-cli
- Language: python
- Year: 2022
- rich exposed as a CLI (tables, markdown, syntax, JSON); a reference for previewing rendered output from the shell.

## 32. Textual
- URL: https://textual.textualize.io/
- Repo: https://github.com/Textualize/textual
- Language: python
- Year: 2021
- Async, CSS-styled TUI framework with a DOM, widgets and a Pilot testing harness; the richest declarative model here.

## 33. textual-plotext
- URL: https://github.com/Textualize/textual-plotext
- Repo: https://github.com/Textualize/textual-plotext
- Language: python
- Year: 2023
- Plotext charts rendered as a Textual widget; a clean pattern for embedding terminal charts.

## 34. tqdm
- URL: https://tqdm.github.io
- Repo: https://github.com/tqdm/tqdm
- Language: python
- Year: 2015
- Progress bars with a fully configurable format string and disable/leave semantics; the API most tools imitate.

## 35. urwid
- URL: https://github.com/urwid/urwid
- Repo: https://github.com/urwid/urwid
- Language: python
- Year: 2010
- Long-lived retained-mode widget library with walkers and flow layouts; a study in text layout algorithms (flow, columns, overlay).


## JS/TS TUI & Rich Output Libraries

## 36. blessed
- URL: https://github.com/chjj/blessed
- Repo: https://github.com/chjj/blessed
- Language: javascript
- Year: 2013
- The classic JS curses-like library (screen object, widget tree, event bubbling) that inspired most JS TUIs.

## 37. blessed-contrib
- URL: https://github.com/yaronn/blessed-contrib
- Repo: https://github.com/yaronn/blessed-contrib
- Language: javascript
- Year: 2015
- Dashboard widgets (gauges, maps, sparklines) over blessed; directly relevant to gauge and grid design.

## 38. boxen
- URL: https://github.com/sindresorhus/boxen
- Repo: https://github.com/sindresorhus/boxen
- Language: javascript
- Year: 2015
- Box drawing around text with border styles, padding and alignment; the simplest reusable visual primitive.

## 39. chalk
- URL: https://github.com/chalk/chalk
- Repo: https://github.com/chalk/chalk
- Language: javascript
- Year: 2013
- Colour and style composition with automatic colour-level detection and template literals.

## 40. Clack
- URL: https://bomb.sh/docs/clack/basics/getting-started/
- Repo: https://github.com/bombshell-dev/clack
- Language: typescript
- Year: 2023
- Beautiful minimal prompts with a tiny API; a study in spacing, symbol choice and colour restraint.

## 41. cli-table3
- URL: https://github.com/cli-table/cli-table3
- Repo: https://github.com/cli-table/cli-table3
- Language: javascript
- Year: 2018
- Table renderer with word wrap and cell spanning; classic column-width heuristics.

## 42. Commander.js
- URL: https://github.com/tj/commander.js
- Repo: https://github.com/tj/commander.js
- Language: javascript
- Year: 2011
- Argument parser with subcommands and generated help; shows the conventional help layout.

## 43. enquirer
- URL: https://github.com/jonschlinkert
- Repo: https://github.com/enquirer/enquirer
- Language: javascript
- Year: 2016
- Prompt framework with pluggable prompt types and theming; good separation of prompt logic from rendering.

## 44. figlet.js
- URL: https://github.com/patorjk/figlet.js
- Repo: https://github.com/patorjk/figlet.js
- Language: javascript
- Year: 2012
- FIGlet banner text in JS; useful for ASCII-art headers and font selection.

## 45. Ink
- URL: https://term.ink
- Repo: https://github.com/vadimdemedes/ink
- Language: typescript
- Year: 2017
- React renderer for the terminal: components, hooks and flexbox via Yoga; the strongest pattern for componentized CLI UIs.

## 46. Inquirer.js
- URL: https://github.com/SBoudrias/Inquirer.js
- Repo: https://github.com/SBoudrias/Inquirer.js
- Language: typescript
- Year: 2013
- The ubiquitous JS prompt library; its confirm/list/input defaults are the de-facto interactive UX baseline.

## 47. listr2
- URL: https://github.com/listr2/listr2
- Repo: https://github.com/listr2/listr2
- Language: typescript
- Year: 2020
- Nested task lists with live-updating subtasks; the reference for rendering concurrent task trees.

## 48. oclif
- URL: https://oclif.io
- Repo: https://github.com/oclif/oclif
- Language: typescript
- Year: 2018
- CLI framework with topics, plugins and generated help/man pages; enterprise-grade help output model.

## 49. ora
- URL: https://github.com/sindresorhus/ora
- Repo: https://github.com/sindresorhus/ora
- Language: javascript
- Year: 2016
- Elegant spinners with persistent prefix/suffix text; the model for one-active-indicator UX.

## 50. prompts
- URL: https://github.com/terkelg/prompts
- Repo: https://github.com/terkelg/prompts
- Language: javascript
- Year: 2018
- Lightweight prompts with per-prompt render callbacks; clean example of custom prompt rendering.

## 51. terminal-kit
- URL: https://github.com/cronvel/terminal-kit
- Repo: https://github.com/cronvel/terminal-kit
- Language: javascript
- Year: 2014
- Unusually broad terminal API: input fields, menus, tables and image protocols (sixel/kitty) in one package.


## Rust TUI Applications

## 52. ATAC
- URL: https://github.com/Julien-cpsn/ATAC
- Repo: https://github.com/Julien-cpsn/ATAC
- Language: rust
- Year: 2024
- Postman-like API client TUI; study multi-tab request/response layout and JSON tree rendering.

## 53. Atuin
- URL: https://atuin.sh
- Repo: https://github.com/atuinsh/atuin
- Language: rust
- Year: 2020
- Shell history with a fuzzy full-screen search UI and sync; a TUI bound into shell keybindings.

## 54. bottom
- URL: https://bottom.pages.dev
- Repo: https://github.com/ClementTsang/bottom
- Language: rust
- Year: 2019
- Cross-platform ratatui system monitor; study per-core graphs, legends and theme files.

## 55. broot
- URL: https://dystroy.org/broot
- Repo: https://github.com/Canop/broot
- Language: rust
- Year: 2018
- Tree-navigating directory browser with fuzzy search; makes jumping to a deep path a single gesture.

## 56. csvlens
- URL: https://github.com/YS-L/csvlens
- Repo: https://github.com/YS-L/csvlens
- Language: rust
- Year: 2021
- CSV pager with in-place search and column highlighting; study wide-table navigation.

## 57. dua-cli
- URL: https://lib.rs/crates/dua-cli
- Repo: https://github.com/Byron/dua-cli
- Language: rust
- Year: 2019
- Disk usage analyzer with a two-mode design (report versus interactive parallel directory view).

## 58. gitu
- URL: https://github.com/altsem/gitu
- Repo: https://github.com/altsem/gitu
- Language: rust
- Year: 2023
- Git TUI inspired by Magit; study transient-style modal key menus.

## 59. gitui
- URL: https://github.com/gitui-org/gitui
- Repo: https://github.com/gitui-org/gitui
- Language: rust
- Year: 2020
- Fast git TUI with diff and staging panes; clean keyboard-driven multi-pane git workflow.

## 60. gpg-tui
- URL: https://blog.orhun.dev/introducing-gpg-tui/
- Repo: https://github.com/orhun/gpg-tui
- Language: rust
- Year: 2020
- GnuPG TUI with an async command executor; its widget-plus-docs structure is a solid architecture template.

## 61. gping
- URL: https://github.com/orf/gping
- Repo: https://github.com/orf/gping
- Language: rust
- Year: 2015
- Ping with a live chart; the canonical stream-into-a-graph CLI pattern.

## 62. Helix
- URL: https://helix-editor.com
- Repo: https://github.com/helix-editor/helix
- Language: rust
- Year: 2020
- Selection-first modal editor; its ratatui status line and popups are a masterclass in information density.

## 63. jless
- URL: https://jless.io
- Repo: https://github.com/PaulJuliusMartinez/jless
- Language: rust
- Year: 2021
- JSON viewer with structural navigation; best reference for viewer keymaps and a current-path indicator.

## 64. joshuto
- URL: https://github.com/kamiyaa/joshuto
- Repo: https://github.com/kamiyaa/joshuto
- Language: rust
- Year: 2018
- ranger-like file manager in Rust; readable reference for column navigation and file operations.

## 65. kmon
- URL: https://kmon.cli.rs
- Repo: https://github.com/orhun/kmon
- Language: rust
- Year: 2019
- Kernel module viewer with sorting and filtering; a focused single-purpose monitoring TUI.

## 66. ncspot
- URL: https://github.com/hrkfdn/ncspot
- Repo: https://github.com/hrkfdn/ncspot
- Language: rust
- Year: 2018
- Spotify client TUI; excellent status-line and list-selection modelling.

## 67. Nushell
- URL: https://www.nushell.sh/
- Repo: https://github.com/nushell/nushell
- Language: rust
- Year: 2019
- Structured-data shell whose primary output type is the table; best-in-class typed, aligned tabular CLI output.

## 68. onefetch
- URL: https://onefetch.dev
- Repo: https://github.com/o2sh/onefetch
- Language: rust
- Year: 2018
- Project info with ASCII-art logos and aligned stat blocks; the language-coloured logo pattern.

## 69. oxker
- URL: https://github.com/mrjackwills/oxker
- Repo: https://github.com/mrjackwills/oxker
- Language: rust
- Year: 2022
- Docker container TUI with live stats; good log-tail plus stats split.

## 70. scooter
- URL: https://github.com/thomasschafer/scooter
- Repo: https://github.com/thomasschafer/scooter
- Language: rust
- Year: 2024
- Interactive find-and-replace across a repo with a review-and-apply flow; TUI for a batch edit task.

## 71. spotify-player
- URL: https://github.com/aome510/spotify-player
- Repo: https://github.com/aome510/spotify-player
- Language: rust
- Year: 2021
- Streaming client TUI with playback progress and lyrics; good example of a polling client UI.

## 72. systeroid
- URL: https://systeroid.cli.rs
- Repo: https://github.com/orhun/systeroid
- Language: rust
- Year: 2021
- sysctl explorer with a searchable tree and live values; clean read-only TUI structure.

## 73. taskwarrior-tui
- URL: https://kdheepak.com/taskwarrior-tui
- Repo: https://github.com/kdheepak/taskwarrior-tui
- Language: rust
- Year: 2020
- Taskwarrior front-end with context-sensitive keybindings; good power-user TUI UX.

## 74. television
- URL: https://alexpasmantier.github.io/television/
- Repo: https://github.com/alexpasmantier/television
- Language: rust
- Year: 2024
- Fuzzy finder with channels and previews; key reference for search-as-navigation UX.

## 75. trippy
- URL: https://trippy.rs
- Repo: https://github.com/fujiapple852/trippy
- Language: rust
- Year: 2022
- Network tracer with a live hop table and charts; streaming data into a stable layout.

## 76. xplr
- URL: https://xplr.dev
- Repo: https://github.com/sayanarijit/xplr
- Language: rust
- Year: 2021
- Hackable, plugin-driven file explorer; study its configuration-as-code extension surface.

## 77. Yazi
- URL: https://yazi-rs.github.io
- Repo: https://github.com/sxyazi/yazi
- Language: rust
- Year: 2023
- Async file manager with image previews; strong example of a preview-plus-list split layout.

## 78. Zellij
- URL: https://zellij.dev
- Repo: https://github.com/zellij-org/zellij
- Language: rust
- Year: 2020
- Terminal multiplexer with plugin panes and layout-as-data config; study pane framing and the status bar.

## 79. zoxide
- URL: https://github.com/ajeetdsouza/zoxide
- Repo: https://github.com/ajeetdsouza/zoxide
- Language: rust
- Year: 2020
- Smarter cd that composes with fzf instead of replacing it; the pattern for shells augments.


## Go TUI Applications

## 80. aerc
- URL: https://git.sr.ht/~rjarry/aerc
- Repo: https://github.com/rjarry/aerc
- Language: go
- Year: 2021
- Email client TUI with tabs, filters and an embedded terminal; strong multi-account layout.

## 81. amfora
- URL: https://github.com/makew0rld/amfora
- Repo: https://github.com/makew0rld/amfora
- Language: go
- Year: 2020
- Gemini protocol browser with tabbed browsing and a gemtext renderer.

## 82. bluetuith
- URL: https://github.com/bluetuith-org/bluetuith
- Repo: https://github.com/bluetuith-org/bluetuith
- Language: go
- Year: 2022
- Bluetooth manager TUI with pairing flows and modal dialogs.

## 83. ctop
- URL: https://ctop.sh
- Repo: https://github.com/bcicen/ctop
- Language: go
- Year: 2016
- Container metrics TUI with sparkline columns; the classic compact dashboard.

## 84. curlie
- URL: https://rs.github.io/curlie
- Repo: https://github.com/rs/curlie
- Language: go
- Year: 2018
- curl front-end with httpie-style colourised request and response display.

## 85. dive
- URL: https://github.com/wagoodman/dive
- Repo: https://github.com/wagoodman/dive
- Language: go
- Year: 2018
- Docker image layer explorer; elegant two-pane layer and file-tree diff.

## 86. duf
- URL: https://github.com/muesli/duf
- Repo: https://github.com/muesli/duf
- Language: go
- Year: 2020
- Disk usage and free-space table with colour-coded device grouping; tabular clarity without a TUI.

## 87. fzf
- URL: https://junegunn.github.io/fzf/
- Repo: https://github.com/junegunn/fzf
- Language: go
- Year: 2013
- The fuzzy finder standard: preview window, keybinding actions and a --bind DSL; essential picker prior art.

## 88. gdu
- URL: https://github.com/dundee/gdu
- Repo: https://github.com/dundee/gdu
- Language: go
- Year: 2018
- Fast disk usage TUI with scan progress and delete flows.

## 89. gh-dash
- URL: https://gh-dash.dev
- Repo: https://github.com/dlvhdr/gh-dash
- Language: go
- Year: 2021
- GitHub dashboard TUI; study section config and PR/issue table presentation.

## 90. Glow
- URL: https://github.com/charmbracelet/glow
- Repo: https://github.com/charmbracelet/glow
- Language: go
- Year: 2019
- Markdown renderer and pager for the terminal; directly relevant to styled README rendering.

## 91. k9s
- URL: https://k9scli.io
- Repo: https://github.com/derailed/k9s
- Language: go
- Year: 2019
- Kubernetes TUI; resource views, describe/YAML toggles and aliases show how to scale a TUI to hundreds of resources.

## 92. lazydocker
- URL: https://github.com/jesseduffield/lazydocker
- Repo: https://github.com/jesseduffield/lazydocker
- Language: go
- Year: 2019
- Docker TUI sharing lazygit design language; study cross-tool UX consistency.

## 93. lazygit
- URL: https://github.com/jesseduffield/lazygit
- Repo: https://github.com/jesseduffield/lazygit
- Language: go
- Year: 2018
- The reference git TUI: panes, panels, commit graph and diff rendering under a consistent keybinding grammar.

## 94. lf
- URL: https://github.com/gokcehan/lf
- Repo: https://github.com/gokcehan/lf
- Language: go
- Year: 2016
- Minimal keybinding-driven file manager; its one-letter command DSL is a study in terse interaction.

## 95. micro
- URL: https://micro-editor.github.io
- Repo: https://github.com/micro-editor/micro
- Language: go
- Year: 2016
- Nano-like editor with mouse support and plugins; approachable editor UX in a terminal.

## 96. nap
- URL: https://github.com/maaslalani/nap
- Repo: https://github.com/maaslalani/nap
- Language: go
- Year: 2022
- Snippet manager with syntax highlighting and a fuzzy picker.

## 97. peco
- URL: https://github.com/peco/peco
- Repo: https://github.com/peco/peco
- Language: go
- Year: 2014
- Simpler fuzzy filter with a query editor; useful minimal contrast to fzf.

## 98. popeye
- URL: https://popeyecli.io
- Repo: https://github.com/derailed/popeye
- Language: go
- Year: 2019
- Cluster linter with a report table and colour-coded severities; CLI report craft.

## 99. process-compose
- URL: https://f1bonacc1.github.io/process-compose/
- Repo: https://github.com/F1bonacc1/process-compose
- Language: go
- Year: 2022
- Process orchestrator whose TUI shows live logs per process; strong split-pane log layout.

## 100. slides
- URL: http://maaslalani.com/slides/
- Repo: https://github.com/maaslalani/slides
- Language: go
- Year: 2021
- Markdown presentations in the terminal; document paging with a status bar.

## 101. Soft Serve
- URL: https://github.com/charmbracelet/soft-serve
- Repo: https://github.com/charmbracelet/soft-serve
- Language: go
- Year: 2021
- Self-hosted Git server with an SSH TUI; study TUI-over-SSH session handling.

## 102. superfile
- URL: https://superfile.dev
- Repo: https://github.com/yorukot/superfile
- Language: go
- Year: 2024
- Modern file manager with a plugin system and themed panes.

## 103. termshark
- URL: https://github.com/gcla/termshark
- Repo: https://github.com/gcla/termshark
- Language: go
- Year: 2019
- Wireshark-like packet capture TUI; study stream reassembly with hex/ASCII panes.

## 104. tut
- URL: https://tut.anv.nu
- Repo: https://github.com/RasmusLindroth/tut
- Language: go
- Year: 2020
- Mastodon TUI with timeline panes and a compose editor.

## 105. VHS
- URL: https://github.com/charmbracelet/vhs
- Repo: https://github.com/charmbracelet/vhs
- Language: go
- Year: 2022
- Scripts terminal sessions into GIF/MP4 from a .tape DSL; the closest sibling to a cast reel pipeline.

## 106. Wish
- URL: https://github.com/charmbracelet/wish
- Repo: https://github.com/charmbracelet/wish
- Language: go
- Year: 2019
- SSH server framework for Bubble Tea apps; the pattern for serving TUIs over the network.

## 107. wtfutil
- URL: http://wtfutil.com
- Repo: https://github.com/wtfutil/wtf
- Language: go
- Year: 2018
- Config-driven modular terminal dashboard; an early influential widget host.

## 108. yq
- URL: https://mikefarah.gitbook.io/yq/
- Repo: https://github.com/mikefarah/yq
- Language: go
- Year: 2015
- YAML processor with colourised output; readable structured output from a CLI.


## Python TUI Applications

## 109. bpytop
- URL: https://github.com/aristocratos/bpytop
- Repo: https://github.com/aristocratos/bpytop
- Language: python
- Year: 2020
- Python port of bashtop; strong terminal colour themes and per-core graphs.

## 110. dolphie
- URL: https://pypi.org/project/dolphie/
- Repo: https://github.com/charles-001/dolphie
- Language: python
- Year: 2022
- MySQL/MariaDB real-time analytics TUI; multi-panel metrics with live refresh.

## 111. Glances
- URL: http://nicolargo.github.io/glances/
- Repo: https://github.com/nicolargo/glances
- Language: python
- Year: 2011
- Cross-platform monitor with curses, web and API frontends from one data model.

## 112. httpie
- URL: https://httpie.io
- Repo: https://github.com/httpie/cli
- Language: python
- Year: 2012
- HTTP client with expressive syntax and colourised structured output; a model for CLI ergonomics.

## 113. litecli
- URL: https://litecli.com
- Repo: https://github.com/dbcli/litecli
- Language: python
- Year: 2018
- SQLite REPL sharing the dbcli design language across engines.

## 114. mycli
- URL: http://mycli.net
- Repo: https://github.com/dbcli/mycli
- Language: python
- Year: 2015
- MySQL CLI with autocompletion and syntax highlighting; the reference SQL REPL UX.

## 115. pgcli
- URL: http://pgcli.com
- Repo: https://github.com/dbcli/pgcli
- Language: python
- Year: 2014
- Postgres counterpart with pager integration and smart completion.

## 116. ranger
- URL: https://ranger.fm
- Repo: https://github.com/ranger/ranger
- Language: python
- Year: 2009
- Three-column file manager with previews and a file-opening abstraction (rifle).


## JS/TS TUI Applications

## 117. dockly
- URL: https://lirantal.github.io/dockly/
- Repo: https://github.com/lirantal/dockly
- Language: javascript
- Year: 2016
- Docker container dashboard TUI built on blessed.

## 118. npkill
- URL: https://npkill.js.org
- Repo: https://github.com/voidcosmos/npkill
- Language: typescript
- Year: 2019
- Interactive node_modules cleaner with a live size-ordered list and space-bar selection.

## 119. svg-term-cli
- URL: https://github.com/marionebl/svg-term-cli
- Repo: https://github.com/marionebl/svg-term-cli
- Language: javascript
- Year: 2017
- Renders asciinema casts to SVG for the web; the closest prior art to a web cast viewer.

## 120. taskbook
- URL: https://klaudiosinani.com/taskbook
- Repo: https://github.com/klaudiosinani/taskbook
- Language: javascript
- Year: 2018
- Task and board CLI with a rendered board view and simple synced storage.

## 121. terminalizer
- URL: https://terminalizer.com
- Repo: https://github.com/faressoft/terminalizer
- Language: javascript
- Year: 2018
- Records terminal sessions to GIF with a config-driven renderer.

## 122. vtop
- URL: https://github.com/MrRio/vtop
- Repo: https://github.com/MrRio/vtop
- Language: javascript
- Year: 2014
- Node system monitor on blessed-contrib; a classic terminal dashboard.


## Classic CLI Tools with Crafted Output

## 123. bat
- URL: https://github.com/sharkdp/bat
- Repo: https://github.com/sharkdp/bat
- Language: rust
- Year: 2018
- cat with syntax highlighting, git diff markers, line numbers and automatic paging.

## 124. bmon
- URL: http://jafaral.github.io/bmon/
- Repo: https://github.com/Jafaral/bmon
- Language: c
- Year: 2013
- Bandwidth monitor with per-interface bar graphs in curses.

## 125. delta
- URL: https://dandavison.github.io/delta/
- Repo: https://github.com/dandavison/delta
- Language: rust
- Year: 2019
- Side-by-side diff pager with syntax highlighting and line-number gutters; the gold standard for diff rendering.

## 126. difftastic
- URL: https://difftastic.wilfred.me.uk/
- Repo: https://github.com/Wilfred/difftastic
- Language: rust
- Year: 2018
- Structural, tree-sitter-based diff; shows diff output can be semantic rather than line-based.

## 127. dog
- URL: https://github.com/ogham/dog
- Repo: https://github.com/ogham/dog
- Language: rust
- Year: 2020
- DNS client with richly structured, colourised answer tables.

## 128. dust
- URL: https://github.com/bootandy/dust
- Repo: https://github.com/bootandy/dust
- Language: rust
- Year: 2018
- du with adaptive depth, bar charts and size-aware colouring.

## 129. exa (legacy)
- URL: https://github.com/ogham/exa
- Repo: https://github.com/ogham/exa
- Language: rust
- Year: 2014
- eza predecessor, still a useful study in colour schemes and hyperlink output.

## 130. eza
- URL: https://eza.rocks
- Repo: https://github.com/eza-community/eza
- Language: rust
- Year: 2023
- ls with icons, a git status column and grid/long views; the model for readable listings.

## 131. fblog
- URL: https://github.com/brocode/fblog
- Repo: https://github.com/brocode/fblog
- Language: rust
- Year: 2017
- Pretty JSON log printer; a narrow tool with excellent formatting.

## 132. fd
- URL: https://github.com/sharkdp/fd
- Repo: https://github.com/sharkdp/fd
- Language: rust
- Year: 2017
- Friendly find with parallel traversal and colourised results.

## 133. fx
- URL: https://fx.wtf
- Repo: https://github.com/antonmedv/fx
- Language: go
- Year: 2018
- Interactive JSON viewer with a navigable tree and reduced-output modes.

## 134. hexyl
- URL: https://github.com/sharkdp/hexyl
- Repo: https://github.com/sharkdp/hexyl
- Language: rust
- Year: 2018
- Coloured hex viewer with a rounded border and offset gutter.

## 135. hyperfine
- URL: https://github.com/sharkdp/hyperfine
- Repo: https://github.com/sharkdp/hyperfine
- Language: rust
- Year: 2018
- Benchmarking with live progress and a statistical summary table.

## 136. jq
- URL: https://jqlang.org
- Repo: https://github.com/jqlang/jq
- Language: c
- Year: 2012
- JSON processor whose colourised output and formatting flags underpin many CLI viewers.

## 137. lsd
- URL: https://github.com/lsd-rs/lsd
- Repo: https://github.com/lsd-rs/lsd
- Language: rust
- Year: 2018
- ls with icons and rich metadata; good study of column alignment rules.

## 138. mdcat
- URL: https://github.com/swsnr/mdcat
- Repo: https://github.com/swsnr/mdcat
- Language: rust
- Year: 2018
- Renders markdown, including inline images, to the terminal (archived).

## 139. neofetch
- URL: https://github.com/dylanaraps/neofetch
- Repo: https://github.com/dylanaraps/neofetch
- Language: shell
- Year: 2015
- The ASCII-art system-info layout that every fetch tool imitates (archived).

## 140. procs
- URL: https://github.com/dalance/procs
- Repo: https://github.com/dalance/procs
- Language: rust
- Year: 2019
- ps replacement with colour-coded columns, tree view and configurable themes.

## 141. ripgrep
- URL: https://github.com/BurntSushi/ripgrep
- Repo: https://github.com/BurntSushi/ripgrep
- Language: rust
- Year: 2016
- grep with smart defaults, colour grouping and a --json streaming output mode.

## 142. ripgrep-all
- URL: https://github.com/phiresky/ripgrep-all
- Repo: https://github.com/phiresky/ripgrep-all
- Language: rust
- Year: 2019
- ripgrep over PDFs and office documents via adapters; composable search backends.

## 143. tree
- URL: https://github.com/Old-Man-Programmer/tree
- Repo: https://github.com/Old-Man-Programmer/tree
- Language: c
- Year: 2022
- Classic recursive tree printer with indent and colour control.

## 144. vivid
- URL: https://github.com/sharkdp/vivid
- Repo: https://github.com/sharkdp/vivid
- Language: rust
- Year: 2018
- LS_COLORS generator: a tool whose only output is configuration for another tool.

## 145. xh
- URL: https://github.com/ducaale/xh
- Repo: https://github.com/ducaale/xh
- Language: rust
- Year: 2020
- httpie-like Rust client with colourised requests/responses and clean error output.


## Interactive Prompts & Shell Integration

## 146. ble.sh
- URL: https://github.com/akinomyoga/ble.sh
- Repo: https://github.com/akinomyoga/ble.sh
- Language: shell
- Year: 2015
- Bash line editor with syntax highlighting, completion menus and Vim mode.

## 147. dialoguer
- URL: https://github.com/console-rs/dialoguer
- Repo: https://github.com/console-rs/dialoguer
- Language: rust
- Year: 2017
- Rust prompt toolkit (select, confirm, password) with theming.

## 148. fzf-tab
- URL: https://github.com/Aloxaf/fzf-tab
- Repo: https://github.com/Aloxaf/fzf-tab
- Language: shell
- Year: 2019
- zsh completion replaced by fzf; demonstration of fuzzy completion menus.

## 149. gum
- URL: https://github.com/charmbracelet/gum
- Repo: https://github.com/charmbracelet/gum
- Language: go
- Year: 2022
- Scriptable prompts, spinners and formatting for shell pipelines; TUI as a Unix primitive.

## 150. indicatif
- URL: https://github.com/console-rs/indicatif
- Repo: https://github.com/console-rs/indicatif
- Language: rust
- Year: 2017
- Rust progress bars and spinners with multi-progress and templates.

## 151. Inquire
- URL: https://docs.rs/inquire
- Repo: https://github.com/mikaelmello/inquire
- Language: rust
- Year: 2021
- Rich Rust prompts including date pickers and editor-based input.

## 152. oh-my-zsh
- URL: https://ohmyz.sh
- Repo: https://github.com/ohmyzsh/ohmyzsh
- Language: shell
- Year: 2009
- Plugin and theme framework whose theme library is a catalogue of prompt layouts.

## 153. powerlevel10k
- URL: https://github.com/romkatv/powerlevel10k
- Repo: https://github.com/romkatv/powerlevel10k
- Language: shell
- Year: 2019
- zsh prompt with an interactive configure wizard; study instant-prompt rendering cost.

## 154. skim
- URL: https://github.com/skim-rs/skim
- Repo: https://github.com/skim-rs/skim
- Language: rust
- Year: 2016
- Fuzzy finder with Rust performance and --preview; interactive query UI.

## 155. starship
- URL: https://starship.rs
- Repo: https://github.com/starship/starship
- Language: rust
- Year: 2019
- Cross-shell prompt with module-based segments and async rendering.

## 156. zsh-autosuggestions
- URL: https://github.com/zsh-users/zsh-autosuggestions
- Repo: https://github.com/zsh-users/zsh-autosuggestions
- Language: shell
- Year: 2013
- Fish-style inline history hints for zsh.


## Editors, File Managers & Git TUIs

## 157. git-crecord
- URL: https://github.com/andrewshadura/git-crecord
- Repo: https://github.com/andrewshadura/git-crecord
- Language: python
- Year: 2016
- Interactive commit curation with a two-pane hunk selector.

## 158. Kakoune
- URL: http://kakoune.org
- Repo: https://github.com/mawww/kakoune
- Language: c++
- Year: 2011
- Modal editor where multiple selections are the primary interface primitive.

## 159. kilo
- URL: https://github.com/antirez/kilo
- Repo: https://github.com/antirez/kilo
- Language: c
- Year: 2016
- The canonical ~1000-line editor tutorial; best starting point for raw-mode rendering.

## 160. Neovim
- URL: https://neovim.io
- Repo: https://github.com/neovim/neovim
- Language: vim script
- Year: 2014
- Modern vim with an RPC/UI protocol; essential study of a TUI driven by an external UI client.

## 161. nnn
- URL: https://github.com/jarun/nnn
- Repo: https://github.com/jarun/nnn
- Language: c
- Year: 2016
- Fast file manager with plugins, contexts and a tiny footprint.

## 162. tig
- URL: https://jonas.github.io/tig/
- Repo: https://github.com/jonas/tig
- Language: c
- Year: 2009
- ncurses git browser; classic view-based navigation (main, diff, tree, blame).


## Monitors, Dashboards & Ops TUIs

## 163. btop
- URL: https://github.com/aristocratos/btop
- Repo: https://github.com/aristocratos/btop
- Language: c++
- Year: 2021
- GPU-aware resource monitor with mouse support, themes and a clean gauge vocabulary.

## 164. dolt
- URL: https://www.dolthub.com
- Repo: https://github.com/dolthub/dolt
- Language: go
- Year: 2019
- Versioned SQL database whose CLI renders query results and diffs as readable tables.

## 165. eks-node-viewer
- URL: https://github.com/awslabs/eks-node-viewer
- Repo: https://github.com/awslabs/eks-node-viewer
- Language: go
- Year: 2022
- Live node and pod resource density view; compact capacity-as-blocks visualisation.

## 166. htop
- URL: https://htop.dev/
- Repo: https://github.com/htop-dev/htop
- Language: c
- Year: 2020
- The classic interactive process viewer; its column configurability remains the benchmark.

## 167. kubectl-tree
- URL: https://github.com/ahmetb/kubectl-tree
- Repo: https://github.com/ahmetb/kubectl-tree
- Language: go
- Year: 2019
- Prints Kubernetes object ownership as an aligned tree; readable hierarchy output.

## 168. lazysql
- URL: https://github.com/jorgerojas26/lazysql
- Repo: https://github.com/jorgerojas26/lazysql
- Language: go
- Year: 2023
- Multi-database TUI client with a tree sidebar and editable result grid.

## 169. neomutt
- URL: https://neomutt.org/
- Repo: https://github.com/neomutt/neomutt
- Language: c
- Year: 2015
- Mail client with index/pager/compose modes and a huge keymap surface.

## 170. newsboat
- URL: https://newsboat.org/
- Repo: https://github.com/newsboat/newsboat
- Language: c++
- Year: 2017
- RSS reader TUI with feeds/articles/content three-pane layout.

## 171. nvtop
- URL: https://github.com/Syllo/nvtop
- Repo: https://github.com/Syllo/nvtop
- Language: c
- Year: 2017
- GPU and accelerator monitor with per-process graphs; excellent dense multi-device layout.

## 172. viddy
- URL: https://github.com/sachaos/viddy
- Repo: https://github.com/sachaos/viddy
- Language: rust
- Year: 2021
- watch with a diff view, timeline navigation and instant replay.


## Shells & Prompt Frameworks

## 173. elvish
- URL: https://elv.sh/
- Repo: https://github.com/elves/elvish
- Language: go
- Year: 2013
- Shell with structured values and a rich interactive line editor.

## 174. fish
- URL: https://fishshell.com
- Repo: https://github.com/fish-shell/fish-shell
- Language: rust
- Year: 2012
- Shell with autosuggestions, syntax highlighting and web-based config; the benchmark for interactive shell UX.

## 175. murex
- URL: https://murex.rocks
- Repo: https://github.com/lmorg/murex
- Language: go
- Year: 2017
- Typed shell with structured pipelines and inline help.

## 176. Oil (Oils for Unix)
- URL: https://oils.pub/
- Repo: https://github.com/oils-for-unix/oils
- Language: python
- Year: 2016
- Bash-compatible OSH plus the new YSH; notable structured-output and HTML tracing tooling.

## 177. xonsh
- URL: http://xon.sh
- Repo: https://github.com/xonsh/xonsh
- Language: python
- Year: 2015
- Python-powered shell blending subprocess and Python semantics.


## Terminal Emulators, Multiplexers & Cast Recording

## 178. agg
- URL: https://docs.asciinema.org/manual/agg/
- Repo: https://github.com/asciinema/agg
- Language: rust
- Year: 2022
- Renders asciicast v2/v3 to GIF; reference for cast timing and frame rendering.

## 179. Alacritty
- URL: https://alacritty.org
- Repo: https://github.com/alacritty/alacritty
- Language: rust
- Year: 2016
- Minimal fast GPU terminal; a study in configuration restraint.

## 180. asciinema
- URL: https://asciinema.org
- Repo: https://github.com/asciinema/asciinema
- Language: rust
- Year: 2011
- Records terminal sessions as asciicast; the format a cast reel viewer must consume.

## 181. asciinema-player
- URL: https://docs.asciinema.org/manual/player/
- Repo: https://github.com/asciinema/asciinema-player
- Language: javascript
- Year: 2014
- Official web player for casts: themes, markers, idle-time limiting and lazy loading.

## 182. contour
- URL: http://contour-terminal.org/
- Repo: https://github.com/contour-terminal/contour
- Language: c++
- Year: 2019
- Terminal that also runs a text-mode fallback from the same core; scripting and passthrough emphasis.

## 183. Ghostty
- URL: https://ghostty.org
- Repo: https://github.com/ghostty-org/ghostty
- Language: zig
- Year: 2022
- Zig terminal with native chrome and sensible defaults; a modern terminal UX baseline.

## 184. kitty
- URL: https://sw.kovidgoyal.net/kitty/
- Repo: https://github.com/kovidgoyal/kitty
- Language: python
- Year: 2016
- Terminal with a graphics protocol, panes and remote control; relevant for inline images.

## 185. mosh
- URL: https://mosh.org
- Repo: https://github.com/mobile-shell/mosh
- Language: c++
- Year: 2011
- Roaming SSH with local echo and predictive typing; the UX of perceived responsiveness.

## 186. rio
- URL: https://rioterm.com
- Repo: https://github.com/raphamorim/rio
- Language: rust
- Year: 2022
- Rust GPU terminal with web-friendly configuration and a VI mode.

## 187. termtosvg
- URL: https://nbedos.github.io/termtosvg/
- Repo: https://github.com/nbedos/termtosvg
- Language: python
- Year: 2018
- Renders shell sessions to animated SVG with a template system (archived).

## 188. tmux
- URL: https://github.com/tmux/tmux
- Repo: https://github.com/tmux/tmux
- Language: c
- Year: 2015
- The multiplexer standard: status-line format strings, panes/windows and copy-mode.

## 189. ttyd
- URL: https://tsl0922.github.io/ttyd
- Repo: https://github.com/tsl0922/ttyd
- Language: c
- Year: 2016
- Shares a terminal over HTTP/WebSocket; the reference for browser-embedded terminals.

## 190. WezTerm
- URL: https://wezterm.org/
- Repo: https://github.com/wezterm/wezterm
- Language: rust
- Year: 2018
- GPU terminal with Lua config and a built-in multiplexer; its tab bar is a model for chrome design.


## Help Output, Error Formatting & Arg Parsing

## 191. anyhow
- URL: https://github.com/dtolnay/anyhow
- Repo: https://github.com/dtolnay/anyhow
- Language: rust
- Year: 2019
- Ergonomic Rust error type with context chaining; shapes how CLI error text is written.

## 192. Charm Log
- URL: https://github.com/charmbracelet/log
- Repo: https://github.com/charmbracelet/log
- Language: go
- Year: 2022
- Styled structured logging with key/value colouring and human/JSON modes.

## 193. clap
- URL: https://github.com/clap-rs/clap
- Repo: https://github.com/clap-rs/clap
- Language: rust
- Year: 2015
- Rust arg parser; generated help, error suggestions and colourised usage are the modern benchmark.

## 194. Click
- URL: https://click.palletsprojects.com
- Repo: https://github.com/pallets/click
- Language: python
- Year: 2014
- Python CLI toolkit whose help formatting and error messages are the Python default.

## 195. Cobra
- URL: https://cobra.dev
- Repo: https://github.com/spf13/cobra
- Language: go
- Year: 2013
- Go CLI framework with generated help, completions and docs.

## 196. miette
- URL: https://docs.rs/miette
- Repo: https://github.com/zkat/miette
- Language: rust
- Year: 2021
- Rust error reporting with span-based diagnostics, hints and coloured snippets.

## 197. Typer
- URL: https://typer.tiangolo.com/
- Repo: https://github.com/fastapi/typer
- Language: python
- Year: 2019
- Type-hint-driven CLI on Click; help generated from function signatures.

## 198. urfave-cli
- URL: https://cli.urfave.org
- Repo: https://github.com/urfave/cli
- Language: go
- Year: 2013
- Go CLI with formatted help templates and shell completion.


### top 15 to study for shareCLI lessons

1. **asciinema/asciinema-player** - the actual precedent: themes, markers, idle-time limiting, lazy loading, and a documented cast model. Start here for the reel viewer's data contract.
2. **asciinema/agg** - cast-to-GIF renderer; the clearest reference for frame timing, speed multipliers and idle-gap compression.
3. **charmbracelet/vhs** - `.tape` DSL that turns scripted terminal sessions into shareable media; the strongest lesson in making a terminal recording reproducible.
4. **asciinema/asciinema** - asciicast v2/v3 writer; the format fields that any reel timeline, chapter or search feature must map onto.
5. **charmbracelet/lipgloss** - declarative bordered panels and horizontal joins: reusable for reel cards, badges and metadata rails.
6. **muesli/duf** - proves a plain table with colour-coded grouping can beat a full-screen TUI; a check against over-building the UI.
7. **charmbracelet/gum** - composable prompt primitives; the model for letting ShareCLI be scripted from other tools.
8. **junegunn/fzf** - preview pane plus `--bind` actions; the best prior art for keyboard-driven list navigation with live preview.
9. **dlvhdr/gh-dash** - config-driven sections over a paginated remote API; maps well onto "reels by tag/author".
10. **Textualize/rich** - layered rendering and a Console protocol; relevant if the viewer gains a Python-side renderer or static export.
11. **eza-community/eza** - iconography, column alignment and git-status columns; the reference for dense metadata done legibly.
12. **jless** - structural navigation with a "current path" indicator; the pattern for navigating a cast timeline or JSON metadata.
13. **ratatui/ratatui** - TestBackend snapshot testing; the cheapest way to keep a TUI rendering honest in CI.
14. **charmbracelet/bubbletea** - Model/Update/View plus Cmd; the architecture to copy if the viewer grows interactive playback.
15. **nushell/nushell** - typed structured output with tables as the primary type; the model for a machine-readable CLI surface alongside the TUI.

### gaps

- **Official ncdu is not on GitHub** (upstream is `dev.yorhel.nl/ncdu`); only unofficial forks exist, so `ncdu` is excluded rather than cited through a fork.
- **Dead or moved during verification:** `fish-shell/fish` -> `fish-shell/fish-shell`, `wez/wezterm` -> `wezterm/wezterm`, `extrawurst/gitui` -> `gitui-org/gitui`, `darkhz/bluetuith` -> `bluetuith-org/bluetuith`, `makeworld-the-better-one/amfora` -> `makew0rld/amfora`, `klaussinani/taskbook` -> `klaudiosinani/taskbook`, `lotabout/skim` -> `skim-rs/skim`, `liamg/termshark` -> `gcla/termshark`, `tgraf/bmon` -> `Jafaral/bmon`.
- **Dropped entirely (404 or no canonical repo):** `aerc-mail/aerc` (now only a read-only mirror, kept as `rjarry/aerc`), `pvolok/mprocs`, `sindresorhus/slap`, `embarkstudios/neo-blessed`, `charleskawasaki/dolphie` (kept as `charles-001/dolphie`), `th1nhhdk/scooter` (kept as `thomasschafer/scooter`), `bminor/bash` (no GitHub repo resolvable).
- **Archived but retained for the lesson:** `fdehau/tui-rs`, `ogham/exa`, `dylanaraps/neofetch`, `nbedos/termtosvg`, `swsnr/mdcat`, `bczsalba/pytermgui`. Pin or vendor these rather than depending on upstream activity.
- **Not covered here:** commercial/closed-source terminal UIs (Warp), GUI-adjacent frameworks (Electron/Tauri), and cast *hosting* services (only the open player/renderer half is represented).
- **Coverage limits:** npm and crates.io category popularity was sampled through GitHub metadata, not scraped from npms.io directly, so JS/TS TUI coverage leans on the well-known libraries rather than on obscure but high-download packages.

