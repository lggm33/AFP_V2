# Transaction System Requirements

## Document Purpose

This document defines the comprehensive requirements for the transaction system in AFP Finance App.
It serves as the foundation for database design and business logic implementation.

---

## Table of Contents

1. [Core Actions by Account Type](#core-actions-by-account-type)
2. [Edge Cases](#edge-cases)
3. [Transaction Data Requirements](#transaction-data-requirements)
4. [System Decisions](#system-decisions)
5. [Business Rules](#business-rules)

---

## Core Actions by Account Type

### Credit Card Actions

#### Normal Operations

1. **Purchase/Charge** - Regular spending at merchants
2. **Full Payment** - Pay complete card balance
3. **Partial Payment** - Pay portion of balance
4. **Minimum Payment** - Pay only required minimum
5. **Overpayment** - Pay more than owed (creates credit balance)
6. **Refund/Return** - Money returned from purchase
7. **Merchant Adjustment** - Merchant adjusts amount post-transaction
8. **Cash Advance** - Withdraw cash from credit card
9. **Annual Fee** - Card maintenance charge
10. **Interest Charges** - For unpaid balances

#### Credit Card Edge Cases

- **Pending charge** - Transaction made but not yet posted to statement
- **Pre-authorization** - Hotel/gas station reserves amount, adjusts later
- **Foreign currency charge** - Exchange rate determined days later
- **Charge cancellation** - Transaction cancelled after appearing
- **Duplicate charges** - Merchant error charging twice
- **Installment payments (MSI)** - Single purchase split into N payments
- **Cancelled purchase on statement** - Appears as credit next month
- **Rejected payment** - Payment attempt fails due to insufficient funds
- **Promotion/Cashback** - Percentage of purchase returned
- **Points converted to credit** - Rewards converted to balance
- **Cancelled recurring charge** - Subscription charged before cancellation
- **Chargeback/Dispute** - Fraudulent charge reported
- **Exchange rate adjustment** - Difference between estimated and final rate
- **Delivery service charge** - Tips added after initial purchase
- **Authorized overlimit** - Spending above limit with temporary authorization
- **Balance transfer** - Moving debt from one card to another
- **Early payment** - Payment before statement closing date
- **Late payment** - Payment after due date (generates interest/fees)
- **Credit limit change** - Increase/decrease in spending capacity

### Debit Card Actions

#### Normal Operations

1. **Purchase** - Direct spending from account
2. **ATM Withdrawal** - Cash withdrawal
3. **ATM Deposit** - Cash deposit
4. **Refund** - Money returned from purchase
5. **ATM Fee** - Charge for using another bank's ATM
6. **Transaction Fee** - Some banks charge per transaction

#### Debit Card Edge Cases

- **Pending charge** - Immediately blocks funds
- **Gas station pre-authorization** - Blocks $100 but only uses $50
- **Purchase without sufficient funds** - Some banks temporarily allow
- **Accidental overdraft** - Spending more than available, generates fee
- **Partial refund** - Only portion of money returned
- **Foreign currency charge with fee** - Purchase + international fee
- **Hotel/rental car hold** - Funds blocked for days
- **Hold release** - Block released without charge
- **Insufficient funds rejection** - Failed transaction attempt
- **Scheduled automatic payment without funds** - Subscription fails to charge

### Bank Account Actions (Checking/Savings)

#### Normal Operations

1. **Outgoing Transfer (SPEI/Wire/ACH)** - Send money to another account
2. **Incoming Transfer** - Receive money
3. **Cash Deposit** - Physical money deposit
4. **Check Deposit** - Deposit check
5. **Branch Withdrawal** - Cash withdrawal at branch
6. **Service Payment** - Utilities, internet, etc.
7. **Credit Card Payment** - From account to own credit card
8. **Salary/Payroll** - Income from employment
9. **Account Maintenance Fee** - Monthly bank charge
10. **Interest Earned** - From average balance (savings)
11. **Direct Debit/Auto Payment** - Service automatically charges
12. **Transfer Between Own Accounts** - Same bank or interbank

#### Bank Account Edge Cases

- **Bounced check** - Deposited check rejected for insufficient funds
- **Transfer reversal** - Transaction cancelled/reversed
- **Pending transfer** - Sent but not arrived yet (weekends)
- **Scheduled transfer** - Scheduled for future date
- **Cancelled transfer** - Cancelled before execution
- **Overdraft fee** - Charge for spending more than available
- **Overdraft protection** - Automatically covered from another account
- **Funds hold** - Bank freezes money for investigation
- **Bank adjustment** - Errors corrected by bank
- **Fee refund** - Bank returns charged fee
- **Tax withholding (ISR)** - Taxes on interest
- **Deposit pending verification** - Check takes time to clear
- **International transfer** - With exchange rate and fees
- **Rejected direct debit** - User rejects automatic charge
- **Tax refund** - Government returns money
- **Loan payment** - Credit amortization
- **External credit card payment** - To another bank's card (possible fee)
- **Transfer with reference/message** - To identify payment
- **Split transfer** - Single payment covering multiple concepts
- **Investment returns** - If account has investment features

---

## Edge Cases

### Timing and State

1. **Pending transaction** - Made but not reflected
2. **Processing transaction** - In approval process
3. **Completed transaction** - Finalized
4. **Failed transaction** - Rejected
5. **Reversed transaction** - Cancelled after completion
6. **Duplicate transaction** - Error creating 2 identical transactions
7. **Scheduled/Future transaction** - Not yet occurred
8. **Recurring transaction** - Automatically repeats

### Amounts and Adjustments

9. **Tip added later** - Restaurant authorizes $100, with tip becomes $120
10. **Quantity adjustment** - Uber estimates $50 but ride costs $45
11. **Taxes calculated later** - International purchases, taxes arrive weeks later
12. **Exchange rate difference** - Already mentioned but critical
13. **Discount applied later** - Promotion applies days after
14. **Partial amount** - Purchase of $100 but only $80 authorized

### Multiple Entities

15. **Transfer between own accounts** - Not real income or expense
16. **Own credit card payment** - Moves money but not expense
17. **Loan between own accounts** - Move money temporarily
18. **Investment from account** - Money out but not expense
19. **Investment withdrawal** - Money returns but not income

### Difficult Categorization

20. **Work expense reimbursement** - Spent but will be returned
21. **Shared expenses** - Paid $100 but owed $50
22. **Personal debt payment** - Lending to friend
23. **Personal debt collection** - Friend pays back
24. **Mixed purchases** - 1 transaction with multiple categories (supermarket: food + cleaning)
25. **Reimbursable medical expenses** - Insurance will reimburse later

### Fraud and Errors

26. **Fraudulent charge** - Theft/unauthorized use
27. **Merchant error charge** - Merchant overcharged
28. **Phantom charge** - Appears and disappears on its own
29. **Test charge** - $1 verification that reverses
30. **Authorization without charge** - Card verified but not charged

### Regional Special Cases (Mexico/LATAM)

31. **CoDi** - Digital collections in Mexico
32. **Shared ATM with fee** - Using another network's ATM
33. **Interbank transfer fee** - SPEI has cost at some banks
34. **Third-party cash deposit** - Someone else deposits to your account
35. **Reference at OXXO/convenience store** - Pay with capture line

### Subscriptions and Recurring

36. **Subscription initiated** - First charge
37. **Subscription renewed** - Monthly/annual charge
38. **Subscription cancelled** - No longer charged
39. **Prorated subscription** - Cancel mid-month, proportional refund
40. **Free trial charges later** - 30-day free but forgot to cancel
41. **Subscription price change** - Netflix raises price
42. **Subscription paused** - Pay less or don't pay temporarily

### Taxes and Regulations

43. **ISR withholding** - On bank interest
44. **Itemized IVA** - Invoice where taxes need separation
45. **IVA refund** - If business recovers VAT
46. **Cash deposit tax (IDE)** - Mexico tax on large cash deposits

### Investments and Savings

47. **Automatic savings** - Money moved to savings automatically
48. **Purchase roundup** - Spend $10.50, rounds to $11, $0.50 saved
49. **Cashback deposited** - Reward money arrives to account
50. **Dividends** - From stocks or investments

---

## Transaction Data Requirements

### 1. Unique Identification

**Purpose:** Detect duplicates and reconcile across sources

```typescript
{
  id: string;                          // Internal UUID
  externalTransactionId?: string;      // Bank/card provided ID
  sourceReference: string;             // Email ID, SMS ID, etc.
  authorizationCode?: string;          // Card authorization code
  folioNumber?: string;                // Transaction folio from email
  merchantTransactionId?: string;      // Merchant's transaction ID
}
```

**Why:** Need to identify when different emails/notifications reference the same transaction

### 2. Amount Details

**Purpose:** Track all money amounts and their changes

```typescript
{
  originalAmount?: number;             // First amount seen
  currentAmount: number;               // Current/final amount
  authorizedAmount?: number;           // Initially authorized
  settledAmount?: number;              // Actually charged
  originalCurrency: string;            // Merchant's currency
  localCurrency: string;               // Account currency
  exchangeRate?: number;               // If currency conversion
  exchangeRateDate?: Date;             // When rate was determined
  fees?: number;                       // Separate fees
  tips?: number;                       // Separate tips
  tax?: number;                        // Itemized tax
  totalAmount: number;                 // All inclusive
}
```

**Why:** Hotel authorizes $1000, spend $850, charged $850 + $100 tip = $950. Need all these numbers.

### 3. Temporal Data

**Purpose:** Understand timeline and transaction state

```typescript
{
  transactionDate: Date;               // Date stated in email/notification
  authorizationDate?: Date;            // When authorized
  postingDate?: Date;                  // When reflected in statement
  settlementDate?: Date;               // When actually processed
  valueDate?: Date;                    // Date for interest calculation
  notificationReceivedAt: Date;        // When we received notification
  createdAt: Date;                     // When record created
  updatedAt: Date;                     // Last update
  timezone?: string;                   // Transaction timezone
}
```

**Why:** Purchase in Japan Jan 1 at 11pm = Dec 31 in Mexico. Email arrives 2 days later. Charge
posts 5 days later.

### 4. Merchant/Vendor Data

**Purpose:** Categorize and understand where money was spent

```typescript
{
  rawMerchantName: string;             // Exactly as in email
  cleanedMerchantName?: string;        // After cleaning/normalization
  merchantCategoryCode?: string;       // MCC if provided
  merchantLocation?: string;           // City/country if available
  merchantAddress?: string;            // Full address if available
  merchantWebsite?: string;            // If can be inferred
  merchantPhone?: string;              // If in email
}
```

**Why:** "AMZN Mktp US\*2X4BC3" vs "Amazon.com" vs "Amazon Prime" - need raw text to clean and
normalize later.

### 5. Source Data (Email/Notification)

**Purpose:** Complete context of where transaction came from

```typescript
{
  sourceType: 'email' | 'sms' | 'push' | 'manual' | 'api';
  sourceEmailId?: string;              // Gmail message ID (to retrieve via API)
  sourceEmailSubject?: string;         // Email subject line
  sourceEmailFrom?: string;            // Sender email
  sourceEmailDate?: Date;              // Email sent date
  extractedData?: Record<string, any>; // Parsed data from email
  parsingConfidence?: number;          // Confidence in parsing (0-1)
  parsingMethod?: string;              // Method used: regex, LLM, manual
}
```

**Why:** If initial analysis is wrong, can retrieve original email and re-process with improved
logic.

**Decision:** Store only parsed data + email ID. Full email can be retrieved via email API when
needed.

### 6. Payment Method Information

**Purpose:** Track which account/card was used

```typescript
{
  paymentMethodId?: string;            // Internal ID (once matched)
  accountLastDigits?: string;          // Last 4 digits mentioned in email
  accountTypeMentioned?: string;       // What email says: "card", "account"
  institutionName?: string;            // Bank/issuer name from email
}
```

**Why:** Email says "your card \*1234" - need to match with which of your cards.

### 7. Classification (Inferred)

**Purpose:** Best guess of what this transaction is

```typescript
{
  rawTransactionType?: string;         // What email says: "purchase", "charge", "credit"
  inferredTransactionType?: 'income' | 'expense' | 'transfer';
  inferredSubtype?: string;            // purchase, payment, refund, fee, etc.
  classificationConfidence: number;    // 0-1, confidence level
  classificationReason?: string;       // Why this classification
  requiresReview: boolean;             // Flag if needs human review
}
```

**Why:** Need to know how reliable automatic classification is.

**Decision:** Store only the most probable interpretation with confidence score.

### 8. State and Flow

**Purpose:** Track transaction lifecycle

```typescript
{
  status: 'pending' | 'authorized' | 'posted' | 'completed' | 'reversed' | 'failed';
  previousStatus?: string;             // Previous state
  statusChangedAt?: Date;              // When status changed
  isPending: boolean;                  // Quick check flag
  isRecurring: boolean;                // Is recurring charge
  recurringFrequency?: string;         // If applicable
}
```

**Why:** Email 1: "Pending charge $100". Email 2: "Charge posted $95". Same transaction, changed
state.

### 9. Relations to Other Transactions

**Purpose:** Link related transactions

```typescript
{
  parentTransactionId?: string;        // If part of another transaction
  relatedTransactionIds?: string[];    // Array of related transaction IDs
  installmentNumber?: number;          // If MSI: 3 of 12
  installmentTotal?: number;           // Total installments
  reversalOfTransactionId?: string;    // If reversal of another
  adjustmentOfTransactionId?: string;  // If adjustment of another
}
```

**Why:** MSI purchase generates 1 initial charge + 11 future charges. Need to know they're related.

### 10. Balance Tracking

**Purpose:** Maintain consistent balances

```typescript
{
  balanceBefore?: number;              // Balance before this transaction
  balanceAfter?: number;               // Balance after
  availableBalanceImpact?: number;     // How it affects available balance
  statementBalanceImpact?: number;     // How it affects statement balance
}
```

**Why:** To reconcile and detect inconsistencies.

**Decision:** Calculate on read, not stored. Allows recalculation if logic changes.

### 11. Metadata and Free Context

**Purpose:** Everything else that doesn't fit structured fields

```typescript
{
  description: string;                 // Generated/cleaned description
  rawDescription?: string;             // Original description from email
  notes?: string;                      // User or system notes
  tags?: string[];                     // Array of tags
  metadata: {                          // JSONB for everything else
    emailParsing?: {
      confidence: number;
      fieldsFound: string[];
      fieldsMissing: string[];
      ambiguities: string[];
    };
    merchantDetails?: {
      detectedBrand?: string;
      detectedService?: string;
      suspectedCategory?: string;
    };
    anomalies?: string[];
    context?: {
      isInternational?: boolean;
      locationDetected?: string;
      timeOfDay?: string;
    };
    [key: string]: any;                // Flexible for future needs
  };
}
```

**Why:** Can't predict what future information will be needed. Flexible JSONB saves the day.

### 12. Machine Learning Features

**Purpose:** Features for training models

```typescript
{
  dayOfWeek: number;                   // 0-6
  dayOfMonth: number;                  // 1-31
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  isWeekend: boolean;
  isHoliday?: boolean;
  distanceFromHome?: number;           // If geolocation available
  isUsualMerchant?: boolean;           // Frequent merchant
  amountVsAverage?: number;            // Compared to user average
  timeSinceLastTransaction?: number;   // In minutes
}
```

**Why:** For fraud detection, pattern recognition, automatic categorization.

**Decision:** Calculate on read when needed for ML, don't store.

### 13. Audit Data

**Purpose:** Debugging and compliance

```typescript
{
  createdBy: string;                   // user_id, system, email-service
  updatedBy?: string;
  verificationStatus: 'unverified' | 'auto-verified' | 'user-verified' | 'disputed';
  verifiedAt?: Date;
  verifiedBy?: string;
  disputeStatus?: string;
  disputeReason?: string;
  version: number;                     // Record version number
  changeHistory: Array<{               // History of changes
    changedAt: Date;
    changedBy: string;
    changes: Record<string, any>;
    reason?: string;
  }>;
}
```

**Why:** Need to answer "who changed this and why?"

**Decision:** Store change history in JSONB array within the transaction record.

### 14. Reconciliation Data

**Purpose:** Match with bank statements

```typescript
{
  reconciled: boolean;
  reconciledAt?: Date;
  reconciledWithSource?: string;       // statement_id if available
  reconciliationConfidence?: number;
  differencesFound?: string[];         // If discrepancies exist
}
```

**Why:** Email says $100, statement says $102, need to record that difference.

---

## System Decisions

### Decision 1: Email Storage

**Question:** Store full email or only parsed data?

**Decision:** Store only parsed data + email ID (source_email_id)

**Rationale:**

- Can retrieve full email via Gmail API when needed
- More storage efficient
- Keeps sensitive data in original secure location
- Still maintains ability to re-process with improved logic

### Decision 2: Transaction Versions

**Question:** Create new records for each version or maintain change history?

**Decision:** Maintain change history in JSONB field

**Rationale:**

- Single source of truth (one record per transaction)
- Easier queries (don't need to filter latest version)
- Complete audit trail in `changeHistory` array
- Can reconstruct transaction state at any point in time

### Decision 3: Data Normalization

**Question:** Normalize on write or on read?

**Decision:** Normalize on read

**Rationale:**

- Store raw data as received
- Preserve original information
- Can improve normalization logic without losing data
- Historical data automatically benefits from improved algorithms
- Example: Store "AMZN Mktp US\*2X4BC3" raw, clean to "Amazon" when reading

### Decision 4: Uncertainty Handling

**Question:** Store multiple interpretations or only most probable?

**Decision:** Store only most probable with confidence score

**Rationale:**

- Simpler data model
- Can flag low-confidence transactions for review (`requiresReview` flag)
- Confidence score indicates reliability
- Alternative interpretations can be recalculated on demand
- If confidence < threshold, require human verification

---

## Business Rules

### Rule 1: Transaction Uniqueness

- Transactions are unique per (sourceReference, externalTransactionId, transactionDate, amount,
  paymentMethodId)
- Duplicate detection must check across all these fields
- Email-service should check for duplicates before creating transactions

### Rule 2: Status Transitions

Valid status transitions:

- `pending` → `authorized` → `posted` → `completed`
- `pending` → `failed`
- `authorized` → `reversed`
- `completed` → `reversed` (rare, but possible)

Any status can move to `under_review` for manual verification.

### Rule 3: Balance Calculations

- Balances are calculated, not stored
- Current balance = sum of all completed transactions
- Available balance considers pending transactions
- For credit cards: available = credit_limit - (posted + pending)
- For bank accounts: available = current_balance - pending_debits

### Rule 4: Internal Transfers

Transfers between user's own accounts must:

- Create 2 linked transactions (one debit, one credit)
- Link via `relatedTransactionIds`
- NOT count toward income/expense totals
- Maintain zero-sum balance (amount out = amount in, minus fees)

### Rule 5: Credit Card Payments

Credit card payments must:

- Create transaction on credit card (increases available credit)
- Create transaction on bank account (decreases balance)
- Link both via `relatedTransactionIds`
- Type: `transfer` with subtype `credit_card_payment`

### Rule 6: Installments (MSI)

Installment purchases must:

- Create parent transaction with full amount
- Create N child transactions (one per installment)
- Each child references parent via `parentTransactionId`
- Each child has `installmentNumber` and `installmentTotal`
- Only children affect monthly spending totals

### Rule 7: Refunds and Reversals

- Refunds reference original transaction via `reversalOfTransactionId`
- Partial refunds create new transaction with partial amount
- Full reversals may update original transaction status
- Refunds don't delete original transaction (audit trail)

### Rule 8: Foreign Currency

- Always store both original and local currency amounts
- Store exchange rate and date rate was applied
- Display amounts in user's preferred currency
- Allow drill-down to see original currency

### Rule 9: Confidence Thresholds

- confidence >= 0.9: Auto-verify
- confidence 0.7-0.89: Auto-create but flag for review
- confidence < 0.7: Hold for manual verification
- User verification always overrides automatic classification

### Rule 10: Data Immutability

- Original parsed data is immutable (stored in changeHistory)
- Changes create new entry in changeHistory array
- version number increments on each change
- Can rollback to previous version if needed

### Rule 11: Soft Deletes

- Transactions are never hard-deleted
- Use `deletedAt` timestamp for soft delete
- Deleted transactions excluded from balance calculations
- Maintain in database for audit purposes

### Rule 12: Reconciliation

- Unreconciled transactions older than 7 days trigger alert
- User can mark as reconciled manually
- Auto-reconcile when matching bank statement found
- Store differences between email and statement

---

## Next Steps

1. **Database Schema Design** - Design tables based on these requirements
2. **API Endpoints** - Define REST/GraphQL endpoints for CRUD operations
3. **Email Parsing Logic** - Implement parsing strategies for different banks
4. **Classification Algorithm** - Build ML model for transaction categorization
5. **Reconciliation Engine** - Build matching algorithm for bank statements
6. **Balance Calculation Service** - Implement balance calculation logic
7. **Duplicate Detection** - Build fuzzy matching for duplicate detection

---

## Document Version History

| Version | Date       | Author | Changes                                     |
| ------- | ---------- | ------ | ------------------------------------------- |
| 1.0     | 2025-10-07 | System | Initial comprehensive requirements document |
