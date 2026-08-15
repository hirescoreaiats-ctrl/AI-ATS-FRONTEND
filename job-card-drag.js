(() => {
    const CARD_SELECTOR = ".job-card-horizontal-scroll"
    const OVERFLOW_VALUE_SELECTOR = [
        ".ats-recruiter-job-body p",
        ".ats-recruiter-job-meta span",
        ".ats-management-card-body p",
        ".ats-management-meta span",
        ".ats-outreach-role-title p",
        ".ats-outreach-meta-grid span",
        ".job-title",
        ".company-name",
        ".job-info > div"
    ].join(",")
    const INTERACTIVE_SELECTOR = "button, a, input, select, textarea, label, [role='button']"
    const DRAG_THRESHOLD = 5
    let drag = null

    document.addEventListener("pointerdown", event => {
        if((event.pointerType !== "touch" && event.button !== 0) || event.target.closest(INTERACTIVE_SELECTOR)) return

        const card = event.target.closest(CARD_SELECTOR)
        if(!card) return

        const scrollTargets = [card, ...card.querySelectorAll(OVERFLOW_VALUE_SELECTOR)]
            .filter(target => target.scrollWidth > target.clientWidth + 1)
            .map(target => ({ target, startScrollLeft: target.scrollLeft }))

        if(!scrollTargets.length) return

        drag = {
            card,
            pointerId: event.pointerId,
            startX: event.clientX,
            scrollTargets,
            moved: false
        }
        card.setPointerCapture?.(event.pointerId)
    })

    document.addEventListener("pointermove", event => {
        if(!drag || event.pointerId !== drag.pointerId) return

        const walk = event.clientX - drag.startX
        if(!drag.moved && Math.abs(walk) < DRAG_THRESHOLD) return

        drag.moved = true
        drag.scrollTargets.forEach(({ target, startScrollLeft }) => {
            target.scrollLeft = startScrollLeft - walk
        })
        event.preventDefault()
    }, { passive: false })

    const stopDragging = event => {
        if(!drag || event.pointerId !== drag.pointerId) return
        drag.card.releasePointerCapture?.(event.pointerId)
        drag = null
    }

    document.addEventListener("pointerup", stopDragging)
    document.addEventListener("pointercancel", stopDragging)
})()
