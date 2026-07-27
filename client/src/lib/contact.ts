/**
 * Single source of truth for where people can reach Victor.
 * Company enquiries go to the business address, everything personal goes direct.
 */
export const COMPANY_EMAIL = "support@themethodco.co";
export const PERSONAL_EMAIL = "victormirandads@gmail.com";

export interface ContactRoute {
  id: string;
  tag: string;
  name: string;
  email: string;
  blurb: string;
  icon: "company" | "person";
}

export const CONTACT_ROUTES: ContactRoute[] = [
  {
    id: "company",
    tag: "Company",
    name: "The Method Co.",
    email: COMPANY_EMAIL,
    blurb: "Project enquiries, freelance builds, and anything with a budget attached.",
    icon: "company",
  },
  {
    id: "direct",
    tag: "Direct",
    name: "Victor Miranda",
    email: PERSONAL_EMAIL,
    blurb: "Roles, hiring, and anything you would rather say to me personally.",
    icon: "person",
  },
];
