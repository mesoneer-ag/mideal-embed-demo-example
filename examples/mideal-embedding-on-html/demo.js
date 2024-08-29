import MidealEmbed from 'https://cdn.jsdelivr.net/npm/@mesoneer-ag/mideal-embed-dev/dist/bundle.js'

class EmbeddedUbiId {
    constructor(url) {
        this.url = url;
    }

    onInit() {
        // Get the HTML DOM element that we want to inject ubiID iframe into
        const iframeContainer = document.getElementById('iframe-container');

        // Get the modal
        const modal = document.getElementById('myModal');

        // Get the button that opens the modal
        const btn = document.getElementById('myBtn');

        // Get the <span> element that closes the modal
        const span = document.getElementsByClassName('close')[0];

        /**
         * This is the function to receive the identification status and handle it.
         * In this example we will simply print the value into the GUI
         */
        const handleReceivedMessage = (result) => {
            const messageElement = document.getElementById('scanResult');
            const signingResultElement = document.getElementById('signingResult');
            const signingErrorElement = document.getElementById('signingError');
            const messageTimeElement = document.getElementById('ubiidStatusTime');
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

        // When the user clicks the button, open the modal
        let ubiIdEndpoint = this.url;
        btn.onclick = function() {
            modal.style.display = 'block';
            ubiIdEndpoint = document.getElementById('url').value;
            /**
             * the ubiID.start() function takes in 4 arguments
             * ubiIdEndpoint: the url returned from the public ubiID API to create scheduled case
             * enclosingDomElement: the HTML DOM element on your page that you want to inject ubiID frame into
             * style: the style of the injected ubiID iframe, currently only support to set width and height
             * onMessage: the function to receive identification status.
             */
            const ubiID = new MidealEmbed();
            ubiID.start({
                ubiIdEndpoint: ubiIdEndpoint,
                enclosingDomElement: iframeContainer,
                style: {
                    width: '100%',
                    height: '860px',
                },
                onMessage: handleReceivedMessage,
            });
        };

        // When the user clicks on <span> (X), close the modal
        span.onclick = function() {
            closePopup();
        };

        // When the user clicks anywhere outside the modal, close it
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

// Assuming the URL is the returned from the ubiID public API for creating scheduled case
// const ubiIDScheduledCaseUrl = 'https://ubiid.ubitec.io/scan/start?tenantid=4e72ef40-00e6-411c-a44f-47af05109bcd&language=de';
const ubiIDScheduledCaseUrl = document.getElementById("url").value;
const ubiid = new EmbeddedUbiId(ubiIDScheduledCaseUrl);
ubiid.onInit();
