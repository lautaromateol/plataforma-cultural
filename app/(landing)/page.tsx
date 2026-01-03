import { Contact } from "./components/contact"
import { Hero } from "./components/hero"
import { Programs } from "./components/programs"
import { Plans } from "./components/testimonials"

export default function Home() {
   return (
      <>
         <Hero />
         <Plans />
         <Programs />
         <Contact />
      </>
   )
}
