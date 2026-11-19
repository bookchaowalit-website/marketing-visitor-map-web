# Design

Since 2026-11-19 this app uses the shared **Dashboard shell**: rules, pieces and the move recipe are in
[`DASHBOARD.md`](DASHBOARD.md). The earlier one-off look ("Visitor Atlas", paper and navy) was retired so every
data page on `*.bookchaowalit.com` reads the same way; see git history for its old design notes.

App-specific pieces (in `app/globals.css`, prefix `vm-`): the abstract map panel, its legend, HTML city labels
(12px floor at every width) and the empty-state prompt. Your visit is a filled dot, a simulated visit is a ring,
so colour is never the only signal; the Cities list carries the same counts as text.
