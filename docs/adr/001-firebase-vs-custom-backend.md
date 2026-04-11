# ADR 001: Firebase vs Custom Backend

## Status
**Accepted** - Firebase is the primary backend

## Context
Choosing between Firebase (Firestore, Auth, Functions) vs building a custom Node.js/Go backend

## Decision
Use **Firebase** as the primary backend because:
1. Rapid development - No need to write backend from scratch
2. Reduced DevOps overhead - Managed by Google
3. Real-time capabilities - Firestore subscriptions perfect for live updates
4. Scalability - Handles enterprise scale
5. Built-in Auth - Custom claims for role-based access
6. Cost - Pay only for what you use
7. FCM integration - Push notifications out of the box

## Consequences

### Positive
- Faster time-to-market
- Reduced infrastructure costs
- Proven security model
- Good for MVPs and startups

### Negative
- Vendor lock-in with Google
- Limited query flexibility (NoSQL)
- Can become expensive at scale
- Limited control over data storage location

## Alternatives Considered
1. **Custom Node.js + PostgreSQL** - More control but slower development
2. **AWS AppSync** - More expensive, similar trade-offs
3. **Supabase** - Less mature ecosystem for our use case

## Migration Path
If we need to migrate in future:
- Firebase exports to JSON
- Can write data pipeline to custom backend
- Estimated effort: 2-4 weeks

---

## Implementation Notes

### Database Model
- Use Firestore for realtime (orders, assignments)
- Avoid complex transactions
- Denormalize data strategically
- Use subcollections for related data

### Cloud Functions
- Keep functions small and focused
- Use TypeScript for type safety
- Implement proper error handling
- Monitor costs (very cheap for low volume)

### Security
- Firestore rules as first line of defense
- Custom claims in tokens for roles
- Never trust client-side data
- Regular security audits

---

**Decision Date**: 2024  
**Last Reviewed**: 2024  
**Related Issues**: -
