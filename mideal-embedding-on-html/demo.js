import MidealEmbed from 'https://cdn.jsdelivr.net/npm/@mesoneer-ag/mideal-embed/dist/bundle.js'

class EmbeddedMideal {
    constructor(url) {
        this.url = url;
    }

    onInit() {
        const iframeContainer = document.getElementById('iframe-container');
        const modal = document.getElementById('myModal');
        const btn = document.getElementById('myBtn');
        const span = document.getElementsByClassName('close')[0];
        const autoResizeCheckbox = document.getElementById('autoResize');
        const lastHeightEl = document.getElementById('lastHeight');

        const handleReceivedMessage = (result) => {
            const messageElement = document.getElementById('scanResult');
            const signingResultElement = document.getElementById('signingResult');
            const signingErrorElement = document.getElementById('signingError');
            const messageTimeElement = document.getElementById('midealStatusTime');
            const statusReasonElement = document.getElementById('statusReason');
            const statusDetailsElement = document.getElementById('statusDetails');
            const {
                scanResult,
                signingResult,
                signingErrors,
                date,
                statusReason,
                statusDetails,
            } = result;
            messageElement.innerHTML = scanResult ?? 'NO_STATUS';
            signingResultElement.innerHTML = signingResult ?? 'NO_SIGNING';
            signingErrorElement.innerHTML = signingErrors ?? '';
            messageTimeElement.innerHTML = date ?? '-------';
            statusReasonElement.innerHTML = statusReason ?? '';
            statusDetailsElement.innerHTML = statusDetails ?? '';
        };

        const INITIAL_IFRAME_HEIGHT_PX = 850;

        const handleHeightChange = (height) => {
            lastHeightEl.innerText = height + 'px';
        };

        let startUrl = this.url;
        btn.onclick = function() {
            modal.style.display = 'block';
            startUrl = document.getElementById('url').value;

            const midealEmbed = new MidealEmbed();
            const options = {
                startUrl: startUrl,
                enclosingDomElement: iframeContainer,
                style: {
                    width: '100%',
                    height: INITIAL_IFRAME_HEIGHT_PX + 'px',
                },
                onMessage: handleReceivedMessage,
                onHeightChange: (height) => {
                    handleHeightChange(height);
                    if (!autoResizeCheckbox.checked) return;
                    // Demo policy: iframe tracks content height but never shrinks below
                    // the initial allocation. Tall pages grow; short pages render at
                    // the floor (no whitespace because the embedded app fills 850 via
                    // its own min-height). Tall→short navigation shrinks back to 850.
                    const target = Math.max(height, INITIAL_IFRAME_HEIGHT_PX);
                    const iframe = iframeContainer.querySelector('iframe');
                    if (iframe) {
                        iframe.style.height = target + 'px';
                        iframe.setAttribute('height', target + 'px');
                    }
                },
            };
            midealEmbed.start(options);
        };

        span.onclick = function() {
            closePopup();
        };

        window.onclick = function(event) {
            if (event.target == modal) {
                closePopup();
            }
        };

        var closePopup = () => {
            modal.style.display = 'none';
        };
    }
}

const startUrl = document.getElementById("url").value;
const mideal = new EmbeddedMideal(startUrl);
mideal.onInit();
