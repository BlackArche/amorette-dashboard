import { z } from "zod";

export const personSchema = z.object({
  name: z.string().trim().max(120).default(""),
  parents: z.string().trim().max(240).default(""),
});

export const eventBlockSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().trim().max(120).default(""),
  date: z.string().trim().max(40).default(""),
  time: z.string().trim().max(40).default(""),
  venue: z.string().trim().max(160).default(""),
  address: z.string().trim().max(240).default(""),
  mapUrl: z.string().trim().max(500).default(""),
});

export const textsSchema = z.object({
  invitation: z.string().max(2000).default(""),
  quote: z.string().max(500).default(""),
  thanks: z.string().max(500).default(""),
  rsvpPrompt: z.string().max(500).default(""),
});

export const invitationSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug շատ կարճ է")
    .max(64)
    .regex(/^[a-z0-9-]+$/i, "Միայն տառեր, թվեր ու '-'"),
  dateSlug: z
    .string()
    .trim()
    .min(4)
    .max(20)
    .regex(/^[a-z0-9-]+$/i, "Միայն տառեր, թվեր ու '-'"),
  template: z.string().min(1, "Ընտրեք թեմփլեյթ"),
  language: z.enum(["hy", "en", "ru"]).default("hy"),
  date: z.string().min(1, "Ամսաթիվը պարտադիր է"),
  couple: z.object({
    bride: personSchema,
    groom: personSchema,
    story: z.string().max(2000).default(""),
  }),
  event: z.object({
    ceremony: eventBlockSchema,
    reception: eventBlockSchema,
    party: eventBlockSchema,
  }),
  texts: textsSchema,
  sections: z.object({
    gallery: z.boolean().default(true),
    rsvp: z.boolean().default(true),
    countdown: z.boolean().default(true),
    music: z.boolean().default(true),
  }),
  rsvpDeadline: z.string().default(""),
  notes: z.string().max(1000).default(""),
});

export type InvitationFormValues = z.infer<typeof invitationSchema>;

export const defaultInvitation: InvitationFormValues = {
  slug: "",
  dateSlug: "",
  template: "",
  language: "hy",
  date: "",
  couple: {
    bride: { name: "", parents: "" },
    groom: { name: "", parents: "" },
    story: "",
  },
  event: {
    ceremony: { enabled: true, title: "Պսակադրություն", date: "", time: "", venue: "", address: "", mapUrl: "" },
    reception: { enabled: true, title: "Ընդունելություն", date: "", time: "", venue: "", address: "", mapUrl: "" },
    party: { enabled: false, title: "Պարահանդես", date: "", time: "", venue: "", address: "", mapUrl: "" },
  },
  texts: {
    invitation: "Սիրով հրավիրում ենք Ձեզ կիսելու մեր ուրախությունը",
    quote: "",
    thanks: "",
    rsvpPrompt: "Խնդրում ենք հաստատել ներկայությունը",
  },
  sections: { gallery: true, rsvp: true, countdown: true, music: true },
  rsvpDeadline: "",
  notes: "",
};