import { Hero } from "./components/hero"
import { Modalities } from "./components/testimonials"
import { FAQ } from "./components/faq"
import { Location } from "./components/location"

export default function Home() {
   return (
      <>
         <Hero />
         <Modalities />
         <FAQ />
         <Location />
      </>
   )
}
