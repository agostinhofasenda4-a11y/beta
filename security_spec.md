# Security Specification - MODA Rewards

## Data Invariants
1. A user can only read their own profile.
2. A user can only create a deposit request for themselves.
3. A user can only create a withdrawal request for themselves.
4. Users cannot modify their own balance directly via client SDK.
5. Users cannot approve their own deposits.
6. `TaskHistory` must be created with a valid user ID matching the authenticated user.
7. `balance` can only be updated by a cloud function (simulated here with strict rules or server-side logic, but we'll try to stick to rules) or restricted triggers. In a pure client-side setup without functions, we have to allow increments but we must be extremely careful. However, the instructions say "The value maximum of 1MB...".
8. For "Ganhos", we will enforce that the `reward` matches the VIP level's `perTask` and the daily limit isn't exceeded (though Firestore rules have limited lookups for N-tasks per day).

## The Dirty Dozen Payloads (Rejection Targets)

1. **Identity Theft (Profile)**: Attempt to read `users/attacker_uid` from a different account.
2. **Balance Injection**: `update doc users/my_uid { balance: 999999 }`.
3. **Privilege Escalation**: `update doc users/my_uid { ownedVips: ["vip6"] }`.
4. **Self-Approval**: `create doc deposits/doc1 { userId: "my_uid", status: "approved" }`.
5. **Ghost Deposit**: `create doc deposits/doc1 { userId: "other_uid", amount: 100 }`.
6. **Withdrawal Spoofing**: `create doc withdrawals/doc1 { userId: "other_uid", amount: 90 }`.
7. **Task History Forgery**: `create doc task_history/doc1 { userId: "other_uid", reward: 9999 }`.
8. **Negative Withdrawal**: `create doc withdrawals/doc1 { amount: -1000 }`.
9. **Spam Deposits**: `create doc deposits/doc1 { ...long_junk_string... }`.
10. **Email/Phone Spoofing**: Changing `phoneNumber` in `User` doc to an admin's phone.
11. **Future Dating**: `create doc task_history/doc1 { completedAt: "2099-01-01" }`.
12. **Double Spending**: Attempt multiple withdrawal requests that sum to more than the balance. (Requires atomic check or server logic).

## Firestore Test Plan
We will use a simulated `firestore.rules.test.ts` to verify these. (Actually I will generate the rules and then lint them).
