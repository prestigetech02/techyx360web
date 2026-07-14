/**
 * Per-route Open Graph images for richer social previews.
 * Keys must match the page path passed to createPageMetadata.
 */
export const pageOgImages: Record<
  string,
  { url: string; alt: string; width?: number; height?: number }
> = {
  "/services/mobile-app-development": {
    url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    alt: "Mobile app development services by Techyx360",
  },
  "/services/web-development": {
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    alt: "Web development and responsive website design",
  },
  "/services/custom-software": {
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    alt: "Custom software development workspace",
  },
  "/services/tech-trainings": {
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
    alt: "Tech training and professional development",
  },
  "/services/digital-marketing": {
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    alt: "Digital marketing strategy and analytics",
  },
  "/services/technical-consultancy": {
    url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    alt: "Technical consultancy and IT strategy",
  },
  "/trainings/corporate": {
    url: "/corp.hero.webp",
    alt: "Corporate technology training illustration",
  },
  "/trainings/bootcamps": {
    url: "/bootcamp-hero.webp",
    alt: "Techyx360 bootcamp training illustration",
  },
  "/trainings/individual-certifications": {
    url: "/ore.webp",
    alt: "Individual tech certification programs",
  },
  "/trainings/siwes-it": {
    url: "/77033d0b-9ed4-49d8-86fe-1fdc7865e835.png",
    alt: "SIWES and industrial training program",
  },
  "/trainings/executive-virtual-assistance": {
    url: "/va.png",
    alt: "Executive virtual assistant professional at a modern workspace with headset and dual monitors",
    width: 1672,
    height: 941,
  },
  "/trainings/register/business-marketing/executive-virtual-assistance": {
    url: "/va.png",
    alt: "Register for Executive Virtual Assistance at Techyx360",
    width: 1672,
    height: 941,
  },
  "/trainings/product-innovation-fellowship": {
    url: "/pil-og.jpg",
    alt: "Product Innovation Fellowship — team building real digital products",
    width: 1200,
    height: 630,
  },
  "/trainings/product-innovation-fellowship/apply": {
    url: "/pil-og.jpg",
    alt: "Apply for the Product Innovation Fellowship at Techyx360",
    width: 1200,
    height: 630,
  },
  "/trainings/register": {
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
    alt: "Register for Techyx360 training programs",
  },
  "/about": {
    url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    alt: "About Techyx360 IT solutions company",
  },
  "/contact": {
    url: "https://images.unsplash.com/photo-1423666639041-f5600c06836f?auto=format&fit=crop&w=1200&q=80",
    alt: "Contact Techyx360",
  },
  "/blog": {
    url: "https://images.unsplash.com/photo-1499750310157-5f6570b1402e?auto=format&fit=crop&w=1200&q=80",
    alt: "Techyx360 blog — IT insights and articles",
  },
  "/careers": {
    url: "/careers-hero.png",
    alt: "Techyx360 team collaborating — careers and open roles",
  },
}
