import { relations } from "drizzle-orm"

import { user } from "./schema/auth"
import {
  contactSubject,
  galleryImage,
  homeContent,
  homeFeature,
  homeReview,
  homeService,
  siteContent,
} from "./schema/content"
import {
  eventFormField,
  eventPackageLine,
  eventStep,
  eventType,
  eventTypeContent,
  eventUpgrade,
} from "./schema/events"
import { location, locationMember } from "./schema/locations"
import { menuCategory, menuContent, menuItem } from "./schema/menu"

export const locationRelations = relations(location, ({ one, many }) => ({
  home: one(homeContent),
  site: one(siteContent),
  menu: one(menuContent),
  features: many(homeFeature),
  services: many(homeService),
  reviews: many(homeReview),
  galleryImages: many(galleryImage),
  contactSubjects: many(contactSubject),
  menuCategories: many(menuCategory),
  eventTypes: many(eventType),
  members: many(locationMember),
}))

export const homeContentRelations = relations(homeContent, ({ one }) => ({
  location: one(location, {
    fields: [homeContent.locationId],
    references: [location.id],
  }),
}))

export const siteContentRelations = relations(siteContent, ({ one }) => ({
  location: one(location, {
    fields: [siteContent.locationId],
    references: [location.id],
  }),
}))

export const homeFeatureRelations = relations(homeFeature, ({ one }) => ({
  location: one(location, {
    fields: [homeFeature.locationId],
    references: [location.id],
  }),
}))

export const homeServiceRelations = relations(homeService, ({ one }) => ({
  location: one(location, {
    fields: [homeService.locationId],
    references: [location.id],
  }),
}))

export const homeReviewRelations = relations(homeReview, ({ one }) => ({
  location: one(location, {
    fields: [homeReview.locationId],
    references: [location.id],
  }),
}))

export const galleryImageRelations = relations(galleryImage, ({ one }) => ({
  location: one(location, {
    fields: [galleryImage.locationId],
    references: [location.id],
  }),
}))

export const contactSubjectRelations = relations(contactSubject, ({ one }) => ({
  location: one(location, {
    fields: [contactSubject.locationId],
    references: [location.id],
  }),
}))

export const menuContentRelations = relations(menuContent, ({ one }) => ({
  location: one(location, {
    fields: [menuContent.locationId],
    references: [location.id],
  }),
}))

export const menuCategoryRelations = relations(
  menuCategory,
  ({ one, many }) => ({
    location: one(location, {
      fields: [menuCategory.locationId],
      references: [location.id],
    }),
    items: many(menuItem),
  })
)

export const menuItemRelations = relations(menuItem, ({ one }) => ({
  category: one(menuCategory, {
    fields: [menuItem.categoryId],
    references: [menuCategory.id],
  }),
}))

export const eventTypeRelations = relations(eventType, ({ one, many }) => ({
  location: one(location, {
    fields: [eventType.locationId],
    references: [location.id],
  }),
  content: one(eventTypeContent),
  steps: many(eventStep),
  packageLines: many(eventPackageLine),
  upgrades: many(eventUpgrade),
  formFields: many(eventFormField),
}))

export const eventTypeContentRelations = relations(
  eventTypeContent,
  ({ one }) => ({
    eventType: one(eventType, {
      fields: [eventTypeContent.eventTypeId],
      references: [eventType.id],
    }),
  })
)

export const eventStepRelations = relations(eventStep, ({ one }) => ({
  eventType: one(eventType, {
    fields: [eventStep.eventTypeId],
    references: [eventType.id],
  }),
}))

export const eventPackageLineRelations = relations(
  eventPackageLine,
  ({ one }) => ({
    eventType: one(eventType, {
      fields: [eventPackageLine.eventTypeId],
      references: [eventType.id],
    }),
  })
)

export const eventUpgradeRelations = relations(eventUpgrade, ({ one }) => ({
  eventType: one(eventType, {
    fields: [eventUpgrade.eventTypeId],
    references: [eventType.id],
  }),
}))

export const eventFormFieldRelations = relations(eventFormField, ({ one }) => ({
  eventType: one(eventType, {
    fields: [eventFormField.eventTypeId],
    references: [eventType.id],
  }),
}))

export const locationMemberRelations = relations(locationMember, ({ one }) => ({
  user: one(user, {
    fields: [locationMember.userId],
    references: [user.id],
  }),
  location: one(location, {
    fields: [locationMember.locationId],
    references: [location.id],
  }),
}))

export const userRelations = relations(user, ({ many }) => ({
  memberships: many(locationMember),
}))
