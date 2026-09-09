import { bootcampPrograms } from "@/config/bootcamps"
import { brand } from "@/config/brand"
import { contactDetails } from "@/config/contact"
import { evaHero } from "@/config/executive-virtual-assistance"
import { pifFaqs, pifPricing } from "@/config/product-innovation-fellowship"
import { services } from "@/config/services"
import { siteUrl } from "@/config/site"
import { getCoursePath, trainingSchools } from "@/config/training-schools"

export function buildChatSystemPrompt() {
  const serviceLines = services
    .map((item) => `- ${item.title}: ${item.description} Path: ${item.href}`)
    .join("\n")

  const courseLines = trainingSchools
    .flatMap((school) =>
      school.courses.map((course) => {
        const path = course.detailPath ?? getCoursePath(school.id, course)
        return `- ${course.title} (${school.name}, ${course.duration}): ${course.description} Register: ${path}`
      })
    )
    .join("\n")

  const bootcampLines = bootcampPrograms
    .map(
      (item) =>
        `- ${item.title} (${item.duration}): ${item.description} Next step: ${item.href}`
    )
    .join("\n")

  const pifSummary =
    pifFaqs.find((item) => item.question.toLowerCase().includes("what is"))
      ?.answer ??
    "PIF is a 12-week product innovation fellowship. Apply at /trainings/product-innovation-fellowship/apply."

  return `You are the website assistant for ${brand.name} (${brand.tagline}).
You chat with visitors on ${siteUrl}. Be concise, warm, and practical. Use short paragraphs. Prefer Nigerian English that is professional, not slangy.

Company facts:
- Email: ${contactDetails.email}
- Phones: ${contactDetails.phones.join(", ")}
- WhatsApp: https://wa.me/${contactDetails.whatsappNumber}
- Address: ${contactDetails.address}
- Hours: ${contactDetails.hours} (Lagos / WAT)
- Public site: ${siteUrl}

Services:
${serviceLines}

Training courses:
${courseLines}

Bootcamps / short programs:
${bootcampLines}

Executive Virtual Assistance: ${evaHero.description} Details: /trainings/executive-virtual-assistance

Product Innovation Fellowship (PIF): ${pifSummary}
Published PIF fee: ${pifPricing.currentPrice} (regular ${pifPricing.regularPrice}). Apply at /trainings/product-innovation-fellowship/apply.

SIWES: students can apply through the training registration flow. If they need a placement letter or custom arrangement, collect contact details and escalate.

Rules:
- Do not invent prices, discounts, start dates, class sizes, visa help, guaranteed jobs, or unpublished tuition. For course fees other than the published PIF fee, say the team confirms pricing and offer to connect them with a person or point them to the registration page.
- Do not collect payment details or ask for BVN/OTP/passwords.
- Give specific page paths when useful (start with /).
- If the visitor asks to speak to a person, is angry, needs a custom quote, billing help, hiring/outsourcing staffing, or you cannot fully answer, call offerTalkToPerson. Then briefly explain that a teammate can take over. Do not pretend the handoff already happened.
- If they share a name, email, or phone, call saveVisitorContact.
- When listing programs, you may call listOfferings, then answer in plain language.
- After a human has joined, do not keep answering as if you were still handling the case.`
}

export function getChatOfferings() {
  return {
    services: services.map((item) => ({
      title: item.title,
      summary: item.description,
      path: item.href,
    })),
    courses: trainingSchools.flatMap((school) =>
      school.courses.map((course) => ({
        title: course.title,
        school: school.name,
        duration: course.duration,
        summary: course.description,
        path: course.detailPath ?? getCoursePath(school.id, course),
      }))
    ),
    bootcamps: bootcampPrograms.map((item) => ({
      title: item.title,
      duration: item.duration,
      summary: item.description,
      path: item.href,
    })),
    programs: [
      {
        title: "Product Innovation Fellowship",
        summary: pifSummaryLine(),
        path: "/trainings/product-innovation-fellowship",
      },
      {
        title: "Executive Virtual Assistance",
        summary: evaHero.description,
        path: "/trainings/executive-virtual-assistance",
      },
    ],
  }
}

function pifSummaryLine() {
  return (
    pifFaqs.find((item) => item.question.toLowerCase().includes("what is"))
      ?.answer ?? "12-week product innovation fellowship."
  )
}
