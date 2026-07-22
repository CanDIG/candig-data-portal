import { useEffect } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/system';

import { useTour } from './TourContext';

// The search page has a fixed global header + a sticky page AppBar (~200px tall).
// Offset Joyride's scrolling so highlighted sections land below them rather than
// behind the header.
const HEADER_SCROLL_OFFSET = 200;

// Expand/collapse the first node's per-program breakdown to demonstrate it during
// the tour. The button exposes its state via data-expanded (set in
// patientCountSingle.jsx), so we only click when a change is actually needed —
// keeping this idempotent across Next/Back navigation.
function setNodeExpanded(shouldExpand) {
    const button = document.querySelector('[data-tour="results-expand-node"]');
    if (!button) return;
    const isExpanded = button.dataset.expanded === 'true';
    if (shouldExpand !== isExpanded) {
        button.click();
    }
}

// Expand (or reset) a systemic-therapy treatment on the patient timeline to
// demonstrate its per-drug rows. The timeline exposes a hidden control whose
// data-active reflects the current state, so we only click when a change is
// needed — keeping this idempotent across Next/Back navigation.
function setTimelineTreatmentExpanded(shouldExpand) {
    const button = document.querySelector('[data-tour="timeline-expand-demo"]');
    if (!button) return;
    const isActive = button.dataset.active === 'true';
    if (shouldExpand !== isActive) {
        button.click();
    }
}

// The sidebar lives in a fixed MUI Drawer that scrolls via react-perfect-scrollbar
// (overflow: hidden), which Joyride's auto-scroll doesn't recognize — so lower
// sections (genomic / clinical filters) stay below the drawer's fold and Joyride
// anchors the tooltip off-screen. For any step whose target is inside the
// scrollbar container, scroll that container so the target sits near the top of
// the drawer before Joyride positions the tooltip.
function scrollSidebarTargetIntoView(step) {
    const selector = typeof step?.target === 'string' ? step.target : null;
    if (!selector) return;
    const target = document.querySelector(selector);
    if (!target) return;
    // react-perfect-scrollbar renders `<div class="scrollbar-container ...">`.
    const scrollParent = target.closest('.scrollbar-container');
    if (!scrollParent) return; // not a sidebar step — Joyride handles page scroll.
    const parentTop = scrollParent.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    // Leave a small gap above the target so it isn't flush against the drawer edge.
    scrollParent.scrollTop += targetTop - parentTop - 12;
}

// Single controlled <Joyride> instance for the whole app. Reads its run state
// from TourContext so it can render over whichever page the tour targets.

function TourRunner() {
    const theme = useTheme();
    const location = useLocation();
    const { run, steps, stepIndex, setStepIndex, stopTour } = useTour();

    // If the user navigates to another page mid-tour, end it — its targets are
    // gone, so continuing would just skip through the remaining steps.
    useEffect(() => {
        if (run) {
            setNodeExpanded(false);
            setTimelineTreatmentExpanded(false);
            stopTour();
        }
        // Only react to path changes; including `run` would stop the tour the
        // instant it starts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const handleCallback = (data) => {
        const { action, index, status, step, type } = data;

        // Clicking the close (X) button ends the tour — the user has opted out,
        // so don't advance to the next step (which would render its beacon).
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === ACTIONS.CLOSE) {
            // Leave nothing expanded behind us. Tours run in place, so there's
            // nothing to navigate to on finish/skip/close.
            setNodeExpanded(false);
            setTimelineTreatmentExpanded(false);
            stopTour();
            return;
        }

        // Before a step opens, make sure a sidebar target is scrolled into the
        // visible part of the drawer so its tooltip lands on screen.
        if (type === EVENTS.STEP_BEFORE) {
            scrollSidebarTargetIntoView(step);
        }

        // Demonstrate the per-program breakdown: expand as the step opens...
        if (type === EVENTS.STEP_BEFORE && step?.expandDemo) {
            setNodeExpanded(true);
        }

        // Demonstrate a treatment expanding into its systemic-therapy drug rows.
        if (type === EVENTS.STEP_BEFORE && step?.expandTreatmentDemo) {
            setTimelineTreatmentExpanded(true);
        }

        if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
            // ...and collapse it again once we move on.
            if (step?.expandDemo) {
                setNodeExpanded(false);
            }
            if (step?.expandTreatmentDemo) {
                setTimelineTreatmentExpanded(false);
            }
            // Advance (or go back) once the current step is done.
            setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
        }
    };

    return (
        <Joyride
            run={run}
            steps={steps}
            stepIndex={stepIndex}
            continuous
            showProgress
            showSkipButton
            scrollToFirstStep
            scrollOffset={HEADER_SCROLL_OFFSET}
            callback={handleCallback}
            locale={{ last: 'Finish' }}
            styles={{
                options: {
                    primaryColor: theme.palette.primary.main,
                    zIndex: 10000
                },
                // Keep the whole tooltip within the viewport on short/small screens
                // so the footer (Back / Next / Finish) is always reachable...
                tooltip: {
                    maxWidth: 'min(90vw, 380px)',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column'
                },
                // ...and let the title+body region scroll when the content is tall
                // rather than pushing the footer buttons off-screen. `minHeight: 0`
                // is required for a flex child to shrink below its content size.
                tooltipContainer: {
                    overflowY: 'auto',
                    minHeight: 0
                }
            }}
        />
    );
}

export default TourRunner;
