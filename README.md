# TripNavigate CRM: full HTML preview

A clickable preview of the whole TripNavigate CRM (Holiday Chacha Pvt LTD) as it will be once every planned feature is built: the screens that are live today plus every pending feature, for every department.

- **Open it:** download the repository and double-click `full-crm-preview.html`. Keep the `fonts` folder next to it. It runs entirely in the browser; nothing is saved or sent, and reloading resets it.
- **Switch role:** open the account menu at the bottom of the left menu (on a phone: Menu) and pick a role under "View as": Sales, Purchase, Flight, Visa and passport, Accounts, Accounts checker, Branch Manager, Super Admin.
- **What is live and what is pending:** see `CHANGES.md` (every screen per role, marked "Live today" or "Pending (to build)", plus the open questions and build notes).
- **Data:** every customer, phone number, e-mail, amount and Deal number in the preview is invented.

## Making changes

The page is assembled from the parts in `build/`:

- `build/live.css`: the live CRM's compiled style sheet (do not edit; it is what makes the preview look exactly like the CRM).
- `build/src/*.js|css`: the preview itself, one file per area (00 data, 10 core, 11 shared markup, 12 shell, 13 home, 20 sales, 30-31 book now and quotations, 40 purchase, 50 flight and visa, 60 accounts, 70 money, 80-81 manager and settings).
- `build/BRIEF.md`: the rules and the shared functions every part uses. `build/notes/`: notes per area.

After editing a part, rebuild the single file:

```bash
python3 build/assemble.py
```

That rewrites `full-crm-preview.html`. `python3 build/assemble.py mycopy` writes a private test copy to `build/out/mycopy.html` instead.
