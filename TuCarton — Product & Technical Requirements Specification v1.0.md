# TuCarton — Product & Technical Requirements Specification

**Document Version:** 1.0  
**Status:** Initial Approved Baseline  
**Product:** TuCarton  
**Primary Market:** Dominican Republic  
**Initial Platforms:** Android and iOS  
**Primary Architecture:** Expo / React Native + NestJS + PostgreSQL  
**Architecture Style:** Offline-first mobile application + modular monolith backend  
**Document Purpose:** Product, business, functional, domain, security, offline-sync, and technical requirements baseline.

---

# 1. Executive Summary

**TuCarton** is a mobile-first, offline-capable shared debt ledger designed initially for colmados, small stores, neighborhood businesses, and their customers in the Dominican Republic.

The application digitizes the traditional process of purchasing goods _“TuCarton”_: a customer receives products or services without paying immediately and agrees to pay the resulting debt later.

The primary problem TuCarton solves is not merely recording debt digitally. Its central purpose is ensuring that **the business and the customer maintain the same mutually acknowledged record**.

Instead of a business keeping one notebook and a customer keeping an independent paper record, TuCarton creates a shared transaction history in which financially meaningful changes require acknowledgment from both parties.

A business can request that a debt be recorded, but that debt does not become part of the confirmed outstanding balance until the customer accepts it.

Similarly, a payment does not reduce the confirmed balance until both sides acknowledge that the payment occurred.

Confirmed financial transactions are immutable. Corrections are represented through additional transactions rather than editing historical records.

TuCarton must operate in environments with unreliable or unavailable internet connectivity. Online transactions may be delivered through the TuCarton application and shareable links, while face-to-face transactions may be transferred and acknowledged offline using QR codes.

TuCarton does **not** lend money, collect debts, guarantee repayment, provide legal enforcement, calculate credit scores, or act as a payment processor.

---

# 2. Problem Statement

Informal credit is common in small neighborhood businesses.

A typical process may work as follows:

1. A customer obtains goods without paying immediately.
2. The merchant writes the amount in a notebook.
3. The customer may maintain a separate paper or handwritten record.
4. Later, the customer pays all or part of the accumulated balance.

Because both records are maintained independently, disagreements may occur.

Examples include:

- the merchant records a different amount than the customer;
- one party forgets a transaction;
- a payment is not properly reflected;
- one record is lost;
- timestamps or descriptions differ;
- the merchant and customer calculate different outstanding balances.

TuCarton replaces these disconnected records with a **single logical ledger whose financial entries are mutually acknowledged**.

---

# 3. Product Vision

TuCarton's initial product vision is:

> **Replace the traditional handwritten “TuCarton” notebook with a simple shared digital ledger that both merchant and customer can trust, including in environments where internet connectivity is unreliable.**

The initial product must remain intentionally narrow.

Future versions may integrate payment systems, merchant-management products, identity-verification providers, financial platforms, or other services, but these capabilities must not unnecessarily complicate the initial debt-recording experience.

---

# 4. Product Goals

## 4.1 Primary Goals

TuCarton MUST:

1. Allow businesses to record debt requests for customers.
2. Require customer acknowledgment before a debt affects the confirmed balance.
3. Allow payments to be recorded and mutually acknowledged.
4. Maintain an immutable history of confirmed financial transactions.
5. Maintain the same logical transaction history for both business and customer.
6. Support online and offline transaction flows.
7. Support QR-based face-to-face offline acknowledgment.
8. Support asynchronous transaction requests.
9. Support shareable transaction links.
10. Support users who simultaneously act as customers and business members.
11. Maintain strict privacy between separate business/customer relationships.
12. Remain simple enough for users with limited technical experience.
13. Operate effectively on unreliable and low-bandwidth internet connections.

---

# 5. Non-Goals

The MVP is NOT intended to provide:

- inventory management;
- product catalogs;
- point-of-sale functionality;
- invoice accounting;
- formal lending;
- interest calculations;
- automatic debt collection;
- legal debt enforcement;
- debt guarantees;
- bank transfers;
- card payments;
- cash processing;
- customer credit scores;
- merchant-visible global customer debt;
- merchant-to-merchant customer information sharing;
- general-purpose chat or direct messaging;
- bookkeeping/accounting software;
- payroll;
- supplier management;
- ecommerce;
- NFC transaction exchange.

A request delivered through TuCarton may feel similar to receiving a DM, but **TuCarton does not need a general messaging system**.

---

# 6. Requirement Language

The following terminology is used throughout this specification:

**MUST** — Mandatory for the relevant release.

**MUST NOT** — Explicitly prohibited.

**SHOULD** — Strongly recommended but may be deferred for a justified technical reason.

**MAY** — Optional capability.

**TBD** — Intentionally unresolved implementation decision that does not block the product definition.

---

# 7. Domain Terminology

## 7.1 User

A person with a TuCarton account.

A User does not permanently belong to a "Customer" or "Store" account type.

---

## 7.2 Business

A commercial entity registered in TuCarton.

Examples:

- Colmado Lewis
- Cafetería José
- Mini Market Ana

---

## 7.3 Business Member

A User authorized to operate on behalf of a Business.

MVP roles:

- `OWNER`
- `MEMBER`

---

## 7.4 Customer

A User participating in a debt relationship with a Business.

"Customer" is a contextual role, not an account type.

---

## 7.5 Customer Relationship

The association between:

**Business ↔ User**

through which debt and payment transactions are maintained.

---

## 7.6 TuCarton Code

A short, unique, public identifier associated with a User.

Examples:

`LMS82K`

`284917`

It allows another user or business to locate the intended TuCarton account without requiring access to a Cédula, phone number, or internal database UUID.

---

## 7.7 Debt Transaction

A request to increase the customer's outstanding balance with a Business.

---

## 7.8 Payment Transaction

A request acknowledging money paid toward an outstanding balance.

A confirmed payment reduces the balance.

---

## 7.9 Reversal

A transaction that compensates for a previously confirmed transaction without modifying or deleting the original transaction.

---

## 7.10 Confirmed Balance

The financial balance calculated exclusively from confirmed ledger transactions.

---

## 7.11 Pending Amount

The value of transactions awaiting acknowledgment.

Pending amounts are displayed separately and MUST NOT be included in the confirmed balance.

---

# 8. Core Product Principles

## BP-001 — Mutual Acknowledgment

Financial changes SHOULD require acknowledgment from both sides of the relationship.

---

## BP-002 — Immutable Financial History

A confirmed financial transaction MUST NOT be edited or deleted.

---

## BP-003 — Append-Only Correction

Errors in confirmed transactions MUST be corrected through new compensating ledger entries.

---

## BP-004 — Ledger as Source of Truth

Balances MUST be derived from ledger transactions.

A mutable balance column MUST NOT be the authoritative financial record.

Cached/materialized balances MAY exist for performance.

---

## BP-005 — Privacy by Relationship

A business MUST NOT obtain information about a customer's relationships or debts with unrelated businesses.

---

## BP-006 — Offline as Core Capability

Offline support is a core requirement and MUST NOT be treated merely as a fallback UI state.

---

## BP-007 — Single Identity, Multiple Contexts

A single User MUST be capable of simultaneously acting as:

- a customer;
- the owner of one or more businesses;
- a member of one or more businesses.

---

# 9. Actors and Authorization

## 9.1 User

Every authenticated person is a User.

---

## 9.2 Business Owner

An `OWNER` MUST be allowed to:

- view the Business;
- view Business customers;
- view Business transaction history;
- create debt requests;
- create payment requests;
- confirm customer-initiated payment requests;
- initiate corrections/reversals;
- confirm customer-initiated corrections when applicable;
- modify Business profile information;
- invite Business members;
- remove Business members;
- change permitted Business membership roles;
- archive/configure the Business.

A Business MUST always retain at least one `OWNER`.

The last Owner MUST NOT be removable or demotable without first assigning another Owner.

---

## 9.3 Business Member

A `MEMBER` MUST be allowed to:

- access the Business operational view;
- view Business customers;
- view customer balances;
- view Business transaction history;
- create debt requests;
- create payment requests;
- acknowledge customer-created payment requests;
- participate in permitted correction workflows.

A `MEMBER` MUST NOT:

- delete/archive the Business;
- change ownership;
- manage Business membership unless that capability is explicitly added later.

---

## 9.4 Customer

A Customer MUST be allowed to:

- view relationships with Businesses;
- view confirmed balances;
- view pending requests;
- view transaction history;
- confirm debt requests;
- reject debt requests;
- initiate payment requests;
- confirm Business-initiated payment requests;
- participate in correction/reversal workflows.

---

# 10. Identity Requirements

## FR-ID-001 — Internal User Identifier

Every User MUST have an immutable, globally unique internal identifier.

UUID-compatible identifiers are recommended.

The internal identifier MUST NOT depend on:

- Cédula;
- phone number;
- email address;
- TuCarton Code.

---

## FR-ID-002 — Public TuCarton Code

Every active User MUST have a unique public TuCarton Code.

The code MUST:

- be substantially easier to communicate than an internal UUID;
- uniquely resolve to one active TuCarton account;
- not reveal sensitive government identification information.

---

## FR-ID-003 — Minimal Public Profile

Exact TuCarton Code lookup MAY return a minimal public identity representation such as:

- display name;
- TuCarton Code;
- profile avatar if later supported.

It MUST NOT expose:

- Cédula;
- phone number;
- private debt information;
- Business relationships.

---

## FR-ID-004 — Enumeration Protection

The backend MUST prevent TuCarton Codes from becoming a convenient bulk directory of all TuCarton users.

Controls SHOULD include:

- exact-code search rather than unrestricted browsing;
- rate limits;
- abuse monitoring.

---

## FR-ID-005 — Government Identification

A Cédula or other government ID MAY later be attached to a User for verification.

Government identification MUST NOT be the primary database key.

---

## FR-ID-006 — MVP Identity Verification

Identity verification MAY remain relatively lightweight in the MVP.

A phone-based verification mechanism is the recommended initial direction.

The exact authentication/OTP provider is TBD.

---

# 11. Authentication Requirements

## FR-AUTH-001

A User MUST authenticate before accessing private account or transaction information.

---

## FR-AUTH-002

Authentication credentials/tokens MUST NOT be stored in plain-text application storage.

---

## FR-AUTH-003

The mobile application SHOULD support persistent authenticated sessions.

---

## FR-AUTH-004

A new device MUST complete an online authentication/provisioning process before participating in trusted fully-offline transaction confirmation.

---

## FR-AUTH-005

Logging out MUST remove or invalidate locally accessible authentication secrets as appropriate.

---

## FR-AUTH-006

Account recovery MUST require an online process.

Exact recovery mechanisms are TBD.

---

# 12. Business Requirements

## FR-BIZ-001 — Business Creation

An authenticated User MUST be able to create a Business.

The creator becomes its initial `OWNER`.

---

## FR-BIZ-002 — Multiple Businesses

A User MAY own or belong to multiple Businesses.

---

## FR-BIZ-003 — Multiple Owners

A Business MAY have multiple `OWNER` memberships.

---

## FR-BIZ-004 — Business Membership Invitation

An Owner SHOULD be able to invite another TuCarton User to a Business.

The invited User MUST acknowledge the invitation before receiving Business access.

---

## FR-BIZ-005 — Minimum Business Fields

A Business MUST include at least:

- unique ID;
- display name;
- status;
- creation timestamp.

Additional metadata MAY be added later.

---

## FR-BIZ-006 — Business Archival

If a Business has historical confirmed ledger transactions, it MUST NOT be hard-deleted through normal user functionality.

It MAY instead be archived/deactivated.

Historical transactions MUST remain intact.

---

# 13. Customer Relationship Requirements

## FR-CUST-001 — Add Customer Manually

An authorized Business member MUST be able to add an existing TuCarton User to the Business's customer list using the User's TuCarton Code or another supported identifier.

---

## FR-CUST-002 — Business-Specific Nickname

The Business MAY assign a private nickname to a customer.

Example:

`Doña María Casa Azul`

This nickname belongs to the Business relationship and does not modify the User's TuCarton identity.

---

## FR-CUST-003 — Automatic Relationship Creation

If a Business and User do not have an existing customer relationship, the system MUST automatically create/save the relationship following their first confirmed debt transaction.

---

## FR-CUST-004 — Pre-Saved Customer

A Business MAY save a customer before creating any debt transaction.

---

## FR-CUST-005 — Customer Without TuCarton Account

The MVP MUST NOT create confirmed TuCarton debts for people without a TuCarton account.

A transaction requires an identifiable TuCarton recipient capable of eventually acknowledging it.

Future versions MAY support onboarding invitation flows.

---

## FR-CUST-006 — Relationship Privacy

The Customer MUST NOT automatically receive information about the Business's other customers.

The Business MUST NOT receive information about the Customer's other Business relationships.

---

# 14. Ledger Transaction Types

The MVP MUST support the following financial transaction types:

1. `DEBT`
2. `PAYMENT`
3. `REVERSAL`

Additional transaction types MAY be introduced later through a versioned domain model.

---

# 15. Debt Requirements

## FR-DEBT-001

Only an authorized `OWNER` or `MEMBER` acting for a Business may initiate a Debt Transaction.

---

## FR-DEBT-002

A Debt Transaction MUST identify exactly:

- one Business;
- one Customer User;
- one amount;
- one currency.

---

## FR-DEBT-003

Debt creation MUST support an optional note/details field.

Example:

`1 Coca-Cola + 2 masitas`

The note is informational and MUST NOT require inventory/product entities.

---

## FR-DEBT-004

A newly created debt MUST initially have status:

`PENDING`

unless an offline exchange contains a valid immediate acknowledgment from the customer.

---

## FR-DEBT-005

A pending debt MUST NOT contribute to confirmed outstanding balance.

---

## FR-DEBT-006

Only the target Customer may acknowledge a Debt Request from the customer side.

A merchant MUST NOT be able to confirm a customer's debt on behalf of that customer.

---

## FR-DEBT-007

The Customer MUST be able to:

- confirm;
- reject

a pending Debt Request.

---

# 16. Payment Requirements

## FR-PAY-001

Payment Transactions MAY be initiated by either:

- Customer;
- authorized Business member.

---

## FR-PAY-002

If the Customer initiates a Payment Request, an authorized Business member MUST confirm it before it affects the balance.

---

## FR-PAY-003

If the Business initiates a Payment Request, the Customer MUST confirm it before it affects the balance.

---

## FR-PAY-004

A confirmed Payment Transaction MUST reduce the ledger balance.

---

## FR-PAY-005

Partial payments MUST be supported.

Example:

Current balance:

`RD$2,000`

Payment:

`RD$500`

Resulting confirmed balance:

`RD$1,500`

---

## FR-PAY-006

The client SHOULD be warned when a proposed payment exceeds the currently known outstanding balance.

This warning SHOULD NOT automatically invalidate a mutually acknowledged transaction because concurrent/offline synchronization may result in balances changing after the request was created.

---

# 17. Financial Amount Representation

## FR-MONEY-001

Monetary amounts MUST NOT be stored using floating-point arithmetic.

---

## FR-MONEY-002

Amounts SHOULD be stored in integer minor units.

Example:

`RD$60.00 → 6000 centavos`

---

## FR-MONEY-003

Each transaction MUST explicitly store its currency.

---

## FR-MONEY-004

The initial Dominican MVP SHOULD default to:

`DOP`

---

## FR-MONEY-005

The database model SHOULD remain capable of supporting additional currencies later.

---

# 18. Transaction State Machine

The core transaction states are:

```text
                 +------------+
                 |  PENDING   |
                 +------------+
                  /    |    \
                 /     |     \
                v      v      v
        +---------+ +--------+ +----------+
        |CONFIRMED| |REJECTED| |CANCELED  |
        +---------+ +--------+ +----------+
                 \
                  \ optional expiration
                   v
                +---------+
                | EXPIRED |
                +---------+
```

Valid terminal transitions from `PENDING`:

```text
PENDING -> CONFIRMED
PENDING -> REJECTED
PENDING -> CANCELED
PENDING -> EXPIRED
```

---

## FR-STATE-001

A confirmed transaction MUST NOT transition back to Pending.

---

## FR-STATE-002

A rejected transaction MUST remain visible in transaction history.

---

## FR-STATE-003

A canceled transaction MUST remain auditable.

---

## FR-STATE-004

Only the transaction creator may cancel a transaction while it remains `PENDING`.

---

## FR-STATE-005

Once another party has confirmed a transaction, cancellation MUST NOT be permitted.

---

## FR-STATE-006

A request MAY define:

`expires_at`

---

## FR-STATE-007

If:

`expires_at = NULL`

the request does not automatically expire.

---

## FR-STATE-008

Expired transactions MUST NOT affect confirmed balance.

---

# 19. Reversal and Correction Requirements

Confirmed records MUST NOT be disabled, rewritten, or deleted.

Instead, corrections use compensating entries.

---

## FR-REV-001

A confirmed transaction MAY be corrected using a `REVERSAL`.

---

## FR-REV-002

A Reversal MUST reference the original confirmed transaction.

---

## FR-REV-003

The financial effect of a full Reversal MUST be the inverse of the original transaction.

Example:

```text
Original DEBT:
+RD$600

REVERSAL:
-RD$600
```

---

## FR-REV-004

The original transaction MUST remain visible after reversal.

---

## FR-REV-005

The reversal MUST also appear in transaction history.

---

## FR-REV-006

A correction SHOULD require mutual acknowledgment.

---

## FR-REV-007

The recommended correction workflow for an incorrect amount is:

```text
Original:
+RD$600

Reversal:
-RD$600

New corrected transaction:
+RD$60
```

rather than changing `600` into `60`.

---

# 20. Immutable Ledger Rules

## BR-LEDGER-001

Once a transaction reaches `CONFIRMED`, the following financial fields MUST NOT change:

- Business;
- Customer;
- transaction type;
- amount;
- currency;
- original creator;
- target reversal transaction reference.

---

## BR-LEDGER-002

The system MAY maintain mutable operational metadata separately, such as:

- synchronization state;
- notification-delivery state;
- cached calculated balances.

---

## BR-LEDGER-003

Status changes and acknowledgments SHOULD themselves be represented in an append-only audit/action history.

---

# 21. Balance Calculation

For each:

**Business ↔ Customer**

relationship:

```text
Confirmed DEBT effects
- Confirmed PAYMENT effects
+/- Confirmed REVERSAL effects
--------------------------------
Confirmed Balance
```

---

## FR-BAL-001

Only confirmed transactions contribute to confirmed balance.

---

## FR-BAL-002

Pending Debt Transactions MUST be displayed separately.

Example:

```text
Confirmed balance:         RD$1,500
Awaiting confirmation:       RD$400
```

The interface MUST NOT misleadingly show:

`RD$1,900 owed`

until the RD$400 transaction is confirmed.

---

## FR-BAL-003

The canonical balance MUST be reproducible from the ledger.

---

## FR-BAL-004

The server MAY maintain a materialized/cached balance for performance.

Any cached balance MUST be reconstructable from ledger data.

---

## FR-BAL-005

The ledger model MUST tolerate a negative calculated balance.

A negative balance may occur through:

- overpayment;
- offline concurrency;
- simultaneous payment requests.

The application MAY represent this as credit in the customer's favor rather than silently dropping a mutually acknowledged payment.

---

# 22. Online Transaction Flow

Normal online debt flow:

```text
Business
   |
   | Create RD$600 request
   v
TuCarton API
   |
   +----> Persistent transaction
   |
   +----> In-app notification
   |
   +----> Optional push notification
   v
Customer
   |
   +---- Confirm
   |
   `---- Reject
```

---

## FR-ONLINE-001

An online request MUST become available in the recipient's TuCarton inbox/activity interface.

---

## FR-ONLINE-002

The system SHOULD send a push notification when appropriate.

Push notification delivery MUST NOT be considered authoritative.

The in-app state is authoritative.

---

## FR-ONLINE-003

A recipient MUST be capable of opening the request and viewing:

- Business;
- amount;
- currency;
- details/note;
- request type;
- creation information;
- expiration information if applicable.

---

# 23. Asynchronous Debt Requirements

A Business MAY create a Debt Request without the Customer being physically present.

Example:

1. Customer calls the colmado.
2. Customer asks for groceries to be delivered.
3. Business prepares products.
4. Business creates RD$850 Debt Request.
5. Customer receives the request in TuCarton.
6. Customer confirms remotely.

---

## FR-ASYNC-001

Debt confirmation MUST NOT require both devices to be physically colocated.

---

## FR-ASYNC-002

An online request MUST remain available until:

- confirmed;
- rejected;
- canceled;
- expired.

---

# 24. Shareable Link Requirements

## FR-LINK-001

A pending transaction MAY generate a secure shareable HTTPS link.

Conceptual form:

```text
https://TuCarton.app/r/{opaque-token}
```

---

## FR-LINK-002

The link MAY be shared through:

- WhatsApp;
- SMS;
- email;
- other messaging applications;
- operating-system share sheet.

Direct WhatsApp integration is NOT required for MVP.

---

## FR-LINK-003

The link MUST NOT itself confirm a transaction.

---

## FR-LINK-004

Opening the link SHOULD route the authenticated intended recipient to the corresponding transaction inside TuCarton.

---

## FR-LINK-005

If the recipient is unauthenticated, TuCarton MUST require authentication before exposing private transaction information or accepting an action.

---

## FR-LINK-006

A link sent to the wrong person MUST NOT allow that person to confirm the transaction.

Authorization MUST be bound to the intended TuCarton account.

---

## FR-LINK-007

Share tokens MUST be high-entropy opaque values.

Sensitive transaction information SHOULD NOT be encoded directly into the URL.

---

## FR-LINK-008

A share token MAY be revoked once a request becomes terminal.

---

# 25. In-App Notifications

## FR-NOT-001

Users MUST have an in-app location where pending actions can be reviewed.

---

## FR-NOT-002

Events that SHOULD produce an in-app notification include:

- new Debt Request;
- new Payment Request;
- transaction confirmed;
- transaction rejected;
- transaction canceled;
- correction/reversal request;
- Business membership invitation.

---

## FR-NOT-003

Push notifications MAY supplement in-app notifications.

---

## FR-NOT-004

Failure to deliver a push notification MUST NOT cause transaction loss.

---

# 26. Offline-First Requirement

TuCarton MUST continue providing useful functionality during connectivity loss.

The mobile device therefore maintains a local persistent database.

The local database is not simply a UI cache; it participates in offline workflow and synchronization.

---

# 27. Local Data Model

The mobile application SHOULD maintain enough local information to support:

- authenticated local identity;
- currently selected Business context;
- relevant customers;
- recent transaction history;
- pending transactions;
- balance snapshots;
- offline operations;
- synchronization queue;
- offline credential metadata.

Secrets MUST be stored separately using platform-secure storage where appropriate.

---

# 28. Synchronization State

Business transaction state and synchronization state MUST be treated separately.

Example transaction state:

`CONFIRMED`

Example sync state:

`LOCAL_ONLY`

These represent different concepts.

Recommended synchronization states:

```text
LOCAL_ONLY
QUEUED
SYNCING
SYNCED
SYNC_ERROR
SYNC_CONFLICT
```

---

## FR-SYNC-001

Every locally generated operation MUST receive a globally unique operation/event identifier before reaching the server.

---

## FR-SYNC-002

Synchronization MUST be idempotent.

Uploading the same event multiple times MUST NOT duplicate a financial transaction.

---

## FR-SYNC-003

Temporary connectivity failure MUST NOT delete locally created events.

---

## FR-SYNC-004

Failed operations MUST remain retryable unless the server identifies a permanent conflict.

---

## FR-SYNC-005

The user SHOULD be able to distinguish:

- synchronized;
- waiting to synchronize;
- synchronization error.

---

## FR-SYNC-006

The server MUST validate permissions and transaction integrity even if the operation was created offline.

---

## FR-SYNC-007

The server MUST NOT trust client timestamps as authoritative security information.

---

## FR-SYNC-008

Important offline events SHOULD store both:

`client_created_at`

and, following synchronization:

`server_received_at`

---

# 29. Fully Offline QR Flow

When both phones lack connectivity, TuCarton should initially use a **two-QR handshake**.

## Step 1 — Business Generates Request

```text
BUSINESS PHONE

Create:
RD$600 Debt Request

     |
     v

Generate Request QR
```

---

## Step 2 — Customer Scans

```text
BUSINESS PHONE                    CUSTOMER PHONE

Request QR
     |
     +---------------------------> Scan

                                  Review:
                                  Colmado José
                                  RD$600
                                  "Compra sábado"

                                  Confirm / Reject
```

---

## Step 3 — Customer Generates Response

If the Customer confirms:

```text
CUSTOMER PHONE

Generate signed
confirmation response QR
```

If the Customer rejects:

```text
CUSTOMER PHONE

Generate signed
rejection response QR
```

---

## Step 4 — Business Scans Response

```text
CUSTOMER PHONE                    BUSINESS PHONE

Confirmation QR
       |
       +-------------------------> Scan

                                  "Confirmed offline"
```

Both devices now maintain equivalent local knowledge of the action.

---

## Step 5 — Synchronization

When either device later gains connectivity, it submits locally stored events.

Eventually both devices synchronize against the canonical backend state.

---

# 30. Offline QR Security Requirements

A QR code is only a transport mechanism.

Possession or scanning of a QR code MUST NOT, by itself, be considered proof of authorization.

---

## FR-QR-001

QR payloads MUST use a versioned protocol.

Example conceptual structure:

```text
protocol_version
envelope_type
transaction_id
operation_id
business_id
customer_id
transaction_type
amount_minor
currency
details
client_created_at
expires_at
creator_device_id
credential_metadata
integrity_signature
```

The final serialization format is TBD.

---

## FR-QR-002

Confirmation QR payloads MUST reference the original transaction identifier.

---

## FR-QR-003

A Confirmation QR MUST be attributable to the intended Customer's provisioned device/account.

---

## FR-QR-004

A Business MUST NOT be capable of generating a valid customer confirmation merely by possessing the original request QR.

---

## FR-QR-005

Offline transaction envelopes SHOULD use cryptographic integrity/authenticity mechanisms.

The exact signing implementation is TBD and requires a dedicated technical/security specification.

---

## FR-QR-006

Devices participating in trusted offline confirmation MUST have been provisioned online previously.

---

## FR-QR-007

If cryptographic verification fails, the transaction MUST NOT silently become canonical.

The application MUST display an error or synchronization conflict.

---

# 31. Offline Credentials

Trusted offline confirmation creates an additional requirement: devices must possess credentials that can later prove who performed an action.

---

## SEC-OFF-001

Each provisioned device SHOULD have a unique device identity.

---

## SEC-OFF-002

Offline authorization SHOULD rely on cryptographically verifiable device/account credentials.

---

## SEC-OFF-003

Private cryptographic material MUST NOT be stored in ordinary SQLite rows.

---

## SEC-OFF-004

Offline authorization credentials associated with Business membership SHOULD have bounded validity so that a removed Business member cannot operate indefinitely using stale offline permissions.

---

## SEC-OFF-005

A new or recovered device MUST reconnect to the service before receiving trusted offline credentials.

---

# 32. Alternative Offline Modes

The architecture SHOULD remain extensible toward the following future alternatives:

### Mode A — Two-Way QR

**MVP preferred approach.**

Request QR followed by response QR.

### Mode B — Delayed Confirmation

Customer scans request offline and confirms locally.

Merchant continues seeing Pending until synchronization occurs.

### Mode C — Direct Local Communication

Potential future technologies:

- NFC;
- Bluetooth;
- nearby-device APIs.

NFC is NOT required for MVP.

---

# 33. Conflict Handling

Offline operation creates unavoidable concurrency scenarios.

Example:

Customer has RD$1,000 outstanding.

Two different Business devices independently record:

```text
Payment A: RD$700
Payment B: RD$500
```

before either synchronizes.

TuCarton MUST NOT solve these situations by silently deleting acknowledged history.

---

## FR-CONFLICT-001

Financial events that were validly acknowledged MUST remain auditable.

---

## FR-CONFLICT-002

Duplicate operations MUST be deduplicated through operation IDs/idempotency.

---

## FR-CONFLICT-003

True concurrent events MUST be preserved and resolved deterministically.

---

## FR-CONFLICT-004

A balance MAY temporarily or permanently become negative if multiple mutually acknowledged operations legitimately produce that result.

---

## FR-CONFLICT-005

Synchronization conflicts requiring user attention MUST be surfaced rather than hidden.

---

# 34. Device Clock Handling

Offline devices may have incorrect or intentionally modified clocks.

Therefore:

## NFR-TIME-001

`client_created_at` MUST NOT be treated as unquestionable server truth.

---

## NFR-TIME-002

The backend MUST record its own reception timestamps.

---

## NFR-TIME-003

Financial ordering SHOULD use deterministic server-side ordering once events are synchronized.

---

## NFR-TIME-004

Exact expiration semantics for requests confirmed fully offline require a dedicated protocol decision.

For MVP, expiration MUST NOT be considered a high-security anti-fraud mechanism.

---

# 35. Privacy Requirements

## SEC-PRIV-001

Business A MUST NOT discover that a Customer has a relationship with Business B.

---

## SEC-PRIV-002

Business A MUST NOT retrieve:

- total Customer debt across TuCarton;
- Customer balances with other Businesses;
- Customer payment behavior with other Businesses;
- Customer rejection history with other Businesses.

---

## SEC-PRIV-003

A Business API query MUST always enforce Business-level authorization server-side.

Client-side filtering is insufficient.

---

## SEC-PRIV-004

Private transaction links MUST not expose transaction details before authorization.

---

## SEC-PRIV-005

Logs SHOULD avoid unnecessary exposure of:

- phone numbers;
- government identification;
- transaction notes;
- authentication tokens.

---

# 36. Security Requirements

## SEC-001 — Transport Security

Production API communication MUST use HTTPS/TLS.

---

## SEC-002 — Server-Side Authorization

Every protected operation MUST be authorized by the backend.

The backend MUST NOT trust the mobile interface to enforce authorization.

---

## SEC-003 — Input Validation

All API input MUST be validated.

---

## SEC-004 — Rate Limiting

Sensitive endpoints SHOULD implement rate limiting, especially:

- authentication;
- TuCarton Code lookup;
- link resolution;
- transaction creation;
- transaction confirmation.

---

## SEC-005 — Replay Protection

Offline and online operations MUST include unique identifiers to prevent replay from creating duplicate ledger effects.

---

## SEC-006 — Secret Storage

Authentication tokens and private device credentials MUST use secure device storage.

---

## SEC-007 — Auditability

Important security/business events SHOULD have auditable records.

---

## SEC-008 — Least Privilege

Business membership roles MUST grant only appropriate capabilities.

---

# 37. Mobile Application UX

TuCarton SHOULD remain one application rather than separate Store and Customer applications.

---

# 38. Context Switching

A User MAY have:

```text
Personal
Colmado Lewis
Cafetería Ana
```

contexts.

The app SHOULD make the currently active context obvious.

---

## FR-UX-001

A User MUST NOT need multiple accounts simply because they own a Business.

---

## FR-UX-002

Business and personal experiences SHOULD use different navigation/context cues while remaining inside one application.

---

# 39. Customer Experience

The personal/customer experience SHOULD prioritize:

### Home

- total relevant personal debt summary;
- Businesses with outstanding balances;
- pending requests;
- recent activity.

### Business Relationship

For each Business:

- confirmed balance;
- pending amount;
- transaction history.

### Pending Request

Display:

- Business;
- amount;
- currency;
- note;
- type;
- date;
- expiration if applicable;
- Confirm;
- Reject.

### Scan

QR scanning for offline requests.

---

# 40. Business Experience

The Business experience SHOULD prioritize:

### Dashboard

- customers with outstanding balances;
- total Business receivables;
- pending requests;
- recent activity.

### Customers

- saved customer list;
- nickname;
- current balance;
- pending amount.

### Customer Detail

- confirmed balance;
- pending transactions;
- ledger history;
- create Debt Request;
- create Payment Request.

### New Transaction

Input:

- Customer;
- amount;
- optional details.

Actions:

- send in app;
- share link;
- show QR.

---

# 41. QR Scanner UX

## FR-UX-QR-001

The QR scanner MUST display transaction information before confirmation.

---

## FR-UX-QR-002

Scanning a request MUST NOT automatically accept it.

---

## FR-UX-QR-003

The user MUST explicitly choose Confirm or Reject.

---

## FR-UX-QR-004

The interface MUST clearly communicate when a transaction is:

- confirmed locally;
- waiting for synchronization;
- fully synchronized.

---

# 42. Low Connectivity UX

The application MUST avoid assuming constant network connectivity.

---

## NFR-OFF-001

The app SHOULD start and show locally available information without requiring an immediate API request.

---

## NFR-OFF-002

Offline actions SHOULD be clearly marked without making offline mode unnecessarily alarming.

---

## NFR-OFF-003

Users SHOULD NOT need to manually retry every queued operation after connectivity returns.

Automatic synchronization SHOULD occur.

---

## NFR-OFF-004

The application SHOULD minimize network payload sizes.

---

# 43. Localization and Accessibility

## NFR-L10N-001

The initial user experience SHOULD prioritize Spanish.

---

## NFR-L10N-002

User-facing terminology SHOULD be understandable by ordinary Dominican users and avoid unnecessary financial/technical jargon.

---

## NFR-L10N-003

The architecture SHOULD permit future localization.

---

## NFR-A11Y-001

Critical actions MUST NOT rely exclusively on color.

---

## NFR-A11Y-002

Amounts and transaction status SHOULD be visually prominent and readable.

---

## NFR-A11Y-003

Confirmation screens SHOULD minimize accidental approvals.

---

# 44. Platform Requirements

## TECH-MOB-001

The mobile application SHOULD use:

**Expo + React Native + TypeScript**

---

## TECH-MOB-002

The application SHOULD support:

- Android;
- iOS.

Android may receive higher initial testing priority because of the expected target market.

---

## TECH-MOB-003

Expo Router SHOULD be used for application navigation and link-addressable routes.

---

## TECH-MOB-004

SQLite SHOULD be used for durable on-device structured data.

---

## TECH-MOB-005

Sensitive credentials SHOULD use platform-secure key/value storage rather than normal SQLite/application storage.

---

# 45. Backend Architecture

The recommended backend is:

**NestJS + TypeScript**

rather than C#/.NET for the initial implementation.

This is primarily a project/productivity decision rather than a capability limitation of .NET.

---

## TECH-BE-001

The backend SHOULD be implemented initially as a **modular monolith**.

---

## TECH-BE-002

The MVP MUST NOT require microservices.

---

## TECH-BE-003

The backend SHOULD expose a versioned REST API.

Example:

```text
/api/v1/...
```

---

## TECH-BE-004

Business modules SHOULD remain logically separated.

Recommended modules:

```text
AuthModule
UsersModule
DevicesModule
BusinessesModule
MembershipsModule
CustomersModule
LedgerModule
TransactionsModule
SyncModule
NotificationsModule
LinksModule
AuditModule
```

---

## TECH-BE-005

Business rules MUST be enforced inside backend/domain services rather than being duplicated exclusively in controllers.

---

# 46. Database Architecture

The cloud database SHOULD use PostgreSQL.

---

## TECH-DB-001

PostgreSQL is the canonical persistent cloud datastore.

---

## TECH-DB-002

Foreign-key constraints SHOULD protect core relational integrity.

---

## TECH-DB-003

Financial writes SHOULD use database transactions where atomicity is required.

---

## TECH-DB-004

Globally unique IDs SHOULD be used for entities/events where offline creation is possible.

---

# 47. Conceptual Cloud Data Model

The following is a conceptual baseline, not yet the final SQL schema.

---

## 47.1 users

```text
id
TuCarton_code
display_name
status
created_at
updated_at
```

---

## 47.2 user_identities

Future/extensible identity information:

```text
id
user_id
identity_type
normalized_value
verification_status
verified_at
created_at
```

Possible types:

```text
PHONE
CEDULA
PASSPORT
EMAIL
```

Sensitive values may require encryption/hashing depending on usage.

---

## 47.3 businesses

```text
id
name
status
created_by_user_id
created_at
updated_at
archived_at
```

---

## 47.4 business_memberships

```text
id
business_id
user_id
role
status
created_at
accepted_at
removed_at
```

Roles:

```text
OWNER
MEMBER
```

---

## 47.5 business_customers

```text
id
business_id
customer_user_id
nickname
created_by_user_id
created_at
archived_at
```

Unique logical relationship:

```text
business_id + customer_user_id
```

---

## 47.6 ledger_transactions

Conceptually:

```text
id
business_id
customer_user_id

type
status

amount_minor
currency

details

created_by_user_id
created_by_device_id

client_created_at
server_created_at
expires_at

confirmed_at

reversal_of_transaction_id

business_name_snapshot
customer_name_snapshot

created_at
```

Transaction types:

```text
DEBT
PAYMENT
REVERSAL
```

Statuses:

```text
PENDING
CONFIRMED
REJECTED
CANCELED
EXPIRED
```

---

## 47.7 transaction_actions

Append-only action history:

```text
id
transaction_id

action_type
actor_user_id
actor_device_id
actor_context

transport

client_created_at
server_received_at

operation_id
signature_metadata

created_at
```

Possible actions:

```text
CREATED
CONFIRMED
REJECTED
CANCELED
EXPIRED
```

Transport values may include:

```text
IN_APP
LINK
QR
```

---

## 47.8 devices

```text
id
user_id
platform
status
credential_public_metadata
last_seen_at
created_at
revoked_at
```

Private keys MUST NOT be stored on the server as if the server were the device.

---

## 47.9 notifications

```text
id
user_id
type
resource_type
resource_id
read_at
created_at
```

---

## 47.10 share_links

```text
id
transaction_id
token_hash
expires_at
revoked_at
created_at
```

Raw bearer tokens SHOULD NOT need to be stored in plain text.

---

# 48. Transaction Action Audit

The main transaction row MAY maintain its current status for efficient queries.

However, status transitions SHOULD also produce immutable action records.

Example:

```text
Transaction TX-123

Action 1:
CREATED by Merchant

Action 2:
CONFIRMED by Customer
```

This makes the system easier to audit and synchronize without turning every application entity into a full event-sourced model.

TuCarton does **not** require full event sourcing.

---

# 49. API Requirements

Illustrative resource structure:

```text
/auth
/users/me
/users/lookup

/businesses
/businesses/:businessId
/businesses/:businessId/members
/businesses/:businessId/customers

/transactions
/transactions/:transactionId
/transactions/:transactionId/confirm
/transactions/:transactionId/reject
/transactions/:transactionId/cancel
/transactions/:transactionId/reverse

/sync
/notifications
/links/:token
/devices
```

Exact endpoint naming will be defined later.

---

## API-001

Every mutation SHOULD support idempotency when retries are possible.

---

## API-002

The API MUST return machine-readable error codes in addition to user-facing messages.

---

## API-003

Authorization MUST derive from authenticated User and Business membership rather than trusting IDs submitted by clients.

---

## API-004

Server-generated validation errors SHOULD be deterministic enough for mobile clients to handle safely during synchronization.

---

# 50. Recommended Repository Architecture

A monorepo is recommended.

Conceptually:

```text
TuCarton/
├── apps/
│   ├── mobile/
│   └── api/
│
├── packages/
│   ├── domain/
│   ├── validation/
│   ├── api-client/
│   └── config/
│
├── docs/
│   └── specs/
│
├── package.json
└── README.md
```

---

# 51. Shared Packages

## packages/domain

May contain framework-independent definitions such as:

```text
TransactionType
TransactionStatus
BusinessRole
CurrencyCode
SyncStatus
domain constants
```

---

## packages/validation

May contain TypeScript validation schemas that are safe to share.

Business authorization MUST still be enforced by the server.

---

## packages/api-client

Should provide the mobile application with a typed client for the REST API.

This MAY eventually be generated from OpenAPI.

---

# 52. Mobile Internal Architecture

Recommended logical layers:

```text
UI / Screens
      |
      v
Application Services
      |
      +------> Local Repositories
      |
      +------> Sync Engine
      |
      v
Local SQLite
```

Network communication:

```text
Sync Engine
    |
    v
API Client
    |
    v
TuCarton Backend
```

---

## TECH-MOB-006

Screens SHOULD NOT directly implement synchronization algorithms.

---

## TECH-MOB-007

Offline storage SHOULD be accessed through repository/data-access abstractions.

---

## TECH-MOB-008

Sync operations SHOULD be persisted, not held only in memory.

---

# 53. Outbox Pattern

Local mutations requiring server synchronization SHOULD use a persistent outbox.

Conceptual local table:

```text
sync_outbox

id
operation_id
operation_type
payload
status
attempt_count
next_attempt_at
created_at
last_attempt_at
last_error
```

---

## SYNC-OUT-001

Writing a local transaction and its corresponding outbox operation SHOULD occur atomically when possible.

---

## SYNC-OUT-002

A mobile application crash MUST NOT erase queued synchronization operations.

---

## SYNC-OUT-003

Successful server acknowledgment SHOULD mark the corresponding local operation synchronized.

---

# 54. Server Synchronization Contract

The synchronization API SHOULD support batches.

Conceptually:

```text
POST /api/v1/sync

{
  "operations": [...]
}
```

Response:

```text
{
  "accepted": [...],
  "duplicates": [...],
  "conflicts": [...],
  "rejected": [...],
  "serverChanges": [...]
}
```

The exact protocol will be defined in a dedicated synchronization specification.

---

# 55. Idempotency

Idempotency is mandatory for an offline-first ledger.

Example:

A phone submits transaction `OP-ABC`.

Network connection closes before the response arrives.

The phone retries `OP-ABC`.

The backend MUST return the existing result rather than creating another RD$600 debt.

---

# 56. Notifications Architecture

Notifications should have two layers:

## In-App Notification

Persisted backend record.

Reliable within TuCarton once synchronized.

## Push Notification

Best-effort delivery mechanism used to alert the device.

Push MUST NOT become the source of transaction state.

---

# 57. Link Architecture

HTTPS links SHOULD integrate with:

- Android App Links;
- iOS Universal Links.

A route may conceptually resemble:

```text
/r/:token
```

The application opens the corresponding transaction after authentication and authorization.

A lightweight web fallback MAY explain how to install/open TuCarton.

---

# 58. Data Retention

Confirmed financial history SHOULD be retained while required for the ledger to remain coherent.

Deleting a User account creates tension between:

- privacy/deletion expectations;
- immutable ledger history.

Therefore:

## TBD-PRIV-001

Exact account deletion, anonymization, and historical ledger retention behavior requires a dedicated privacy/legal specification before production launch.

---

# 59. Observability

The backend SHOULD provide structured observability for:

- API failures;
- synchronization conflicts;
- duplicate operation attempts;
- authentication failures;
- rejected offline credentials;
- push delivery errors;
- database errors.

---

## NFR-OBS-001

Application logs MUST NOT routinely contain access tokens or private cryptographic keys.

---

## NFR-OBS-002

Every server request SHOULD have a correlation/request ID.

---

## NFR-OBS-003

Synchronization operations SHOULD be traceable by `operation_id`.

---

# 60. Reliability Requirements

## NFR-REL-001

Retrying an operation MUST NOT duplicate a financial effect.

---

## NFR-REL-002

A mobile app crash during synchronization MUST NOT corrupt confirmed ledger history.

---

## NFR-REL-003

Server failures MUST NOT cause successfully persisted local offline operations to disappear.

---

## NFR-REL-004

Database constraints SHOULD prevent invalid relationships even when application bugs occur.

---

# 61. Performance Targets

These are initial engineering targets rather than contractual SLAs.

## NFR-PERF-001

Common cached mobile views SHOULD remain usable without waiting for network requests.

---

## NFR-PERF-002

Transaction creation SHOULD feel immediate locally, including while offline.

---

## NFR-PERF-003

Online API operations SHOULD normally complete fast enough to support interactive mobile UX.

---

## NFR-PERF-004

Customer and transaction lists MUST use pagination or incremental loading when datasets grow.

---

# 62. Scalability

The architecture should initially optimize for correctness and development speed.

A modular monolith with PostgreSQL is expected to handle the initial product scale.

---

## NFR-SCALE-001

The domain MUST NOT rely on a single Business per User.

---

## NFR-SCALE-002

The domain MUST NOT rely on a single device per User.

---

## NFR-SCALE-003

The domain MUST NOT assume one Business Owner.

---

## NFR-SCALE-004

The API SHOULD remain horizontally deployable when required.

---

## NFR-SCALE-005

Microservices SHOULD NOT be introduced without demonstrated operational or scaling need.

---

# 63. Testing Requirements

The project MUST include multiple testing layers.

---

## TEST-001 — Unit Tests

Critical business logic MUST have unit tests.

Especially:

- transaction transitions;
- balance calculation;
- authorization;
- reversals;
- expiration;
- idempotency;
- conflict resolution.

---

## TEST-002 — Integration Tests

Integration tests MUST validate interactions with PostgreSQL for critical ledger operations.

---

## TEST-003 — API Tests

Important endpoints MUST have API-level tests.

---

## TEST-004 — Mobile Tests

Critical mobile workflows SHOULD receive automated tests where practical.

---

## TEST-005 — Offline Sync Tests

Offline synchronization requires explicit test scenarios.

---

# 64. Mandatory Synchronization Test Scenarios

The following scenarios MUST eventually have automated coverage.

### Scenario A

Merchant online, Customer online.

Debt successfully confirmed.

---

### Scenario B

Merchant offline, Customer online.

Transaction eventually synchronizes.

---

### Scenario C

Merchant online, Customer offline.

Transaction eventually synchronizes.

---

### Scenario D

Both offline.

Request QR → Confirmation QR → later synchronization.

---

### Scenario E

The same transaction is submitted twice.

Only one financial effect exists.

---

### Scenario F

Application crashes after saving the transaction but before sync.

Transaction remains queued.

---

### Scenario G

Application crashes during server submission.

Retry does not duplicate transaction.

---

### Scenario H

Customer rejects Debt Request.

Balance remains unchanged.

---

### Scenario I

Merchant cancels Pending Debt Request.

Customer cannot subsequently confirm it once canonical cancellation is known.

---

### Scenario J

Two concurrent Payments synchronize in different orders.

Final ledger contains both valid acknowledged events.

---

### Scenario K

Invalid or forged confirmation QR.

Server rejects canonical confirmation.

---

### Scenario L

Removed Business member attempts to synchronize unauthorized new operations.

Server rejects unauthorized operations according to credential validity rules.

---

# 65. Core Acceptance Scenario

Given:

```text
Customer owes RD$0
```

Business creates:

```text
Debt: RD$60
Details: "1 Coca-Cola + 2 masitas"
```

Before customer confirmation:

```text
Confirmed balance: RD$0
Pending: RD$60
```

Customer confirms.

After confirmation:

```text
Confirmed balance: RD$60
Pending: RD$0
```

Later Customer pays:

```text
RD$20
```

Customer creates Payment Request.

Business confirms.

Result:

```text
Confirmed balance: RD$40
```

Ledger:

```text
+ RD$60   DEBT       CONFIRMED
- RD$20   PAYMENT    CONFIRMED
--------------------------------
  RD$40   BALANCE
```

Neither party may modify the RD$60 or RD$20 historical entries.

---

# 66. Reversal Acceptance Scenario

Existing ledger:

```text
+RD$600  DEBT  CONFIRMED
```

Parties realize the intended amount was RD$60.

The system MUST NOT allow:

```text
UPDATE transaction
SET amount = 60
```

Instead:

```text
+RD$600  DEBT      CONFIRMED
-RD$600  REVERSAL  CONFIRMED
+RD$60   DEBT      CONFIRMED
--------------------------------
 RD$60   BALANCE
```

---

# 67. Privacy Acceptance Scenario

Given:

```text
María -> Colmado A -> RD$2,000
María -> Colmado B -> RD$5,000
```

Colmado A MAY retrieve:

```text
María balance with Colmado A:
RD$2,000
```

Colmado A MUST NOT retrieve:

```text
Debt with Colmado B
RD$5,000
Total TuCarton debt: RD$7,000
Other business relationships
```

---

# 68. Offline Acceptance Scenario

Both devices are offline.

Business creates:

```text
RD$500 Debt Request
```

Business displays request QR.

Customer scans.

Customer sees:

```text
Colmado José

Debt Request
RD$500

"Compra del lunes"
```

Customer confirms.

Customer displays response QR.

Business scans response QR.

Both applications display:

```text
Confirmed offline
Waiting to synchronize
```

After internet becomes available:

```text
Local transaction
       |
       v
Synchronization
       |
       v
Server verification
       |
       v
Canonical CONFIRMED transaction
```

Neither side receives a duplicate financial entry if both devices upload overlapping information.

---

# 69. Abuse Prevention

The system SHOULD anticipate abuse even though TuCarton does not guarantee debt.

Potential abuse includes:

- merchants repeatedly sending false Debt Requests;
- guessing TuCarton Codes;
- forged QR responses;
- replaying transaction messages;
- unauthorized former Business members;
- leaked share links;
- brute-force authentication attempts.

The MVP MUST at minimum provide server-side:

- authorization;
- validation;
- rate limiting for sensitive operations;
- idempotency/replay protection;
- audit logs for critical actions.

Customer blocking/reporting MAY be considered in a later product iteration.

---

# 70. Legal/Product Boundary

TuCarton records representations and acknowledgments made by users.

TuCarton MUST NOT market a confirmed transaction as:

- guaranteed repayment;
- government-certified debt;
- automatic legal judgment;
- TuCarton-issued loan;
- TuCarton-owned receivable.

The legal meaning and enforceability of records require separate legal review.

---

# 71. Technology Baseline

The initial recommended baseline is:

```text
Mobile
────────────────────────
Expo
React Native
TypeScript
Expo Router
SQLite
Secure credential storage

Backend
────────────────────────
NestJS
TypeScript
REST API
OpenAPI
PostgreSQL

Architecture
────────────────────────
Modular monolith
Local-first writes where appropriate
Persistent outbox
Idempotent synchronization
Append-only ledger semantics

Transaction Transport
────────────────────────
In-app request
HTTPS share link
QR

Future
────────────────────────
NFC
Bluetooth/local transport
Stronger identity verification
Payment integrations
Third-party merchant platforms
```

Exact dependency versions MUST be pinned when implementation begins rather than being hard-coded into this product requirements document.

---

# 72. Architecture Decision: NestJS vs C#

Both technologies are technically capable of implementing TuCarton.

For v1, **NestJS is the recommended backend** because:

- the mobile application already uses TypeScript;
- domain types can more easily be shared where appropriate;
- the repository can use one primary programming language;
- NestJS supports clean modular server architecture;
- the expected initial scale does not justify choosing a more operationally complex stack.

This does not prohibit a future .NET implementation.

Architecture correctness depends significantly more on:

- ledger modeling;
- synchronization;
- idempotency;
- authorization;
- offline security

than on the choice between NestJS and ASP.NET Core.

---

# 73. Explicit MVP Scope

## MVP MUST include

### Account

- user registration/authentication;
- display name;
- TuCarton Code;
- authenticated sessions.

### Business

- create Business;
- OWNER role;
- MEMBER role;
- invite members;
- switch contexts.

### Customers

- lookup by TuCarton Code;
- add customer;
- customer nickname;
- auto-save after first confirmed transaction.

### Ledger

- Debt Requests;
- Payment Requests;
- confirm;
- reject;
- cancel while Pending;
- optional `expires_at`;
- reversals/corrections;
- transaction history;
- confirmed balance;
- pending amount.

### Online Delivery

- in-app requests;
- in-app notifications;
- push notifications where supported.

### Sharing

- HTTPS transaction link;
- OS sharing.

### Offline

- persistent SQLite;
- synchronization outbox;
- QR request;
- QR response;
- offline-local confirmation indicator;
- later cloud synchronization.

### Backend

- REST API;
- PostgreSQL;
- authorization;
- validation;
- idempotency;
- auditability.

---

# 74. MVP MAY Defer

The following MAY be deferred if necessary without invalidating the core product:

- Cédula verification;
- passport verification;
- identity-document scanning;
- NFC;
- Bluetooth exchange;
- web transaction confirmation without app;
- direct WhatsApp API integration;
- customer blocking;
- advanced Business permissions;
- advanced analytics;
- exports;
- multiple currencies in the UI;
- external payment processing;
- external accounting integrations.

---

# 75. Implementation TBDs

The following are intentionally unresolved and should receive individual Architecture Decision Records or technical specs.

## TBD-001 — Authentication Provider

Possible phone/OTP provider.

---

## TBD-002 — ORM / Database Toolkit

Examples may include Prisma or another PostgreSQL-compatible TypeScript solution.

---

## TBD-003 — Hosting

Cloud/platform provider.

---

## TBD-004 — Push Provider

Implementation details for push notification delivery.

---

## TBD-005 — Offline Digital Signature Implementation

The exact asymmetric signing/key-management implementation compatible with Expo/React Native requires a security-focused implementation spike.

This MUST be solved before claiming cryptographically authenticated two-device offline confirmations.

---

## TBD-006 — Offline Credential Lifetime

How long device/Business authorization credentials remain valid without contacting the server.

---

## TBD-007 — Request Expiration Defaults

`expires_at` exists, but default expiration policy is not yet fixed.

`NULL` explicitly means no automatic expiration.

---

## TBD-008 — Account Deletion and Ledger Retention

Requires privacy/legal analysis.

---

## TBD-009 — Business Archival Rules

Detailed post-archive UX.

---

## TBD-010 — Negative Balance UX

Ledger permits negative balances, but final customer-facing terminology must be selected.

---

# 76. Architecture Risks

## RISK-001 — Offline Security

**Risk:** A simplistic QR implementation could permit forged acknowledgment.

**Mitigation:** Device provisioning, cryptographic signatures, replay protection, server validation.

---

## RISK-002 — Complex Synchronization

**Risk:** Offline events may arrive multiple times or in different orders.

**Mitigation:** Globally unique operation IDs, persistent outbox, idempotent server operations, deterministic reconciliation.

---

## RISK-003 — User Confusion

**Risk:** Users may confuse pending amounts with actual debt.

**Mitigation:** Strict UX separation between confirmed balance and pending requests.

---

## RISK-004 — Identity Abuse

**Risk:** Weak identity verification may allow impersonation.

**Mitigation:** Begin with lightweight verification but design identity system for stronger verification later.

---

## RISK-005 — Business Member Revocation

**Risk:** Removed member possesses previously provisioned offline permissions.

**Mitigation:** Expiring authorization credentials and server-side validation.

---

## RISK-006 — Scope Creep

**Risk:** TuCarton evolves prematurely into POS/accounting/credit-scoring software.

**Mitigation:** Explicit non-goals and narrow MVP.

---

# 77. Recommended Development Phases

## Phase 0 — Foundation

Implement:

- monorepo;
- API;
- PostgreSQL;
- mobile application shell;
- authentication;
- shared domain types;
- environments;
- CI.

---

## Phase 1 — Online Ledger

Implement:

- Users;
- Businesses;
- membership;
- customers;
- Debt Transactions;
- Payment Transactions;
- statuses;
- balances;
- transaction history;
- reversals.

At the end of Phase 1, TuCarton should function correctly while online.

---

## Phase 2 — Async Delivery

Implement:

- in-app notifications;
- push notifications;
- share links;
- deep/app links.

---

## Phase 3 — Local Persistence

Implement:

- SQLite;
- offline reads;
- outbox;
- sync engine;
- idempotency.

---

## Phase 4 — Offline QR

Implement:

- QR request envelope;
- QR scanner;
- customer response;
- return QR;
- device credentials;
- signatures;
- replay protection;
- conflict handling.

---

## Phase 5 — Production Hardening

Implement:

- security review;
- privacy review;
- observability;
- rate limiting;
- recovery flows;
- performance tuning;
- release pipeline;
- production monitoring.

---

# 78. Recommended Specification Split for Codex

This document should eventually be decomposed into smaller authoritative files.

Recommended structure:

```text
docs/
└── specs/
    ├── 00-product-overview.md
    ├── 01-domain-glossary.md
    ├── 02-business-rules.md
    ├── 03-users-and-auth.md
    ├── 04-businesses-and-memberships.md
    ├── 05-customer-relationships.md
    ├── 06-ledger.md
    ├── 07-transaction-state-machine.md
    ├── 08-balances-and-reversals.md
    ├── 09-online-requests.md
    ├── 10-links-and-notifications.md
    ├── 11-offline-architecture.md
    ├── 12-qr-protocol.md
    ├── 13-sync-protocol.md
    ├── 14-security.md
    ├── 15-privacy.md
    ├── 16-mobile-architecture.md
    ├── 17-backend-architecture.md
    ├── 18-database-schema.md
    ├── 19-rest-api.md
    ├── 20-error-codes.md
    ├── 21-testing-strategy.md
    ├── 22-observability.md
    ├── 23-deployment.md
    ├── 24-acceptance-tests.md
    └── 25-roadmap.md
```

Additionally:

```text
docs/
└── adr/
    ├── ADR-001-nestjs-backend.md
    ├── ADR-002-postgresql.md
    ├── ADR-003-single-mobile-app.md
    ├── ADR-004-immutable-ledger.md
    ├── ADR-005-offline-first.md
    ├── ADR-006-two-way-qr.md
    └── ADR-007-device-signatures.md
```

---

# 79. Codex Implementation Rule

When this specification is used by an AI coding agent:

1. The agent MUST NOT invent new business behavior when requirements exist.
2. Business rules MUST be traced to requirement IDs.
3. Ambiguous implementation details SHOULD be captured in an ADR.
4. Database migrations MUST preserve ledger history.
5. Tests SHOULD reference relevant requirement IDs.
6. Security requirements MUST NOT be bypassed simply to make tests pass.
7. Offline synchronization MUST be implemented incrementally rather than mixed into basic CRUD from the beginning.
8. Generated code MUST treat server authorization as authoritative.
9. Confirmed ledger entries MUST never receive ordinary update/delete endpoints.
10. Implementation SHOULD favor simple architecture unless scale demonstrates a need for additional infrastructure.

---

# 80. Definition of MVP Success

TuCarton's MVP is successful when the following story works reliably:

> A colmado owner creates a TuCarton Business, adds a known customer, records an RD$500 debt, and sends the request to the customer. The customer sees exactly what is being requested and explicitly confirms it. Both applications show the same RD$500 confirmed balance. Later, the customer pays RD$200, both parties acknowledge the payment, and both applications show RD$300 outstanding. Neither party can silently rewrite either transaction. The same essential transaction process can also occur face-to-face without internet by exchanging QR codes, with synchronization occurring when connectivity returns.

If TuCarton reliably accomplishes this while remaining easy to understand, the core product has achieved its purpose.

---

# 81. Final Product Boundary

The fundamental TuCarton invariant is:

> **No confirmed financial balance exists independently from an auditable set of mutually acknowledged ledger transactions.**

Everything else should be designed around preserving that invariant.
