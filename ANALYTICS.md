# Analytics

## Shape

`lib/analytics/events.ts` declares every event and its exact payload. `track()` is
typed against that map, so a misspelled event name or a missing property is a compile
error rather than a funnel that turns out to be empty three weeks later.

```ts
track('vehicle_view', { vehicle_id, make, model, year, price });
```

Providers are registered at runtime through `registerProvider()`. Nothing in the app
imports a vendor SDK directly, so swapping analytics platforms touches one file.

## What never leaves the browser

`FORBIDDEN_KEYS` is enforced at runtime in `track()`: any property whose name contains
`email`, `phone`, `full_name`, `name`, `address`, `card`, `cvv`, `password`, `token`,
or `provider_reference` is dropped before any provider sees it, and a warning is
logged outside production.

The type system already prevents this. The runtime filter exists because the type
system stops at the compile boundary and a payload can be assembled dynamically. Both
layers are tested in `src/lib/analytics/__tests__`.

Amounts _are_ sent. A listing price is public information; a phone number is not.

## The events

Discovery — `search`, `filter_used`, `vehicle_view`, `compare_vehicle`, `favorite_vehicle`, `content_view`
Leads — `inquiry_created`, `test_drive_started`, `test_drive_submitted`, `dealer_contact`, `whatsapp_click`, `phone_click`
Supply — `seller_listing_started`, `seller_listing_submitted`
Transaction — `checkout_started`, `payment_started`, `payment_completed`, `payment_failed`

`payment_completed` fires only when the backend reports `PAID`. It is not fired on the
return redirect from the payment provider, because that redirect is not evidence.

## Adding an event

1. Add it to `AnalyticsEvents` with its payload type.
2. Check no property could carry personal data.
3. Call `track()` from the component where the action happens.

Not the other way round. If it is not in the map, it cannot be sent.
