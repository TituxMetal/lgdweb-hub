import { BackToList } from '~/components/BackToList'
import { useActiveSection } from '../hooks/useActiveSection'
import { useSectionNavigation } from '../hooks/useSectionNavigation'
import { BackToTop } from './BackToTop'
import { ContactSection } from './ContactSection'
import { Hero } from './Hero'
import { PortfolioNav } from './PortfolioNav'
import { ProfileSection } from './ProfileSection'
import { ProjectsSection } from './ProjectsSection'
import { SiteFooter } from './SiteFooter'
import { SkillsSection } from './SkillsSection'

/**
 * The 2021 end-of-training portfolio, rewritten: the same four sections, the
 * same hero, footer and contact form, the same era's palette.
 *
 * The shell owns the page around it, so the feature fills the shell's column
 * (`-mx-6`) instead of bleeding to the viewport edges the way the original did;
 * it keeps its own look inside that column. `BackToList` stays in the shell's
 * padding so returning to the list keeps the placement every other feature uses.
 */
export const Portfolio = () => {
  const active = useActiveSection()
  const goTo = useSectionNavigation()

  return (
    <>
      <BackToList />
      <div className='-mx-6 bg-neutral-900 text-neutral-50'>
        <Hero />
        <PortfolioNav active={active} onNavigate={goTo} />
        <SkillsSection />
        <ProfileSection />
        <ProjectsSection />
        <ContactSection />
        <SiteFooter />
      </div>
      <BackToTop />
    </>
  )
}
