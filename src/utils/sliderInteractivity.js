/**
 * Wire up interactivity on every `.blog__resale-slider` inside `rootEl`:
 *
 *   - Clicking a `__dot` button scrolls the slider track to the matching slide
 *     and marks that dot active.
 *   - Scrolling the track itself (via swipe / scroll wheel / touch) updates
 *     the active dot using an IntersectionObserver, so the indicator stays
 *     in sync with the currently-visible slide.
 *
 * Returns a cleanup function that removes all listeners and disconnects
 * observers. Safe to call repeatedly when the HTML re-renders — pair with
 * a useEffect dep so old handlers are torn down.
 */
export function initSliders(rootEl) {
  if (!rootEl) return () => {}

  const ACTIVE_CLASS = 'blog__resale-slider__dot--active'
  const cleanups = []

  const sliders = rootEl.querySelectorAll('.blog__resale-slider')
  sliders.forEach(slider => {
    const track = slider.querySelector('.blog__resale-slider__track')
    const slides = track ? track.querySelectorAll('.blog__resale-slider__slide') : []
    const dots = slider.querySelectorAll('.blog__resale-slider__dot')
    if (!track || slides.length === 0 || dots.length === 0) return

    const setActive = (idx) => {
      dots.forEach((d, i) => d.classList.toggle(ACTIVE_CLASS, i === idx))
    }

    // ----- Click handlers on dots → scroll track to corresponding slide -----
    const clickHandlers = []
    dots.forEach((dot, i) => {
      const handler = (e) => {
        e.preventDefault()
        const slide = slides[i]
        if (!slide) return
        slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
        setActive(i)
      }
      dot.addEventListener('click', handler)
      clickHandlers.push([dot, handler])
    })

    // ----- Track scroll → update active dot to the most visible slide -----
    let observer = null
    try {
      observer = new IntersectionObserver(
        () => {
          // Pick the slide closest to the track's left edge.
          const trackRect = track.getBoundingClientRect()
          let bestIdx = 0
          let bestDistance = Infinity
          slides.forEach((slide, i) => {
            const slideRect = slide.getBoundingClientRect()
            const distance = Math.abs(slideRect.left - trackRect.left)
            if (distance < bestDistance) {
              bestDistance = distance
              bestIdx = i
            }
          })
          setActive(bestIdx)
        },
        { root: track, threshold: [0.25, 0.5, 0.75, 1.0] }
      )
      slides.forEach(s => observer.observe(s))
    } catch {
      // IntersectionObserver may not be available in some test envs — fall
      // back to a plain scroll listener.
      const onScroll = () => {
        const trackRect = track.getBoundingClientRect()
        let bestIdx = 0
        let bestDistance = Infinity
        slides.forEach((slide, i) => {
          const slideRect = slide.getBoundingClientRect()
          const distance = Math.abs(slideRect.left - trackRect.left)
          if (distance < bestDistance) {
            bestDistance = distance
            bestIdx = i
          }
        })
        setActive(bestIdx)
      }
      track.addEventListener('scroll', onScroll, { passive: true })
      cleanups.push(() => track.removeEventListener('scroll', onScroll))
    }

    cleanups.push(() => {
      clickHandlers.forEach(([el, h]) => el.removeEventListener('click', h))
      if (observer) observer.disconnect()
    })
  })

  return () => cleanups.forEach(fn => fn())
}
