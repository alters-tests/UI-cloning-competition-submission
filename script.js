function initTabs() {
    const tabs = document.querySelectorAll("#tab-bar .tab");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(tabi => {
                tabi.classList.remove("active");
            });
            document.querySelectorAll(".tab-content").forEach(contentElmnti => {
                contentElmnti.classList.remove("active");
            });
            
            const tabType = tab.id === "outbound-tab" ? "outbound" : "return";
            const contentElmnt = document.querySelector(`.tab-content[data-tab=${tabType}]`);
            tab.classList.add("active");
            contentElmnt.classList.add("active");
        });
    });
}
// Loader screen functionality
function showLoaderScreen() {
    const loaderScreen = document.getElementById("loader-screen");
    if (loaderScreen) {
        loaderScreen.style.display = "block";
        // Force reflow to ensure display change takes effect before animation
        loaderScreen.offsetHeight;
        loaderScreen.classList.add("show");
        loaderScreen.classList.remove("hide");
    }
}

function hideLoaderScreen() {
    const loaderScreen = document.getElementById("loader-screen");
    if (loaderScreen) {
        loaderScreen.classList.add("hide");
        loaderScreen.classList.remove("show");
        
        // Hide the element completely after animation completes
        setTimeout(() => {
            loaderScreen.style.display = "none";
        }, 300); // Match the CSS transition duration
    }
}

function initEvents() {
    const btn = document.getElementById("buy-btn");
    btn.addEventListener("mousedown", logBuyboxMousedown);
    btn.addEventListener("mouseup", showBuyBox);
    btn.addEventListener("contextmenu", () => {
        window.mousedownStart = 0; // allow editing
        showBuyBox();
    });

    // Generic handler for all history-back elements
    const historyBackElements = document.querySelectorAll('.history-back');
    historyBackElements.forEach(element => {
        element.addEventListener('click', () => {
            if (window.stateManager) {
                window.stateManager.goBack();
            }
        });
    });

    const shareBtns = [document.getElementById("share-btn"), document.getElementById("share-btn2"), document.getElementById("share-btn3")];
    shareBtns.forEach(shareBtn => {
        if (shareBtn) {
            shareBtn.addEventListener("click", () => {
                const shareData = {
                    title: "TrainPal",
                    text: "TrainPal - cheapest and easiest-to-book train tickets across all major UK networks!",
                    url: "https://www.mytrainpal.com/book-tickets/book-detail?orderId=1134741549649637&flightsignature=H4sIAAAAAAAA_4uuVirOTM_zS8xNVbJSyi9KSS3yTFHSAQuGJeaUgkQNDY1NzE0MTU0szYDI2BwqnVhSWgSSdnR0dXQMdPRIMvbKjorwKohycQt1c88ONrAMyC1ISTJIMgiMDE6yNM40LrCsKM2ycAk2STEoTy6wyKg00C0pyiwAGaZUGwsAKdIb3osAAAA=-split-AAEAAQAPZmxpZ2h0c2lnbmF0dXJlKVKYKl2YGJRqMnIJW-DBhi89oa2vum6fRWxWYr06US4=-tripsign",
                };
                navigator.share(shareData);
            });
        }
    });

    const trainpalBuy = document.getElementById("buy-trainpal-card");
    trainpalBuy.addEventListener("click", () => {
        if(!window.canEdit) {
            return;
        }
        if (window.stateManager) {
            window.stateManager.navigateToSettings();
        }
    });

    // Euro-jant close button functionality
    const euroJantCloseBtn = document.querySelector(".jant .close-btn");
    if (euroJantCloseBtn) {
        euroJantCloseBtn.addEventListener("click", () => {
            const euroJant = document.querySelector(".jant");
            if (euroJant) {
                euroJant.style.opacity = 0;
                euroJant.style.transform = "translateX(-50%) scale(0.75)";
                setTimeout(() => {
                    euroJant.style.display = "none";
                }, 200);
            }
        });
    }

    // Add event listeners for all onclick-load elements
    const onclickLoadElements = document.querySelectorAll(".onclick-load");
    onclickLoadElements.forEach(element => {
        element.addEventListener("click", (e) => {
            e.preventDefault();
            if(window.canEdit) return;
            if (window.stateManager) {
                window.stateManager.showLoader('onclick-load', 'main', 3000);
            }
        });
    });

    // E-ticket functionality
    const viewTicketBtns = document.querySelectorAll(".view-ticket");
    viewTicketBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            window.stateManager.navigateToETicket();
        });
    });

    const eticketRefreshBtn = document.getElementById("eticket-refresh-btn");
    const eticketRetryBtn = document.getElementById("eticket-retry-btn");
    [eticketRefreshBtn, eticketRetryBtn].forEach(btn => {
        btn.addEventListener("click", () => {
            const content = document.getElementById("eticket-failed");
            
            if(content.style.display === "none")
                return;
            
            const randLoadTime = Math.random() < .5 ? 380 : Math.random() * (50000 - 30000) + 30000;
            const loader = document.getElementById("eticket-loader");
            loader.style.display = "";
            content.style.display = "none";
            setTimeout(() => {
                loader.style.display = "none";
                content.style.display = "";
            }, randLoadTime);

        });
    });

    // Settings functionality - back button now handled by history-back class

    const saveSettingsBtn = document.getElementById("save-settings-btn");
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener("click", saveSettings);
    }

    const resetSettingsBtn = document.getElementById("reset-settings-btn");
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener("click", resetSettings);
    }
}
function logBuyboxMousedown() {
    window.mousedownStart = performance.now();
}
function showBuyBox() {
    const deltat = performance.now() - (window.mousedownStart??Infinity);
    window.mousedownStart = Infinity;
    if(deltat > 2000) { // if btn was long pressed for 2 sec, allow content editing
        window.canEdit = true;
    }
    // if user has taken more than 3 secs to press the next button, dont allow edits
    setTimeout(() => {
        window.canEdit = false;
    }, 3000);

    // Use StateManager for buy box navigation
    if (window.stateManager) {
        window.stateManager.navigateToBuyBox();
    }
}


// E-ticket screen functionality
function showETicketScreen() {
    const eticketScreen = document.getElementById("eticket-screen");
    if (eticketScreen) {
        eticketScreen.style.display = "block";
        // Force reflow to ensure display change takes effect before animation
        eticketScreen.offsetHeight;
        eticketScreen.classList.add("show");
        eticketScreen.classList.remove("hide");
        
        // Start loading the ticket
        loadETicket();
    }
}

function hideETicketScreen() {
    const eticketScreen = document.getElementById("eticket-screen");
    if (eticketScreen) {
        eticketScreen.classList.add("hide");
        eticketScreen.classList.remove("show");
        
        // Hide the element completely after animation completes
        setTimeout(() => {
            eticketScreen.style.display = "none";
        }, 300); // Match the CSS transition duration
    }
}

function loadETicket() {
    const loader = document.getElementById("eticket-loader");
    const failedContainer = document.getElementById("eticket-failed");
    
    // Show loader, hide failed image
    loader.style.display = "flex";
    failedContainer.style.display = "none";
    
    // Generate random delay between 13-25 seconds
    const randomDelay = Math.floor(Math.random() * 12000) + 13000; // 13000-25000ms
    
    setTimeout(() => {
        // Hide loader and show failed image
        loader.style.display = "none";
        failedContainer.style.display = "flex";
    }, randomDelay);
}

function refreshETicket() {
    // This function is called by both refresh button and retry button
    loadETicket();
}

function hideSettingsScreen() {
    const settingsScreen = document.getElementById("settings-screen");
    if (settingsScreen) {
        settingsScreen.classList.add("hide");
        settingsScreen.classList.remove("show");
        
        // Hide the element completely after animation completes
        setTimeout(() => {
            settingsScreen.style.display = "none";
        }, 300); // Match the CSS transition duration
    }
}

// Default settings
const defaultSettings = {
    outbound: {
        origin: "London Euston",
        destination: "Stafford",
        date: "2024-12-11",
        departTime: "09:30",
        arriveTime: "11:20",
        endStation: "Crewe",
        seatInfo: "Standard, sit in any available seat",
        originPlatform: "12",
        destinationPlatform: "3",
        showTimeChanged: false
    },
    return: {
        origin: "Stafford", 
        destination: "London Euston",
        date: "2024-12-11",
        departTime: "15:45",
        arriveTime: "17:35"
    },
    ticketPrice: 35.45,
    email: "jack.lecco59@gmail.com"
};

function loadCurrentSettings() {
    // Get saved settings from localStorage or use defaults
    const savedSettings = JSON.parse(localStorage.getItem('trainpal-settings')) || defaultSettings;
    
    // Fill form with current settings
    document.getElementById('outbound-origin').value = savedSettings.outbound.origin;
    document.getElementById('outbound-destination').value = savedSettings.outbound.destination;
    document.getElementById('outbound-date').value = savedSettings.outbound.date;
    document.getElementById('outbound-depart-time').value = savedSettings.outbound.departTime;
    document.getElementById('outbound-arrive-time').value = savedSettings.outbound.arriveTime;

    document.getElementById('end-station-setting').value = savedSettings.outbound.endStation;
    document.getElementById('seat-info-setting').value = savedSettings.outbound.seatInfo;
    document.getElementById('origin-platform-setting').value = savedSettings.outbound.originPlatform;
    document.getElementById('destination-platform-setting').value = savedSettings.outbound.destinationPlatform;

    document.getElementById('show-time-changed-outbound').checked = savedSettings.outbound.showTimeChanged;
    document.getElementById('outbound-new-depart-time').value = savedSettings.outbound.newDepartTime;
    document.getElementById('outbound-new-arrive-time').value = savedSettings.outbound.newArriveTime;

    
    document.getElementById('return-origin').value = savedSettings.return.origin;
    document.getElementById('return-destination').value = savedSettings.return.destination;
    document.getElementById('return-date').value = savedSettings.return.date;
    document.getElementById('return-depart-time').value = savedSettings.return.departTime;
    document.getElementById('return-arrive-time').value = savedSettings.return.arriveTime;

    document.getElementById("ticket-price-input").value = savedSettings.ticketPrice;
    document.getElementById("email-input").value = savedSettings.email;
}

function saveSettings() {
    // Get values from form
    const settings = {
        outbound: {
            origin: document.getElementById('outbound-origin').value,
            destination: document.getElementById('outbound-destination').value,
            date: document.getElementById('outbound-date').value,
            departTime: document.getElementById('outbound-depart-time').value,
            arriveTime: document.getElementById('outbound-arrive-time').value,
            
            showTimeChanged: document.getElementById('show-time-changed-outbound').checked,
            newDepartTime: document.getElementById('outbound-new-depart-time').value,
            newArriveTime: document.getElementById('outbound-new-arrive-time').value,

            endStation: document.getElementById("end-station-setting").value,
            seatInfo: document.getElementById("seat-info-setting").value,

            originPlatform: document.getElementById("origin-platform-setting").value,
            destinationPlatform: document.getElementById("destination-platform-setting").value
        },
        return: {
            origin: document.getElementById('return-origin').value,
            destination: document.getElementById('return-destination').value,
            date: document.getElementById('return-date').value,
            departTime: document.getElementById('return-depart-time').value,
            arriveTime: document.getElementById('return-arrive-time').value,
            
            /* showTimeChanged: document.getElementById('show-time-changed-return').checked,
            newDepartTime: document.getElementById('return-new-depart-time').value,
            newArriveTime: document.getElementById('return-new-arrive-time').value */
        },
        ticketPrice: document.getElementById("ticket-price-input").value
    };
    
    // Save to localStorage
    localStorage.setItem('trainpal-settings', JSON.stringify(settings));
    
    // Apply settings to main UI
    applySettingsToUI(settings);
    
    // Show success feedback
    const saveBtn = document.getElementById('save-settings-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Settings Saved!';
    saveBtn.style.background = '#10b981';
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '#1f6bff';
        
        // Hide settings screen after save
        hideSettingsScreen();
        location.reload();
    }, 1500);
}

function resetSettings() {
    // Reset form to default values
    document.getElementById('outbound-origin').value = defaultSettings.outbound.origin;
    document.getElementById('outbound-destination').value = defaultSettings.outbound.destination;
    document.getElementById('outbound-date').value = defaultSettings.outbound.date;
    document.getElementById('outbound-depart-time').value = defaultSettings.outbound.departTime;
    document.getElementById('outbound-arrive-time').value = defaultSettings.outbound.arriveTime;
    
    document.getElementById('return-origin').value = defaultSettings.return.origin;
    document.getElementById('return-destination').value = defaultSettings.return.destination;
    document.getElementById('return-date').value = defaultSettings.return.date;
    document.getElementById('return-depart-time').value = defaultSettings.return.departTime;
    document.getElementById('return-arrive-time').value = defaultSettings.return.arriveTime;
    
    
    // Remove saved settings from localStorage
    localStorage.removeItem('trainpal-settings');
    
    // Apply default settings to main UI
    applySettingsToUI(defaultSettings);
    
    // Show feedback
    const resetBtn = document.getElementById('reset-settings-btn');
    const originalText = resetBtn.textContent;
    resetBtn.textContent = 'Reset Complete!';
    resetBtn.style.background = '#10b981';
    resetBtn.style.color = 'white';
    
    setTimeout(() => {
        resetBtn.textContent = originalText;
        resetBtn.style.background = '#f3f4f6';
        resetBtn.style.color = '#374151';
    }, 1500);
}

// Helper function to calculate journey duration
function calculateDuration(departTime, arriveTime) {
    const depart = new Date(`2000-01-01T${departTime}:00`);
    const arrive = new Date(`2000-01-01T${arriveTime}:00`);
    
    let diffMs = arrive - depart;
    // Handle overnight journeys
    if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000;
    }
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m,`;
}

function applySettingsToUI(settings) {
    // Format dates for display
    const formatDate = (dateStr, includeYear) => {
        const date = new Date(dateStr);
        const opt = {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: "numeric"
        };
        const parts = new Intl.DateTimeFormat('en-GB', opt).formatToParts(date);
        let formatted = `${parts.find(p => p.type === 'weekday').value}, ` +
                        `${parts.find(p => p.type === 'day').value} ` +
                        `${parts.find(p => p.type === 'month').value}`;
        if(includeYear) formatted += ` ${parts.find(p => p.type === "year").value}`;
        return formatted;
    };

    const addMonth = (startDate) => {
        const newDate = new Date();
        newDate.setFullYear(startDate.getFullYear());
        newDate.setMonth(startDate.getMonth()+1);
        newDate.setDate(startDate.getDate());
        return newDate;
    };


    // Update outbound journey details
    const outboundOriginEl = document.querySelector('.outbound-origin');
    if (outboundOriginEl) {
        outboundOriginEl.textContent = settings.outbound.origin;
    }
    
    const outboundDestinationEl = document.querySelector('.outbound-destination');
    if (outboundDestinationEl) {
        outboundDestinationEl.textContent = settings.outbound.destination;
    }
    
    const outboundDateEl = document.querySelector('.outbound-date');
    if (outboundDateEl) {
        outboundDateEl.textContent = formatDate(settings.outbound.date);
    }
    
    const outboundDurationEl = document.querySelector('.outbound-duration');
    if (outboundDurationEl) {
        outboundDurationEl.textContent = calculateDuration(settings.outbound.departTime, settings.outbound.arriveTime);
    }
    const departTimeEl = document.getElementById("outbound-depart-time-value");
    const arriveTimeEl = document.getElementById("outbound-arrive-time-value");
    departTimeEl.innerText = settings.outbound.departTime;
    arriveTimeEl.innerText = settings.outbound.arriveTime;

    // Update return journey details 
    const returnOriginEl = document.querySelector('.return-origin');
    if (returnOriginEl) {
        returnOriginEl.textContent = settings.return.origin;
        document.getElementById("timeline-return-origin").textContent = "Depart " + settings.return.origin;
    }
    
    const returnDestinationEl = document.querySelector('.return-destination');
    if (returnDestinationEl) {
        returnDestinationEl.textContent = settings.return.destination;
        document.getElementById("timeline-return-destination").textContent = "Arrive " + settings.return.destination;
    }
    
    const returnDateEl = document.querySelector('.return-date');
    if (returnDateEl) {
        returnDateEl.textContent = formatDate(settings.return.date);
    }
    
    const returnDurationEl = document.querySelector('.return-duration');
    if (returnDurationEl) {
        returnDurationEl.textContent = calculateDuration(settings.return.departTime, settings.return.arriveTime);
    }


    // Update journey info date displays
    const outboundJourneyDateEl = document.querySelector('.outbound-journey-date');
    if (outboundJourneyDateEl) {
        outboundJourneyDateEl.textContent = formatDate(settings.outbound.date);
    }
    
    const returnJourneyDateEl = document.querySelector('.return-journey-date');
    if (returnJourneyDateEl) {
        returnJourneyDateEl.textContent = formatDate(settings.return.date);
    }
    
    // Show/hide time changed warning based on settings
    const outboundTimeChangedElmnt = document.getElementsByClassName("outbound-time-changed")[0];
    if(outboundTimeChangedElmnt) {
        outboundTimeChangedElmnt.style.display = settings.outbound.showTimeChanged ? 'flex' : 'none';
    }
    const returnTimeChangedElmnt = document.getElementsByClassName("return-time-changed")[0];
    if(returnTimeChangedElmnt) {
        returnTimeChangedElmnt.style.display = settings.return.showTimeChanged ? 'flex' : 'none';
    }

    const outboundNewDepartTime = document.getElementById("outbound-new-depart-time-value");
    if(outboundNewDepartTime && settings.outbound.showTimeChanged) {
        outboundNewDepartTime.classList.remove("display-none");
        document.getElementById("outbound-depart-ontime").classList.add("display-none");
        outboundNewDepartTime.innerText = settings.outbound.newDepartTime;
    }
    const outboundNewArriveTime = document.getElementById("outbound-new-arrive-time-value");
    if(outboundNewArriveTime && settings.outbound.showTimeChanged) {
        outboundNewArriveTime.style.display = "block";
        document.getElementById("outbound-arrive-ontime").style.display = "none";
        outboundNewArriveTime.innerText = settings.outbound.newArriveTime;
    }

    const returnNewDepartTime = document.getElementById("return-new-depart-time-value");
    if(returnNewDepartTime && settings.return.showTimeChanged) {
        returnNewDepartTime.classList.remove("display-none");
        document.getElementById("return-depart-ontime").classList.add("display-none");
        returnNewDepartTime.innerText = settings.return.newDepartTime;
    }
    const returnNewArriveTime = document.getElementById("return-new-arrive-time-value");
    if(returnNewArriveTime && settings.return.showTimeChanged) {
        returnNewArriveTime.style.display = "block";
        document.getElementById("return-arrive-ontime").style.display = "none";
        returnNewArriveTime.innerText = settings.return.newArriveTime;
    }
    const departDate = new Date(settings?.outbound?.date);

    /* // if ticket is old, do not show ontime / late
    if(departDate.getTime() + 8e+7 < Date.now()) {
        Array.from(document.getElementsByClassName("time-disclaimer"))
            .forEach(elmnt => {
                elmnt.classList.add("hidden"); // do NOT use display-none, we want it to take up space
        });
    } */


    const validDate = addMonth(departDate);
    const validUntil = document.getElementById("valid-until");
    validUntil.innerText = formatDate(validDate, true);

    const endStation = document.getElementById("end-station");
    if(endStation) {
        endStation.textContent = settings.outbound.endStation || "Crewe";
    }
    const seatInfo = document.getElementById("seat-info");
    if(seatInfo) {
        seatInfo.textContent = settings.outbound.seatInfo || "Standard, sit in any available seat";
    }

    const originPlatform = document.getElementById("origin-platform");
    if(originPlatform) {
        originPlatform.textContent = "Plat. " + (settings.outbound.originPlatform || "12");
    }
    const destPlatform = document.getElementById("destination-platform");
    if(destPlatform) {
        destPlatform.textContent = "Plat. " + (settings.outbound.destinationPlatform || "3");
    }

    const ticketPrice = document.getElementById("ticket-price");
    if(ticketPrice) {
        ticketPrice.textContent = "£" + settings.ticketPrice || defaultSettings.ticketPrice;
    }
    
    const email = document.getElementById("email");
    if(email) {
        email.textContent = settings.email || defaultSettings.email;
    }

}

// Initialize with saved settings on page load
function initializeSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('trainpal-settings')) || defaultSettings;
    applySettingsToUI(savedSettings);
}

// Initialize StateManager - back buttons now handled by history-back class
function initializeStateManager() {
    // Wait for StateManager to be available
    if (window.StateManager) {
        window.stateManager = new StateManager();
    } else {
        // Retry if StateManager not yet loaded
        setTimeout(initializeStateManager, 100);
    }
}

initTabs();
initEvents();
initializeSettings();
initializeStateManager();
