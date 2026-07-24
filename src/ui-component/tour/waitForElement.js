// Poll for a selector to appear in the DOM (up to `timeout` ms) before resolving.
// The tour navigates between lazy-loaded routes whose targets (and, for the
// sidebar, a drawer) aren't in the DOM immediately — this lets callers wait for
// a target to exist before starting/resuming Joyride. Resolves true if found,
// false on timeout (callers proceed either way so the tour degrades gracefully).
export default function waitForElement(selector, timeout = 6000, interval = 100) {
    return new Promise((resolve) => {
        const startedAt = Date.now();
        const check = () => {
            if (document.querySelector(selector)) {
                resolve(true);
            } else if (Date.now() - startedAt > timeout) {
                resolve(false);
            } else {
                setTimeout(check, interval);
            }
        };
        check();
    });
}
