import Image from "next/image"

const PIF_SCROLL_IMAGE = "/pil.webp"

/**
 * Rounded rectangular “window” that reveals a large photo as you scroll.
 */
export function PifScrollImage() {
  return (
    <section className="bg-background py-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative h-[48vh] min-h-[260px] overflow-hidden rounded-[1.75rem] shadow-[0_20px_60px_-28px_rgb(15_27_61_/_0.45)] sm:h-[56vh] sm:min-h-[320px] sm:rounded-[2rem] lg:h-[62vh]">
          <Image
            src={PIF_SCROLL_IMAGE}
            alt="Fellows collaborating on a product during the Product Innovation Fellowship"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  )
}
