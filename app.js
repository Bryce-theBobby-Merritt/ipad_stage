(function() {
    const animationEl = document.getElementById('animation');
    const staticEl = document.getElementById('static');
    const goEl = document.getElementById('go');
    let currentMode = 'animation';
    const POLL_INTERVAL = 1500;

    function setMode(mode) {
        if (mode === currentMode) return;
        currentMode = mode;

        animationEl.classList.remove('active');
        staticEl.classList.remove('active');
        goEl.classList.remove('active');

        if (mode === 'animation') {
            animationEl.classList.add('active');
        } else if (mode === 'static') {
            staticEl.classList.add('active');
        } else if (mode === 'go') {
            goEl.classList.add('active');
        }
    }

    async function pollState() {
        try {
            const response = await fetch('/api/state');
            if (response.ok) {
                const data = await response.json();
                setMode(data.mode);
            }
        } catch (err) {
            // Silently fail - keep current state
        }
    }

    // Initial poll
    pollState();

    // Poll every POLL_INTERVAL ms
    setInterval(pollState, POLL_INTERVAL);
})();
