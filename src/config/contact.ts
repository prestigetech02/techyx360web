export const contactDetails = {
  address: "8, Road B, Ladugba Estate, Ita Oluwo, Ikorodu, Lagos, Nigeria.",
  email: "info@techyx360.com",
  phones: ["(+234) 907 168 2117", "(+234) 912 886 8892"],
  phoneHref: "tel:+2349071682117",
  whatsappNumber: "2349071682117",
  whatsappHref: "https://wa.me/2349071682117",
  hours: "08:00AM - 06:00PM",
} as const

export const contactPageCards = [
  {
    id: "location",
    title: "Our Location",
    description: contactDetails.address,
  },
  {
    id: "email",
    title: "Email Us",
    description: "Our support team is here to assist you",
    link: {
      label: contactDetails.email,
      href: `mailto:${contactDetails.email}`,
    },
  },
  {
    id: "phone",
    title: "Call Us",
    description: "Our customer support team is available",
    link: {
      label: contactDetails.phones[0],
      href: contactDetails.phoneHref,
    },
  },
] as const
