(() => {
    const repositoryCount = document.getElementById('layered-repository-count');
    const siteLastUpdated = document.querySelector('#site-last-updated time');
    if (repositoryCount || siteLastUpdated) {
        fetch('gallery/catalog.json')
            .then((response) => {
                if (!response.ok) throw new Error('Gallery catalog unavailable');
                return response.json();
            })
            .then((catalog) => {
                if (repositoryCount && Array.isArray(catalog.images)) {
                    repositoryCount.textContent = catalog.images.length;
                }

                if (siteLastUpdated && typeof catalog.generated === 'string') {
                    const builtAt = new Date(catalog.generated);
                    if (!Number.isNaN(builtAt.getTime())) {
                        const month = new Intl.DateTimeFormat('en', {
                            month: 'short',
                            timeZone: 'UTC'
                        }).format(builtAt);
                        siteLastUpdated.dateTime = builtAt.toISOString();
                        siteLastUpdated.textContent = `${builtAt.getUTCFullYear()} ${month}`;
                        siteLastUpdated.parentElement.hidden = false;
                    }
                }
            })
            .catch(() => {});
    }

    const theatre = document.getElementById('layered-theatre');
    const image = document.getElementById('layered-theatre-image');
    const layersImage = document.getElementById('layered-theatre-layers-image');
    const title = document.getElementById('layered-theatre-title');
    const author = document.getElementById('layered-theatre-author');
    const year = document.getElementById('layered-theatre-year');
    const layers = document.getElementById('layered-theatre-layers');
    const csdb = document.getElementById('layered-theatre-csdb');
    const imageLink = document.getElementById('layered-theatre-image-link');
    const textLink = document.getElementById('layered-theatre-text-link');
    const closeButton = theatre.querySelector('.layered-theatre-close');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let opener = null;
    let closing = false;
    let closeTimer = null;

    function finishClose() {
        window.clearTimeout(closeTimer);
        closeTimer = null;
        if (!theatre.open) return;

        theatre.close();
        theatre.classList.remove('is-closing');
        image.removeAttribute('src');
        layersImage.removeAttribute('src');
        closing = false;
        opener?.focus({ preventScroll: true });
    }

    function dismiss() {
        if (!theatre.open || closing) return;
        if (reducedMotion.matches) {
            finishClose();
            return;
        }

        closing = true;
        theatre.classList.add('is-closing');
        closeTimer = window.setTimeout(finishClose, 300);
    }

    document.querySelectorAll('[data-theatre-gif]').forEach((card) => {
        card.addEventListener('click', () => {
            if (theatre.open) return;

            opener = card;
            const artworkTitle = card.dataset.theatreTitle;
            const appUrl = card.dataset.theatreOpen;
            title.textContent = artworkTitle;
            author.textContent = card.dataset.theatreAuthor;
            year.textContent = `· ${card.dataset.theatreYear}`;
            layers.textContent = card.dataset.theatreLayers;
            csdb.href = card.dataset.theatreCsdb;
            image.src = card.dataset.theatreGif;
            layersImage.src = card.dataset.theatreLayersGif;
            image.alt = `Animated C64 display render of ${artworkTitle} by ${card.dataset.theatreAuthor}`;
            imageLink.href = appUrl;
            imageLink.setAttribute('aria-label', `Open ${artworkTitle} in C64 Graphics Explorer`);
            textLink.href = appUrl;
            theatre.showModal();
            closeButton.focus({ preventScroll: true });
        });
    });

    closeButton.addEventListener('click', dismiss);
    theatre.addEventListener('cancel', (event) => {
        event.preventDefault();
        dismiss();
    });
    theatre.addEventListener('click', (event) => {
        if (event.target === theatre) dismiss();
    });
    theatre.addEventListener('animationend', (event) => {
        if (closing && event.animationName === 'layered-theatre-out') finishClose();
    });
})();
