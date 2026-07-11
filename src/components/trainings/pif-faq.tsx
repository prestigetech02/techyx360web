"use client"

import { useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { pifFaqs } from "@/config/product-innovation-fellowship"

export function PifFaq() {
  const [openItems, setOpenItems] = useState<string[]>([pifFaqs[0].question])

  return (
    <Accordion
      value={openItems}
      onValueChange={setOpenItems}
      keepMounted
      className="w-full"
    >
      {pifFaqs.map((item) => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger className="py-4 text-left text-base font-semibold text-zinc-900 hover:no-underline sm:text-lg dark:text-foreground">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
