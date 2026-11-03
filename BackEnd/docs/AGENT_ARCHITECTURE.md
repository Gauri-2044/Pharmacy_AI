# Pharmacy agent architecture

The chat endpoint (`POST /api/agent/chat`, also mounted at `/api/chat`) uses
`@google/genai` function calling when `GEMINI_API_KEY` or `GOOGLE_API_KEY` is
configured. The model can only request functions declared in
`src/agents/tool.definitions.js`; `src/agents/tool.executor.js` validates the
allow-list and delegates to services and repositories. It cannot execute SQL.

The available tools are:

- `search_medicine_catalog`: exact name, optional alias, then `pg_trgm` fuzzy search.
- `get_medicine_details`: returns the selected catalog record.
- `check_inventory`: read-only stock lookup.
- `prepare_order_draft`: validates items and returns a reviewable draft.
- `get_order_status`: enforces authenticated-user ownership (admins follow the existing role).

Order placement remains an explicit backend action through
`POST /api/agent/confirm-order` or `POST /api/orders/orders`. It uses a
transaction and row locks for inventory consistency. Email delivery occurs
after commit; an email failure does not roll back a successful order.

Run `db/migrations/001_agent_search.sql` if the deployment permits `pg_trgm`
and aliases are available. The application remains usable without the
extension or alias table.
