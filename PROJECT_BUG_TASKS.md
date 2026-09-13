# Explorers Choice — Bug and Improvement Task Backlog

Review date: 12 September 2026

**20 defect tasks + 4 integration-gap tasks.** Suggested priorities: P1 = address before a production release; P2 = next development cycle. Priorities are triage recommendations, not a claim that every flow was tested in a deployed environment. Owner labels identify skills needed; assign named teammates during planning.

## Verification and scope

- Reviewed the current working tree, including existing uncommitted work. Application source was not modified.
- `npx tsc --noEmit`: passed.
- `npm run lint`: failed with two errors and one warning in the hotel-owner page.
- Isolated Python checks used the existing virtual environment and an in-memory SQLite database from `/tmp`; no project database was queried or mutated.
- Those checks reproduced password truncation, USD payment defaults, disabled SQLite foreign keys, orphan-payment creation, and sole-admin deactivation.
- Other findings are supported by source paths and control/data flow. Their reproduction steps are teammate/QA instructions, not claims of browser execution. No production build, external service test, browser suite, or load test was run.

## Assignment overview

| ID | Priority | Suggested owner | Task |
| --- | --- | --- | --- |
| BUG-01 | P1 | Backend authentication | Passwords silently ignore everything after 72 bytes |
| BUG-02 | P1 | Backend finance | Manual payment currency defaults to USD for every booking |
| BUG-03 | P1 | Backend documents | Repeated document filenames overwrite existing booking files |
| BUG-04 | P1 | Backend database | SQLite does not enforce declared foreign keys |
| BUG-05 | P1 | Backend authorization + frontend | Booking update bypasses the separate finance-role restriction |
| BUG-06 | P1 | Backend finance | Recording or refunding a payment does not reconcile booking payment status |
| BUG-07 | P1 | Frontend + backend finance | Customer payment summary shows wrong balances and mixes currencies |
| BUG-08 | P1 | Full stack catalog | Public package/destination pages ignore admin database changes |
| BUG-09 | P1 | Backend database / operations | Startup can serve against an outdated schema |
| BUG-10 | P1 | Backend accounts | An administrator can deactivate or demote the last active admin |
| BUG-11 | P2 | Frontend operations | Selecting the active filter leaves lists loading forever |
| BUG-12 | P2 | Frontend operations | Out-of-order responses display results for the wrong filter |
| BUG-13 | P2 | Frontend hotels | Hotel cards navigate to a missing detail route |
| BUG-14 | P2 | Frontend hotels | Hotel prices are always labelled as rupees |
| BUG-15 | P2 | Frontend configuration | LAN API fallback conflicts with Content Security Policy |
| BUG-16 | P2 | Frontend images | Image URL editors accept hosts that the image renderer rejects |
| BUG-17 | P2 | Backend audit | Content/settings audit records omit the acting staff member |
| BUG-18 | P2 | Backend booking + frontend | Retrying a successful-but-unacknowledged booking creates duplicates |
| BUG-19 | P2 | Backend uploads | Document size limit is checked after reading the entire file |
| BUG-20 | P2 | Frontend maintenance | Current lint command fails |
| GAP-01 | P1 | Full stack CRM | Contact form claims success without sending or saving anything |
| GAP-02 | P1 | Backend authentication | Password-reset delivery is unimplemented and reveals account existence |
| GAP-03 | P2 | Full stack booking / product | Instant-booking button promises payment without a checkout |
| GAP-04 | P2 | Full stack content / product | Admin stories and offers are not connected to the public journey |

## Defect task cards

### BUG-01 — Passwords silently ignore everything after 72 bytes

**Priority:** P1 · **Suggested owner:** Backend authentication

**Evidence:** Both hashing and verification slice UTF-8 input to 72 bytes, while schemas allow 128 characters. Two different passwords with the same first 72 bytes authenticate identically.

**Files:** [backend/app/security.py:70](backend/app/security.py); [backend/app/schemas.py:325](backend/app/schemas.py)

**Reproduce / verify:** Isolated reproduction passed: hash Aa1 + 69 x characters + first; verify with the same prefix + second returns True.

**Implementation task:** Adopt a versioned password hashing strategy that preserves the whole accepted password, or explicitly reject oversized UTF-8 input; plan compatibility for existing hashes.

**Acceptance criteria:** Different accepted passwords must not verify against each other; cover long ASCII and multibyte passwords and existing-account migration.

### BUG-02 — Manual payment currency defaults to USD for every booking

**Priority:** P1 · **Suggested owner:** Backend finance

**Evidence:** The form omits currency, the schema defaults it to USD, and the backend does not derive or check it against the booking.

**Files:** [src/app/admin/bookings/[id]/page.tsx:90](src/app/admin/bookings/[id]/page.tsx); [backend/app/schemas.py:469](backend/app/schemas.py); [backend/app/crud.py:688](backend/app/crud.py)

**Reproduce / verify:** Open an INR booking and record a payment. The submitted amount is stored as USD. The schema default was reproduced in isolation.

**Implementation task:** Derive currency from the booking on the server and reject incompatible currency submissions; send/display the correct currency in the UI.

**Acceptance criteria:** INR and USD bookings retain their respective currencies; mismatched payment currencies cannot enter the ledger.

### BUG-03 — Repeated document filenames overwrite existing booking files

**Priority:** P1 · **Suggested owner:** Backend documents

**Evidence:** Storage uses booking ID plus sanitized original filename and opens the destination with wb; every upload still creates a new document row.

**Files:** [backend/app/routes/admin.py:209](backend/app/routes/admin.py)

**Reproduce / verify:** Upload invoice.pdf twice with different content for one booking. Both document records point to the second upload. Sanitization can also make distinct names collide.

**Implementation task:** Use unique storage identifiers, retain the original name as metadata, and clean up files if the database write fails.

**Acceptance criteria:** Earlier downloads retain their exact bytes after same-name and concurrent uploads; failed saves leave no orphan file.

### BUG-04 — SQLite does not enforce declared foreign keys

**Priority:** P1 · **Suggested owner:** Backend database

**Evidence:** The SQLite engine has no connection hook enabling PRAGMA foreign_keys. Invalid child records are accepted despite declared ForeignKey constraints.

**Files:** [backend/app/database.py](backend/app/database.py); [backend/app/models.py](backend/app/models.py)

**Reproduce / verify:** Isolated database returned PRAGMA foreign_keys = 0; crud.add_payment created a payment referencing booking 9999 with no such booking.

**Implementation task:** Enable foreign keys on every SQLite connection; audit existing orphan data before rollout and add explicit parent validation to payment creation.

**Acceptance criteria:** Every new connection reports foreign_keys = 1; unknown booking payments return a clear 404/422; intended cascade/restrict behavior is tested.

### BUG-05 — Booking update bypasses the separate finance-role restriction

**Priority:** P1 · **Suggested owner:** Backend authorization + frontend

**Evidence:** Travel agents can submit payment_status through the general booking PATCH, although the dedicated payment-status route restricts changes to finance roles. Accountants see the same Save action but it calls the general route, which excludes them.

**Files:** [backend/app/routes/bookings.py:84](backend/app/routes/bookings.py); [backend/app/crud.py:391](backend/app/crud.py); [backend/app/routes/admin.py:169](backend/app/routes/admin.py); [src/app/admin/bookings/[id]/page.tsx:61](src/app/admin/bookings/[id]/page.tsx)

**Reproduce / verify:** As a travel agent, PATCH a booking with status plus payment_status=PAID; the general handler accepts it. As an accountant, use Save on the detail page and receive 403.

**Implementation task:** Enforce field-level permissions or separate booking and payment mutations consistently; show role-appropriate controls.

**Acceptance criteria:** Travel agents cannot change payment state through any route; accountants can perform authorized finance updates from the UI; unauthorized fields are rejected.

### BUG-06 — Recording or refunding a payment does not reconcile booking payment status

**Priority:** P1 · **Suggested owner:** Backend finance

**Evidence:** Payment creation/update changes only payments rows. Booking.payment_status remains independent, while customer summaries rely on it.

**Files:** [backend/app/crud.py:688](backend/app/crud.py); [backend/app/crud.py:704](backend/app/crud.py); [src/app/account/payments/page.tsx](src/app/account/payments/page.tsx)

**Reproduce / verify:** Record full payment for a PENDING booking, or mark its only paid payment REFUNDED. Reload the customer account: booking status remains unchanged.

**Implementation task:** Define and implement transaction-based reconciliation for partial, full, failed, and refunded payments in the same transaction; define any manual override explicitly.

**Acceptance criteria:** Partial/full/refund cases produce consistent booking summaries and ledger totals without a second manual status edit.

### BUG-07 — Customer payment summary shows wrong balances and mixes currencies

**Priority:** P1 · **Suggested owner:** Frontend + backend finance

**Evidence:** The overview counts the full booking total as outstanding for PARTIALLY_PAID bookings, excludes partial receipts from Paid, and sums all currencies into a default INR display.

**Files:** [src/app/account/payments/page.tsx:10](src/app/account/payments/page.tsx); [src/lib/bookingMeta.ts](src/lib/bookingMeta.ts)

**Reproduce / verify:** For an INR 1000 booking with 400 paid and PARTIALLY_PAID status, overview reports 1000 outstanding rather than 600. Add a USD booking to observe mixed-currency aggregation.

**Implementation task:** Use server-provided ledger-derived balances, grouped by currency; define refund treatment.

**Acceptance criteria:** The example shows 400 paid and 600 outstanding; INR and USD appear separately unless an explicit conversion policy is implemented.

### BUG-08 — Public package/destination pages ignore admin database changes

**Priority:** P1 · **Suggested owner:** Full stack catalog

**Evidence:** Public pages directly import static data, while admin edits persist to the database and the booking wizard reads the API. Public price/content and booking options can disagree.

**Files:** [src/app/destinations/page.tsx](src/app/destinations/page.tsx); [src/app/destinations/[slug]/page.tsx](src/app/destinations/[slug]/page.tsx); [src/app/packages/page.tsx](src/app/packages/page.tsx); [src/app/packages/[slug]/page.tsx](src/app/packages/[slug]/page.tsx); [src/lib/catalog.ts](src/lib/catalog.ts); [src/components/booking/BookingFlow.tsx](src/components/booking/BookingFlow.tsx)

**Reproduce / verify:** Create a package or change a price in admin. Inspect public listing/detail and then the booking wizard; only the live booking catalog reflects the change.

**Implementation task:** Use a shared authoritative catalog across listings, details, home features, and booking entry; define caching and offline fallback behavior.

**Acceptance criteria:** New items become reachable, price edits agree across pages, and inactive items disappear within the documented cache interval.

### BUG-09 — Startup can serve against an outdated schema

**Priority:** P1 · **Suggested owner:** Backend database / operations

**Evidence:** SQLite create_all does not alter existing tables. Non-SQLite migration failures are caught and logged, allowing startup to continue. Health checks only execute SELECT 1.

**Files:** [backend/app/main.py:32](backend/app/main.py)

**Reproduce / verify:** Start against an older SQLite schema with a missing current column, or force an Alembic upgrade failure in a disposable database. Startup can complete before model-dependent requests fail.

**Implementation task:** Provide a supported migration path for SQLite and PostgreSQL; fail startup/readiness when required schema upgrades fail.

**Acceptance criteria:** Old-schema upgrade preserves data and adds required columns; migration failure prevents readiness and reports a clear diagnostic.

### BUG-10 — An administrator can deactivate or demote the last active admin

**Priority:** P1 · **Suggested owner:** Backend accounts

**Evidence:** Staff PATCH has no protection equivalent to the self-delete guard. The only active admin can lose administrative access.

**Files:** [backend/app/routes/admin.py:342](backend/app/routes/admin.py); [backend/app/crud.py:498](backend/app/crud.py)

**Reproduce / verify:** Isolated CRUD reproduction deactivated the sole admin successfully; submit the equivalent staff PATCH while signed in as that admin.

**Implementation task:** Protect the last active administrator from deactivation/demotion/deletion using a transactional check; define self-edit rules.

**Acceptance criteria:** A system with one active admin cannot lose that admin through supported account mutations; safe changes remain possible when another active admin exists.

### BUG-11 — Selecting the active filter leaves lists loading forever

**Priority:** P2 · **Suggested owner:** Frontend operations

**Evidence:** Handlers set loading=true even when the selected filter value has not changed. The effect depends only on that value and does not fetch again.

**Files:** [src/app/admin/bookings/page.tsx:24](src/app/admin/bookings/page.tsx); [src/app/admin/enquiries/page.tsx:28](src/app/admin/enquiries/page.tsx)

**Reproduce / verify:** Wait for either list to load, then click the already-selected All filter. Loading remains until a different filter is selected.

**Implementation task:** Ignore unchanged selections or implement a deliberate refresh mechanism with request lifecycle handling.

**Acceptance criteria:** Repeated clicks on the current filter never leave the page stuck; cover both lists.

### BUG-12 — Out-of-order responses display results for the wrong filter

**Priority:** P2 · **Suggested owner:** Frontend operations

**Evidence:** Filter effects have no abort, stale-response guard, or request sequence check. Old requests can replace newer results or clear their loading state.

**Files:** [src/app/admin/bookings/page.tsx](src/app/admin/bookings/page.tsx); [src/app/admin/enquiries/page.tsx](src/app/admin/enquiries/page.tsx)

**Reproduce / verify:** Throttle the network; quickly switch between filters and resolve the older request last. Selected filter and displayed rows can disagree.

**Implementation task:** Cancel obsolete requests or ignore stale responses for data, errors, and loading state.

**Acceptance criteria:** Only the latest selected filter controls displayed results, including delayed successes and failures.

### BUG-13 — Hotel cards navigate to a missing detail route

**Priority:** P2 · **Suggested owner:** Frontend hotels

**Evidence:** Cards link to /hotels/{slug}, but src/app/hotels/[slug]/page.tsx does not exist.

**Files:** [src/components/cards/HotelCard.tsx](src/components/cards/HotelCard.tsx); [src/app/hotels/page.tsx](src/app/hotels/page.tsx)

**Reproduce / verify:** Click a hotel card from /hotels; the route resolves to not-found.

**Implementation task:** Implement the detail route using published hotel data, or change the card destination to a supported action.

**Acceptance criteria:** Published hotel cards open usable content; unknown and unpublished slugs return intentional 404 responses.

### BUG-14 — Hotel prices are always labelled as rupees

**Priority:** P2 · **Suggested owner:** Frontend hotels

**Evidence:** API hotels include currency, but the adapter drops it and the card hardcodes the rupee symbol.

**Files:** [src/lib/hotels.ts](src/lib/hotels.ts); [src/data/hotels.ts](src/data/hotels.ts); [src/components/cards/HotelCard.tsx:69](src/components/cards/HotelCard.tsx)

**Reproduce / verify:** Publish a USD hotel with price 100; its public card displays ₹100.

**Implementation task:** Carry currency through the hotel type/adapter and use currency-aware formatting.

**Acceptance criteria:** INR, USD, and other supported listings retain their actual currency in list and detail displays.

### BUG-15 — LAN API fallback conflicts with Content Security Policy

**Priority:** P2 · **Suggested owner:** Frontend configuration

**Evidence:** Without an explicit public API URL, the client selects the current LAN hostname on port 8000. CSP connect-src allows self and localhost:8000, not that different LAN port.

**Files:** [src/lib/api.ts](src/lib/api.ts); [next.config.ts](next.config.ts)

**Reproduce / verify:** Serve the frontend on a LAN address with no NEXT_PUBLIC_EXPLORERS_API_URL; inspect an auth/API request in the browser. It targets LAN port 8000 but is outside the configured CSP source list.

**Implementation task:** Generate consistent API URLs and CSP origins, or use a same-origin API proxy. Keep production policy explicit.

**Acceptance criteria:** Login and account requests work on supported localhost/LAN setups without CSP violations; production policy remains restricted.

### BUG-16 — Image URL editors accept hosts that the image renderer rejects

**Priority:** P2 · **Suggested owner:** Frontend images

**Evidence:** Editors accept arbitrary image URLs, but next/image remotePatterns only allow images.unsplash.com and http://localhost:8000. Adding the API URL to CSP does not update this image allowlist.

**Files:** [next.config.ts](next.config.ts); [src/app/admin/hotels/page.tsx](src/app/admin/hotels/page.tsx); [src/app/admin/packages/page.tsx](src/app/admin/packages/page.tsx); [src/app/admin/destinations/page.tsx](src/app/admin/destinations/page.tsx); [src/components/cards/HotelCard.tsx](src/components/cards/HotelCard.tsx)

**Reproduce / verify:** Save an image URL on another intended CDN or backend hostname, then render it through next/image. It falls outside remotePatterns.

**Implementation task:** Define supported image hosts and validate inputs or use managed uploads; align CSP, rendering configuration, and user-facing validation.

**Acceptance criteria:** Supported production-host images render; unsupported URLs are rejected before saving with a helpful explanation.

### BUG-17 — Content/settings audit records omit the acting staff member

**Priority:** P2 · **Suggested owner:** Backend audit

**Evidence:** Several routes authenticate through dependency lists but call CRUD without actor. Audit helper then stores an empty username/user ID; settings updated_by is also absent.

**Files:** [backend/app/routes/admin.py:272](backend/app/routes/admin.py); [backend/app/routes/admin.py:301](backend/app/routes/admin.py); [backend/app/routes/admin.py:391](backend/app/routes/admin.py); [backend/app/crud.py](backend/app/crud.py)

**Reproduce / verify:** Create/edit an offer or story, or save a setting as a known admin. Inspect the resulting audit entry and setting updater.

**Implementation task:** Resolve the actor in each mutation handler and pass it through; make business writes and audit writes atomic where appropriate.

**Acceptance criteria:** These operations record the correct actor, entity, and action; failed writes do not leave misleading success audit records.

### BUG-18 — Retrying a successful-but-unacknowledged booking creates duplicates

**Priority:** P2 · **Suggested owner:** Backend booking + frontend

**Evidence:** The frontend only remembers a successful response locally. Backend booking creation has no idempotency key; each request generates a fresh reference.

**Files:** [backend/app/routes/bookings.py:14](backend/app/routes/bookings.py); [backend/app/crud.py:314](backend/app/crud.py); [src/components/booking/BookingFlow.tsx:175](src/components/booking/BookingFlow.tsx)

**Reproduce / verify:** Allow a booking POST to commit but drop the response, then retry the same submission. Two bookings can be created.

**Implementation task:** Add scoped idempotency keys and persist/reuse the booking result; keep intentional separate bookings possible.

**Acceptance criteria:** Retry/concurrent requests with the same key create exactly one booking and return the same reference; different keys may create distinct bookings.

### BUG-19 — Document size limit is checked after reading the entire file

**Priority:** P2 · **Suggested owner:** Backend uploads

**Evidence:** file.file.read() loads the complete uploaded file into memory before comparing it to the 20 MB limit. Large/concurrent authorized uploads can consume excessive memory.

**Files:** [backend/app/routes/admin.py:226](backend/app/routes/admin.py)

**Reproduce / verify:** In an isolated environment, submit an oversized document and observe that the handler reads the full content before returning 413. This memory behavior was identified statically, not load-tested.

**Implementation task:** Read in bounded chunks and stop once the limit is exceeded; apply a compatible request limit at the serving layer and clean up partial output.

**Acceptance criteria:** Oversized uploads return 413 with bounded memory use and no leftover partial files.

### BUG-20 — Current lint command fails

**Priority:** P2 · **Suggested owner:** Frontend maintenance

**Evidence:** npm run lint reports two react/no-unescaped-entities errors on quoted JSX text and one unused Link import warning.

**Files:** [src/app/hotel-owner/page.tsx:303](src/app/hotel-owner/page.tsx)

**Reproduce / verify:** Run npm run lint. Result reproduced during this review: exit code 1, two errors, one warning.

**Implementation task:** Escape the JSX quotes and remove the unused import without changing behavior.

**Acceptance criteria:** npm run lint exits successfully and npx tsc --noEmit remains clean.

## Incomplete integrations requiring implementation or a product decision

These tasks are separated because completing the missing capability may require broader scope than a bug fix. The misleading or broken current behavior is still actionable.

### GAP-01 — Contact form claims success without sending or saving anything

**Priority:** P1 · **Suggested owner:** Full stack CRM

**Evidence:** handleSubmit only prevents default and sets submitted=true.

**Files:** [src/app/contact/page.tsx](src/app/contact/page.tsx)

**Reproduce / verify:** Submit a valid form and inspect the network/database: there is no delivery request or enquiry record.

**Implementation task:** Implement validated public enquiry capture and error handling; display success only after persistence.

**Acceptance criteria:** A submission appears once in admin enquiries; server failure retains input and shows an error.

### GAP-02 — Password-reset delivery is unimplemented and reveals account existence

**Priority:** P1 · **Suggested owner:** Backend authentication

**Evidence:** Known users get a stored reset token followed by HTTP 501; unknown users get HTTP 204. No email is sent.

**Files:** [backend/app/routes/auth.py:95](backend/app/routes/auth.py)

**Reproduce / verify:** Request a reset for a known and an unknown email; compare responses.

**Implementation task:** Implement token delivery and uniform public responses; avoid exposing delivery/account status.

**Acceptance criteria:** Both addresses receive indistinguishable responses; a real user can complete the emailed reset and cannot reuse the token.

### GAP-03 — Instant-booking button promises payment without a checkout

**Priority:** P2 · **Suggested owner:** Full stack booking / product

**Evidence:** Continue to payment submits a booking and shows confirmation; no payment-provider checkout is invoked.

**Files:** [src/components/booking/BookingFlow.tsx:554](src/components/booking/BookingFlow.tsx); [backend/app/crud.py:314](backend/app/crud.py)

**Reproduce / verify:** Select an INSTANT_BOOKING package and complete the wizard.

**Implementation task:** Either implement checkout and verified payment callbacks, or relabel the flow clearly as a request with manual payment instructions.

**Acceptance criteria:** The button describes the resulting action; no booking is presented as paid without confirmed payment.

### GAP-04 — Admin stories and offers are not connected to the public journey

**Priority:** P2 · **Suggested owner:** Full stack content / product

**Evidence:** Public stories use static content; admin offers are stored but booking calculation never applies them.

**Files:** [src/app/stories/page.tsx](src/app/stories/page.tsx); [src/app/stories/[slug]/page.tsx](src/app/stories/[slug]/page.tsx); [src/data/stories.ts](src/data/stories.ts); [backend/app/crud.py:314](backend/app/crud.py)

**Reproduce / verify:** Publish a story in admin and inspect /stories; create an offer and inspect booking submission/pricing.

**Implementation task:** Create separate story-publication and offer-redemption follow-up tickets; define supported discount rules before implementation.

**Acceptance criteria:** Published stories appear publicly; if offers are supported at checkout, valid codes apply server-side and expired/inapplicable codes do not.

## Suggested work allocation and sequencing

- **Backend/security teammate:** BUG-01, BUG-04, BUG-05, BUG-09, BUG-10, BUG-17, and GAP-02. Coordinate database rollout before enabling stricter constraints.
- **Payments/booking teammate:** BUG-02, BUG-06, BUG-07, BUG-18, and GAP-03. Agree ledger/status rules first; then implement currency validation and reconciliation before correcting summaries.
- **Frontend/content teammate:** BUG-08, BUG-11–BUG-16, BUG-20, and GAP-04. Coordinate API contracts with backend; read the repository-required Next.js local guides before editing framework code.
- **Full stack/documents/CRM teammate:** BUG-03, BUG-19, and GAP-01. Combine upload storage and bounded-read changes into a coherent implementation.
- **QA:** reproduce each task with disposable fixtures, add focused regression coverage with the fix, and verify both authorized and unauthorized roles. Include partial/full/refunded payments, INR/USD bookings, repeated filenames, stale network responses, and API failure cases.

Suggested first release gate: resolve P1 defects, contact/reset failures, and the failing lint check; verify the core registration → booking → payment recording → customer document workflow. Keep product-dependent integrations explicit in the release scope.
